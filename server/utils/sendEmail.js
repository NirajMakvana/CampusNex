const nodemailer = require('nodemailer');

// Reuse transporter across calls — avoids creating a new SMTP connection every time
let _transporter = null;

const getTransporter = () => {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return _transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"CampusNex" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
