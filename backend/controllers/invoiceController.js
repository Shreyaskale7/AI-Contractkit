// backend/controllers/invoiceController.js
const Invoice = require('../models/Invoice');

// POST /api/invoices
const createInvoice = async (req, res) => {
  const { clientId, items, dueDate, currency, notes } = req.body;

  // Calculate totals automatically
  const processedItems = items.map(item => ({
    ...item,
    total: item.quantity * item.rate
  }));

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
    .sort('-createdAt');
  res.json(invoices);
};

// PUT /api/invoices/:id/status — mark as paid/overdue
const updateInvoiceStatus = async (req, res) => {
  const { status } = req.body;
  const invoice = await Invoice.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { status },
    { new: true }
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