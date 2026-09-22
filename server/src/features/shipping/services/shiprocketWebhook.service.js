import Order from "../../../models/Order.js";
import ApiError from "../../../utils/ApiError.js";
import { ORDER_STATUS, SHIPMENT_STATUS } from "../../../models/Order.js";

import { updateOrderStatusFromShipment } from "./shipmentStatus.service.js";

const normalizeStatus = (status = "") => {
  return status.toString().trim().toUpperCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
};

const mapShipmentStatus = (status = "") => {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "PICKUP SCHEDULED":
    case "PICKUP QUEUED":
    case "PICKUP RESCHEDULED":
      return SHIPMENT_STATUS.PICKUP_SCHEDULED;

    case "PICKED UP":
      return SHIPMENT_STATUS.PICKED_UP;

    case "SHIPPED":
      return SHIPMENT_STATUS.SHIPPED;

    case "IN TRANSIT":
      return SHIPMENT_STATUS.IN_TRANSIT;

    case "OUT FOR DELIVERY":
      return SHIPMENT_STATUS.OUT_FOR_DELIVERY;

    case "DELIVERED":
      return SHIPMENT_STATUS.DELIVERED;

    case "RTO":
    case "RTO INITIATED":
    case "RTO DELIVERED":
      return SHIPMENT_STATUS.RTO;

    default:
      return null;
  }
};

const parseWebhookDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const addTrackingEvents = (order, scans = []) => {
  if (!Array.isArray(scans) || !scans.length) {
    return;
  }

  if (!Array.isArray(order.shipment.trackingEvents)) {
    order.shipment.trackingEvents = [];
  }

  for (const scan of scans) {
    const timestamp = parseWebhookDate(scan.date);

    const event = {
      status: scan["sr-status-label"] || scan.status || "",

      description: scan.activity || "",

      location: scan.location || "",

      timestamp,
    };

    const alreadyExists = order.shipment.trackingEvents.some(
      (existing) =>
        existing.status === event.status &&
        existing.description === event.description &&
        existing.location === event.location &&
        existing.timestamp?.getTime?.() === event.timestamp?.getTime?.()
    );

    if (!alreadyExists) {
      order.shipment.trackingEvents.push(event);
    }
  }
};

const processShipmentWebhook = async ({ payload }) => {
  if (!payload || typeof payload !== "object") {
    throw new ApiError(400, "Invalid Shiprocket webhook payload.");
  }

  const awb = String(payload.awb || "").trim();

  if (!awb) {
    throw new ApiError(400, "AWB is missing from Shiprocket webhook.");
  }

  const order = await Order.findOne({
    "shipment.awbCode": awb,
  });

  if (!order) {
    console.warn("Shiprocket webhook: local order not found for AWB:", awb);

    return {
      processed: false,
      reason: "ORDER_NOT_FOUND",
      awb,
    };
  }

  const incomingStatus = payload.current_status || payload.shipment_status || "";

  const shipmentStatus = mapShipmentStatus(incomingStatus);

  if (!shipmentStatus) {
    console.warn("Shiprocket webhook: unsupported status:", incomingStatus);

    return {
      processed: false,
      reason: "UNSUPPORTED_STATUS",
      awb,
      status: incomingStatus,
    };
  }

  /*
   * Don't move a shipment backwards.
   */
  const statusPriority = {
    [SHIPMENT_STATUS.CREATED]: 10,
    [SHIPMENT_STATUS.AWB_ASSIGNED]: 20,
    [SHIPMENT_STATUS.PICKUP_SCHEDULED]: 30,
    [SHIPMENT_STATUS.PICKED_UP]: 40,
    [SHIPMENT_STATUS.SHIPPED]: 50,
    [SHIPMENT_STATUS.IN_TRANSIT]: 60,
    [SHIPMENT_STATUS.OUT_FOR_DELIVERY]: 70,
    [SHIPMENT_STATUS.DELIVERED]: 80,
    [SHIPMENT_STATUS.RTO]: 90,
  };

  const currentPriority = statusPriority[order.shipment.currentStatus] || 0;

  const incomingPriority = statusPriority[shipmentStatus] || 0;

  if (incomingPriority >= currentPriority) {
    order.shipment.currentStatus = shipmentStatus;
  }

  /*
   * Update courier if Shiprocket sends it.
   */
  if (payload.courier_name) {
    order.shipment.courierName = payload.courier_name;
  }

  /*
   * Update pickup date.
   */
  if (payload.pickup_scheduled_date) {
    const pickupDate = parseWebhookDate(payload.pickup_scheduled_date);

    if (pickupDate) {
      order.shipment.pickupScheduledAt = pickupDate;
    }
  }

  /*
   * Update estimated delivery date.
   */
  if (payload.etd) {
    const estimatedDelivery = parseWebhookDate(payload.etd);

    if (estimatedDelivery) {
      order.shipment.estimatedDeliveryAt = estimatedDelivery;
    }
  }

  /*
   * Store all scan events.
   */
  addTrackingEvents(order, payload.scans);

  /*
   * Save the latest tracking time.
   */
  order.shipment.lastTrackedAt = new Date();

  /*
   * Update customer-facing order status.
   */
  const eventTimestamp = parseWebhookDate(payload.current_timestamp) || new Date();

  await updateOrderStatusFromShipment({
    order,
    shipmentStatus,
    changedAt: eventTimestamp,
  });

  await order.save();

  return {
    processed: true,
    order,
    shipmentStatus,
    awb,
  };
};

export default processShipmentWebhook;
