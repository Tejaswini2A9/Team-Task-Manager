const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Team Task Manager" <${process.env.GMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`,
    });

    console.log(`✓ Email sent to ${options.email}`);
    return { success: true };
  } catch (error) {
    console.error('✗ Email send failed:', error.message);
    if (options.otp) {
      console.log(`[DEV FALLBACK] OTP for ${options.email} → ${options.otp}`);
    }
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
