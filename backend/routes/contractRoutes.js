const express = require('express');
const router  = express.Router();
const {
  generateContract,
  generateContractStream,
  downloadContractPdf,
  downloadPublicContractPdf,
  getContracts,
  getContractById,
  getPublicContract,
  signContract,
  deleteContract,
  refineContract,
  revertContract,
  markContractSent,
  addClientComment,
  resolveCommentWithAI,
  analyzeScope,
  logScopeDefense,
  getScopeDefenses,
  getELI5Contract,
  generateFromNotes
} = require('../controllers/contractController');
const { protect } = require('../middleware/authMiddleware');
const {
  aiLimiter,
  publicReadLimiter,
  publicWriteLimiter,
  eli5Limiter,
} = require('../middleware/rateLimiters');

// ── Public routes (no auth needed) ──
router.get('/public/:token',  publicReadLimiter, getPublicContract);
router.get('/public/:token/eli5', eli5Limiter, getELI5Contract);
router.get('/public/:token/pdf', publicReadLimiter, downloadPublicContractPdf);
router.post('/sign/:token',   publicWriteLimiter, signContract);
router.post('/public/:token/comments', publicWriteLimiter, addClientComment);

// ── Protected routes ──
router.use(protect);
// AI-backed endpoints carry a per-user/hour cap — each call spends Groq tokens.
router.post('/generate',  aiLimiter, generateContract);
router.post('/generate-stream', aiLimiter, generateContractStream);
router.post('/generate-from-notes', aiLimiter, generateFromNotes);
router.get('/',           getContracts);
// Static path — must be declared before '/:id' so it isn't captured as an id.
router.get('/scope-defenses', getScopeDefenses);
router.post('/:id/scope-defense', logScopeDefense);
router.get('/:id/pdf',    downloadContractPdf);
router.get('/:id',        getContractById);
router.post('/:id/refine', aiLimiter, refineContract);
router.post('/:id/revert', revertContract);
router.post('/:id/send',   markContractSent);
router.post('/:id/comments/:commentId/resolve', aiLimiter, resolveCommentWithAI);
router.post('/:id/analyze-scope', aiLimiter, analyzeScope);
router.delete('/:id',     deleteContract);

module.exports = router;
