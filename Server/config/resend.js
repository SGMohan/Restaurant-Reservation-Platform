require("dotenv").config();
const {Resend} = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async (mailOptions) => {
  try {
        const response = await resend.emails.send(mailOptions);
        return response;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
module.exports = sendMail;