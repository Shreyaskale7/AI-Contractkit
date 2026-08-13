// backend/controllers/invoiceController.js
const Invoice = require('../models/Invoice');

// POST /api/invoices
const createInvoice = async (req, res) => {
  const { clientId, items, dueDate, currency, notes } = req.body;

  if (!clientId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'A client and at least one line item are required' });
  }
  if (!dueDate) {
    return res.status(400).json({ message: 'A due date is required' });
  }

  // Calculate totals automatically, coercing numbers so bad input can't produce NaN
  const processedItems = items.map(item => {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    return { description: String(item.description || ''), quantity, rate, total: quantity * rate };
  });

  const totalAmount = processedItems.reduce((sum, item) => sum + item.total, 0);

  // Auto-generate invoice number: INV-001, INV-002...
  const count = await Invoice.countDocuments({ userId: req.user._id });
  const invoiceNumber = `INV-${String(count + 1).padStart(3, '0')}`;

  const invoice = await Invoice.create({
    userId: req.user._id,
    clientId,
    invoiceNumber,
    items: processedItems,
    totalAmount,
    currency: currency || 'INR',
    dueDate,
    notes,
  });

  res.status(201).json(invoice);
};

// GET /api/invoices
const getInvoices = async (req, res) => {
  const invoices = await Invoice.find({ userId: req.user._id })
    .populate('clientId', 'name email company')
    .sort('-createdAt')
    .limit(500);
  res.json(invoices);
};

// PUT /api/invoices/:id/status — mark as paid/overdue
const updateInvoiceStatus = async (req, res) => {
  const { status } = req.body;
  if (!['unpaid', 'paid', 'overdue'].includes(status)) {
    return res.status(400).json({ message: 'Invalid invoice status' });
  }
  const invoice = await Invoice.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { status },
    { new: true, runValidators: true }
  );
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  res.json(invoice);
};

// DELETE /api/invoices/:id
const deleteInvoice = async (req, res) => {
  await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ message: 'Invoice deleted' });
};

module.exports = { createInvoice, getInvoices, updateInvoiceStatus, deleteInvoice };