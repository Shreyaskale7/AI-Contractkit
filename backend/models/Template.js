// backend/models/Template.js
const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:    { type: String, required: true },
  content:  { type: String, required: true },
  prompt:   { type: String },
  category: {
    type: String,
    enum: ['Web Development', 'Mobile Development', 'Design', 'Content Writing', 'Consulting', 'Other'],
    default: 'Other'
  },
  usageCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);