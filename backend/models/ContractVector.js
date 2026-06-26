// backend/models/ContractVector.js
// Persistent backing store for the contract similarity index.
// Previously this lived only in process memory, so the "learning library"
// was wiped on every restart / cold start. Now each indexed document is a
// row here, and the in-memory cache in config/vectordb.js is hydrated from it.
const mongoose = require('mongoose');

const contractVectorSchema = new mongoose.Schema({
  category: { type: String, required: true, index: true },
  docId:    { type: String, required: true }, // contractId or an upload id
  content:  { type: String, required: true }, // truncated contract text
  // Sparse word-frequency vector: { word: count }. Stored as a plain object.
  vector:   { type: mongoose.Schema.Types.Mixed, default: {} },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

// One row per document within a category; lets add() upsert safely.
contractVectorSchema.index({ category: 1, docId: 1 }, { unique: true });

module.exports = mongoose.model('ContractVector', contractVectorSchema);
