// config/nodemailer.js
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true, 
  maxConnections: 5, 
  maxMessages: 100, 
});

const sendEmail = async (mailOptions) => {
  try {
    if (!mailOptions.from) {
      mailOptions.from = {
        name: process.env.EMAIL_FROM_NAME || "DineArea",
        address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER,
      };
    }
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("Error in sendEmail helper:", error.message);
    throw new Error(error.message);
  }
};

module.exports = sendEmail;
