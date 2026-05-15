
// backend/models/Client.js
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  // Every client belongs to ONE user (the freelancer)
  // ObjectId is a reference — like a foreign key in SQL
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:     { type: String, required: true },
  email:    { type: String, required: true },
  phone:    { type: String, default: '' },
  company:  { type: String, default: '' },
  status:   { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);