require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  // Add connection timeout settings
  socketTimeout: 30000, // 30 seconds
  connectionTimeout: 30000, // 30 seconds
  greetingTimeout: 30000, // 30 seconds
  // Additional security settings
  secure: true,
  tls: {
    rejectUnauthorized: false, // Might help with certificate issues
  },
});

// Verify transporter connection
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to take messages");
  }
});

const sendEmail = async (mailOptions) => {
  try {
    // Add timeout to the sendMail operation
    const sendMailWithTimeout = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Email sending timeout after 30 seconds"));
      }, 30000);

      transporter
        .sendMail(mailOptions)
        .then((result) => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });

    let info = await sendMailWithTimeout;
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail;
