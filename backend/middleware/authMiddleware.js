// backend/middleware/authMiddleware.js
// ─────────────────────────────────────────
// MIDDLEWARE = a function that runs BEFORE your route handler.
// This one checks: "Is there a valid JWT in the request header?"
// If yes → let the request through. If no → block it immediately.
// ─────────────────────────────────────────

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // JWT is sent in the Authorization header as: "Bearer <token>"
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // extract token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify + decode
      req.user = await User.findById(decoded.id).select('-passwordHash'); // attach user to request
      // Token is valid but the user may have been deleted — guard so handlers
      // don't crash on req.user._id.
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user no longer exists' });
      }
      next(); // ✅ valid — continue to the route handler
    } catch (err) {
      return res.status(401).json({ message: 'Token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };