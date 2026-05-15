// backend/models/Contract.js
const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  title:      { type: String, required: true },
  content:    { type: String, required: true }, // AI-generated HTML contract
  aiPrompt:   { type: String },                 // original prompt user typed
  riskFlags:  [{ type: String }],               // AI risk detector output
  signature: {
    data:     { type: String },   // base64 canvas signature
    signedAt: { type: Date },
    ip:       { type: String },
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'signed'],
    default: 'draft'
  },
  publicToken: { type: String }, // for shareable public link
}, { timestamps: true });

module.exports = mongoose.model('Contract', contractSchema);