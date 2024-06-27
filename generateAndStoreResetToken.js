const { generateResetToken, storeResetToken } = require('../utils/resetTokenService');
const User = require('./models/user.cjs'); // Adjust the path as needed

const generateAndStoreToken = async (userId) => {
  try {
    const token = generateResetToken();
    await storeResetToken(userId, token);
    console.log(`Reset token generated and stored for user ID: ${userId}`);
  } catch (error) {
    console.error('Error generating and storing reset token:', error);
  }
};

// Usage example
// const userId = 'someUserId'; // Replace with actual user ID
// generateAndStoreToken(userId);
