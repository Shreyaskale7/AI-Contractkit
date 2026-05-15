// backend/routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const { createInvoice, getInvoices, updateInvoiceStatus, deleteInvoice } = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getInvoices).post(createInvoice);
router.put('/:id/status', updateInvoiceStatus);
router.delete('/:id', deleteInvoice);

module.exports = router;