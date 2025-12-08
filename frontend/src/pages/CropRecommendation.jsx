import React, { useState, useEffect } from 'react';
import { Sprout, TrendingUp, IndianRupee, Calendar, Droplets, ArrowRight, Loader2, Search, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CropRecommendation = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [analyzingImage, setAnalyzingImage] = useState(false); // New State
    const [recommendations, setRecommendations] = useState(null);
    const [marketInsight, setMarketInsight] = useState('');

    // Form State
    const [budget, setBudget] = useState(50000);
    const [customCrop, setCustomCrop] = useState('');
    const [soilData, setSoilData] = useState({
        n: '', p: '', k: '', ph: ''
    });

    // Image Upload Handler
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAnalyzingImage(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/ai/extract-soil', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data) {
                setSoilData({
                    n: res.data.n || '',
                    p: res.data.p || '',
                    k: res.data.k || '',
                    ph: res.data.ph || ''
                });
                alert("Soil Data Extracted Successfully!");
            }
        } catch (error) {
            console.error("Extraction Error", error);
            const errorMsg = error.response?.status === 429 
                ? "AI quota exceeded. Please try again in a few minutes or enter data manually."
                : error.response?.data?.message || "Failed to extract data. Please enter manually.";
            alert(errorMsg);
        } finally {
            setAnalyzingImage(false);
        }
    };

    const handleAnalyze = async () => {
        setStep(2); // Loading State
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/ai/recommend', {
                soilData,
                budget,
                customCrop,
                landId: user?.landRecords?.[0]?.id // Use first land if available
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setRecommendations(res.data.recommendations);
            setMarketInsight(res.data.market_insight);
            setLoading(false);
            setStep(3); // Result State
        } catch (error) {
            console.error("Analysis Error", error);
            setLoading(false);
            setStep(1); // Go back
            alert("Failed to analyze. Please try again.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            {/* Header */}
            <div className="text-center mb-10 pt-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 mb-3">
                    Smart Crop Recommendation
                </h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
                    AgriGenius analyzes your soil, budget, and future market trends to find the most profitable crops for you.
                </p>
            </div>

            {/* STEP 1: INPUTS */}
            {step === 1 && (
                <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-fade-in">
                    <div className="bg-green-50 dark:bg-green-900/30 p-6 border-b border-green-100 dark:border-green-800">
                        <h2 className="text-xl font-bold text-green-800 dark:text-green-100 flex items-center gap-2">
                            <Sprout className="w-6 h-6" /> Cultivation Parameters
                        </h2>
                    </div>

                    <div className="p-8 space-y-8">

                        {/* Image Upload Section */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-blue-800 dark:text-blue-200">Have a Soil Health Card?</h4>
                                <p className="text-sm text-blue-600 dark:text-blue-300">Upload a photo to auto-fill details.</p>
                            </div>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={analyzingImage}
                                />
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                                    {analyzingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                    {analyzingImage ? 'Scanning...' : 'Upload & Scan'}
                                </button>
                            </div>
                        </div>

                        {/* Budget Slider */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex justify-between">
                                <span>Initial Investment (Budget)</span>
                                <span className="text-green-600 font-bold">₹{budget.toLocaleString()}</span>
                            </label>
                            <input
                                type="range"
                                min="10000" max="500000" step="5000"
                                value={budget} onChange={(e) => setBudget(Number(e.target.value))}
                                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>₹10k</span>
                                <span>₹5L</span>
                            </div>
                        </div>

                        {/* Soil Data Form */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Nitrogen (N)</label>
                                <input
                                    type="text" placeholder="e.g. 140" value={soilData.n}
                                    onChange={(e) => setSoilData({ ...soilData, n: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Phosphorus (P)</label>
                                <input
                                    type="text" placeholder="e.g. 60" value={soilData.p}
                                    onChange={(e) => setSoilData({ ...soilData, p: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Potassium (K)</label>
                                <input
                                    type="text" placeholder="e.g. 50" value={soilData.k}
                                    onChange={(e) => setSoilData({ ...soilData, k: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">pH Level</label>
                                <input
                                    type="text" placeholder="e.g. 6.5" value={soilData.ph}
                                    onChange={(e) => setSoilData({ ...soilData, ph: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Optional Custom Crop */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Interested in a specific crop? (Optional)</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="e.g. Turmeric, Dragon Fruit..."
                                    value={customCrop}
                                    onChange={(e) => setCustomCrop(e.target.value)}
                                    className="w-full pl-10 p-3 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-green-500/30 transition transform hover:-translate-y-1 flex justify-center items-center gap-2"
                        >
                            Analyze & Recommend <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: LOADING */}
            {step === 2 && (
                <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                    <div className="relative w-24 h-24 mb-6">
                        <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
                        <Sprout className="absolute inset-0 m-auto text-green-600 w-10 h-10 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Analyzing your Farm...</h3>
                    <p className="text-gray-500 dark:text-gray-400">Checking soil compatibility, market trends, and financial viability.</p>
                </div>
            )}

            {/* STEP 3: RESULTS */}
            {step === 3 && recommendations && (
                <div className="animate-fade-in space-y-8">

                    {/* Market Insight Banner */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-6 rounded-2xl flex gap-4 items-start">
                        <TrendingUp className="w-8 h-8 text-blue-600 shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-1">Market Insight</h3>
                            <p className="text-blue-700 dark:text-blue-300 leading-relaxed">{marketInsight}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {recommendations.map((rec, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:border-green-300 dark:hover:border-green-700 transition duration-300">
                                {/* Card Header */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-6 flex flex-wrap justify-between items-center gap-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            {rec.crop_name}
                                            <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full">{rec.confidence_score}% Match</span>
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mt-1">{rec.suitability_reason}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Exp. Profit</p>
                                        <p className="text-xl font-bold text-green-600">{rec.economics.profit_potential}</p>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Timeline */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold">
                                            <Calendar className="w-5 h-5 text-purple-500" /> Timeline
                                        </div>
                                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-sm">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-gray-500">Sowe</span>
                                                <span className="font-bold">{rec.timeline.sowing_month}</span>
                                            </div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-gray-500">Harvest</span>
                                                <span className="font-bold">{rec.timeline.harvest_month}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Duration</span>
                                                <span className="font-bold">{rec.timeline.duration_days} Days</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Economics */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold">
                                            <IndianRupee className="w-5 h-5 text-yellow-500" /> Economics / Acre
                                        </div>
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl text-sm">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-gray-500">Cost</span>
                                                <span className="font-bold">₹{rec.economics.estimated_cost_per_acre}</span>
                                            </div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-gray-500">Yield</span>
                                                <span className="font-bold">{rec.economics.expected_yield_per_acre}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Price</span>
                                                <span className="font-bold text-green-600">{rec.economics.market_price_forecast}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Steps */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold">
                                            <Sprout className="w-5 h-5 text-green-500" /> Key Advice
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-sm space-y-2 max-h-40 overflow-y-auto">
                                            {rec.cultivation_steps.map((step, sIdx) => (
                                                <div key={sIdx} className="border-l-2 border-green-300 pl-3">
                                                    <p className="font-bold text-gray-800 dark:text-gray-200">{step.stage}</p>
                                                    <p className="text-gray-600 dark:text-gray-400 text-xs">{step.advice}</p>
                                                    {step.fertilizer && <p className="text-xs text-green-600 mt-1 font-medium">🧴 {step.fertilizer}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => { setStep(1); setRecommendations(null); }}
                        className="mx-auto block px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                        Try Different Inputs
                    </button>
                </div>
            )}
        </div>
    );
};

export default CropRecommendation;
