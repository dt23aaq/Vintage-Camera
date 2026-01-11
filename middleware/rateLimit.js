/**
 * Simple in-memory rate limiter
 * For production, use redis-based rate limiting
 */
const requestCounts = new Map();

/**
 * Rate limiting middleware
 * @param {number} maxRequests - Maximum requests allowed per window
 * @param {number} windowMs - Time window in milliseconds
 */
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    // Get or create request tracking
    if (!requestCounts.has(key)) {
      requestCounts.set(key, []);
    }
    
    let requests = requestCounts.get(key);
    
    // Remove old requests outside window
    requests = requests.filter(timestamp => now - timestamp < windowMs);
    
    if (requests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000)
      });
    }
    
    // Add current request
    requests.push(now);
    requestCounts.set(key, requests);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - requests.length);
    
    next();
  };
};

/**
 * Stricter rate limit for auth endpoints
 * 5 requests per 15 minutes
 */
const authRateLimit = rateLimit(5, 15 * 60 * 1000);

/**
 * Standard rate limit for API endpoints
 * 100 requests per 15 minutes
 */
const apiRateLimit = rateLimit(100, 15 * 60 * 1000);

module.exports = {
  rateLimit,
  authRateLimit,
  apiRateLimit
};
