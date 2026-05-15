// backend/routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const { getClients, createClient, updateClient, deleteClient } = require('../controllers/clientController');
const { protect } = require('../middleware/authMiddleware');

// ALL client routes are protected — must be logged in
router.use(protect);

router.route('/').get(getClients).post(createClient);
router.route('/:id').put(updateClient).delete(deleteClient);

module.exports = router;