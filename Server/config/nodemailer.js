require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = async (mailOptions) => {
  try {
    let info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = sendEmail;
