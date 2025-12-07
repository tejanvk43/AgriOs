const express = require('express');
const router = express.Router();
const { createAdvisory, getAdvisories } = require('../controllers/govController');
const { protect } = require('../middleware/authMiddleware');

router.post('/advisories', protect, createAdvisory);
router.get('/advisories', protect, getAdvisories);

module.exports = router;
