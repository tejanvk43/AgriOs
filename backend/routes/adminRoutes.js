const express = require('express');
const router = express.Router();
const { getUsers, createUser, getStats, getFarmerDetails } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

// Add specific Admin-only middleware here if needed
router.get('/users', protect, getUsers);
router.post('/users', protect, createUser);
router.get('/stats', protect, getStats);
router.get('/farmers/:id', protect, getFarmerDetails);

module.exports = router;
