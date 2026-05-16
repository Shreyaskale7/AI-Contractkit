// backend/models/User.js
// ─────────────────────────────────────────
// A Mongoose Schema defines the SHAPE of data stored in MongoDB.
// Think of it like a form template — every user document follows this structure.
// ─────────────────────────────────────────

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  businessName: { type: String, default: '' },
  logo:         { type: String, default: '' }, // Cloudinary URL later
  phone:        { type: String, default: '' },        // ← add
  address:      { type: String, default: '' },        // ← add
  website:      { type: String, default: '' },        // ← add
  bio:          { type: String, default: '' },        // ← add
  currency:     { type: String, default: 'INR' },
}, { timestamps: true }); // adds createdAt + updatedAt automatically

// INSTANCE METHOD: call user.matchPassword(enteredPassword) to verify login
// We never store raw passwords — always compare against the hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// PRE-SAVE HOOK: runs automatically before saving a user to DB
// If password was changed, hash it before storing
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

module.exports = mongoose.model('User', userSchema);