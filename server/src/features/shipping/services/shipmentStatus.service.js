import { ORDER_STATUS, SHIPMENT_STATUS } from "../../../models/Order.js";

import { updateOrderStatus } from "../../../services/order.service.js";

const updateOrderStatusFromShipment = async ({ order, shipmentStatus, changedAt = new Date() }) => {
  if (shipmentStatus === SHIPMENT_STATUS.PICKED_UP) {
    if (
      ![ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED, ORDER_STATUS.RTO].includes(
        order.orderStatus
      )
    ) {
      await updateOrderStatus({
        order,
        status: ORDER_STATUS.SHIPPED,
        changedAt,
      });
    }

    return;
  }

  /*
   * IN_TRANSIT does not create
   * a new order status.
   *
   * Order remains SHIPPED.
   */
  if (shipmentStatus === SHIPMENT_STATUS.IN_TRANSIT) {
    return;
  }

  if (shipmentStatus === SHIPMENT_STATUS.OUT_FOR_DELIVERY) {
    if (
      ![ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED, ORDER_STATUS.RTO].includes(
        order.orderStatus
      )
    ) {
      await updateOrderStatus({
        order,
        status: ORDER_STATUS.OUT_FOR_DELIVERY,
        changedAt,
      });
    }

    return;
  }

  if (shipmentStatus === SHIPMENT_STATUS.DELIVERED) {
    if (order.orderStatus !== ORDER_STATUS.CANCELLED && order.orderStatus !== ORDER_STATUS.RTO) {
      await updateOrderStatus({
        order,
        status: ORDER_STATUS.DELIVERED,
        changedAt,
      });
    }

    return;
  }

  if (shipmentStatus === SHIPMENT_STATUS.RTO) {
    if (order.orderStatus !== ORDER_STATUS.CANCELLED) {
      await updateOrderStatus({
        order,
        status: ORDER_STATUS.RTO,
        changedAt,
      });
    }
  }
};

export { updateOrderStatusFromShipment };
