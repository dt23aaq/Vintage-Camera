const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from Authorization header
 * Expects: Authorization: Bearer <token>
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Missing or invalid authorization header' 
      });
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Token verification failed' });
  }
};

/**
 * Middleware to verify admin role
 * Must be used after verifyToken
 */
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin role required.' 
    });
  }
  next();
};

/**
 * Generate a JWT token
 * @param {Object} payload - Data to encode in token
 * @param {string} expiresIn - Token expiration time (default: 24h)
 * @returns {string} JWT token
 */
const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

module.exports = {
  verifyToken,
  verifyAdmin,
  generateToken
};
