import { buildSellerOrderEmail } from "../templates/sellerOrder.template.js";

import resend from "../../../config/resend.js";

import { sendEmail } from "../../../services/email.service.js";

const SELLER_EMAIL = process.env.SELLER_ORDER_EMAIL;

export const sendSellerNewOrderEmail = async (order) => {
  const email = buildSellerOrderEmail({
    order,
    type: "NEW_ORDER",
  });
  await sendEmail({
    to: SELLER_EMAIL,
    subject: email.subject,
    html: email.html,
  });
};

export const sendSellerPaidOrderEmail = async (order) => {
  const email = buildSellerOrderEmail({
    order,
    type: "PAID_ORDER",
  });

  await sendEmail({
    to: SELLER_EMAIL,
    subject: email.subject,
    html: email.html,
  });
};
