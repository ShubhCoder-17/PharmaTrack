const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. Token not provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT verify error:', err);
      return res.status(403).json({ message: 'Access denied. Invalid token.' });
    }
    req.user = decoded;
    next();
  });
};

module.exports = authenticateToken;
