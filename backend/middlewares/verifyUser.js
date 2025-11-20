const jwt = require('jsonwebtoken');
const secretkey = 'secretkey'; // Use your actual secret key here

// Middleware to check if the user is authenticated (teacher or student)
function verifyUser(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify token and decode payload
    const decoded = jwt.verify(token, secretkey);

    // Check role and set appropriate request property
    if (decoded.role === 'teacher') {
      req.teacher = decoded;
    } else if (decoded.role === 'student') {
      req.student = decoded;
    } else if (decoded.role === 'admin') {
      req.admin = decoded;
    } else {
      return res.status(403).json({ message: 'Access forbidden: role not authorized.' });
    }

    next(); // Proceed to next middleware or route handler
  } catch (error) {
    // Handle JWT specific errors gracefully without logging full stack trace
    if (error.name === 'TokenExpiredError') {
      // Token expired
      // Optionally log for audit: console.warn('Token expired for request from IP:', req.ip);
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      // Invalid token
      // Optionally log for audit: console.warn('Invalid token for request from IP:', req.ip);
      return res.status(401).json({ message: 'Invalid token. Please login again.' });
    }
    // Other or unknown errors, avoid logging error details, just send generic message
    return res.status(401).json({ message: 'Authentication failed.' });
  }
}

module.exports = verifyUser;
