const express = require('express');
const router  = express.Router();
const {
  generateContract,
  getContracts,
  getContractById,
  getPublicContract,
  signContract,
  deleteContract,
  refineContract
} = require('../controllers/contractController');
const { protect } = require('../middleware/authMiddleware');

// ── Public routes (no auth needed) ──
router.get('/public/:token',  getPublicContract);
router.post('/sign/:token',   signContract);

// ── Protected routes ──
router.use(protect);
router.post('/generate',  generateContract);
router.get('/',           getContracts);
router.get('/:id',        getContractById);
router.post('/:id/refine', refineContract);
router.delete('/:id',     deleteContract);

module.exports = router;