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

        const apiKey = process.env.WEATHER_API_KEY;

        // Helper function to fetch weather
        const fetchWeather = async (query) => {
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&units=metric&appid=${apiKey}`;
            return await axios.get(apiUrl);
        };

        let response;
        try {
            response = await fetchWeather(location);
        } catch (err) {
            // If 404 and location has commas, try the last part (District/City)
            if (err.response && err.response.status === 404 && location.includes(',')) {
                const parts = location.split(',');
                const fallbackQuery = parts[parts.length - 1].trim(); // Try the district/city
                console.log(`Weather 404 for "${location}", retrying with "${fallbackQuery}"`);
                try {
                    response = await fetchWeather(fallbackQuery);
                } catch (fallbackErr) {
                    throw fallbackErr; // Throw original or fallback error
                }
            } else {
                throw err;
            }
        }

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

