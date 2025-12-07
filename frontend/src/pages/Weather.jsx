import React, { useState, useEffect, useCallback } from 'react';
import { CloudSun, Droplets, Wind, Thermometer, Umbrella, MapPin, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Weather = () => {
    const { t } = useTranslation();
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_KEY = "e47d887a808fecccae21a8bf478c7ccb";
    const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
    const CACHE_KEY = 'weather_cache';

    // Check if cached data is still valid
    const getCachedData = useCallback(() => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            const now = Date.now();

            // Return cached data if less than 10 minutes old
            if (now - timestamp < CACHE_DURATION) {
                console.log('Using cached weather data');
                return data;
            }
        } catch (err) {
            console.error('Cache read error:', err);
        }
        return null;
    }, [CACHE_DURATION]);

    // Save data to cache
    const setCachedData = useCallback((data) => {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (err) {
            console.error('Cache write error:', err);
        }
    }, []);

    const fetchWeather = useCallback(async (lat, lon) => {
        // Check cache first
        const cached = getCachedData();
        if (cached) {
            setWeatherData(cached);
            setLoading(false);
            setError("Using cached data (refreshes every 10 min)");
            return;
        }

        try {
            console.log('Fetching fresh weather data...');
            // Fetch Current Weather
            const currentRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);

            // Fetch Forecast (5 Day / 3 Hour)
            const forecastRes = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);

            const data = {
                current: currentRes.data,
                forecast: forecastRes.data
            };

            setWeatherData(data);
            setCachedData(data); // Save to cache
            setLoading(false);
            setError(null);
        } catch (err) {
            console.error("Weather API Error:", err);

            // Specific handling for 429 errors
            if (err.response?.status === 429) {
                setError("⚠️ API limit exceeded. Showing demo data.");
            } else {
                setError("Live data unavailable. Showing demo weather.");
            }
            setWeatherData({
                current: {
                    name: "Your Location",
                    sys: { country: "IN" },
                    main: { temp: 28, humidity: 65, temp_max: 30, temp_min: 22 },
                    weather: [{ description: "partly cloudy", icon: "02d" }],
                    wind: { speed: 3.5 },
                    clouds: { all: 20 },
                    rain: null
                },
                forecast: {
                    list: Array(40).fill(0).map((_, i) => ({
                        dt: (Date.now() / 1000) + (i * 10800),
                        dt_txt: new Date(Date.now() + i * 10800000).toISOString(),
                        main: { temp: 28 - (i % 6), temp_max: 30, temp_min: 22 },
                        weather: [{ icon: i % 3 === 0 ? "01d" : "02d", description: "clear sky" }]
                    }))
                }
            });
            setLoading(false);
        }
    }, [API_KEY, getCachedData, setCachedData]);

    // useEffect only runs ONCE on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                },
                (err) => {
                    console.warn("Location denied, using default");
                    fetchWeather(17.3850, 78.4867);
                }
            );
        } else {
            fetchWeather(17.3850, 78.4867);
        }
    }, [fetchWeather]); // Safe dependency since fetchWeather is memoized with useCallback

    if (loading) return (
        <div className="flex justify-center items-center h-[50vh]">
            <Loader className="animate-spin text-green-600" size={32} />
        </div>
    );

    if (!weatherData) return <div className="p-4 text-center text-red-500">Weather Unavailable</div>;

    const { current, forecast } = weatherData;
    const dailyForecast = forecast.list.filter((reading) => reading.dt_txt.includes("12:00:00")).slice(0, 5);

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                {t('weather')}
                {error && <span className="text-xs text-red-500 font-normal">({error})</span>}
            </h2>

            {/* Current Weather Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
                            <MapPin size={18} />
                            {current.name}, {current.sys.country}
                        </h3>
                        <p className="text-blue-100 capitalize">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                    </div>
                    <img
                        src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
                        alt={current.weather[0].description}
                        className="w-16 h-16 bg-white/20 rounded-full"
                    />
                </div>

                <div className="mt-8 flex items-end gap-4 relative z-10">
                    <span className="text-6xl font-bold">{Math.round(current.main.temp)}°</span>
                    <span className="text-xl mb-2 capitalize">{current.weather[0].description}</span>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/20 pt-4 relative z-10">
                    <div className="flex flex-col items-center">
                        <Droplets size={20} className="mb-1 text-blue-200" />
                        <span className="text-sm">{current.main.humidity}%</span>
                        <span className="text-xs text-blue-200">Humidity</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Wind size={20} className="mb-1 text-blue-200" />
                        <span className="text-sm">{current.wind.speed} m/s</span>
                        <span className="text-xs text-blue-200">Wind</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Umbrella size={20} className="mb-1 text-blue-200" />
                        <span className="text-sm">{current.clouds.all}%</span>
                        <span className="text-xs text-blue-200">Clouds</span>
                    </div>
                </div>

                {/* Decorative Background Circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
            </div>

            {/* Agro Indices (Calculated/Mock based on real data) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                        <Thermometer size={20} className="text-red-500" />
                        <h4 className="font-semibold text-gray-700 dark:text-gray-200">Sowing Index</h4>
                    </div>
                    <p className={`text-2xl font-bold ${current.main.temp > 20 && current.main.temp < 30 ? 'text-green-600' : 'text-orange-500'}`}>
                        {current.main.temp > 20 && current.main.temp < 30 ? 'Optimal' : 'Moderate'}
                    </p>
                    <p className="text-xs text-gray-500">Based on current temp ({Math.round(current.main.temp)}°C).</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                        <Droplets size={20} className="text-blue-500" />
                        <h4 className="font-semibold text-gray-700 dark:text-gray-200">Soil Moisture</h4>
                    </div>
                    {/* Mock logic for demo */}
                    <p className="text-2xl font-bold text-blue-600">{current.rain ? 'High' : 'Normal'}</p>
                    <p className="text-xs text-gray-500">{current.rain ? 'Recent rainfall detected.' : 'No recent rain.'}</p>
                </div>
            </div>

            {/* Hourly Forecast (Next few items from list) */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Upcoming Forecast (3-Hour Steps)</h3>
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                    {forecast.list.slice(0, 8).map((item, i) => (
                        <div key={i} className="flex flex-col items-center min-w-[70px] p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                {new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <img
                                src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                                alt="icon"
                                className="w-10 h-10 my-1"
                            />
                            <span className="font-semibold text-gray-800 dark:text-white">{Math.round(item.main.temp)}°</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5-Day Forecast */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">5-Day Forecast</h3>
                <div className="space-y-4">
                    {dailyForecast.map((day, i) => (
                        <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <span className="text-gray-600 dark:text-gray-300 w-24 font-medium">
                                {new Date(day.dt * 1000).toLocaleDateString('en-IN', { weekday: 'long' })}
                            </span>
                            <div className="flex items-center gap-2">
                                <img
                                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                                    alt="icon"
                                    className="w-8 h-8"
                                />
                                <span className="text-sm text-gray-500 capitalize hidden sm:block">{day.weather[0].description}</span>
                            </div>
                            <div className="flex gap-4 w-24 justify-end">
                                <span className="font-semibold text-gray-800 dark:text-white">{Math.round(day.main.temp_max)}°</span>
                                <span className="text-gray-400">{Math.round(day.main.temp_min)}°</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Weather;
