import React from 'react';
import { Play, Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HeroCard = ({ user }) => {
    const { t } = useTranslation();

    const playGreeting = () => {
        // Stub for voice synthesis
        const msg = new SpeechSynthesisUtterance(`${t('welcome')}, ${user?.name || 'Farmer'}`);
        window.speechSynthesis.speak(msg);
    };

    return (
        <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">{t('welcome')}, {user?.name}</h2>
                <p className="text-green-100 mb-6 text-lg">Here is your daily summary.</p>

                <button
                    onClick={playGreeting}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full transition-all"
                >
                    <Play size={20} fill="currentColor" />
                    <span className="font-medium">Play Daily Briefing</span>
                </button>
            </div>

            {/* Decorative background pattern */}
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                <Mic size={200} />
            </div>
        </div>
    );
};

export default HeroCard;
