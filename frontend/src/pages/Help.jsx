import React from 'react';
import { HelpCircle, Phone, Mail, ChevronDown } from 'lucide-react';

const Help = () => {
    const faqs = [
        { q: 'How do I change my language?', a: 'Go to Profile > Settings > Language to select your preferred language.' },
        { q: 'Is the soil test free?', a: 'The basic AI analysis is free. Detailed lab reports may have a nominal fee.' },
        { q: 'How to contact support?', a: 'You can call our toll-free number 1800-123-4567 or email support@smartfarmer.com.' },
    ];

    return (
        <div className="max-w-2xl mx-auto pb-20 space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Help & Support</h2>

            {/* Contact Card */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="text-xl font-bold mb-4">Need Assistance?</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Phone size={20} />
                        </div>
                        <div>
                            <p className="text-green-100 text-sm">Toll Free Number</p>
                            <p className="font-bold text-lg">1800-123-4567</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Mail size={20} />
                        </div>
                        <div>
                            <p className="text-green-100 text-sm">Email Support</p>
                            <p className="font-bold text-lg">support@smartfarmer.com</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQs */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <HelpCircle size={20} className="text-green-600" /> Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.q}</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center text-gray-400 text-sm pt-8">
                <p>App Version 1.0.0</p>
                <p>© 2024 AI Smart Farmer System</p>
            </div>
        </div>
    );
};

export default Help;
