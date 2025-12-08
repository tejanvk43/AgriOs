import React from 'react';
import { Bell, AlertTriangle, TrendingDown, CheckCircle, Info, Wind } from 'lucide-react';

const AlertsWidget = ({ advisories = [] }) => {

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle size={18} />;
            case 'caution': return <Wind size={18} />;
            case 'success': return <CheckCircle size={18} />;
            default: return <Info size={18} />;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'warning': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
            case 'caution': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
            case 'success': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
            default: return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
                <Bell size={20} className="text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Live Farmer Advisories</h3>
            </div>

            <div className="space-y-3">
                {advisories.length > 0 ? advisories.map((alert, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <div className={`mt-0.5 p-1 rounded ${getColor(alert.type)}`}>
                            {getIcon(alert.type)}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-0.5">{alert.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">{alert.message}</p>
                            {alert.action && (
                                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1">Recommended: {alert.action}</p>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="text-center text-gray-400 text-sm py-4">
                        No active advisories for your area.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertsWidget;
