import React from 'react';
import { CloudSun, Droplets, Wind, Thermometer, Umbrella } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Weather = () => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('weather')}</h2>

            {/* Current Weather Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-semibold mb-1">Hyderabad, Telangana</h3>
                        <p className="text-blue-100">Monday, 4 Dec</p>
                    </div>
                    <CloudSun size={48} className="text-yellow-300" />
                </div>

                <div className="mt-8 flex items-end gap-4">
                    <span className="text-6xl font-bold">28°</span>
                    <span className="text-xl mb-2">Sunny</span>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/20 pt-4">
                    <div className="flex flex-col items-center">
                        <Droplets size={20} className="mb-1 text-blue-200" />
                        <span className="text-sm">65%</span>
                        <span className="text-xs text-blue-200">Humidity</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Wind size={20} className="mb-1 text-blue-200" />
                        <span className="text-sm">12 km/h</span>
                        <span className="text-xs text-blue-200">Wind</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Umbrella size={20} className="mb-1 text-blue-200" />
                        <span className="text-sm">10%</span>
                        <span className="text-xs text-blue-200">Rain</span>
                    </div>
                </div>
            </div>

            {/* Agro Indices */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                        <Thermometer size={20} className="text-red-500" />
                        <h4 className="font-semibold text-gray-700 dark:text-gray-200">Sowing Index</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-600">Optimal</p>
                    <p className="text-xs text-gray-500">Good time for sowing Rabi crops.</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                        <Droplets size={20} className="text-blue-500" />
                        <h4 className="font-semibold text-gray-700 dark:text-gray-200">Soil Moisture</h4>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">Adequate</p>
                    <p className="text-xs text-gray-500">No irrigation needed for 2 days.</p>
                </div>
            </div>

            {/* Hourly Forecast (Placeholder) */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Hourly Forecast</h3>
                <div className="flex gap-6 overflow-x-auto pb-2">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center min-w-[60px]">
                            <span className="text-sm text-gray-500">{12 + i}:00</span>
                            <CloudSun size={24} className="my-2 text-yellow-500" />
                            <span className="font-semibold text-gray-800 dark:text-white">{28 - i}°</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 7-Day Forecast */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">7-Day Forecast</h3>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-300 w-20">Day {i + 1}</span>
                            <div className="flex items-center gap-2">
                                <CloudSun size={20} className="text-yellow-500" />
                                <span className="text-sm text-gray-500">Sunny</span>
                            </div>
                            <div className="flex gap-4 w-24 justify-end">
                                <span className="font-semibold text-gray-800 dark:text-white">30°</span>
                                <span className="text-gray-400">22°</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Weather;
