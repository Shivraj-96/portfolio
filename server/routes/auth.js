const express  = require('express');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── POST /api/auth/register ───────────────────────────────────────
router.post('/register', async (req, res) => {
  console.log('📥 Register attempt:', req.body); // ← shows what was received

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password });
    console.log('✅ User created:', user.email);

    res.status(201).json({
      message: 'Registration successful.',
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('❌ Register error full:', err); // ← shows exact error
    res.status(500).json({ error: err.message });  // ← now returns real error
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────
router.post('/login', async (req, res) => {
  console.log('📥 Login attempt:', req.body.email);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    console.log('✅ Login success:', user.email);

    res.json({
      message: 'Login successful.',
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({
    id: req.user._id, name: req.user.name,
    email: req.user.email, role: req.user.role,
  });
});

module.exports = router;