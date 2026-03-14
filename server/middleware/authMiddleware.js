const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── Protect route middleware ──────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  // Token must be in Authorization header as: Bearer <token>
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized — no token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user to request (exclude password)
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ error: 'User not found.' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Not authorized — invalid token.' });
  }
};

// ── Admin-only middleware ─────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ error: 'Access denied — admins only.' });
};

module.exports = { protect, adminOnly };