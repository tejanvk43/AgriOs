import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sprout, Bug, MessageSquare, Calendar, MapPin, User, Activity } from 'lucide-react';

const FarmerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [farmer, setFarmer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/admin/farmers/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setFarmer(data);
                } else {
                    console.error("Failed to fetch farmer details");
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Farmer Profile...</div>;
    if (!farmer) return <div className="p-8 text-center text-red-500">Farmer not found or access denied.</div>;

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 dark:text-gray-400 mb-6 hover:text-green-600 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" /> Back
            </button>

            {/* Header Profile */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 text-3xl font-bold">
                    {farmer.name.charAt(0)}
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{farmer.name}</h1>
                    <div className="text-gray-500 dark:text-gray-400 flex flex-wrap gap-4 mt-2">
                        <span className="flex items-center gap-1"><MapPin size={16} /> {farmer.village || 'Unknown Village'}, {farmer.mandal || 'Mandal'}</span>
                        <span className="flex items-center gap-1"><User size={16} /> {farmer.mobileNumber}</span>
                    </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg text-green-700 dark:text-green-400 font-medium">
                    Active Farmer
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Crops Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                            <Sprout className="text-green-500" /> Cultivated Crops
                        </h2>
                        {farmer.UserCrops && farmer.UserCrops.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {farmer.UserCrops.map((uc) => (
                                    <div key={uc.id} className="border dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                                        <div className="font-semibold text-lg text-gray-800 dark:text-gray-200">{uc.Crop?.name || 'Unknown Crop'}</div>
                                        <div className="text-sm text-gray-500 mt-1">Area: {uc.area} Acres</div>
                                        <div className="text-sm text-gray-500">Sown on: {new Date(uc.sowingDate).toLocaleDateString()}</div>
                                        <div className="mt-3 inline-block px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-xs rounded-md">
                                            {uc.status || 'Active'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">No active crops logged.</p>
                        )}
                    </div>

                    {/* Activity / Pesticides */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                            <Activity className="text-orange-500" /> Recent Activity & Logs
                        </h2>
                        {farmer.activities && farmer.activities.length > 0 ? (
                            <div className="space-y-4">
                                {farmer.activities.map((act) => (
                                    <div key={act.id} className="flex gap-4 border-b dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                                        <div className={`p-2 rounded-lg h-fit ${act.type === 'PESTICIDE' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                            {act.type === 'PESTICIDE' ? <Bug size={18} /> : <Calendar size={18} />}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-800 dark:text-gray-200">{act.title || act.type}</div>
                                            <p className="text-sm text-gray-500">{act.description}</p>
                                            <span className="text-xs text-gray-400 block mt-1">{new Date(act.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">No recent logged activities.</p>
                        )}
                    </div>
                </div>

                {/* AI History Sidebar */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm h-fit">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                        <MessageSquare className="text-purple-500" /> AI Queries
                    </h2>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {farmer.ChatMessages && farmer.ChatMessages.length > 0 ? (
                            farmer.ChatMessages.map((msg) => (
                                <div key={msg.id} className={`p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-gray-50 dark:bg-gray-700 ml-4' : 'bg-purple-50 dark:bg-purple-900/20 mr-4'}`}>
                                    <div className="font-semibold text-xs mb-1 opacity-70">{msg.role === 'user' ? 'Farmer' : 'AI'}</div>
                                    {msg.message}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 italic">No AI interactions yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmerDetail;
