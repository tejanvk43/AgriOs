const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const cropController = require('../controllers/cropController');

// Add a new crop
router.post('/', protect, cropController.addCrop);

// Get all active crops for the user (Dashboard summary)
router.get('/active', protect, cropController.getAllActiveCrops);

// Get crops for a specific land record
router.get('/land/:landId', protect, cropController.getCropsByLand);

module.exports = router;
