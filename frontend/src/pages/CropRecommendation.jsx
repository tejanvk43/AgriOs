import React, { useState } from 'react';
import { Sprout, Droplets, Sun, ArrowRight, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CropRecommendation = () => {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        soilType: '',
        season: '',
        waterSource: '',
        landArea: ''
    });
    const [recommendations, setRecommendations] = useState(null);

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else handleSubmit();
    };

    const handleSubmit = () => {
        // Mock API call
        setTimeout(() => {
            setRecommendations([
                { name: 'Wheat', yield: '45-50 q/ha', profit: 'High', duration: '120 days', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80' },
                { name: 'Mustard', yield: '15-20 q/ha', profit: 'Medium', duration: '100 days', image: 'https://images.unsplash.com/photo-1508595165502-3e2652e5a405?auto=format&fit=crop&w=400&q=80' },
            ]);
            setStep(4);
        }, 1000);
    };

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Crop Doctor</h2>

            {/* Progress Steps */}
            <div className="flex justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10"></div>
                {[1, 2, 3].map((s) => (
                    <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700'}`}>
                        {step > s ? <CheckCircle size={20} /> : s}
                    </div>
                ))}
            </div>

            {step < 4 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold mb-4">Soil Details</h3>
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Soil Type</label>
                                <select
                                    className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                                >
                                    <option value="">Select Soil Type</option>
                                    <option value="Alluvial">Alluvial Soil</option>
                                    <option value="Black">Black Soil</option>
                                    <option value="Red">Red Soil</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold mb-4">Season & Water</h3>
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Current Season</label>
                                <select
                                    className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                                >
                                    <option value="">Select Season</option>
                                    <option value="Kharif">Kharif (Monsoon)</option>
                                    <option value="Rabi">Rabi (Winter)</option>
                                    <option value="Zaid">Zaid (Summer)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold mb-4">Land Area</h3>
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Total Area (Acres)</label>
                                <input
                                    type="number"
                                    className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="e.g. 5"
                                    onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium"
                        >
                            {step === 3 ? 'Get Recommendations' : 'Next Step'} <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Recommended Crops</h3>
                    {recommendations.map((crop, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4">
                            <img src={crop.image} alt={crop.name} className="w-24 h-24 rounded-xl object-cover" />
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{crop.name}</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                        <Sprout size={14} /> {crop.yield}
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                        <Sun size={14} /> {crop.duration}
                                    </div>
                                </div>
                                <div className="mt-3 inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                    {crop.profit} Profit Potential
                                </div>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => setStep(1)}
                        className="w-full py-3 text-green-600 font-medium hover:bg-green-50 dark:hover:bg-gray-800 rounded-xl transition"
                    >
                        Start Over
                    </button>
                </div>
            )}
        </div>
    );
};

export default CropRecommendation;
