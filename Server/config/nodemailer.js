require("dotenv").config();
const nodemailer = require("nodemailer");

// FIXED: Using explicit SMTP host and port instead of the "gmail" service abstraction
// This is more reliable in production (Render) as it bypasses some common automation blocks
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Port 465 for SSL (highly recommended for production)
  secure: true, // Use SSL/TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // FIXED: Increased timeout settings for Render's potential cold starts/slow networking
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 5000, 
  socketTimeout: 10000,
  pool: true,
  maxConnections: 3,
  maxMessages: 100,
});

// FIXED: Added transporter verification to log issues early in production
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Transporter Error:", error.message);
    console.error("Make sure EMAIL_USER and EMAIL_PASS (App Password) are correct in Render.");
  } else {
    console.log("SMTP Transporter is ready for production email delivery");
  }
});

const sendEmail = async (mailOptions) => {
  try {
    // FIXED: Added the 'from' field if missing in mailOptions to avoid Gmail restriction
    if (!mailOptions.from) {
      mailOptions.from = {
        name: "DineArea",
        address: process.env.EMAIL_USER
      };
    }
    
    console.log(`Attempting to send email to: ${mailOptions.to}`);
    let info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    // FIXED: Better logging with specific error codes for easier debugging in Render logs
    console.error("SendEmail Function ERROR:", {
      code: error.code,
      command: error.command,
      response: error.response,
      message: error.message
    });
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

module.exports = sendEmail;

