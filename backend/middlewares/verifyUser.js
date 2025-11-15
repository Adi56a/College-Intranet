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
    }
    else if (decoded.role === 'admin'){
      req.admin  = decoded;
    } else {
      return res.status(403).json({ message: 'Access forbidden: role not authorized.' });
    }

    next(); // Proceed to next middleware or route handler
  } catch (error) {
    console.error('JWT verification failed:', error);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = verifyUser;
