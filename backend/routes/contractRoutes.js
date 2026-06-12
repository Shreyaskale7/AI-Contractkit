const express = require('express');
const rateLimit = require('express-rate-limit');
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
  getELI5Contract,
  generateFromNotes
} = require('../controllers/contractController');
const { protect } = require('../middleware/authMiddleware');

// Public endpoints are unauthenticated — rate-limit them so a leaked link
// can't be used to spam comments or burn AI quota via /eli5.
const publicReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests — please try again later.' },
});
const eli5Limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10, // triggers a paid AI call on cache miss
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many translation requests — please try again later.' },
});

// ── Public routes (no auth needed) ──
router.get('/public/:token',  publicReadLimiter, getPublicContract);
router.get('/public/:token/eli5', eli5Limiter, getELI5Contract);
router.get('/public/:token/pdf', publicReadLimiter, downloadPublicContractPdf);
router.post('/sign/:token',   publicWriteLimiter, signContract);
router.post('/public/:token/comments', publicWriteLimiter, addClientComment);

// ── Protected routes ──
router.use(protect);
router.post('/generate',  generateContract);
router.post('/generate-stream', generateContractStream);
router.post('/generate-from-notes', generateFromNotes);
router.get('/',           getContracts);
router.get('/:id/pdf',    downloadContractPdf);
router.get('/:id',        getContractById);
router.post('/:id/refine', refineContract);
router.post('/:id/revert', revertContract);
router.post('/:id/send',   markContractSent);
router.post('/:id/comments/:commentId/resolve', resolveCommentWithAI);
router.post('/:id/analyze-scope', analyzeScope);
router.delete('/:id',     deleteContract);

module.exports = router;
