const express = require('express');
const router = express.Router();
const soilController = require('../controllers/soilController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, soilController.addSoilReport);
router.get('/my-reports', protect, soilController.getMyReports);

module.exports = router;
