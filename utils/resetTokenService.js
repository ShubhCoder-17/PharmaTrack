const mongoose = require('mongoose');
const ResetToken = require('../models/resetToken.model');

async function generateAndStoreResetToken(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format');
  }

  const resetToken = new ResetToken({
    userId: mongoose.Types.ObjectId(userId),
    token: 'your-generated-token', // Generate your token here
    expiresAt: new Date(Date.now() + 3600000) // Token expires in 1 hour
  });

  await resetToken.save();
  return resetToken.token;
}

module.exports = { generateAndStoreResetToken };
