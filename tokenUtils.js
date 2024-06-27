// utils/tokenUtils.js
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function sendResetEmail(email, token) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Password Reset',
    text: `You requested a password reset. Click the following link to reset your password: ${process.env.BASE_URL}/reset-password?token=${token}`
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { generateResetToken, sendResetEmail };
