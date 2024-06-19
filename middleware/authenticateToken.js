const jwt = require('jsonwebtoken');
const { User } = require('../models/user.cjs'); // Adjust the path as needed

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing' });
  }

  if (revokedTokens.includes(token)) {
    return res.status(403).json({ message: 'Token has been revoked' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user; // Attach user data to request object
    next();
  });
};

module.exports = authenticateToken;
