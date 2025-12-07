const express = require('express');
const router = express.Router();
const {
    getGodowns,
    getMyGodown,
    createGodown,
    updateCapacity,
    logStockMovement,
    getStockLogs,
    getConnectedFarmers
} = require('../controllers/godownController');
const { protect } = require('../middleware/authMiddleware');

// General routes (admin)
router.get('/', protect, getGodowns);
router.post('/', protect, createGodown);
router.put('/:id/capacity', protect, updateCapacity);

// Manager routes (single godown)
router.get('/my-godown', protect, getMyGodown);
router.post('/stock-log', protect, logStockMovement);
router.get('/stock-logs', protect, getStockLogs);
router.get('/farmers', protect, getConnectedFarmers);

module.exports = router;
