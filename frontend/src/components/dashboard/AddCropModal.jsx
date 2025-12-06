import React, { useState } from 'react';
import { X, Sprout, Calendar, Ruler } from 'lucide-react';

const AddCropModal = ({ isOpen, onClose, landId, onCropAdded }) => {
    const [formData, setFormData] = useState({
        cropName: '',
        sowingDate: '',
        areaAcres: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/crops', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    landRecordId: landId
                })
            });

            const data = await response.json();

            if (response.ok) {
                onCropAdded(data);
                onClose();
                setFormData({ cropName: '', sowingDate: '', areaAcres: '' });
            } else {
                setError(data.message || 'Failed to add crop');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl transform transition-all scale-100">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Sprout className="text-green-600" />
                        Add New Crop
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Crop Name</label>
                        <select
                            required
                            value={formData.cropName}
                            onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Select Crop</option>
                            <option value="Rice (Paddy)">Rice (Paddy)</option>
                            <option value="Wheat">Wheat</option>
                            <option value="Cotton">Cotton</option>
                            <option value="Maize">Maize</option>
                            <option value="Sugarcane">Sugarcane</option>
                            <option value="Chilli">Chilli</option>
                            <option value="Tomato">Tomato</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sowing Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="date"
                                required
                                value={formData.sowingDate}
                                onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cultivation Area (Acres)</label>
                        <div className="relative">
                            <Ruler className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="number"
                                step="0.1"
                                required
                                placeholder="e.g. 2.5"
                                value={formData.areaAcres}
                                onChange={(e) => setFormData({ ...formData, areaAcres: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-green-200 dark:shadow-none disabled:opacity-50 flex justify-center"
                        >
                            {loading ? 'Adding...' : 'Save Crop Details'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCropModal;
