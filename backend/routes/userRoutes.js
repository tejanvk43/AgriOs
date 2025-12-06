const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Protected route - requires authentication
router.get('/profile', protect, getUserProfile);

module.exports = router;
