// backend/routes/proposalRoutes.js
const express = require('express');
const router  = express.Router();
const {
  generateProposal,
  getProposals,
  getProposalById,
  updateProposalStatus,
  deleteProposal
} = require('../controllers/proposalController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiters');

router.use(protect);
router.post('/generate',       aiLimiter, generateProposal);
router.get('/',                getProposals);
router.get('/:id',             getProposalById);
router.put('/:id/status',      updateProposalStatus);
router.delete('/:id',          deleteProposal);

module.exports = router;