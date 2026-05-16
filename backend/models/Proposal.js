// backend/models/Proposal.js
const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  title:    { type: String, required: true },
  content:  { type: String, required: true }, // AI generated HTML
  aiPrompt: { type: String },
  budget:   { type: String },
  timeline: { type: String },
  status:   { type: String, enum: ['draft', 'sent', 'accepted', 'rejected'], default: 'draft' },
  publicToken: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Proposal', proposalSchema);