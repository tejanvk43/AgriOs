const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Configure Multer for Image Uploads
const upload = multer({ dest: 'uploads/' });

router.post('/chat', upload.single('image'), protect, aiController.chatAgent);
router.post('/voice-audio', upload.single('image'), protect, aiController.voiceAudio);
router.post('/diagnose', upload.single('image'), protect, aiController.diagnosePest);
router.get('/history', protect, aiController.getChatHistory);
router.post('/recommend', protect, aiController.recommendCrops);
router.post('/extract-soil', protect, upload.single('image'), aiController.extractSoilFromImage);

module.exports = router;
