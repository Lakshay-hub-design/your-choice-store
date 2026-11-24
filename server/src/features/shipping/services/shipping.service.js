import ApiError from "../../../utils/ApiError.js";

import shiprocketService from "./shiprocket.service.js";
import Product from "../../../models/Product.js";
import Order from "../../../models/Order.js";

import { SHIPMENT_STATUS } from "../../../models/Order.js";

import { USER_ROLES } from "../../../constants/roles.js";

import { updateOrderStatusFromShipment } from "./shipmentStatus.service.js";
/*
 * --------------------------------
 * Calculate shipment package
 * --------------------------------
 *
 * V1 packing assumption:
 *
 * Weight:
 * product weight × quantity
 *
 * Dimensions:
 * - largest length
 * - largest breadth
 * - sum of heights
 *
 * This represents products being stacked
 * inside one shipment package.
 *
 * We can improve this later with a
 * dedicated packing algorithm.
 */

const calculatePackage = ({ cart, products }) => {
  if (!cart?.items?.length) {
    throw new ApiError(400, "Cart is empty.");
  }

  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  let totalWeight = 0;

  let maxLength = 0;
  let maxBreadth = 0;
  let totalHeight = 0;

  for (const cartItem of cart.items) {
    const product = productMap.get(cartItem.product.toString());

    if (!product) {
      throw new ApiError(400, "One or more products in your cart are unavailable.");
    }

    const weight = product.shipping?.weight;

    const length = product.shipping?.dimensions?.length;

    const breadth = product.shipping?.dimensions?.breadth;

    const height = product.shipping?.dimensions?.height;

    if (!weight || !length || !breadth || !height) {
      throw new ApiError(400, `Shipping information is missing for ${product.name}.`);
    }

    const quantity = cartItem.quantity;

    totalWeight += weight * quantity;

    maxLength = Math.max(maxLength, length);

    maxBreadth = Math.max(maxBreadth, breadth);

    totalHeight += height * quantity;
  }

  const chargeableWeight = Math.max(totalWeight, 0.5);

  return {
    weight: Number(chargeableWeight.toFixed(3)),

    length: Number(maxLength.toFixed(2)),

    breadth: Number(maxBreadth.toFixed(2)),

    height: Number(totalHeight.toFixed(2)),
  };
};

/*
 * --------------------------------
 * Select courier
 * --------------------------------
 *
 * V1:
 * - Prefer surface
 * - Within surface, choose lowest rate
 * - Otherwise choose lowest available rate
 */

const selectCourier = (couriers = []) => {
  if (!couriers.length) {
    throw new ApiError(400, "No courier service is available for this address.");
  }

  const surfaceCouriers = couriers.filter((courier) =>
    courier.courier_name?.toLowerCase().includes("surface")
  );

  const candidates = surfaceCouriers.length ? surfaceCouriers : couriers;

  return [...candidates].sort((a, b) => Number(a.rate || 0) - Number(b.rate || 0))[0];
};

/*
 * --------------------------------
 * Get shipping quote
 * --------------------------------
 */

const getShippingQuote = async ({ products, cart, deliveryPostcode, paymentMethod }) => {
  if (!deliveryPostcode) {
    throw new ApiError(400, "Delivery postcode is required.");
  }

  const packageDetails = calculatePackage({
    cart,
    products,
  });

  const cod = paymentMethod === "COD";
  const response = await shiprocketService.getCourierServiceability({
    pickupPostcode: process.env.SHIPROCKET_PICKUP_POSTCODE,

    deliveryPostcode,

    weight: packageDetails.weight,

    cod,

    length: packageDetails.length,

    breadth: packageDetails.breadth,

    height: packageDetails.height,

    declaredValue: products.reduce((total, product) => {
      const cartItem = cart.items.find(
        (item) => item.product.toString() === product._id.toString()
      );

      if (!cartItem) {
        return total;
      }

      return total + product.price * cartItem.quantity;
    }, 0),
  });

  const couriers = response?.data?.available_courier_companies || [];

  const selectedCourier = selectCourier(couriers);

  const shippingCost = Number(selectedCourier.rate || 0);

  return {
    shippingCost,

    shippingFee: shippingCost,

    courier: {
      id: selectedCourier.courier_company_id,

      name: selectedCourier.courier_name,

      rate: Number(selectedCourier.rate || 0),

      estimatedDelivery: selectedCourier.etd || null,

      rating: selectedCourier.rating || null,
    },

    package: packageDetails,

    currency: response?.data?.currency || "INR",
  };
};

const createShipmentForOrder = async ({ order, user }) => {
  if (!order) {
    throw new ApiError(400, "Order is required.");
  }

  if (!user) {
    throw new ApiError(400, "Customer information is required.");
  }

  /*
   * --------------------------------
   * Idempotency protection
   * --------------------------------
   *
   * If Shiprocket order creation has
   * already succeeded, don't create
   * another Shiprocket order.
   */
  if (order.shipment?.shiprocketOrderId) {
    return {
      alreadyCreated: true,
      order,
    };
  }

  /*
   * --------------------------------
   * Build package
   * --------------------------------
   *
   * For an already-created order,
   * we need the original product
   * dimensions.
   */

  const productIds = order.items.map((item) => item.product);

  const products = await Product.find({
    _id: {
      $in: productIds,
    },
  }).select("shipping");

  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  let totalWeight = 0;
  let maxLength = 0;
  let maxBreadth = 0;
  let totalHeight = 0;

  for (const item of order.items) {
    const product = productMap.get(item.product.toString());

    if (!product) {
      throw new ApiError(400, `Product information is missing for ${item.name}.`);
    }

    const weight = product.shipping?.weight;
    const length = product.shipping?.dimensions?.length;
    const breadth = product.shipping?.dimensions?.breadth;
    const height = product.shipping?.dimensions?.height;

    if (!weight || !length || !breadth || !height) {
      throw new ApiError(400, `Shipping information is missing for ${item.name}.`);
    }

    totalWeight += weight * item.quantity;

    maxLength = Math.max(maxLength, length);

    maxBreadth = Math.max(maxBreadth, breadth);

    totalHeight += height * item.quantity;
  }

  const packageDetails = {
    weight: Number(totalWeight.toFixed(3)),

    length: Number(maxLength.toFixed(2)),

    breadth: Number(maxBreadth.toFixed(2)),

    height: Number(totalHeight.toFixed(2)),
  };

  /*
   * --------------------------------
   * Convert order items
   * --------------------------------
   */

  const orderItems = order.items.map((item) => ({
    name: item.name,

    sku: item.sku,

    units: item.quantity,

    selling_price: item.price,

    discount: 0,

    tax: 0,

    hsn: "",
  }));

  /*
   * --------------------------------
   * Create Shiprocket order
   * --------------------------------
   */

  const response = await shiprocketService.createOrder({
    orderId: order.orderNumber,

    orderDate: order.placedAt || order.createdAt,

    pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION,

    billingCustomerName: order.shippingAddress.fullName,

    billingAddress: [
      order.shippingAddress.houseNumber,
      order.shippingAddress.formattedAddress,
      order.shippingAddress.landmark,
    ]
      .filter(Boolean)
      .join(", "),

    billingCity: order.shippingAddress.city,

    billingState: order.shippingAddress.state,

    billingPincode: order.shippingAddress.postalCode,

    billingPhone: order.shippingAddress.phone,

    billingEmail: user.email || "",

    orderItems,

    paymentMethod: order.paymentMethod,

    subTotal: order.pricing.itemsTotal,

    shippingCharges: order.pricing.shippingFee,

    totalDiscount: 0,

    ...packageDetails,
  });

  return {
    response,

    package: packageDetails,
  };
};

const getAvailableCouriersForOrder = async ({ orderId }) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (order.shipment?.awbCode) {
    throw new ApiError(400, "Courier has already been assigned to this order.");
  }

  const products = await Product.find({
    _id: {
      $in: order.items.map((item) => item.product),
    },
  }).select("_id shipping");

  const packageDetails = calculatePackage({
    cart: {
      items: order.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      })),
    },
    products,
  });

  const response = await shiprocketService.getCourierServiceability({
    pickupPostcode: process.env.SHIPROCKET_PICKUP_POSTCODE,

    deliveryPostcode: order.shippingAddress.postalCode,

    weight: packageDetails.weight,

    cod: order.paymentMethod === "COD",

    declaredValue: order.pricing.grandTotal,

    length: packageDetails.length,

    breadth: packageDetails.breadth,

    height: packageDetails.height,
  });

  const couriers = response?.data?.available_courier_companies || [];

  if (!couriers.length) {
    throw new ApiError(400, "No courier service is available for this order.");
  }

  const courierOptions = couriers.map((courier) => ({
    courierId: Number(courier.courier_company_id),

    courierName: courier.courier_name,

    rate: Number(courier.rate || 0),

    freightCharge: Number(courier.freight_charge || 0),

    chargeWeight: Number(courier.charge_weight || 0),

    estimatedDelivery: courier.etd || null,

    estimatedDeliveryDays: courier.estimated_delivery_days
      ? Number(courier.estimated_delivery_days)
      : null,

    rating: Number(courier.rating || 0),

    deliveryPerformance: Number(courier.delivery_performance || 0),

    pickupPerformance: Number(courier.pickup_performance || 0),

    rtoCharges: Number(courier.rto_charges || 0),

    rtoPerformance: Number(courier.rto_performance || 0),

    isSurface: Boolean(courier.is_surface),

    codCharges: Number(courier.cod_charges || 0),

    pickupAvailability: courier.pickup_availability,

    realtimeTracking: courier.realtime_tracking,

    callBeforeDelivery: courier.call_before_delivery,
  }));

  return {
    couriers: courierOptions,

    package: packageDetails,
  };
};

const assignCourierToOrder = async ({ orderId, courierId }) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (!order.shipment?.shiprocketOrderId) {
    throw new ApiError(400, "Shiprocket order has not been created yet.");
  }

  if (!order.shipment?.shipmentId) {
    throw new ApiError(400, "Shiprocket shipment ID is missing.");
  }

  if (order.shipment?.awbCode) {
    throw new ApiError(400, "AWB has already been assigned to this order.");
  }

  const parsedCourierId = Number(courierId);

  if (!Number.isInteger(parsedCourierId) || parsedCourierId <= 0) {
    throw new ApiError(400, "Valid courier ID is required.");
  }

  /*
   * ==========================================
   * Verify courier is available for this order
   * ==========================================
   */

  const courierResult = await getAvailableCouriersForOrder({
    orderId,
  });

  const selectedCourier = courierResult.couriers.find(
    (courier) => courier.courierId === parsedCourierId
  );

  if (!selectedCourier) {
    throw new ApiError(400, "Selected courier is not currently available for this order.");
  }

  /*
   * ==========================================
   * Assign AWB through Shiprocket
   * ==========================================
   */

  const response = await shiprocketService.generateAWB({
    shipmentId: order.shipment.shipmentId,

    courierId: selectedCourier.courierId,
  });

  console.log("SHIPROCKET ASSIGN AWB RESPONSE:", JSON.stringify(response, null, 2));

  /*
   * ==========================================
   * Extract AWB information
   * ==========================================
   */

  const awbDetails = response?.response?.data;

  const awbCode = awbDetails?.awb_code || response?.response?.awb_code || response?.awb_code;

  const courierName =
    awbDetails?.courier_name ||
    response?.response?.courier_name ||
    response?.courier_name ||
    selectedCourier.courierName ||
    "";

  if (!awbCode) {
    const awbError =
      awbDetails?.awb_assign_error ||
      response?.message ||
      "Shiprocket did not return an AWB number.";

    throw new ApiError(400, awbError);
  }
  /*
   * ==========================================
   * Save shipment details
   * ==========================================
   */

  order.shipment.awbCode = String(awbCode);

  order.shipment.courierName = courierName;

  order.shipment.currentStatus = SHIPMENT_STATUS.AWB_ASSIGNED;

  order.shipment.failureReason = "";

  await order.save();

  return {
    success: true,

    awbCode,

    courierName,

    order,

    response,
  };
};

const schedulePickupForOrder = async ({ orderId, pickupDate, retry = false }) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (!order.shipment?.shiprocketOrderId) {
    throw new ApiError(400, "Shiprocket order has not been created yet.");
  }

  if (!order.shipment?.shipmentId) {
    throw new ApiError(400, "Shiprocket shipment ID is missing.");
  }

  if (!order.shipment?.awbCode) {
    throw new ApiError(400, "AWB must be assigned before scheduling pickup.");
  }

  if (order.shipment.currentStatus === SHIPMENT_STATUS.PICKUP_SCHEDULED) {
    throw new ApiError(400, "Pickup has already been scheduled for this shipment.");
  }

  if (pickupDate && !/^\d{4}-\d{2}-\d{2}$/.test(pickupDate)) {
    throw new ApiError(400, "Pickup date must be in YYYY-MM-DD format.");
  }

  const response = await shiprocketService.generatePickup({
    shipmentId: order.shipment.shipmentId,
    pickupDate,
    retry,
  });

  const pickupScheduledDate =
    response?.pickup_scheduled_date || response?.response?.pickup_scheduled_date || null;

  const pickupTokenNumber =
    response?.pickup_token_number || response?.response?.pickup_token_number || null;

  const pickupGenerated = response?.pickup_generated ?? response?.response?.pickup_generated;

  if (pickupGenerated !== undefined && Number(pickupGenerated) !== 1) {
    throw new ApiError(502, response?.message || "Shiprocket did not generate the pickup request.");
  }

  order.shipment.currentStatus = SHIPMENT_STATUS.PICKUP_SCHEDULED;

  order.shipment.failureReason = "";

  if (pickupScheduledDate) {
    const parsedDate = new Date(pickupScheduledDate);

    if (!Number.isNaN(parsedDate.getTime())) {
      order.shipment.pickupScheduledAt = parsedDate;
    }
  }

  if (pickupTokenNumber) {
    order.shipment.pickupTokenNumber = String(pickupTokenNumber);
  }

  await order.save();

  return {
    success: true,
    pickupScheduledDate,
    pickupTokenNumber,
    order,
    response,
  };
};

const trackOrderShipment = async ({ orderId }) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  const awbCode = order.shipment?.awbCode;

  if (!awbCode) {
    throw new ApiError(400, "AWB has not been assigned to this shipment.");
  }

  const response = await shiprocketService.trackShipmentByAwb({
    awbCode,
  });

  const tracking = extractTrackingData(response);

  if (!tracking.status) {
    throw new ApiError(502, "Shiprocket did not return a shipment status.");
  }

  const shipmentStatus = mapShiprocketStatus(tracking.status);

  if (!shipmentStatus) {
    throw new ApiError(502, `Unsupported Shiprocket shipment status: ${tracking.status}`);
  }

  /*
   * --------------------------------------------------------------------------
   * Update shipment status
   * --------------------------------------------------------------------------
   */

  order.shipment.currentStatus = shipmentStatus;

  order.shipment.lastTrackedAt = new Date();

  /*
   * --------------------------------------------------------------------------
   * Tracking URL
   * --------------------------------------------------------------------------
   */

  if (tracking.trackingUrl) {
    order.shipment.trackingUrl = tracking.trackingUrl;
  }

  /*
   * --------------------------------------------------------------------------
   * Estimated delivery
   * --------------------------------------------------------------------------
   */

  if (tracking.estimatedDeliveryAt) {
    order.shipment.estimatedDeliveryAt = tracking.estimatedDeliveryAt;
  }

  /*
   * --------------------------------------------------------------------------
   * Tracking event
   * --------------------------------------------------------------------------
   */

  if (tracking.event) {
    addTrackingEvent(order, tracking.event);
  }

  /*
   * --------------------------------------------------------------------------
   * Sync order status
   * --------------------------------------------------------------------------
   */

  const changedAt = tracking.event?.timestamp || new Date();

  await updateOrderStatusFromShipment({
    order,
    shipmentStatus,
    changedAt,
  });

  await order.save();

  return {
    success: true,
    order,
    tracking,
    response,
  };
};

const mapShiprocketStatus = (status = "") => {
  const normalized = status.toLowerCase().replace(/[_-]/g, " ").trim();

  if (
    normalized.includes("pickup scheduled") ||
    normalized.includes("pickup queued") ||
    normalized.includes("pickup generated")
  ) {
    return SHIPMENT_STATUS.PICKUP_SCHEDULED;
  }

  if (normalized.includes("picked up") || normalized.includes("pickup done")) {
    return SHIPMENT_STATUS.PICKED_UP;
  }

  if (normalized === "shipped") {
    return SHIPMENT_STATUS.SHIPPED;
  }

  if (normalized.includes("in transit") || normalized.includes("in-transit")) {
    return SHIPMENT_STATUS.IN_TRANSIT;
  }

  if (normalized.includes("out for delivery") || normalized.includes("out-for-delivery")) {
    return SHIPMENT_STATUS.OUT_FOR_DELIVERY;
  }

  if (normalized.includes("delivered")) {
    return SHIPMENT_STATUS.DELIVERED;
  }

  if (normalized.includes("rto") || normalized.includes("return to origin")) {
    return SHIPMENT_STATUS.RTO;
  }

  return SHIPMENT_STATUS.CREATED;
};

const extractTrackingData = (response) => {
  const trackingData =
    response?.tracking_data || response?.response?.tracking_data || response?.response || response;

  const shipmentTrack = trackingData?.shipment_track?.[0] || null;

  const activities = trackingData?.shipment_track_activities || [];

  const status =
    shipmentTrack?.current_status || shipmentTrack?.status || trackingData?.current_status || "";

  const trackingUrl = shipmentTrack?.tracking_url || trackingData?.track_url || "";

  const estimatedDelivery = shipmentTrack?.edd || shipmentTrack?.estimated_delivery_date || null;

  const latestActivity = activities.length > 0 ? activities[activities.length - 1] : null;

  return {
    status,
    trackingUrl,
    estimatedDeliveryAt: parseDate(estimatedDelivery),
    event: latestActivity
      ? {
          status: latestActivity.activity || latestActivity.status || "",
          description: latestActivity.activity || latestActivity.status || "",
          location: latestActivity.location || "",
          timestamp: parseDate(latestActivity.date || latestActivity.timestamp),
        }
      : null,
  };
};

const parseDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const addTrackingEvent = (order, event) => {
  if (!event) return;

  const exists = order.shipment.trackingEvents?.some(
    (existing) =>
      existing.status === event.status &&
      existing.location === event.location &&
      existing.timestamp?.getTime?.() === event.timestamp?.getTime?.()
  );

  if (exists) {
    return;
  }

  order.shipment.trackingEvents.push(event);
};

const getTrackingForOrder = async ({ orderId, user }) => {
  const query = {
    _id: orderId,
  };

  if (user.role === USER_ROLES.CUSTOMER) {
    query.user = user._id;
  }

  const order = await Order.findOne(query).select("orderNumber orderStatus shipment user").lean();

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (!order.shipment) {
    throw new ApiError(404, "Shipment information is not available for this order.");
  }

  return {
    orderId: order._id,
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,

    shipment: {
      courierName: order.shipment.courierName || null,
      awbCode: order.shipment.awbCode || null,
      currentStatus: order.shipment.currentStatus || null,

      trackingUrl: order.shipment.trackingUrl || null,

      pickupScheduledAt: order.shipment.pickupScheduledAt || null,

      estimatedDeliveryAt: order.shipment.estimatedDeliveryAt || null,

      lastTrackedAt: order.shipment.lastTrackedAt || null,

      trackingEvents: order.shipment.trackingEvents || [],
    },
  };
};

const shippingService = {
  getShippingQuote,
  createShipmentForOrder,

  getAvailableCouriersForOrder,
  assignCourierToOrder,
  schedulePickupForOrder,
  trackOrderShipment,
  getTrackingForOrder,
};

export default shippingService;
