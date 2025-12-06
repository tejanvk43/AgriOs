import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { User, MapPin, Globe, Moon, Sun, Save } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        mobileNumber: user?.mobileNumber || '',
    });
    const [landRecords, setLandRecords] = useState([]);

    // Calculate total acres
    const totalAcres = landRecords.reduce((sum, record) => sum + (parseFloat(record.totalAcres) || 0), 0);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('userToken');
                if (!token) return;

                const response = await fetch('http://localhost:5000/api/users/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.user && data.user.landRecords) {
                        setLandRecords(data.user.landRecords);
                    }
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        // API call to update profile would go here
        setIsEditing(false);
        alert('Profile updated successfully!');
    };

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('profile')}</h2>

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-4xl font-bold">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        {isEditing ? <Save size={18} /> : <User size={18} />}
                        <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            disabled={!isEditing}
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white disabled:opacity-60"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                        <input
                            type="text"
                            name="mobileNumber"
                            disabled={!isEditing}
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white disabled:opacity-60"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Land (Acres)</label>
                        <input
                            type="text"
                            disabled={true}
                            value={totalAcres.toFixed(2)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 dark:text-white cursor-default font-medium"
                            style={{ cursor: 'default' }}
                        />
                        <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Total area calculated from your land records</p>
                    </div>
                </div>
            </div>

            {/* Farming Details & Land Records */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Language Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <Globe className="text-blue-500" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Language</h3>
                    </div>
                    <div className="space-y-2">
                        <select
                            value={i18n.language}
                            onChange={(e) => changeLanguage(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 cursor-pointer"
                            style={{ cursor: 'pointer' }}
                        >
                            {['en', 'hi', 'te', 'bn', 'ta', 'mr', 'gu', 'kn', 'pa', 'or', 'ml'].map((lang) => (
                                <option key={lang} value={lang}>
                                    {lang === 'en' ? 'English' :
                                        lang === 'hi' ? 'हिंदी (Hindi)' :
                                            lang === 'te' ? 'తెలుగు (Telugu)' :
                                                lang === 'bn' ? 'বাংলা (Bengali)' :
                                                    lang === 'ta' ? 'தமிழ் (Tamil)' :
                                                        lang === 'mr' ? 'मराठी (Marathi)' :
                                                            lang === 'gu' ? 'ગુજરાતી (Gujarati)' :
                                                                lang === 'kn' ? 'ಕನ್ನಡ (Kannada)' :
                                                                    lang === 'pa' ? 'ਪੰਜਾਬੀ (Punjabi)' :
                                                                        lang === 'or' ? 'ଓଡ଼ିଆ (Odia)' :
                                                                            'മലയാളം (Malayalam)'}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Farm Locations / Land Records */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <MapPin className="text-red-500" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Land Records</h3>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                        {landRecords.length > 0 ? (
                            landRecords.map((record, index) => (
                                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Survey No: {record.surveyNumber}</h4>
                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                                            {record.totalAcres} Acres
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                        <p>{record.village}, {record.mandal}</p>
                                        <p>{record.district}, {record.state}</p>
                                        <p className="text-xs text-gray-500 mt-2">Owner: {record.ownerName} | Type: {record.landType}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <MapPin size={48} className="mx-auto mb-3 opacity-20" />
                                <p>No land records found.</p>
                                <p className="text-xs mt-1">Add details when registering to see them here.</p>
                            </div>
                        )}
                    </div>

                    <button className="mt-4 w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700">
                        + Add New Land Record
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
