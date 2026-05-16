// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper: create a signed JWT token for a user ID
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, businessName } = req.body;

  // Check if user already exists
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });

  // Create user — the pre-save hook in User.js will hash the password
  const user = await User.create({
    name, email, passwordHash: password, businessName
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id), // send token immediately after register
  });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // matchPassword is our custom method defined in User.js
  if (user && await user.matchPassword(password)) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  // req.user is set by the protect middleware
  res.json(req.user);
};

// PUT /api/auth/profile — update profile
const updateProfile = async (req, res) => {
  const { name, businessName, phone, address, website, bio, currency } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, businessName, phone, address, website, bio, currency },
    { new: true }
  ).select('-passwordHash');

  res.json(user);
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  // Verify current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  // Set new password — pre-save hook will hash it
  user.passwordHash = newPassword;
  await user.save();

  res.json({ message: 'Password changed successfully!' });
};

module.exports = { register, login, getMe, updateProfile, changePassword };