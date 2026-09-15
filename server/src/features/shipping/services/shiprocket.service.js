import axios from "axios";
import ApiError from "../../../utils/ApiError.js";

const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";

const TOKEN_VALIDITY_MS = 240 * 60 * 60 * 1000; // 240 hours

const TOKEN_BUFFER_MS = 5 * 60 * 1000; // 5 minutes safety buffer

let cachedToken = null;
let tokenExpiresAt = null;

const authenticate = async () => {
  const email = process.env.SHIPROCKET_API_EMAIL;
  const password = process.env.SHIPROCKET_API_PASSWORD;

  if (!email || !password) {
    throw new ApiError(500, "Shiprocket API credentials are not configured.");
  }

  try {
    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/auth/login`,
      {
        email,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const token = response.data?.token;

    if (!token) {
      throw new ApiError(502, "Shiprocket authentication succeeded but no token was returned.");
    }

    cachedToken = token;

    tokenExpiresAt = Date.now() + TOKEN_VALIDITY_MS - TOKEN_BUFFER_MS;

    return cachedToken;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Shiprocket authentication failed:", error.response?.data || error.message);

    throw new ApiError(502, "Unable to authenticate with Shiprocket.");
  }
};

const getToken = async () => {
  const tokenIsValid = cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt;

  if (tokenIsValid) {
    return cachedToken;
  }

  return authenticate();
};

const invalidateToken = () => {
  cachedToken = null;
  tokenExpiresAt = null;
};

const getCourierServiceability = async ({
  pickupPostcode,
  deliveryPostcode,
  weight,
  cod,
  declaredValue,
  length,
  breadth,
  height,
}) => {
  if (!pickupPostcode) {
    throw new ApiError(400, "Pickup postcode is required.");
  }

  if (!deliveryPostcode) {
    throw new ApiError(400, "Delivery postcode is required.");
  }

  if (!weight || weight <= 0) {
    throw new ApiError(400, "Valid shipment weight is required.");
  }

  const token = await getToken();

  try {
    const params = {
      pickup_postcode: pickupPostcode,
      delivery_postcode: deliveryPostcode,
      cod: cod ? 1 : 0,
      weight,
    };

    if (declaredValue !== undefined) {
      params.declared_value = declaredValue;
    }

    if (length) {
      params.length = length;
    }

    if (breadth) {
      params.breadth = breadth;
    }

    if (height) {
      params.height = height;
    }

    const response = await axios.get(`${SHIPROCKET_BASE_URL}/courier/serviceability/`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      invalidateToken();

      throw new ApiError(502, "Shiprocket authentication expired. Please try again.");
    }

    console.error(
      "Shiprocket courier serviceability failed:",
      error.response?.data || error.message
    );

    throw new ApiError(502, "Unable to calculate shipping rates from Shiprocket.");
  }
};

const createOrder = async ({
  orderId,
  orderDate,
  pickupLocation,

  billingCustomerName,
  billingAddress,
  billingCity,
  billingState,
  billingPincode,
  billingPhone,
  billingEmail,

  orderItems,

  paymentMethod,

  subTotal,
  shippingCharges = 0,
  totalDiscount = 0,

  length,
  breadth,
  height,
  weight,
}) => {
  if (!orderId) {
    throw new ApiError(400, "Shiprocket order ID is required.");
  }

  if (!pickupLocation) {
    throw new ApiError(500, "Shiprocket pickup location is not configured.");
  }

  if (!billingCustomerName) {
    throw new ApiError(400, "Customer name is required.");
  }

  if (!billingAddress) {
    throw new ApiError(400, "Customer address is required.");
  }

  if (!billingCity || !billingState || !billingPincode) {
    throw new ApiError(400, "Complete customer address is required.");
  }

  if (!billingPhone) {
    throw new ApiError(400, "Customer phone is required.");
  }

  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    throw new ApiError(400, "At least one order item is required.");
  }

  if (!weight || weight <= 0) {
    throw new ApiError(400, "Valid shipment weight is required.");
  }

  const token = await getToken();

  const payload = {
    order_id: orderId,

    order_date: orderDate || new Date().toISOString(),

    pickup_location: pickupLocation,

    billing_customer_name: billingCustomerName,

    billing_last_name: "",

    billing_address: billingAddress,

    billing_city: billingCity,

    billing_pincode: billingPincode,

    billing_state: billingState,

    billing_country: "India",

    billing_email: billingEmail || "",

    billing_phone: billingPhone,

    shipping_is_billing: true,

    order_items: orderItems,

    payment_method: paymentMethod === "COD" ? "COD" : "Prepaid",

    sub_total: subTotal,

    shipping_charges: shippingCharges,

    total_discount: totalDiscount,

    length,

    breadth,

    height,

    weight,
  };

  try {
    const response = await axios.post(`${SHIPROCKET_BASE_URL}/orders/create/adhoc`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },

      timeout: 15000,
    });

    console.log("SHIPROCKET RAW CREATE ORDER RESPONSE:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      invalidateToken();

      throw new ApiError(502, "Shiprocket authentication expired. Please try again.");
    }

    console.error("Shiprocket order creation failed:", error.response?.data || error.message);

    throw new ApiError(
      502,
      error.response?.data?.message || "Unable to create order in Shiprocket."
    );
  }
};

const generateAWB = async ({ shipmentId, courierId }) => {
  if (!shipmentId) {
    throw new ApiError(400, "Shiprocket shipment ID is required.");
  }

  if (!courierId) {
    throw new ApiError(400, "Courier ID is required.");
  }

  const token = await getToken();

  try {
    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/courier/assign/awb`,
      {
        shipment_id: shipmentId,
        courier_id: courierId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    console.log("SHIPROCKET AWB RESPONSE:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      invalidateToken();

      throw new ApiError(502, "Shiprocket authentication expired. Please try again.");
    }

    console.error("Shiprocket AWB assignment failed:", error.response?.data || error.message);

    throw new ApiError(
      502,
      error.response?.data?.message || "Unable to assign courier/AWB through Shiprocket."
    );
  }
};

const generatePickup = async ({ shipmentId, pickupDate, retry = false }) => {
  if (!shipmentId) {
    throw new ApiError(400, "Shiprocket shipment ID is required.");
  }

  const token = await getToken();

  const payload = {
    shipment_id: [Number(shipmentId)],
  };

  if (pickupDate) {
    payload.pickup_date = [pickupDate];
  }

  if (retry) {
    payload.status = "retry";
  }

  try {
    const response = await axios.post(`${SHIPROCKET_BASE_URL}/courier/generate/pickup`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    console.log("SHIPROCKET PICKUP RESPONSE:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      invalidateToken();

      throw new ApiError(502, "Shiprocket authentication expired. Please try again.");
    }

    console.error("Shiprocket pickup generation failed:", error.response?.data || error.message);

    throw new ApiError(
      502,
      error.response?.data?.message || "Unable to schedule pickup through Shiprocket."
    );
  }
};

const trackShipmentByAwb = async ({ awbCode }) => {
  if (!awbCode) {
    throw new ApiError(400, "AWB number is required.");
  }

  const token = await getToken();

  try {
    const response = await axios.get(
      `${SHIPROCKET_BASE_URL}/courier/track/awb/${encodeURIComponent(awbCode)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    console.log("SHIPROCKET TRACKING RESPONSE:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      invalidateToken();

      throw new ApiError(502, "Shiprocket authentication expired. Please try again.");
    }

    console.error("Shiprocket tracking failed:", error.response?.data || error.message);

    throw new ApiError(
      502,
      error.response?.data?.message || "Unable to fetch shipment tracking from Shiprocket."
    );
  }
};

const shiprocketService = {
  authenticate,
  getToken,
  invalidateToken,
  generateAWB,
  getCourierServiceability,
  createOrder,
  generatePickup,
  trackShipmentByAwb,
};

export default shiprocketService;
