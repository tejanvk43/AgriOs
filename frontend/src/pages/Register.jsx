import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Phone, User, MapPin, Lock, Check, Home, Map } from 'lucide-react';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import LandRecordForm from '../components/LandRecordForm';

const INDIAN_LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
];

const Register = () => {
    const [step, setStep] = useState(1);
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [landRecords, setLandRecords] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        houseAddress: '',
        pincode: '',
        state: '',
        district: '',
        city: '',
        password: '',
        mobileNumber: '',
        role: 'Farmer'
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const { i18n, t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        if (selectedLanguage) {
            i18n.changeLanguage(selectedLanguage);
            localStorage.setItem('language', selectedLanguage); // Save to localStorage
        }
    }, [selectedLanguage, i18n]);

    useEffect(() => {
        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier = null;
            }
        };
    }, []);

    // Fetch location from pincode
    const fetchLocationFromPincode = async (pincode) => {
        if (pincode.length !== 6) return;

        setFetchingLocation(true);
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();

            if (data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
                const postOffice = data[0].PostOffice[0];
                setFormData(prev => ({
                    ...prev,
                    state: postOffice.State,
                    district: postOffice.District,
                    city: postOffice.Block || postOffice.Name
                }));
                setError('');
            } else {
                setError(t('invalidPincode'));
                setFormData(prev => ({ ...prev, state: '', district: '', city: '' }));
            }
        } catch (err) {
            console.error('Pincode fetch error:', err);
        } finally {
            setFetchingLocation(false);
        }
    };

    const handleLanguageSelect = (langCode) => {
        setSelectedLanguage(langCode);
        setStep(2);
    };

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => { }
            });
        }
    };

    const handleSendOTP = async () => {
        if (!phoneNumber || phoneNumber.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        setSending(true);
        setError('');

        try {
            setupRecaptcha();
            const formattedPhoneNumber = `+91${phoneNumber}`;
            const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, window.recaptchaVerifier);
            setConfirmationResult(confirmation);
        } catch (error) {
            console.error('OTP Error:', error.code);
            if (error.code === 'auth/too-many-requests') {
                setError('Too many attempts. Please wait and try again.');
            } else {
                setError('Failed to send OTP. Please try again.');
            }
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier = null;
            }
        } finally {
            setSending(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setVerifying(true);
        setError('');

        try {
            await confirmationResult.confirm(otp);
            setPhoneVerified(true);
            setFormData(prev => ({ ...prev, mobileNumber: phoneNumber }));
            setTimeout(() => setStep(3), 1000);
        } catch (error) {
            console.error('Verify Error:', error);
            setError('Invalid OTP. Please try again.');
        } finally {
            setVerifying(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'pincode' && value.length === 6) {
            fetchLocationFromPincode(value);
        }
    };

    const handleLandRecordsChange = (records) => {
        setLandRecords(records);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!phoneVerified) {
            setError('Please verify your phone number first');
            return;
        }

        if (!formData.name || !formData.houseAddress || !formData.pincode || !formData.password) {
            setError('Please fill all required fields');
            return;
        }

        // Include land records in registration
        const registrationData = {
            ...formData,
            landRecords: landRecords
        };

        const result = await register(registrationData);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
    };

    // Step indicator component
    const StepIndicator = ({ currentStep }) => (
        <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s, i) => (
                <React.Fragment key={s}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
            ${s < currentStep ? 'bg-green-500 text-white' :
                            s === currentStep ? 'bg-blue-500 text-white' :
                                'bg-gray-200 dark:bg-gray-600 text-gray-500'}`}>
                        {s < currentStep ? <Check size={16} /> : s}
                    </div>
                    {i < 3 && <ChevronRight size={20} className="text-gray-400" />}
                </React.Fragment>
            ))}
        </div>
    );

    // Step 1: Language Selection
    if (step === 1) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
                <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                            Select your language
                        </h1>
                        <h2 className="text-3xl font-bold text-gray-600 dark:text-gray-300">
                            अपनी भाषा चुनें
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {INDIAN_LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageSelect(lang.code)}
                                className="p-6 bg-gradient-to-br from-green-50 to-white dark:from-gray-700 dark:to-gray-600 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-green-500 hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                            >
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                                        {lang.nativeName}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {lang.name}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <Link to="/login" className="text-sm text-green-600 hover:text-green-700 font-medium">
                            {t('alreadyHaveAccount')} {t('loginHere')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: Phone Verification
    if (step === 2) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                            {t('verifyPhone')}
                        </h2>
                        <StepIndicator currentStep={2} />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <Phone className="text-green-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-white">
                                    {t('phoneVerification')}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t('verifyPhoneDesc')}
                                </p>
                            </div>
                        </div>

                        {!phoneVerified ? (
                            <div className="space-y-4">
                                {!confirmationResult ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {t('mobileNumber')}
                                            </label>
                                            <div className="flex gap-2">
                                                <div className="w-16 px-3 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center font-medium text-gray-700 dark:text-gray-300">
                                                    +91
                                                </div>
                                                <input
                                                    type="tel"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                    placeholder="10-digit mobile number"
                                                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"
                                                    maxLength={10}
                                                />
                                            </div>
                                        </div>
                                        <div id="recaptcha-container"></div>
                                        <button
                                            onClick={handleSendOTP}
                                            disabled={sending || phoneNumber.length !== 10}
                                            className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium shadow-lg disabled:opacity-50 cursor-pointer"
                                        >
                                            {sending ? '...' : t('sendOTP')}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {t('enterOTP')}
                                            </label>
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="6-digit OTP"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 text-center text-2xl tracking-widest font-bold"
                                                maxLength={6}
                                            />
                                        </div>
                                        <button
                                            onClick={handleVerifyOTP}
                                            disabled={verifying || otp.length !== 6}
                                            className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium shadow-lg disabled:opacity-50 cursor-pointer"
                                        >
                                            {verifying ? '...' : t('verifyOTP')}
                                        </button>
                                        <button
                                            onClick={() => { setConfirmationResult(null); setOtp(''); setError(''); }}
                                            className="w-full py-2 text-sm text-gray-600 dark:text-gray-400"
                                        >
                                            ← {t('changeNumber')}
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-4">
                                    <Check size={20} />
                                    <span className="font-medium">{t('phoneVerified')}</span>
                                </div>
                                <button
                                    onClick={() => setStep(3)}
                                    className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium cursor-pointer"
                                >
                                    {t('continue')} →
                                </button>
                            </div>
                        )}
                    </div>

                    <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
                        ← {t('back')}
                    </button>
                </div>
            </div>
        );
    }

    // Step 3: User Details with Address
    if (step === 3) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                            {t('createAccount')}
                        </h2>
                        <StepIndicator currentStep={3} />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <User className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white">{t('userDetails')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('userDetailsDesc')}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <User size={16} className="inline mr-1" /> {t('fullName')} *
                            </label>
                            <input
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                placeholder={t('fullNamePlaceholder')}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"
                                onChange={handleChange}
                            />
                        </div>

                        {/* House Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <Home size={16} className="inline mr-1" /> {t('houseAddress')} *
                            </label>
                            <textarea
                                name="houseAddress"
                                required
                                value={formData.houseAddress}
                                placeholder={t('houseAddressPlaceholder')}
                                rows={2}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 resize-none"
                                onChange={handleChange}
                            />
                        </div>

                        {/* Pincode */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <MapPin size={16} className="inline mr-1" /> {t('pincode')} *
                            </label>
                            <input
                                name="pincode"
                                type="text"
                                required
                                value={formData.pincode}
                                placeholder={t('pincodePlaceholder')}
                                maxLength={6}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"
                                onChange={(e) => handleChange({ target: { name: 'pincode', value: e.target.value.replace(/\D/g, '') } })}
                            />
                            {fetchingLocation && <p className="mt-1 text-xs text-blue-500">{t('fetchingLocation')}</p>}
                        </div>

                        {/* Auto-detected fields */}
                        {formData.state && (
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-3">
                                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                    <Map size={14} className="inline mr-1" /> {t('autoDetected')}
                                </p>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-500 text-xs">{t('state')}</span>
                                        <p className="font-medium text-gray-800 dark:text-white">{formData.state}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-xs">{t('district')}</span>
                                        <p className="font-medium text-gray-800 dark:text-white">{formData.district}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-xs">{t('city')}</span>
                                        <p className="font-medium text-gray-800 dark:text-white">{formData.city}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <Lock size={16} className="inline mr-1" /> {t('password')} *
                            </label>
                            <input
                                name="password"
                                type="password"
                                required
                                minLength="6"
                                value={formData.password}
                                placeholder={t('passwordPlaceholder')}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"
                                onChange={handleChange}
                            />
                            <p className="mt-1 text-xs text-gray-500">{t('minPassword')}</p>
                        </div>

                        <button
                            onClick={() => {
                                if (!formData.name || !formData.houseAddress || !formData.pincode || !formData.state || !formData.password) {
                                    setError('Please fill all required fields');
                                    return;
                                }
                                setError('');
                                setStep(4);
                            }}
                            disabled={!formData.state}
                            className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium shadow-lg disabled:opacity-50 cursor-pointer"
                        >
                            {t('continue')} →
                        </button>
                    </div>

                    <div className="mt-4">
                        <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
                            ← {t('back')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 4: Land Verification
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {i18n.language === 'hi' ? 'भूमि सत्यापन' : 'Land Verification'}
                    </h2>
                    <StepIndicator currentStep={4} />
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <LandRecordForm
                    onLandRecordsChange={handleLandRecordsChange}
                />

                <div className="mt-6 space-y-3">
                    <button
                        onClick={handleSubmit}
                        className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium shadow-lg cursor-pointer"
                    >
                        {t('registerAsFarmer')}
                    </button>
                    {landRecords.length === 0 && (
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                            {i18n.language === 'hi' ? 'आप बिना भूमि रिकॉर्ड के भी पंजीकरण कर सकते हैं' : 'You can register without land records'}
                        </p>
                    )}

                    <button onClick={() => setStep(3)} className="text-sm text-gray-500 hover:text-gray-700 block cursor-pointer">
                        ← {t('back')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;
