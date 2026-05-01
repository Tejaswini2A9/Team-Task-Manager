const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // allow self-signed certs
      },
    });

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Team Task Manager'}" <${process.env.SMTP_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.email}: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    // Log the error but do NOT throw — email failure should not crash the request
    console.error('Email send failed:', error.message);
    // Print OTP to console as a fallback during development
    if (options.otp) {
      console.log(`[DEV FALLBACK] OTP for ${options.email}: ${options.otp}`);
    }
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
