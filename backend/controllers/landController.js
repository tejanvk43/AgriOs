const { LandRecord } = require('../models');

// @desc    Verify land record
// @route   POST /api/land/verify
// @access  Public
const verifyLandRecord = async (req, res) => {
    // Keep existing mock verification logic for now as it simulates government API
    const { surveyNumber } = req.body;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock response logic
    return res.status(200).json({
        status: 'success',
        verified: true,
        data: {
            survey_number: surveyNumber,
            total_acres: (Math.random() * 5 + 1).toFixed(2),
            verified_at: new Date().toISOString()
        }
    });
};

// @desc    Save land records to database
// @route   POST /api/land/save
// @access  Public (or Protected depending on flow)
const saveLandRecords = async (req, res) => {
    try {
        const { landRecords, userId } = req.body;

        if (!landRecords || !Array.isArray(landRecords) || !userId) {
            return res.status(400).json({ message: 'Invalid data provided' });
        }

        // Add userId to each record
        const recordsToSave = landRecords.map(record => ({
            ...record,
            userId,
            totalAcres: parseFloat(record.totalAcres), // Ensure decimal
            // Map frontend fields to backend model if needed
        }));

        await LandRecord.bulkCreate(recordsToSave);

        res.status(201).json({
            status: 'success',
            message: 'Land records saved successfully'
        });
    } catch (error) {
        console.error('Error saving land records:', error);
        res.status(500).json({ message: 'Server error saving land records' });
    }
};

// @desc    Get all land records for current user
// @route   GET /api/land
// @access  Private
const getLandRecords = async (req, res) => {
    try {
        const userId = req.user.id;
        const lands = await LandRecord.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        res.json(lands);
    } catch (error) {
        console.error('Error fetching lands:', error);
        res.status(500).json({ message: 'Server error fetching lands' });
    }
};

// @desc    Get single land record by ID
// @route   GET /api/land/:id
// @access  Private
const getLandById = async (req, res) => {
    try {
        const userId = req.user.id;
        const landId = req.params.id;

        const land = await LandRecord.findOne({
            where: { id: landId, userId }
        });

        if (!land) {
            return res.status(404).json({ message: 'Land record not found' });
        }

        res.json(land);
    } catch (error) {
        console.error('Error fetching land:', error);
        res.status(500).json({ message: 'Server error fetching land' });
    }
};

// @desc    Delete land record
// @route   DELETE /api/land/:id
// @access  Private
const deleteLandRecord = async (req, res) => {
    try {
        const userId = req.user.id;
        const landId = req.params.id;

        const land = await LandRecord.findOne({
            where: { id: landId, userId }
        });

        if (!land) {
            return res.status(404).json({ message: 'Land record not found' });
        }

        await land.destroy();

        res.json({ message: 'Land record deleted successfully' });
    } catch (error) {
        console.error('Error deleting land:', error);
        res.status(500).json({ message: 'Server error deleting land' });
    }
};

module.exports = {
    verifyLandRecord,
    saveLandRecords,
    getLandRecords,
    getLandById,
    deleteLandRecord
};
