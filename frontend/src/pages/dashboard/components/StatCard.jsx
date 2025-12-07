import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
                </div>
                <div className={`p-3 rounded-full ${color || 'bg-blue-50 text-blue-600'}`}>
                    {Icon && <Icon size={24} />}
                </div>
            </div>
            {(trend || trendValue) && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={`flex items-center font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {trend === 'up' ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                        {trendValue}
                    </span>
                    <span className="text-gray-500 ml-2">vs last month</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
