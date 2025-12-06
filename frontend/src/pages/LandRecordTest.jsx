import React from 'react';
import LandRecordForm from '../components/LandRecordForm';

const LandRecordTest = () => {
    const handleLandRecordsChange = (records) => {
        console.log('Land Records Updated:', records);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
            <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    Land Record Form Test
                </h1>
                <LandRecordForm onLandRecordsChange={handleLandRecordsChange} />
            </div>
        </div>
    );
};

export default LandRecordTest;
