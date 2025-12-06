import React, { useState, useEffect } from 'react';
import { CloudSun, Droplets, Wind } from 'lucide-react';

const WeatherWidget = ({ location }) => {
    const displayLocation = location || 'Loading Location...';

    // Default/Loading State
    const [weather, setWeather] = useState({
        temp: '--',
        description: 'Loading...',
        humidity: '--',
        wind: '--',
        icon: 'CloudSun'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!location || location === 'Select a Field' || location === 'Loading Location...') return;

        const fetchWeather = async () => {
            setLoading(true);
            try {
                // Fetch from our backend proxy
                // Extract just the district or city if possible for better accuracy, 
                // but let's try sending the full string first.
                // Or better: try to split and use the district (part after comma) if available.
                let query = location;
                if (location.includes(',')) {
                    // "Village, District" -> Use District for better weather match usually
                    // query = location.split(',')[1].trim(); 
                    // actually let's keep full string, OWM is okay.
                }

                const response = await fetch(`http://localhost:5000/api/weather?location=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    setWeather({
                        temp: data.temp,
                        description: data.description,
                        humidity: data.humidity + '%',
                        wind: data.windSpeed + ' km/h',
                        icon: getIconForWeather(data.description)
                    });
                } else {
                    setWeather(prev => ({ ...prev, description: 'Unavailable' }));
                }
            } catch (err) {
                console.error('Weather fetch error:', err);
                setWeather(prev => ({ ...prev, description: 'Error' }));
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [location]);

    const getIconForWeather = (desc) => {
        if (!desc) return 'CloudSun';
        const d = desc.toLowerCase();
        if (d.includes('rain')) return 'CloudRain';
        if (d.includes('clear')) return 'Sun';
        if (d.includes('cloud')) return 'Cloud';
        return 'CloudSun';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Weather Today</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{displayLocation}</p>
                </div>
                <CloudSun size={32} className="text-yellow-500" />
            </div>

            <div className="flex items-end gap-2 mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {loading ? '--' : weather.temp}°
                </span>
                <span className="text-lg text-gray-500 dark:text-gray-400 mb-1 capitalize">
                    {loading ? '...' : weather.description}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Droplets size={20} className="text-blue-500" />
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Humidity</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{weather.humidity}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <Wind size={20} className="text-gray-500" />
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Wind</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{weather.wind}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
