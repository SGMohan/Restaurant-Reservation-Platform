require("dotenv").config();
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (mailOptions) => {
  try {
    const senderName = mailOptions.from?.name || "DineArea";
    const senderEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    const msg = {
      to: mailOptions.to,
      from: {
        name: senderName,
        email: senderEmail // Must be a verified sender in SendGrid
      },
      subject: mailOptions.subject,
      text: mailOptions.text,
      html: mailOptions.html,
      // Pass other fields if they exist (headers, etc.)
      headers: mailOptions.headers,
    };

    console.log(`Attempting to send email via SendGrid API to: ${msg.to}`);
    const response = await sgMail.send(msg);
    console.log(`Email sent successfully via SendGrid! Status: ${response[0].statusCode}`);
    return response[0];
  } catch (error) {
    console.error("SendGrid API ERROR:", {
      message: error.message,
      body: error.response ? error.response.body : "No response body",
    });
    throw error;
  }
};

module.exports = sendEmail;
