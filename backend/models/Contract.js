const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  title:      { type: String, required: true },
  content:    { type: String, required: true },
  aiPrompt:   { type: String },
  riskFlags:  [{ type: String }],
  signature: {
    data:       { type: String },  // base64 canvas image
    signedAt:   { type: Date },
    ip:         { type: String },
    signerName: { type: String },
    signerEmail:{ type: String },
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'signed'],
    default: 'draft'
  },
  publicToken: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Contract', contractSchema);