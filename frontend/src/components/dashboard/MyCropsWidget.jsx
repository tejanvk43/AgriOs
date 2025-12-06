import React, { useState, useEffect } from 'react';
import { Sprout, Plus } from 'lucide-react';
import AddCropModal from './AddCropModal';

const MyCropsWidget = ({ landId }) => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!landId) return;

        const fetchCrops = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/crops/land/${landId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setCrops(data);
                }
            } catch (error) {
                console.error('Error fetching crops:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCrops();
    }, [landId]);

    const handleCropAdded = (newCrop) => {
        setCrops([newCrop, ...crops]);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Sprout className="text-green-500" size={20} />
                    Current Crops
                </h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-sm bg-green-50 text-green-600 px-3 py-1 rounded-full font-medium hover:bg-green-100 transition-colors flex items-center gap-1"
                >
                    <Plus size={16} /> Add Crop
                </button>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-3">
                    <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
                </div>
            ) : crops.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                    No crops added for this field yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {crops.map(crop => (
                        <div key={crop.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-white">{crop.cropName}</p>
                                <p className="text-xs text-gray-500">Sown: {crop.sowingDate}</p>
                            </div>
                            <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-lg">
                                {crop.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <AddCropModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                landId={landId}
                onCropAdded={handleCropAdded}
            />
        </div>
    );
};

export default MyCropsWidget;
