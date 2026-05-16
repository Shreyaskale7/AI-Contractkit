// backend/routes/templateRoutes.js
const express = require('express');
const router  = express.Router();
const {
  createTemplate,
  saveContractAsTemplate,
  getTemplates,
  getTemplateById,
  deleteTemplate
} = require('../controllers/templateController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/',                          getTemplates);
router.post('/',                         createTemplate);
router.post('/from-contract/:id',        saveContractAsTemplate);
router.get('/:id',                       getTemplateById);
router.delete('/:id',                    deleteTemplate);

module.exports = router;