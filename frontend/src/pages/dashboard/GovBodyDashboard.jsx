import React, { useState } from 'react';
import { Users, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import StatCard from './components/StatCard';

const GovBodyDashboard = () => {
    // Mock Data for Mandal Officer
    const [stats] = useState({
        totalFarmers: 3450,
        pendingApprovals: 5,
        advisories: 12,
        complaints: 0
    });

    const [pendingRequests] = useState([
        { id: 1, farmer: 'Ramesh Patil', type: 'Land Update', date: '2023-12-01' },
        { id: 2, farmer: 'Suresh Kumar', type: 'Crop Change', date: '2023-12-02' },
    ]);

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Mandal Officer Dashboard</h1>
                <p className="text-gray-500">Government operations and farmer oversight for Mandal: <strong>Example Mandal</strong></p>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Farmers in Mandal" value={stats.totalFarmers} icon={Users} color="bg-green-100 text-green-600" />
                <StatCard title="Pending Approvals" value={stats.pendingApprovals} icon={AlertCircle} color="bg-orange-100 text-orange-600" />
                <StatCard title="Active Advisories" value={stats.advisories} icon={FileText} color="bg-blue-100 text-blue-600" />
                <StatCard title="Open Complaints" value={stats.complaints} icon={CheckCircle} color="bg-gray-100 text-gray-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Approvals */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-orange-600">Action Items</h2>
                    </div>
                    <div className="p-6">
                        {pendingRequests.length > 0 ? (
                            <ul className="space-y-4">
                                {pendingRequests.map(req => (
                                    <li key={req.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                                        <div>
                                            <p className="font-semibold text-gray-800">{req.farmer}</p>
                                            <p className="text-sm text-gray-500">Request: {req.type} • {req.date}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">Approve</button>
                                            <button className="px-3 py-1 bg-white text-red-600 border border-red-200 text-sm rounded hover:bg-red-50">Reject</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No pending items.</p>
                        )}
                    </div>
                </div>

                {/* Quick Tools */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold mb-4">Quick Tools</h2>
                    <div className="space-y-3">
                        <button className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 flex items-center">
                            <FileText className="mr-3 text-blue-600" />
                            <div>
                                <p className="font-semibold">Publish New Advisory</p>
                                <p className="text-xs text-gray-500">Send alerts to all farmers in this Mandal</p>
                            </div>
                        </button>
                        <button className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 flex items-center">
                            <Users className="mr-3 text-green-600" />
                            <div>
                                <p className="font-semibold">Farmer Directory</p>
                                <p className="text-xs text-gray-500">Search and view farmer profiles</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GovBodyDashboard;
