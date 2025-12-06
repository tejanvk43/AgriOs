import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

const LAND_TYPES = ['Wetland', 'Dryland', 'Irrigated', 'Garden', 'Orchard'];

const LandRecordForm = ({ onLandRecordsChange }) => {
    const { i18n } = useTranslation();
    const isHindi = i18n.language === 'hi';

    const [landRecords, setLandRecords] = useState([]);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [currentRecord, setCurrentRecord] = useState({
        state: '',
        district: '',
        mandal: '',
        village: '',
        surveyNumber: '',
        totalAcres: '',
        landType: 'Wetland',
        ownerName: ''
    });

    const labels = {
        title: isHindi ? 'भूमि रिकॉर्ड' : 'Land Records',
        subtitle: isHindi ? 'अपनी भूमि का विवरण जोड़ें' : 'Add your land details',
        state: isHindi ? 'राज्य' : 'State',
        district: isHindi ? 'जिला' : 'District',
        mandal: isHindi ? 'मंडल/तहसील' : 'Mandal/Tehsil',
        village: isHindi ? 'गाँव' : 'Village',
        surveyNumber: isHindi ? 'सर्वे नंबर' : 'Survey Number',
        totalAcres: isHindi ? 'कुल एकड़' : 'Total Acres',
        landType: isHindi ? 'भूमि का प्रकार' : 'Land Type',
        ownerName: isHindi ? 'मालिक का नाम' : 'Owner Name',
        addLand: isHindi ? 'भूमि जोड़ें' : 'Add Land Record',
        updateLand: isHindi ? 'भूमि अपडेट करें' : 'Update Land Record',
        cancel: isHindi ? 'रद्द करें' : 'Cancel',
        edit: isHindi ? 'संपादित करें' : 'Edit',
        delete: isHindi ? 'हटाएं' : 'Delete',
        noRecords: isHindi ? 'कोई भूमि रिकॉर्ड नहीं जोड़ा गया' : 'No land records added yet',
        addAnother: isHindi ? '+ एक और भूमि जोड़ें' : '+ Add Another Land',
        enterState: isHindi ? 'राज्य दर्ज करें' : 'Enter state',
        enterDistrict: isHindi ? 'जिला दर्ज करें' : 'Enter district',
        enterMandal: isHindi ? 'मंडल दर्ज करें' : 'Enter mandal',
        enterVillage: isHindi ? 'गाँव दर्ज करें' : 'Enter village',
        enterSurveyNumber: isHindi ? 'सर्वे नंबर दर्ज करें' : 'Enter survey number',
        enterAcres: isHindi ? 'एकड़ दर्ज करें' : 'Enter acres',
        enterOwnerName: isHindi ? 'मालिक का नाम दर्ज करें' : 'Enter owner name',
        selectLandType: isHindi ? 'भूमि का प्रकार चुनें' : 'Select land type',
        required: isHindi ? 'सभी फ़ील्ड आवश्यक हैं' : 'All fields are required'
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentRecord(prev => ({ ...prev, [name]: value }));
    };

    const validateRecord = () => {
        return currentRecord.state &&
            currentRecord.district &&
            currentRecord.mandal &&
            currentRecord.village &&
            currentRecord.surveyNumber &&
            currentRecord.totalAcres &&
            currentRecord.ownerName;
    };

    const handleAddOrUpdate = () => {
        if (!validateRecord()) {
            alert(labels.required);
            return;
        }

        let updatedRecords;
        if (editingIndex >= 0) {
            // Update existing record
            updatedRecords = [...landRecords];
            updatedRecords[editingIndex] = { ...currentRecord };
            setEditingIndex(-1);
        } else {
            // Add new record
            updatedRecords = [...landRecords, { ...currentRecord }];
        }

        setLandRecords(updatedRecords);

        // Notify parent component
        if (onLandRecordsChange) {
            onLandRecordsChange(updatedRecords);
        }

        // Reset form
        setCurrentRecord({
            state: '',
            district: '',
            mandal: '',
            village: '',
            surveyNumber: '',
            totalAcres: '',
            landType: 'Wetland',
            ownerName: ''
        });
    };

    const handleEdit = (index) => {
        setCurrentRecord({ ...landRecords[index] });
        setEditingIndex(index);
    };

    const handleDelete = (index) => {
        const updatedRecords = landRecords.filter((_, i) => i !== index);
        setLandRecords(updatedRecords);

        if (onLandRecordsChange) {
            onLandRecordsChange(updatedRecords);
        }
    };

    const handleCancel = () => {
        setEditingIndex(-1);
        setCurrentRecord({
            state: '',
            district: '',
            mandal: '',
            village: '',
            surveyNumber: '',
            totalAcres: '',
            landType: 'Wetland',
            ownerName: ''
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <MapPin className="text-green-600" size={24} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{labels.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{labels.subtitle}</p>
                </div>
            </div>

            {/* Land Record Form */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    {/* State */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {labels.state} *
                        </label>
                        <input
                            type="text"
                            name="state"
                            value={currentRecord.state}
                            onChange={handleInputChange}
                            placeholder={labels.enterState}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* District */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {labels.district} *
                        </label>
                        <input
                            type="text"
                            name="district"
                            value={currentRecord.district}
                            onChange={handleInputChange}
                            placeholder={labels.enterDistrict}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Mandal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {labels.mandal} *
                        </label>
                        <input
                            type="text"
                            name="mandal"
                            value={currentRecord.mandal}
                            onChange={handleInputChange}
                            placeholder={labels.enterMandal}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Village */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {labels.village} *
                        </label>
                        <input
                            type="text"
                            name="village"
                            value={currentRecord.village}
                            onChange={handleInputChange}
                            placeholder={labels.enterVillage}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Survey Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {labels.surveyNumber} *
                        </label>
                        <input
                            type="text"
                            name="surveyNumber"
                            value={currentRecord.surveyNumber}
                            onChange={handleInputChange}
                            placeholder={labels.enterSurveyNumber}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Total Acres */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {labels.totalAcres} *
                        </label>
                        <input
                            type="number"
                            name="totalAcres"
                            value={currentRecord.totalAcres}
                            onChange={handleInputChange}
                            placeholder={labels.enterAcres}
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Land Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {labels.landType} *
                        </label>
                        <select
                            name="landType"
                            value={currentRecord.landType}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"
                        >
                            {LAND_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Owner Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {labels.ownerName} *
                        </label>
                        <input
                            type="text"
                            name="ownerName"
                            value={currentRecord.ownerName}
                            onChange={handleInputChange}
                            placeholder={labels.enterOwnerName}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={handleAddOrUpdate}
                        className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {editingIndex >= 0 ? (
                            <>
                                <Save size={18} />
                                {labels.updateLand}
                            </>
                        ) : (
                            <>
                                <Plus size={18} />
                                {labels.addLand}
                            </>
                        )}
                    </button>
                    {editingIndex >= 0 && (
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-medium flex items-center gap-2 cursor-pointer"
                        >
                            <X size={18} />
                            {labels.cancel}
                        </button>
                    )}
                </div>
            </div>

            {/* List of Added Land Records */}
            {landRecords.length > 0 ? (
                <div className="space-y-3">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                        {isHindi ? 'जोड़े गए रिकॉर्ड' : 'Added Records'} ({landRecords.length})
                    </h4>
                    {landRecords.map((record, index) => (
                        <div key={index} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">{labels.state}:</span>
                                    <p className="font-medium text-gray-800 dark:text-white">{record.state}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">{labels.district}:</span>
                                    <p className="font-medium text-gray-800 dark:text-white">{record.district}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">{labels.mandal}:</span>
                                    <p className="font-medium text-gray-800 dark:text-white">{record.mandal}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">{labels.village}:</span>
                                    <p className="font-medium text-gray-800 dark:text-white">{record.village}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">{labels.surveyNumber}:</span>
                                    <p className="font-medium text-gray-800 dark:text-white">{record.surveyNumber}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">{labels.totalAcres}:</span>
                                    <p className="font-medium text-gray-800 dark:text-white">{record.totalAcres}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">{labels.landType}:</span>
                                    <p className="font-medium text-gray-800 dark:text-white">{record.landType}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">{labels.ownerName}:</span>
                                    <p className="font-medium text-gray-800 dark:text-white">{record.ownerName}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                <button
                                    onClick={() => handleEdit(index)}
                                    className="flex-1 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Edit2 size={16} />
                                    {labels.edit}
                                </button>
                                <button
                                    onClick={() => handleDelete(index)}
                                    className="flex-1 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Trash2 size={16} />
                                    {labels.delete}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                    {labels.noRecords}
                </div>
            )}
        </div>
    );
};

export default LandRecordForm;
