// backend/models/ScopeDefense.js
// A logged outcome from the Scope Creep Defender: a client request the user
// identified as additional (out-of-scope) work, with the value they expect to
// recover. Aggregated into a "revenue protected" figure on the dashboard.
const mongoose = require('mongoose');

const scopeDefenseSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
  clientName: { type: String, default: '' },
  requestText:{ type: String, default: '' },
  isOutOfScope: { type: Boolean, default: true },
  estimatedValue: { type: Number, default: 0, min: 0 },
  currency:   { type: String, default: 'INR' },
  // logged  = caught it, not yet acted on
  // billed  = converted into a paid add-on / invoice
  // waived  = chose to do it for free (goodwill)
  status:     { type: String, enum: ['logged', 'billed', 'waived'], default: 'logged' },
}, { timestamps: true });

module.exports = mongoose.model('ScopeDefense', scopeDefenseSchema);
