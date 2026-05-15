// backend/routes/contractRoutes.js
const express = require('express');
const router = express.Router();
const {
  generateContract,
  getContracts,
  getContractById,
  getPublicContract,
  deleteContract
} = require('../controllers/contractController');
const { protect } = require('../middleware/authMiddleware');

// Public route — no token needed (for client to view and sign)
router.get('/public/:token', getPublicContract);

// Protected routes — must be logged in
router.use(protect);
router.post('/generate', generateContract);
router.get('/', getContracts);
router.get('/:id', getContractById);
router.delete('/:id', deleteContract);

module.exports = router;