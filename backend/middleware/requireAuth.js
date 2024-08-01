const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET; // Replace with your secret key

const requireAuth = (req, res, next) => {
  // Get token from the Authorization header
  const token = req.headers.authorization?.split(' ')[1]; // Extract token

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  // Verify and decode the token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' });
      } else {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
      }
    }

    // Attach decoded payload to the request object
    req.user = decoded;
    next(); // Move to the next middleware or route handler
  });
};

module.exports = requireAuth;
