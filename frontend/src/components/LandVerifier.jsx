import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, FileCheck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const LandVerifier = ({ onVerificationSuccess }) => {
    const { i18n } = useTranslation();
    const isHindi = i18n.language === 'hi';

    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedMandal, setSelectedMandal] = useState('');
    const [selectedVillage, setSelectedVillage] = useState('');
    const [manualLocation, setManualLocation] = useState(false);
    const [manualState, setManualState] = useState('');
    const [manualDistrict, setManualDistrict] = useState('');
    const [manualMandal, setManualMandal] = useState('');
    const [manualVillage, setManualVillage] = useState('');
    const [surveyNumber, setSurveyNumber] = useState('');

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [mandals, setMandals] = useState([]);
    const [villages, setVillages] = useState([]);

    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingMandals, setLoadingMandals] = useState(false);
    const [loadingVillages, setLoadingVillages] = useState(false);

    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState('');
    const [landData, setLandData] = useState(null);

    // Memoized display helper
    const getDisplayName = useMemo(() => (item) => {
        if (!item) return '';
        return isHindi && item.nameHi ? item.nameHi : item.name;
    }, [isHindi]);

    // Fetch states on mount (skip when in manual location mode)
    useEffect(() => {
        if (manualLocation) return;
        const fetchStates = async () => {
            setLoadingStates(true);
            try {
                const res = await fetch(`${API_BASE}/locations/states`);
                const data = await res.json();
                setStates(data.states || []);
            } catch (err) {
                setError(isHindi ? 'राज्य लोड नहीं हो सके' : 'Failed to load states');
            } finally {
                setLoadingStates(false);
            }
        };
        fetchStates();
    }, [isHindi, manualLocation]);

    // Fetch districts when state changes (skip in manual mode)
    useEffect(() => {
        if (manualLocation) return;
        if (!selectedState) {
            setDistricts([]);
            return;
        }
        const fetchDistricts = async () => {
            setLoadingDistricts(true);
            try {
                const res = await fetch(`${API_BASE}/locations/districts/${selectedState}`);
                const data = await res.json();
                setDistricts(data.districts || []);
            } catch (err) {
                setError(isHindi ? 'जिले लोड नहीं हो सके' : 'Failed to load districts');
            } finally {
                setLoadingDistricts(false);
            }
        };
        fetchDistricts();
        setSelectedDistrict('');
        setSelectedMandal('');
        setSelectedVillage('');
    }, [selectedState, isHindi, manualLocation]);

    // Fetch mandals when district changes (skip in manual mode)
    useEffect(() => {
        if (manualLocation) return;
        if (!selectedDistrict) {
            setMandals([]);
            return;
        }
        const fetchMandals = async () => {
            setLoadingMandals(true);
            try {
                const res = await fetch(`${API_BASE}/locations/mandals?districtCode=${selectedDistrict}`);
                const data = await res.json();
                setMandals(data.mandals || []);
            } catch (err) {
                setError(isHindi ? 'मंडल लोड नहीं हो सके' : 'Failed to load mandals');
            } finally {
                setLoadingMandals(false);
            }
        };
        fetchMandals();
        setSelectedMandal('');
        setSelectedVillage('');
    }, [selectedDistrict, isHindi, manualLocation]);

    // Fetch villages when mandal changes (skip in manual mode)
    useEffect(() => {
        if (manualLocation) return;
        if (!selectedMandal) {
            setVillages([]);
            return;
        }
        const fetchVillages = async () => {
            setLoadingVillages(true);
            try {
                const res = await fetch(`${API_BASE}/locations/villages?mandalName=${encodeURIComponent(selectedMandal)}`);
                const data = await res.json();
                setVillages(data.villages || []);
            } catch (err) {
                setError(isHindi ? 'गाँव लोड नहीं हो सके' : 'Failed to load villages');
            } finally {
                setLoadingVillages(false);
            }
        };
        fetchVillages();
        setSelectedVillage('');
    }, [selectedMandal, isHindi, manualLocation]);

    const handleVerify = async () => {
        const stateValue = manualLocation ? manualState : selectedState;
        const districtValue = manualLocation ? manualDistrict : selectedDistrict;
        const mandalValue = manualLocation ? manualMandal : selectedMandal;
        const villageValue = manualLocation ? manualVillage : selectedVillage;

        if (!stateValue || !districtValue || !mandalValue || !villageValue || !surveyNumber) {
            setError(isHindi ? 'कृपया सभी फ़ील्ड भरें' : 'Please fill all fields');
            return;
        }

        setVerifying(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE}/land/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    state: stateValue,
                    district: districtValue,
                    mandal: mandalValue,
                    village: villageValue,
                    surveyNumber: surveyNumber
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Verification failed');
            }

            if (data.verified) {
                setVerified(true);
                setLandData(data.data);
                if (onVerificationSuccess) {
                    onVerificationSuccess(data.data);
                }
            }
        } catch (err) {
            setError(isHindi
                ? 'सर्वे नंबर सरकारी रिकॉर्ड में नहीं मिला'
                : 'Survey Number not found in Government Records');
        } finally {
            setVerifying(false);
        }
    };

    const labels = {
        title: isHindi ? 'भूमि सत्यापन' : 'Land Verification',
        subtitle: isHindi ? 'अपनी भूमि का विवरण सत्यापित करें' : 'Verify your land ownership details',
        state: isHindi ? 'राज्य' : 'State',
        district: isHindi ? 'जिला' : 'District',
        mandal: isHindi ? 'मंडल/तहसील' : 'Mandal/Tehsil',
        village: isHindi ? 'गाँव' : 'Village',
        surveyNumber: isHindi ? 'सर्वे नंबर' : 'Survey Number',
        selectState: isHindi ? 'राज्य चुनें' : 'Select State',
        selectDistrict: isHindi ? 'जिला चुनें' : 'Select District',
        selectMandal: isHindi ? 'मंडल चुनें' : 'Select Mandal',
        selectVillage: isHindi ? 'गाँव चुनें' : 'Select Village',
        enterSurvey: isHindi ? 'कोई भी नंबर दर्ज करें (टेस्ट के लिए)' : 'Enter any number (for testing)',
        verify: isHindi ? 'भूमि रिकॉर्ड सत्यापित करें' : 'Verify Land Record',
        verifying: isHindi ? 'सत्यापित हो रहा है...' : 'Verifying...',
        verified: isHindi ? 'सत्यापित' : 'Verified',
        ownerName: isHindi ? 'मालिक का नाम' : 'Owner Name',
        totalAcres: isHindi ? 'कुल एकड़' : 'Total Acres',
        landType: isHindi ? 'भूमि का प्रकार' : 'Land Type',
        testNote: isHindi ? '* टेस्टिंग के लिए कोई भी सर्वे नंबर काम करेगा। "000" से एरर टेस्ट करें।' : '* Any survey number works for testing. Use "000" to test error.'
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <FileCheck className="text-amber-600" size={24} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{labels.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{labels.subtitle}</p>
                </div>
                {verified && (
                    <CheckCircle2 className="ml-auto text-green-500" size={28} />
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Location */}
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    {/* State */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {labels.state} *
                        </label>
                        {!manualLocation ? (
                            <select
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                                disabled={verified || loadingStates}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">{labels.selectState}</option>
                                {states.map(state => (
                                    <option key={state.code} value={state.code}>
                                        {getDisplayName(state)}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={manualState}
                                onChange={(e) => setManualState(e.target.value)}
                                disabled={verified}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder={isHindi ? 'राज्य दर्ज करें' : 'Enter state'}
                            />
                        )}
                    </div>

                    {/* District */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {labels.district} *
                        </label>
                        {!manualLocation ? (
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                disabled={!selectedState || verified || loadingDistricts}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">{labels.selectDistrict}</option>
                                {districts.map(district => (
                                    <option key={district.code} value={district.code}>
                                        {district.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={manualDistrict}
                                onChange={(e) => setManualDistrict(e.target.value)}
                                disabled={verified}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder={isHindi ? 'जिला दर्ज करें' : 'Enter district'}
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Mandal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {labels.mandal} *
                        </label>
                        {!manualLocation ? (
                            <select
                                value={selectedMandal}
                                onChange={(e) => setSelectedMandal(e.target.value)}
                                disabled={!selectedDistrict || verified || loadingMandals}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">{labels.selectMandal}</option>
                                {mandals.map(mandal => (
                                    <option key={mandal} value={mandal}>
                                        {mandal}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={manualMandal}
                                onChange={(e) => setManualMandal(e.target.value)}
                                disabled={verified}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder={isHindi ? 'मंडल/तहसील दर्ज करें' : 'Enter mandal/tehsil'}
                            />
                        )}
                    </div>

                    {/* Village */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {labels.village} *
                        </label>
                        {!manualLocation ? (
                            <select
                                value={selectedVillage}
                                onChange={(e) => setSelectedVillage(e.target.value)}
                                disabled={!selectedMandal || verified || loadingVillages}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">{labels.selectVillage}</option>
                                {villages.map(village => (
                                    <option key={village} value={village}>
                                        {village}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={manualVillage}
                                onChange={(e) => setManualVillage(e.target.value)}
                                disabled={verified}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder={isHindi ? 'गाँव दर्ज करें' : 'Enter village'}
                            />
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="manual-location"
                        type="checkbox"
                        checked={manualLocation}
                        onChange={(e) => {
                            const on = e.target.checked;
                            setManualLocation(on);
                            setManualState('');
                            setManualDistrict('');
                            setManualMandal('');
                            setManualVillage('');
                            if (on) {
                                setSelectedState('');
                                setSelectedDistrict('');
                                setSelectedMandal('');
                                setSelectedVillage('');
                            }
                        }}
                        disabled={verified}
                        className="h-4 w-4"
                    />
                    <label htmlFor="manual-location" className="text-sm text-gray-700 dark:text-gray-300">
                        {isHindi ? 'स्थान मैनुअली दर्ज करें' : 'Enter full location manually'}
                    </label>
                </div>
            </div>

            {/* Survey Number */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <MapPin size={16} className="inline mr-1" />
                    {labels.surveyNumber} *
                </label>
                <input
                    type="text"
                    value={surveyNumber}
                    onChange={(e) => setSurveyNumber(e.target.value)}
                    placeholder={labels.enterSurvey}
                    disabled={verified}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    {labels.testNote}
                </p>
            </div>

            {/* Verify Button */}
            {!verified && (
                <button
                    onClick={handleVerify}
                    disabled={
                        verifying ||
                        !surveyNumber ||
                        (!manualLocation && (!selectedState || !selectedDistrict || !selectedMandal || !selectedVillage)) ||
                        (manualLocation && (!manualState || !manualDistrict || !manualMandal || !manualVillage))
                    }
                    className="w-full py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-medium shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {verifying ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            {labels.verifying}
                        </>
                    ) : (
                        <>
                            <FileCheck size={20} />
                            {labels.verify}
                        </>
                    )}
                </button>
            )}

            {/* Verified Land Details */}
            {verified && landData && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
                        <CheckCircle2 size={20} />
                        <span>{labels.verified} ✓</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">{labels.ownerName}:</span>
                            <p className="font-semibold text-gray-800 dark:text-white">{landData.owner_name}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">{labels.surveyNumber}:</span>
                            <p className="font-semibold text-gray-800 dark:text-white">{landData.survey_number}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">{labels.totalAcres}:</span>
                            <p className="font-semibold text-gray-800 dark:text-white">{landData.total_acres}</p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">{labels.landType}:</span>
                            <p className="font-semibold text-gray-800 dark:text-white">{landData.land_type}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandVerifier;
