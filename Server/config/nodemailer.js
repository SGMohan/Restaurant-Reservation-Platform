require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // your App Password (not direct Gmail password)
  },
  pool: true, // reuse connection
  maxConnections: 5,
  maxMessages: 100,
});

const sendEmail = async (mailOptions) => {
  try {
    let info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(error.message);
  }
};

module.exports = sendEmail;
