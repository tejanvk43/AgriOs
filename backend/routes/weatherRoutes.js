const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// GET /api/weather?location=CityName
router.get('/', weatherController.getCurrentWeather);

// GET /api/weather/forecast?location=CityName
router.get('/forecast', weatherController.getForecast);

module.exports = router;
