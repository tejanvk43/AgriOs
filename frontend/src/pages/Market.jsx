import React, { useState } from 'react';
import { Search, MapPin, TrendingUp, Truck, Calculator } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Market = () => {
    const { t } = useTranslation();
    const [selectedCrop, setSelectedCrop] = useState('Tomato');

    const mandiPrices = [
        { id: 1, mandi: 'Bowenpally', distance: '12 km', price: 2400, trend: 'up' },
        { id: 2, mandi: 'Gudimalkapur', distance: '18 km', price: 2350, trend: 'down' },
        { id: 3, mandi: 'Erragadda', distance: '8 km', price: 2200, trend: 'stable' },
    ];

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('market')}</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                    <Calculator size={18} />
                    <span>Profit Calc</span>
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search crops..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <select
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                >
                    <option>Tomato</option>
                    <option>Onion</option>
                    <option>Potato</option>
                    <option>Rice</option>
                </select>
            </div>

            {/* Map Placeholder */}
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center relative overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="absolute inset-0 opacity-10 bg-gray-200 dark:bg-gray-700 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-100 via-gray-300 to-gray-400"></div>
                <div className="z-10 text-center">
                    <MapPin size={48} className="mx-auto text-red-500 mb-2" />
                    <p className="text-gray-500 font-medium">Interactive Map View</p>
                    <p className="text-xs text-gray-400">Showing prices in 50km radius</p>
                </div>
            </div>

            {/* Price Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Real-time Mandi Prices (₹/Quintal)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm">
                            <tr>
                                <th className="p-4 font-medium">Mandi</th>
                                <th className="p-4 font-medium">Distance</th>
                                <th className="p-4 font-medium">Price</th>
                                <th className="p-4 font-medium">Trend</th>
                                <th className="p-4 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {mandiPrices.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                    <td className="p-4 font-medium text-gray-900 dark:text-white">{item.mandi}</td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400">{item.distance}</td>
                                    <td className="p-4 font-bold text-gray-900 dark:text-white">₹{item.price}</td>
                                    <td className="p-4">
                                        {item.trend === 'up' && <span className="text-green-500 flex items-center gap-1"><TrendingUp size={16} /> +2%</span>}
                                        {item.trend === 'down' && <span className="text-red-500 flex items-center gap-1"><TrendingUp size={16} className="rotate-180" /> -1%</span>}
                                        {item.trend === 'stable' && <span className="text-gray-400 text-sm">Stable</span>}
                                    </td>
                                    <td className="p-4">
                                        <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-100 transition">
                                            <Truck size={16} /> Book
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Market;
