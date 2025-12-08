import React, { useState, useRef } from 'react';
import { Upload, Camera, X, Check, AlertTriangle, Leaf, FlaskConical, Droplet } from 'lucide-react';

const PestDoctor = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
        }
    };

    const handleDiagnose = async () => {
        if (!image) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', image);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/ai/diagnose', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setResult(data);
            } else {
                alert('Diagnosis failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error connecting to AI Doctor.');
        } finally {
            setLoading(false);
        }
    };

    const clearImage = () => {
        setImage(null);
        setPreview(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-3">
                    <Leaf className="text-green-500" size={32} />
                    AI Pest & Disease Doctor
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Upload a photo of your crop to instantly identify diseases and get expert remedies.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Upload Section */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    {!preview ? (
                        <div
                            onClick={() => fileInputRef.current.click()}
                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
                                <Camera size={32} className="text-green-600 dark:text-green-400" />
                            </div>
                            <p className="font-medium text-gray-700 dark:text-gray-200">Click to Upload Photo</p>
                            <p className="text-sm text-gray-500 mt-1">Supports JPG, PNG</p>
                        </div>
                    ) : (
                        <div className="relative rounded-xl overflow-hidden h-64 bg-black">
                            <img src={preview} alt="Crop Upload" className="w-full h-full object-contain" />
                            <button
                                onClick={clearImage}
                                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        className="hidden"
                    />

                    <button
                        onClick={handleDiagnose}
                        disabled={!image || loading}
                        className={`w-full mt-6 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2
                            ${!image || loading
                                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {loading ? (
                            <span className="animate-pulse">Analyzing Crop...</span>
                        ) : (
                            <>
                                <Upload size={20} /> Diagnose Now
                            </>
                        )}
                    </button>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {result ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className={`p-4 ${result.diagnosis === 'Healthy' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'} flex justify-between items-center`}>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{result.diagnosis}</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Detected on {result.crop}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Confidence</span>
                                    <p className="text-2xl font-black">{result.confidence}%</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {result.symptoms && result.symptoms.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                                            <AlertTriangle size={18} className="text-orange-500" /> Symptoms
                                        </h3>
                                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                                            {result.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {result.diagnosis !== 'Healthy' && (
                                    <>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                                                <Leaf size={18} className="text-green-500" /> Organic Remedy
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                                                {result.organic_remedy || "No specific organic remedy found."}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                                                <Droplet size={18} className="text-blue-500" /> Chemical Treatment
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                                                {result.chemical_remedy || "No specific chemical remedy found."}
                                            </p>
                                        </div>
                                    </>
                                )}

                                {result.diagnosis === 'Healthy' && (
                                    <div className="text-center py-8 text-green-600">
                                        <Check size={48} className="mx-auto mb-2" />
                                        <p className="font-medium">Your crop is looking great! Keep up the good work.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 text-center">
                            <div>
                                <Upload size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Diagnosis results will appear here after analysis.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PestDoctor;
