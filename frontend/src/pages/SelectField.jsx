import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Trash2 } from 'lucide-react';

const SelectField = () => {
    const [lands, setLands] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLands = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/land', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setLands(data);
                }
            } catch (error) {
                console.error('Error fetching lands:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLands();
    }, []);

    const handleDelete = async (e, landId) => {
        e.stopPropagation(); // Prevent card click
        if (!window.confirm("Are you sure you want to delete this field? This action cannot be undone.")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/land/${landId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                setLands(lands.filter(land => land.id !== landId));
            } else {
                alert("Failed to delete field");
            }
        } catch (error) {
            console.error("Error deleting field:", error);
            alert("Error deleting field");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Select Your Field</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                {lands.map((land) => (
                    <div
                        key={land.id}
                        onClick={() => navigate(`/dashboard/${land.id}`)}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-transparent hover:border-green-500 transform hover:-translate-y-1 relative group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-600 dark:text-green-400">
                                <MapPin size={24} />
                            </div>

                            <div className="flex gap-2">
                                <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full flex items-center">
                                    {land.totalAcres} Acres
                                </span>
                                <button
                                    onClick={(e) => handleDelete(e, land.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete Field"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                            {land.village}, {land.mandal}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            {land.district}, {land.state}
                        </p>

                        <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-card-hover">
                            Go to Dashboard <ArrowRight size={16} className="ml-1 transition-transform" />
                        </div>
                    </div>
                ))}

                {/* Add New Field Card */}
                <div
                    onClick={() => navigate('/profile')}
                    className="bg-transparent border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all min-h-[200px]"
                >
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full text-gray-400 mb-3 block">
                        <span className="text-2xl">+</span>
                    </div>
                    <span className="font-semibold text-gray-500 dark:text-gray-400">Add Another Field</span>
                </div>
            </div>
        </div>
    );
};

export default SelectField;
