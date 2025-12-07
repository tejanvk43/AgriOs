import React, { useState, useEffect } from 'react';
import { Package, Truck, AlertTriangle, Archive, Plus, TrendingUp, Edit, MapPin, Calendar, Users, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

const GodownManagerDashboard = () => {
    const [godown, setGodown] = useState(null);
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showStockModal, setShowStockModal] = useState(false);
    const [stockForm, setStockForm] = useState({
        crop_type: '',
        quantity_tonnes: '',
        movement_type: 'IN',
        farmer_id: null,
        remarks: ''
    });

    useEffect(() => {
        fetchGodown();
    }, []);

    const fetchGodown = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/godowns/my-godown', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setGodown(data);
                setRecentLogs(data.stockLogs || []);
            } else {
                console.error('Failed to fetch godown');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStockSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/godowns/stock-log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(stockForm)
            });

            if (response.ok) {
                fetchGodown();
                setShowStockModal(false);
                setStockForm({
                    crop_type: '',
                    quantity_tonnes: '',
                    movement_type: 'IN',
                    farmer_id: null,
                    remarks: ''
                });
                alert('Stock movement logged successfully!');
            } else {
                alert('Failed to log stock movement');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error logging stock');
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse">Loading Dashboard...</div>;
    if (!godown) return <div className="p-8 text-center text-red-500">No godown assigned to you</div>;

    const utilizationPercent = ((godown.used_capacity_tonnes / godown.total_capacity_tonnes) * 100) || 0;
    const availableCapacity = godown.total_capacity_tonnes - godown.used_capacity_tonnes;

    const pieData = [
        { name: 'Used', value: godown.used_capacity_tonnes },
        { name: 'Available', value: availableCapacity }
    ];

    const COLORS = ['#4F46E5', '#10B981'];

    return (
        <div className="p-4 lg:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{godown.name}</h1>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
                    <MapPin size={16} />
                    <span>{godown.village}, {godown.mandal}, {godown.district}, {godown.state}</span>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Capacity</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{godown.total_capacity_tonnes}<span className="text-sm ml-1">T</span></h3>
                        </div>
                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                            <Archive className="text-gray-600 dark:text-gray-300" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Used</p>
                            <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{godown.used_capacity_tonnes.toFixed(1)}<span className="text-sm ml-1">T</span></h3>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Package className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Available</p>
                            <h3 className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{availableCapacity.toFixed(1)}<span className="text-sm ml-1">T</span></h3>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Utilization</p>
                            <h3 className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">{utilizationPercent.toFixed(0)}<span className="text-sm ml-1">%</span></h3>
                            {utilizationPercent > 90 && <p className="text-xs text-red-500 mt-1">⚠ Near Full</p>}
                        </div>
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                            <Activity className="text-orange-600 dark:text-orange-400" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Quick Actions</h2>
                <div className="flex gap-4">
                    <button
                        onClick={() => { setStockForm({ ...stockForm, movement_type: 'IN' }); setShowStockModal(true); }}
                        className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                        <Truck className="mr-2" size={18} /> Log Inward Stock
                    </button>
                    <button
                        onClick={() => { setStockForm({ ...stockForm, movement_type: 'OUT' }); setShowStockModal(true); }}
                        className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                        <Truck className="mr-2" size={18} /> Log Outward Stock
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Stock Movements */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Recent Stock Movements</h2>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {recentLogs.length > 0 ? recentLogs.map(log => (
                            <div key={log.log_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${log.movement_type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        <Truck size={18} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{log.crop_type}</p>
                                        <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${log.movement_type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                        {log.movement_type === 'IN' ? '+' : '-'}{log.quantity_tonnes}T
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-400 text-center py-8">No stock movements yet</p>
                        )}
                    </div>
                </div>

                {/* Capacity Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Capacity Breakdown</h2>
                    <div className="h-[250px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Stock Modal */}
            {showStockModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            Log {stockForm.movement_type === 'IN' ? 'Inward' : 'Outward'} Stock
                        </h2>
                        <form onSubmit={handleStockSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Crop Type</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Wheat, Rice"
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={stockForm.crop_type}
                                    onChange={e => setStockForm({ ...stockForm, crop_type: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Quantity (Tonnes)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={stockForm.quantity_tonnes}
                                    onChange={e => setStockForm({ ...stockForm, quantity_tonnes: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Remarks</label>
                                <textarea
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={stockForm.remarks}
                                    onChange={e => setStockForm({ ...stockForm, remarks: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowStockModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Cancel</button>
                                <button type="submit" className={`px-4 py-2 text-white rounded hover:opacity-90 ${stockForm.movement_type === 'IN' ? 'bg-green-600' : 'bg-red-600'}`}>
                                    Log {stockForm.movement_type}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GodownManagerDashboard;
