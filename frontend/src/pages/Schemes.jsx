import React from 'react';
import { BookOpen, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';

const Schemes = () => {
    const schemes = [
        {
            id: 1,
            name: 'PM Kisan Samman Nidhi',
            description: 'Financial benefit of Rs. 6000/- per year in three equal installments.',
            eligibility: 'Small and Marginal Farmers',
            status: 'Eligible',
            deadline: 'No Deadline'
        },
        {
            id: 2,
            name: 'Pradhan Mantri Fasal Bima Yojana',
            description: 'Crop insurance scheme to provide financial support to farmers suffering crop loss/damage.',
            eligibility: 'All Farmers growing notified crops',
            status: 'Applied',
            deadline: '31st July 2024'
        },
        {
            id: 3,
            name: 'Soil Health Card Scheme',
            description: 'Government to issue soil health cards to farmers which will carry crop-wise recommendations.',
            eligibility: 'All Farmers',
            status: 'Not Applied',
            deadline: 'Ongoing'
        }
    ];

    return (
        <div className="max-w-3xl mx-auto pb-20 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Government Schemes</h2>

            <div className="grid gap-6">
                {schemes.map((scheme) => (
                    <div key={scheme.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider ${scheme.status === 'Eligible' ? 'bg-green-100 text-green-700' :
                                scheme.status === 'Applied' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-600'
                            }`}>
                            {scheme.status}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 pr-24">{scheme.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{scheme.description}</p>

                        <div className="flex flex-wrap gap-4 mb-6 text-sm">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <CheckCircle size={16} className="text-green-500" />
                                <span>Eligibility: <span className="font-medium text-gray-700 dark:text-gray-200">{scheme.eligibility}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <AlertCircle size={16} className="text-amber-500" />
                                <span>Deadline: <span className="font-medium text-gray-700 dark:text-gray-200">{scheme.deadline}</span></span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium">
                                {scheme.status === 'Applied' ? 'Track Application' : 'Apply Now'}
                            </button>
                            <button className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-300">
                                <ExternalLink size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Schemes;
