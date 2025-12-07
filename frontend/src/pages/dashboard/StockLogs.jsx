import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download, Truck, Search } from 'lucide-react';

const StockLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        movement_type: '',
        crop_type: ''
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams(filters);
            const response = await fetch(`/api/godowns/stock-logs?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        setLoading(true);
        fetchLogs();
    };

    const exportToCSV = () => {
        const csv = [
            ['Date', 'Crop Type', 'Movement', 'Quantity (T)', 'Farmer', 'Remarks'].join(','),
            ...logs.map(log => [
                new Date(log.createdAt).toLocaleDateString(),
                log.crop_type,
                log.movement_type,
                log.quantity_tonnes,
                log.farmer?.name || 'N/A',
                log.remarks || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) return <div className="p-8 text-center animate-pulse">Loading Logs...</div>;

    return (
        <div className="p-4 lg:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Stock Movement Logs</h1>
                    <p className="text-gray-500 dark:text-gray-400">View complete stock history</p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Download size={18} /> Export CSV
                </button>
            </header>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    <Filter size={20} /> Filters
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="date"
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={filters.startDate}
                        onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                    />
                    <input
                        type="date"
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={filters.endDate}
                        onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                    />
                    <select
                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={filters.movement_type}
                        onChange={e => setFilters({ ...filters, movement_type: e.target.value })}
                    >
                        <option value="">All Movements</option>
                        <option value="IN">Inward</option>
                        <option value="OUT">Outward</option>
                    </select>
                    <button
                        onClick={handleFilter}
                        className="bg-green-600 text-white rounded-lg hover:bg-green-700 px-4 py-2"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-sm">
                            <tr>
                                <th className="p-4">Date & Time</th>
                                <th className="p-4">Crop Type</th>
                                <th className="p-4">Movement</th>
                                <th className="p-4">Quantity</th>
                                <th className="p-4">Farmer</th>
                                <th className="p-4">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {logs.map(log => (
                                <tr key={log.log_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                    <td className="p-4">
                                        <div className="text-sm text-gray-900 dark:text-gray-100">
                                            {new Date(log.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(log.createdAt).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{log.crop_type}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${log.movement_type === 'IN'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {log.movement_type === 'IN' ? '↓ IN' : '↑ OUT'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`font-semibold ${log.movement_type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                            {log.movement_type === 'IN' ? '+' : '-'}{log.quantity_tonnes} T
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                                        {log.farmer?.name || 'N/A'}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                        {log.remarks || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {logs.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            No stock logs found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockLogs;
