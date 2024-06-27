const express = require('express');
const mongoose = require('mongoose');
const { generateAndStoreResetToken } = require('../utils/resetTokenService');
const User = require('../models/user.cjs'); // Ensure this path is correct

const router = express.Router();

router.post('/request-reset', async (req, res) => {
  const { userId } = req.body;

  // Ensure userId is a string and valid ObjectId
  if (typeof userId !== 'string' || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = await generateAndStoreResetToken(userId);
    // Send token via email or other means here

    res.json({ message: 'Password reset token generated', token });
  } catch (error) {
    res.status(500).json({ message: 'Failed to request password reset', error: error.message });
  }
});

module.exports = router;
