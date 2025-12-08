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

// @desc    Get 5-day forecast and generated advisories
// @route   GET /api/weather/forecast
exports.getForecast = async (req, res) => {
    try {
        const { location } = req.query;

        if (!location) {
            return res.status(400).json({ message: 'Location is required' });
        }

        const apiKey = process.env.WEATHER_API_KEY;
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&units=metric&appid=${apiKey}`;

        // Helper to fetch with retry logic
        const fetchForecast = async (url) => {
            try {
                return await axios.get(url);
            } catch (err) {
                if (err.response && err.response.status === 404 && location.includes(',')) {
                    const parts = location.split(',');
                    const fallbackQuery = parts[parts.length - 1].trim();
                    console.log(`Forecast 404 for "${location}", retrying with "${fallbackQuery}"`);
                    const fallbackUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(fallbackQuery)}&units=metric&appid=${apiKey}`;
                    return await axios.get(fallbackUrl);
                }
                throw err;
            }
        };

        const response = await fetchForecast(apiUrl);
        const list = response.data.list;

        // Process Forecast (Daily summary)
        const dailyForecast = [];
        const seenDates = new Set();

        list.forEach(item => {
            const date = item.dt_txt.split(' ')[0];
            if (!seenDates.has(date) && dailyForecast.length < 5) {
                dailyForecast.push({
                    date: date,
                    temp: Math.round(item.main.temp),
                    description: item.weather[0].main,
                    icon: item.weather[0].icon,
                    rain: item.rain ? item.rain['3h'] || 0 : 0
                });
                seenDates.add(date);
            }
        });

        // Generate Real-time Advisories based on Forecast
        const advisories = [];
        const today = list.slice(0, 8); // Next 24 hours (3hr intervals * 8)

        // Rule 1: Rain Alert
        const impendingRain = today.some(item => item.weather[0].main === 'Rain' || (item.rain && item.rain['3h'] > 0));
        if (impendingRain) {
            advisories.push({
                type: 'warning', // red
                title: 'Rain Expected Nearby',
                message: 'Heavy rain predicted in the next 24 hours. Delay any planned pesticide or fertilizer spraying to prevent runoff.',
                action: 'Postpone Spraying'
            });
        }

        // Rule 2: High Temperature Alert
        const maxTemp = Math.max(...today.map(item => item.main.temp));
        if (maxTemp > 35) {
            advisories.push({
                type: 'caution', // orange
                title: 'High Heat Alert',
                message: `Temperatures reaching ${Math.round(maxTemp)}°C. Soil moisture evaporation will be high.`,
                action: 'Irrigate in Evening'
            });
        }

        // Rule 3: Wind Alert
        const maxWind = Math.max(...today.map(item => item.wind.speed));
        if (maxWind > 10) { // 10 m/s is roughly 36 km/h
            advisories.push({
                type: 'caution', // orange
                title: 'Strong Winds',
                message: 'Strong winds detected. Avoid spraying and support tall crops if necessary.',
                action: 'Secure Crops'
            });
        }

        // Default "All Good" if no alerts
        if (advisories.length === 0) {
            advisories.push({
                type: 'success', // green
                title: 'Favorable Conditions',
                message: 'Weather is clear for farm activities. Perfect time for sowing or weeding.',
                action: 'Plan Activities'
            });
        }

        res.json({
            forecast: dailyForecast,
            advisories: advisories,
            city: response.data.city.name
        });

    } catch (error) {
        if (error.response) {
            console.error('Forecast API Error:', error.response.status);
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ message: 'Error fetching forecast' });
    }
};

