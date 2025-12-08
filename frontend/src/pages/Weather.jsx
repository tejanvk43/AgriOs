import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CloudSun, Droplets, Wind, Thermometer, Umbrella, MapPin, Loader, Calendar, Clock, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import weatherService from '../services/weatherService';

const Weather = () => {
    const { t } = useTranslation();
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationName, setLocationName] = useState("Loading location...");
    const [usingFieldLocation, setUsingFieldLocation] = useState(false);

    // Time Selection State
    const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);

    const fetchWeather = useCallback(async (lat, lon, name = "Your Location") => {
        try {
            setLoading(true);
            const data = await weatherService.getDetailedWeather(lat, lon);
            setWeatherData(data);
            setLocationName(name);

            // Find index of current hour in hourly array for initial selection
            const now = new Date();
            const closestIndex = data.hourly.time.findIndex(time => time > now);
            setSelectedTimeIndex(closestIndex !== -1 ? closestIndex : 0);

            setError(null);
        } catch (err) {
            console.error("Weather Fetch Error:", err);
            setError("Could not load weather data.");
        } finally {
            setLoading(false);
        }
    }, []);

    const initWeather = useCallback(async () => {
        try {
            // 1. Try to get registered land first
            const token = localStorage.getItem('token');
            let fieldFound = false;

            if (token) {
                try {
                    const res = await axios.get('/api/land', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (res.data && res.data.length > 0) {
                        const land = res.data[0];
                        // Construct query: "Village, Mandal, District"
                        const query = `${land.village}, ${land.mandal}, ${land.district}`;
                        console.log("Geocoding Field:", query);

                        const geo = await weatherService.getCoordinates(query);
                        if (geo.found) {
                            setUsingFieldLocation(true);
                            await fetchWeather(geo.lat, geo.lon, `${geo.name} (Your Field)`);
                            fieldFound = true;
                        }
                    }
                } catch (e) {
                    console.warn("Failed to fetch lands:", e);
                }
            }

            // 2. Fallback to geolocation
            if (!fieldFound) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            fetchWeather(position.coords.latitude, position.coords.longitude, "Current Location");
                        },
                        (err) => {
                            console.warn("Location denied, using default");
                            fetchWeather(17.3850, 78.4867, "Hyderabad (Default)");
                        }
                    );
                } else {
                    fetchWeather(17.3850, 78.4867, "Hyderabad (Default)");
                }
            }

        } catch (err) {
            console.error("Init Error:", err);
            setLoading(false);
        }
    }, [fetchWeather]);

    useEffect(() => {
        initWeather();
    }, [initWeather]);

    // Helpers for display
    const formatValue = (val, unit = "") => val !== undefined && val !== null ? `${Math.round(val)}${unit}` : "N/A";
    const formatDecimal = (val, unit = "") => val !== undefined && val !== null ? `${val.toFixed(1)}${unit}` : "N/A";

    const getWeatherIcon = (code) => {
        // Simple mapping for OpenMeteo WMO codes
        if (code === 0) return "01d"; // Clear
        if (code <= 3) return "02d"; // Cloudy
        if (code <= 48) return "50d"; // Fog
        if (code <= 67) return "09d"; // Rain
        if (code <= 77) return "13d"; // Snow
        if (code <= 82) return "09d"; // Showers
        if (code <= 99) return "11d"; // Thunderstorm
        return "02d";
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[50vh]">
            <Loader className="animate-spin text-green-600" size={32} />
        </div>
    );

    if (!weatherData) return <div className="p-4 text-center text-red-500">Weather Unavailable</div>;

    const { current, hourly } = weatherData;
    const selectedHour = {
        time: hourly.time[selectedTimeIndex],
        temp: hourly.temperature_2m[selectedTimeIndex],
        rain: hourly.rain[selectedTimeIndex],
        humidity: hourly.relative_humidity_2m[selectedTimeIndex],
        wind: hourly.wind_speed_10m[selectedTimeIndex],
        precip_prob: hourly.precipitation_probability[selectedTimeIndex],
        et0: hourly.et0_fao_evapotranspiration[selectedTimeIndex],
        soil_temp_180: hourly.temperature_180m[selectedTimeIndex],
        // Add more mapped fields as needed from the arrays
        visibility: hourly.visibility[selectedTimeIndex],
        dew_point: hourly.dew_point_2m[selectedTimeIndex],
        surface_pressure: current.surface_pressure, // Using current for general metrics where hourly might be overkill or static
        vapour_pressure_deficit: hourly.vapour_pressure_deficit[selectedTimeIndex]
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        {t('weather')}
                    </h2>
                    <p className={`text-sm flex items-center gap-1 ${usingFieldLocation ? "text-green-600 font-medium" : "text-gray-500"}`}>
                        <MapPin size={14} />
                        {locationName}
                        {usingFieldLocation && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Field Location</span>}
                    </p>
                </div>
            </div>

            {/* Main Current Weather Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1 opacity-90">
                            <Calendar size={16} />
                            <span>{current.time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        </div>
                        <h3 className="text-6xl font-bold mb-2">{formatValue(current.temp)}°</h3>
                        <p className="text-xl capitalize flex items-center gap-2">
                            <img
                                src={`https://openweathermap.org/img/wn/${getWeatherIcon(current.code)}.png`}
                                className="w-10 h-10 -ml-2 filter brightness-200"
                                alt="icon"
                            />
                            Current Conditions
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full md:w-auto bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                        <div className="flex flex-col">
                            <span className="text-xs opacity-70 mb-1">Apparent Temp</span>
                            <span className="font-semibold text-lg">{formatValue(current.apparent_temperature)}°</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs opacity-70 mb-1">Wind Gusts</span>
                            <span className="font-semibold text-lg">{formatDecimal(current.wind_gusts_10m)} km/h</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs opacity-70 mb-1">Pressure</span>
                            <span className="font-semibold text-lg">{formatValue(current.pressure_msl)} hPa</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs opacity-70 mb-1">Precipitation</span>
                            <span className="font-semibold text-lg">{formatDecimal(current.precipitation)} mm</span>
                        </div>
                    </div>
                </div>

                {/* Decorative Background */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
            </div>

            {/* Time Selector */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4 text-gray-700 dark:text-gray-200">
                    <Clock size={18} />
                    <h3 className="font-semibold">Hourly Forecast Details</h3>
                </div>

                {/* Horizontal Time Scroller */}
                <div className="relative">
                    <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide snap-x">
                        {hourly.time.slice(0, 24).map((time, idx) => {
                            const isSelected = idx === selectedTimeIndex;
                            const isNow = idx === hourly.time.findIndex(t => t > new Date()) - 1;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedTimeIndex(idx)}
                                    className={`flex-shrink-0 snap-start flex flex-col items-center justify-center p-3 min-w-[70px] rounded-xl transition-all duration-200 border ${isSelected
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                                            : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <span className="text-xs font-medium mb-1">
                                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {/* Small icon based on code or rain */}
                                    <img
                                        src={`https://openweathermap.org/img/wn/${getWeatherIcon(hourly.weather_code[idx])}.png`}
                                        className="w-8 h-8 object-contain"
                                        alt=""
                                    />
                                    <span className="font-bold text-sm mt-1">{Math.round(hourly.temperature_2m[idx])}°</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Detailed Metrics for Selected Hour */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <MetricBox
                        label="Cloud Cover"
                        value={`${hourly.cloud_cover[selectedTimeIndex]}%`}
                        icon={<CloudSun size={18} className="text-gray-500" />}
                    />
                    <MetricBox
                        label="Wind Speed"
                        value={`${formatDecimal(hourly.wind_speed_10m[selectedTimeIndex])} km/h`}
                        icon={<Wind size={18} className="text-blue-400" />}
                    />
                    <MetricBox
                        label="Rain"
                        value={`${formatDecimal(hourly.rain[selectedTimeIndex])} mm`}
                        icon={<Droplets size={18} className="text-blue-600" />}
                    />
                    <MetricBox
                        label="Humidity"
                        value={`${hourly.relative_humidity_2m[selectedTimeIndex]}%`}
                        icon={<Droplets size={18} className="text-cyan-500" />}
                    />
                    <MetricBox
                        label="Dew Point"
                        value={`${formatValue(hourly.dew_point_2m[selectedTimeIndex])}°`}
                        icon={<Thermometer size={18} className="text-orange-400" />}
                    />
                    <MetricBox
                        label="Visibility"
                        value={`${formatValue(hourly.visibility[selectedTimeIndex] / 1000, 'km')}`}
                        icon={<Navigation size={18} className="text-gray-400" />}
                    />
                    <MetricBox
                        label="Precip Prob"
                        value={`${hourly.precipitation_probability[selectedTimeIndex]}%`}
                        icon={<Umbrella size={18} className="text-purple-500" />}
                    />
                    <MetricBox
                        label="Evapotranspiration"
                        value={`${formatDecimal(hourly.et0_fao_evapotranspiration[selectedTimeIndex])} mm`}
                        sub="ET0 FAO"
                        icon={<Wind size={18} className="text-green-500" />}
                    />
                    <MetricBox
                        label="Soil Temp (18cm)"
                        value={`${formatValue(hourly.temperature_180m[selectedTimeIndex])}°`}
                        icon={<Thermometer size={18} className="text-brown-500" />} // brown color technically doesn't exist in tw default, using orange fallback effectively or custom
                    />
                    <MetricBox
                        label="Vapor Pressure Deficit"
                        value={`${formatDecimal(hourly.vapour_pressure_deficit[selectedTimeIndex])} kPa`}
                        icon={<Wind size={18} className="text-yellow-600" />}
                    />
                </div>
            </div>
        </div>
    );
};

const MetricBox = ({ label, value, icon, sub }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600">
        <div className="flex items-start justify-between mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
            {icon}
        </div>
        <p className="text-lg font-bold text-gray-800 dark:text-white">{value}</p>
        {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
    </div>
);

export default Weather;
