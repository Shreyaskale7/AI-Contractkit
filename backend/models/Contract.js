const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  title:      { type: String, required: true },
  content:    { type: String, required: true },
  eli5Content:{ type: String },
  aiPrompt:   { type: String },
  riskAnalysis: [{
    originalText: String,
    riskLevel: { type: String, enum: ['high', 'medium', 'low'] },
    reasoning: String
  }],
  signature: {
    data:       { type: String },  // base64 canvas image
    signedAt:   { type: Date },
    ip:         { type: String },
    userAgent:  { type: String },
    contentHash:{ type: String },
    signerName: { type: String },
    signerEmail:{ type: String },
  },
  status: { type: String, enum: ['draft', 'sent', 'signed', 'expired'], default: 'draft' },
  sentAt:     { type: Date },
  validUntil: { type: Date },
  // Every AI edit pushes the PREVIOUS content here so a bad rewrite can be undone
  versions: [{
    content:     String,
    instruction: String,                 // what change was requested
    changedBy:   { type: String, enum: ['refine', 'comment-resolve'], default: 'refine' },
    createdAt:   { type: Date, default: Date.now },
  }],
  comments: [{
    id: { type: String, default: () => Math.random().toString(36).substring(2, 9) },
    text: String,
    note: String,
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
    createdAt: { type: Date, default: Date.now }
  }],
  publicToken: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Contract', contractSchema);