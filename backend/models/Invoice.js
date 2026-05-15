// backend/models/Invoice.js
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  invoiceNumber: { type: String, required: true },
  items: [{
    description: { type: String, required: true },
    quantity:    { type: Number, required: true },
    rate:        { type: Number, required: true },
    total:       { type: Number, required: true },
  }],
  totalAmount:  { type: Number, required: true },
  currency:     { type: String, default: 'INR' },
  dueDate:      { type: Date, required: true },
  status:       { type: String, enum: ['unpaid', 'paid', 'overdue'], default: 'unpaid' },
  notes:        { type: String, default: '' },
  remindersSent: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);