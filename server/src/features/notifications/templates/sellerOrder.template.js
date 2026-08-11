const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
};

export const buildSellerOrderEmail = ({ order, type = "NEW_ORDER" }) => {
  const isPaid = type === "PAID_ORDER";

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
            <strong>${item.name}</strong>
            <br />
            <span style="font-size: 13px; color: #777;">
              SKU: ${item.sku}
            </span>
          </td>

          <td
            align="center"
            style="
              padding: 12px 10px;
              border-bottom: 1px solid #eee;
            "
          >
            ${item.quantity}
          </td>

          <td
            align="right"
            style="
              padding: 12px 0;
              border-bottom: 1px solid #eee;
            "
          >
            ${formatCurrency(item.subtotal)}
          </td>
        </tr>
      `
    )
    .join("");

  const paymentStatus = isPaid ? "PAID" : order.paymentStatus;

  const paymentColor = isPaid ? "#16a34a" : "#d97706";

  const title = isPaid ? "Payment Received 🎉" : "New Order Received 🛍️";

  const subtitle = isPaid
    ? "A customer has successfully completed payment for an order."
    : "A new customer order has been placed.";

  return {
    subject: isPaid
      ? `Payment Received - Order #${order.orderNumber}`
      : `New Order - #${order.orderNumber}`,

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background: #fff9f5;
            font-family: Arial, sans-serif;
            color: #242424;
          "
        >
          <div
            style="
              max-width: 680px;
              margin: 30px auto;
              background: #ffffff;
              border: 1px solid #ede9e6;
              border-radius: 16px;
              overflow: hidden;
            "
          >

            <!-- Header -->
            <div
              style="
                padding: 28px;
                background: #ff5a5f;
                color: white;
              "
            >
              <h1
                style="
                  margin: 0;
                  font-size: 24px;
                "
              >
                ${title}
              </h1>

              <p
                style="
                  margin: 8px 0 0;
                  font-size: 14px;
                  opacity: 0.9;
                "
              >
                ${subtitle}
              </p>
            </div>

            <!-- Order -->
            <div style="padding: 28px;">

              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 24px;
                "
              >
                <div>
                  <div
                    style="
                      font-size: 12px;
                      color: #999;
                    "
                  >
                    ORDER
                  </div>

                  <div
                    style="
                      margin-top: 4px;
                      font-size: 18px;
                      font-weight: bold;
                    "
                  >
                    #${order.orderNumber}
                  </div>
                </div>

                <div style="text-align: right;">
                  <div
                    style="
                      font-size: 12px;
                      color: #999;
                    "
                  >
                    DATE
                  </div>

                  <div
                    style="
                      margin-top: 4px;
                      font-size: 14px;
                    "
                  >
                    ${formatDate(order.createdAt)}
                  </div>
                </div>
              </div>

              <!-- Customer -->
              <div
                style="
                  padding: 18px;
                  background: #fff9f5;
                  border-radius: 12px;
                  margin-bottom: 24px;
                "
              >
                <h3
                  style="
                    margin: 0 0 12px;
                    font-size: 15px;
                  "
                >
                  Customer
                </h3>

                <div style="font-size: 14px;">
                  ${order.shippingAddress.fullName}
                </div>

                <div
                  style="
                    margin-top: 4px;
                    font-size: 14px;
                    color: #666;
                  "
                >
                  ${order.shippingAddress.phone}
                </div>
              </div>

              <!-- Items -->
              <h3
                style="
                  margin: 0 0 12px;
                  font-size: 15px;
                "
              >
                Order Items
              </h3>

              <table
                width="100%"
                cellspacing="0"
                cellpadding="0"
                style="
                  border-collapse: collapse;
                  font-size: 14px;
                "
              >
                <thead>
                  <tr>
                    <th
                      align="left"
                      style="
                        padding-bottom: 10px;
                        color: #777;
                        font-size: 12px;
                      "
                    >
                      PRODUCT
                    </th>

                    <th
                      style="
                        padding-bottom: 10px;
                        color: #777;
                        font-size: 12px;
                      "
                    >
                      QTY
                    </th>

                    <th
                      align="right"
                      style="
                        padding-bottom: 10px;
                        color: #777;
                        font-size: 12px;
                      "
                    >
                      TOTAL
                    </th>
                  </tr>
                </thead>

                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Pricing -->
              <div
                style="
                  margin-top: 20px;
                  border-top: 1px solid #eee;
                  padding-top: 16px;
                "
              >
                <table width="100%">
                  <tr>
                    <td style="padding: 5px 0; color: #777;">
                      Items Total
                    </td>

                    <td
                      align="right"
                      style="padding: 5px 0;"
                    >
                      ${formatCurrency(order.pricing.itemsTotal)}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 5px 0; color: #777;">
                      Shipping
                    </td>

                    <td
                      align="right"
                      style="padding: 5px 0;"
                    >
                      ${formatCurrency(order.pricing.shippingFee)}
                    </td>
                  </tr>

                  ${
                    order.pricing.discount > 0
                      ? `
                        <tr>
                          <td
                            style="
                              padding: 5px 0;
                              color: #16a34a;
                            "
                          >
                            Discount
                          </td>

                          <td
                            align="right"
                            style="
                              padding: 5px 0;
                              color: #16a34a;
                            "
                          >
                            -${formatCurrency(order.pricing.discount)}
                          </td>
                        </tr>
                      `
                      : ""
                  }

                  <tr>
                    <td
                      style="
                        padding-top: 12px;
                        font-size: 17px;
                        font-weight: bold;
                      "
                    >
                      Grand Total
                    </td>

                    <td
                      align="right"
                      style="
                        padding-top: 12px;
                        font-size: 17px;
                        font-weight: bold;
                      "
                    >
                      ${formatCurrency(order.pricing.grandTotal)}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Payment -->
              <div
                style="
                  margin-top: 24px;
                  padding: 16px;
                  border: 1px solid #ede9e6;
                  border-radius: 12px;
                "
              >
                <div
                  style="
                    font-size: 12px;
                    color: #999;
                  "
                >
                  PAYMENT
                </div>

                <div
                  style="
                    margin-top: 5px;
                    font-weight: bold;
                  "
                >
                  ${order.paymentMethod}
                </div>

                <div
                  style="
                    margin-top: 5px;
                    color: ${paymentColor};
                    font-size: 13px;
                    font-weight: bold;
                  "
                >
                  ${paymentStatus}
                </div>
              </div>

              <!-- Address -->
              <div style="margin-top: 24px;">
                <h3
                  style="
                    margin: 0 0 10px;
                    font-size: 15px;
                  "
                >
                  Shipping Address
                </h3>

                <p
                  style="
                    margin: 0;
                    color: #666;
                    font-size: 14px;
                    line-height: 1.6;
                  "
                >
                  ${order.shippingAddress.houseNumber}<br />

                  ${order.shippingAddress.landmark ? `${order.shippingAddress.landmark}<br />` : ""}

                  ${order.shippingAddress.formattedAddress}<br />

                  ${order.shippingAddress.city},
                  ${order.shippingAddress.state}
                  -
                  ${order.shippingAddress.postalCode}<br />

                  ${order.shippingAddress.country}
                </p>
              </div>

            </div>

            <!-- Footer -->
            <div
              style="
                padding: 20px 28px;
                background: #fafafa;
                border-top: 1px solid #eee;
                font-size: 12px;
                color: #999;
                text-align: center;
              "
            >
              YC Gifts & Toys
            </div>

          </div>
        </body>
      </html>
    `,
  };
};
