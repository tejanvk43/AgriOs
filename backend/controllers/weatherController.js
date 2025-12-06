const axios = require('axios');

// @desc    Get current weather by location name
// @route   GET /api/weather
// @access  Public (or Protected)
exports.getCurrentWeather = async (req, res) => {
    try {
        const { location } = req.query;

        if (!location) {
            return res.status(400).json({ message: 'Location is required' });
        }

        // Use the API key from env
        const apiKey = process.env.WEATHER_API_KEY;
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${apiKey}`;

        const response = await axios.get(apiUrl);
        const data = response.data;

        // Simplify response for frontend
        const weatherData = {
            temp: Math.round(data.main.temp),
            description: data.weather[0].main, // e.g. 'Clouds', 'Rain'
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            city: data.name
        };

        res.json(weatherData);

    } catch (error) {
        // Detailed logging
        if (error.response) {
            console.error('Weather API Error:', error.response.status, error.response.data);
            return res.status(error.response.status).json(error.response.data);
        } else {
            console.error('Weather API Network Error:', error.message);
            res.status(500).json({ message: 'Error communicating with Weather Service' });
        }
    }
};

