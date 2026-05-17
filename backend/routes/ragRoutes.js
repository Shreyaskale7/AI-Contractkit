const express = require('express');
const router  = express.Router();
const {
  indexAllContracts,
  generateWithRAG,
  uploadContracts,
  getStats
} = require('../controllers/ragController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/generate',   generateWithRAG);
router.post('/index-all',  indexAllContracts);
router.post('/upload',     uploadContracts);
router.get('/stats',       getStats);

module.exports = router;