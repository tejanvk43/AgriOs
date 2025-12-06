import React, { useState } from 'react';
import { Upload, FileText, Check, AlertTriangle } from 'lucide-react';

const SoilReport = () => {
    const [file, setFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = () => {
        if (!file) return;
        setAnalyzing(true);
        // Mock analysis
        setTimeout(() => {
            setAnalyzing(false);
            setResult({
                ph: '6.5 (Neutral)',
                nitrogen: 'Low',
                phosphorus: 'Medium',
                potassium: 'High',
                recommendation: 'Add Urea to increase Nitrogen levels. Soil is good for Wheat and Rice.'
            });
        }, 2000);
    };

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Soil Report Analyzer</h2>

            {!result ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-dashed border-gray-300 dark:border-gray-600 text-center">
                    <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                        <Upload size={32} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Upload Soil Health Card</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Take a photo of your soil report and upload it here for AI analysis.</p>

                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="soil-upload"
                        onChange={handleFileChange}
                    />
                    <label
                        htmlFor="soil-upload"
                        className="inline-block px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium mb-4"
                    >
                        {file ? file.name : 'Choose Image'}
                    </label>

                    {file && (
                        <button
                            onClick={handleUpload}
                            disabled={analyzing}
                            className="block w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium disabled:opacity-70"
                        >
                            {analyzing ? 'Analyzing...' : 'Analyze Report'}
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                            <FileText size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Analysis Result</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400">pH Level</p>
                            <p className="font-semibold text-gray-800 dark:text-white">{result.ph}</p>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                            <p className="text-xs text-red-600 dark:text-red-400">Nitrogen</p>
                            <p className="font-semibold text-red-700 dark:text-red-300">{result.nitrogen}</p>
                        </div>
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
                            <p className="text-xs text-yellow-600 dark:text-yellow-400">Phosphorus</p>
                            <p className="font-semibold text-yellow-700 dark:text-yellow-300">{result.phosphorus}</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                            <p className="text-xs text-green-600 dark:text-green-400">Potassium</p>
                            <p className="font-semibold text-green-700 dark:text-green-300">{result.potassium}</p>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                            <Check size={18} /> Recommendation
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">
                            {result.recommendation}
                        </p>
                    </div>

                    <button
                        onClick={() => { setResult(null); setFile(null); }}
                        className="mt-6 w-full py-3 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition"
                    >
                        Analyze Another Report
                    </button>
                </div>
            )}
        </div>
    );
};

export default SoilReport;
