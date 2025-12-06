const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    verifyLandRecord,
    saveLandRecords,
    getLandRecords,
    getLandById
} = require('../controllers/landController');

// POST /api/land/verify - Verify land record (Public)
router.post('/verify', verifyLandRecord);

// POST /api/land/save - Save land records (Public - called during reg)
router.post('/save', saveLandRecords);

// GET /api/land - Get all user lands (Private)
router.get('/', protect, getLandRecords);

// GET /api/land/:id - Get specific land (Private)
router.get('/:id', protect, getLandById);

module.exports = router;
