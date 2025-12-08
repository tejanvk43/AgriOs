
import { fetchWeatherApi } from "openmeteo";
import axios from 'axios';

// Helper to interact with OpenMeteo APIs

export const weatherService = {
    // 1. Get Coordinates from Location Name (Geocoding)
    getCoordinates: async (query) => {
        try {
            // Using OpenMeteo Geocoding API (Free, no key required)
            const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
            const response = await axios.get(url);

            if (response.data.results && response.data.results.length > 0) {
                const { latitude, longitude, name, admin1, country } = response.data.results[0];
                return {
                    lat: latitude,
                    lon: longitude,
                    name: name,
                    state: admin1,
                    country: country,
                    found: true
                };
            }
            return { found: false };
        } catch (error) {
            console.error("Geocoding Error:", error);
            return { found: false, error: error.message };
        }
    },

    // 2. Get Detailed Weather Data
    getDetailedWeather: async (lat, lon) => {
        const params = {
            latitude: lat,
            longitude: lon,
            hourly: ["temperature_2m", "cloud_cover", "wind_speed_10m", "wind_gusts_10m", "temperature_120m", "temperature_180m", "visibility", "vapour_pressure_deficit", "et0_fao_evapotranspiration", "dew_point_2m", "relative_humidity_2m", "precipitation", "rain", "precipitation_probability", "weather_code", "snowfall", "snow_depth"],
            current: ["apparent_temperature", "pressure_msl", "surface_pressure", "showers", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m", "precipitation", "rain", "temperature_2m", "relative_humidity_2m", "weather_code", "cloud_cover"], // Added temp/humidity/code for general UI
            timezone: "auto",
            past_days: 0,
            forecast_days: 3
        };
        const url = "https://api.open-meteo.com/v1/forecast";

        try {
            const responses = await fetchWeatherApi(url, params);

            // Process first location
            const response = responses[0];

            const utcOffsetSeconds = response.utcOffsetSeconds();
            const current = response.current();
            const hourly = response.hourly();

            // Helper to get ranges
            const range = (start, stop, step) =>
                Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

            const weatherData = {
                current: {
                    time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
                    // Standard Fields
                    temp: current.variables(9).value(), // temperature_2m
                    humidity: current.variables(10).value(), // relative_humidity_2m
                    code: current.variables(11).value(), // weather_code
                    cloud_cover: current.variables(12).value(),

                    // Detailed Fields
                    apparent_temperature: current.variables(0).value(),
                    pressure_msl: current.variables(1).value(),
                    surface_pressure: current.variables(2).value(),
                    showers: current.variables(3).value(),
                    wind_speed_10m: current.variables(4).value(),
                    wind_direction_10m: current.variables(5).value(),
                    wind_gusts_10m: current.variables(6).value(),
                    precipitation: current.variables(7).value(),
                    rain: current.variables(8).value(),
                },
                hourly: {
                    time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
                        (t) => new Date((t + utcOffsetSeconds) * 1000)
                    ),
                    temperature_2m: hourly.variables(0).valuesArray(),
                    cloud_cover: hourly.variables(1).valuesArray(),
                    wind_speed_10m: hourly.variables(2).valuesArray(),
                    wind_gusts_10m: hourly.variables(3).valuesArray(),
                    temperature_120m: hourly.variables(4).valuesArray(),
                    temperature_180m: hourly.variables(5).valuesArray(),
                    visibility: hourly.variables(6).valuesArray(),
                    vapour_pressure_deficit: hourly.variables(7).valuesArray(),
                    et0_fao_evapotranspiration: hourly.variables(8).valuesArray(),
                    dew_point_2m: hourly.variables(9).valuesArray(),
                    relative_humidity_2m: hourly.variables(10).valuesArray(),
                    precipitation: hourly.variables(11).valuesArray(),
                    rain: hourly.variables(12).valuesArray(),
                    precipitation_probability: hourly.variables(13).valuesArray(),
                    weather_code: hourly.variables(14).valuesArray(),
                    snowfall: hourly.variables(15).valuesArray(),
                    snow_depth: hourly.variables(16).valuesArray(),
                },
            };
            return weatherData;
        } catch (error) {
            console.error("Weather Fetch Error:", error);
            throw error;
        }
    }
};

export default weatherService;
