import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // ignore certificate errors
  },
});
const sendMail = async (data) => {
  try {
    var mailOptions = {
      from: process.env.SMTP_MAIL,
      to: data.email,
      subject: data.subject,
      html: data.content,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
      console.log(info.messageId);
    });
  } catch (error) {
    console.log(error.message);
  }
};

export { sendMail };
