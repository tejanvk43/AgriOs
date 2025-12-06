import React from 'react';
import { TrendingUp, CloudRain, Sprout, Truck, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
    const navigate = useNavigate();

    const actions = [
        { icon: <TrendingUp size={24} />, label: 'Check Prices', path: '/market', color: 'bg-blue-100 text-blue-600' },
        { icon: <Sprout size={24} />, label: 'Crop Doctor', path: '/crop-recommendation', color: 'bg-green-100 text-green-600' },
        { icon: <FileText size={24} />, label: 'Soil Report', path: '/soil-report', color: 'bg-amber-100 text-amber-600' },
        { icon: <Truck size={24} />, label: 'Book Transport', path: '/transport', color: 'bg-purple-100 text-purple-600' },
        { icon: <CloudRain size={24} />, label: 'Weather', path: '/weather', color: 'bg-sky-100 text-sky-600' },
        { icon: <Users size={24} />, label: 'Community', path: '/community', color: 'bg-rose-100 text-rose-600' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {actions.map((action, index) => (
                <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 group cursor-pointer"
                    style={{ cursor: 'pointer' }}
                >
                    <div className={`p-3 rounded-full mb-3 ${action.color} group-hover:scale-110 transition-transform`}>
                        {action.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{action.label}</span>
                </button>
            ))}
        </div>
    );
};

export default QuickActions;
