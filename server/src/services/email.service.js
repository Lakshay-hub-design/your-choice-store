import resend from "../config/resend.js";

const sendEmail = async ({ to, subject, html }) => {
  const res = await resend.emails.send({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  });
};

const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    html: verificationEmailTemplate(verificationUrl, user.fullName),
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    html: passwordResetTemplate(resetUrl, user.fullName),
  });
};

const verificationEmailTemplate = (url, name) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
</head>
<body>

<h2>Welcome ${name} 👋</h2>

<p>
Thanks for creating your account.
Please verify your email by clicking the button below.
</p>

<p>
<a href="${url}">
Verify Email
</a>
</p>

<p>
This link expires in 24 hours.
</p>

</body>
</html>
`;

const passwordResetTemplate = (url, name) => `
<!DOCTYPE html>
<html>

<body>

<h2>Hello ${name}</h2>

<p>
Click below to reset your password.
</p>

<p>
<a href="${url}">
Reset Password
</a>
</p>

<p>
This link expires in 15 minutes.
</p>

</body>

</html>
`;

const emailServce = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};

export default emailServce;
