import React from 'react';
import { Bell, AlertTriangle, TrendingDown } from 'lucide-react';

const AlertsWidget = () => {
    const alerts = [
        { id: 1, type: 'warning', message: 'Heavy rainfall expected tomorrow.', icon: <AlertTriangle size={18} /> },
        { id: 2, type: 'info', message: 'Tomato prices dropped by 10% in local mandi.', icon: <TrendingDown size={18} /> },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
                <Bell size={20} className="text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Alerts</h3>
            </div>

            <div className="space-y-3">
                {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <div className={`mt-0.5 ${alert.type === 'warning' ? 'text-amber-500' : 'text-blue-500'}`}>
                            {alert.icon}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-tight">{alert.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlertsWidget;
