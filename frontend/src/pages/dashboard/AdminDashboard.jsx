import React, { useEffect, useState } from 'react';
import { Users, Warehouse, Sprout, TrendingUp, Map as MapIcon, FileText } from 'lucide-react';
import StatCard from './components/StatCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalFarmers: 12450,
        totalGodowns: 45,
        activeCropCycles: 8900,
        avgYield: '2.4 tons/acre'
    });

    const [cropData, setCropData] = useState([
        { name: 'Wheat', yield: 4000 },
        { name: 'Rice', yield: 3000 },
        { name: 'Maize', yield: 2000 },
        { name: 'Cotton', yield: 2780 },
    ]);

    const [storageData, setStorageData] = useState([
        { name: 'Used', value: 65, color: '#EF4444' }, // red-500
        { name: 'Available', value: 35, color: '#10B981' }, // green-500
    ]);

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Admin Governance Dashboard</h1>
                <p className="text-gray-500">Monitor all agricultural operations across the region</p>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Farmers"
                    value={stats.totalFarmers.toLocaleString()}
                    trend="up"
                    trendValue="12%"
                    icon={Users}
                    color="bg-green-100 text-green-700"
                />
                <StatCard
                    title="Godowns Active"
                    value={stats.totalGodowns}
                    icon={Warehouse}
                    color="bg-blue-100 text-blue-700"
                />
                <StatCard
                    title="Active Crop Cycles"
                    value={stats.activeCropCycles.toLocaleString()}
                    trend="up"
                    trendValue="5%"
                    icon={Sprout}
                    color="bg-yellow-100 text-yellow-700"
                />
                <StatCard
                    title="Avg Yield"
                    value={stats.avgYield}
                    icon={TrendingUp}
                    color="bg-purple-100 text-purple-700"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Map Section (Wide) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold flex items-center">
                            <MapIcon className="mr-2" size={20} /> Regional Farmer Distribution
                        </h2>
                        <select className="border border-gray-300 rounded-md text-sm p-1">
                            <option>All States</option>
                            <option>Maharashtra</option>
                            <option>Karnataka</option>
                        </select>
                    </div>
                    <div className="h-[400px] w-full rounded-lg overflow-hidden z-0">
                        <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap contributors'
                            />
                            {/* Example Markers */}
                            <Marker position={[19.0760, 72.8777]}>
                                <Popup>Maharashtra: High Density</Popup>
                            </Marker>
                            <Marker position={[12.9716, 77.5946]}>
                                <Popup>Karnataka: Medium Density</Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </div>

                {/* Storage Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4">Storage Utilization</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={storageData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {storageData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-4">
                        <p className="text-gray-500 text-sm">Total Capacity: 50,000 Tonnes</p>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Crop Yield Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Seasonal Crop Yield (Tonnes)</h2>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cropData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar dataKey="yield" fill="#1B5E20" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
