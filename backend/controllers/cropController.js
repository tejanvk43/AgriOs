const { UserCrop, LandRecord } = require('../models');

// Add a new crop
exports.addCrop = async (req, res) => {
    try {
        const { landRecordId, cropName, sowingDate, areaAcres } = req.body;
        const userId = req.user.id; // From auth middleware

        // Verify land belongs to user
        const land = await LandRecord.findOne({ where: { id: landRecordId, userId } });
        if (!land) {
            return res.status(404).json({ message: 'Land record not found or does not belong to you.' });
        }

        const newCrop = await UserCrop.create({
            userId,
            landRecordId,
            cropName,
            sowingDate,
            areaAcres,
            status: 'Active'
        });

        res.status(201).json(newCrop);
    } catch (error) {
        console.error('Error adding crop:', error);
        res.status(500).json({ message: 'Server error while adding crop.' });
    }
};

// Get crops for specific land
exports.getCropsByLand = async (req, res) => {
    try {
        const { landId } = req.params;
        const userId = req.user.id;

        const crops = await UserCrop.findAll({
            where: { landRecordId: landId, userId },
            order: [['createdAt', 'DESC']]
        });

        res.json(crops);
    } catch (error) {
        console.error('Error fetching crops:', error);
        res.status(500).json({ message: 'Server error while fetching crops.' });
    }
};

// Get all active crops for the dashboard (aggregated)
exports.getAllActiveCrops = async (req, res) => {
    try {
        const userId = req.user.id;

        const crops = await UserCrop.findAll({
            where: { userId, status: 'Active' },
            include: [{
                model: LandRecord,
                attributes: ['state', 'district', 'village', 'surveyNumber']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json(crops);
    } catch (error) {
        console.error('Error fetching active crops:', error);
        res.status(500).json({ message: 'Server error while fetching active crops.' });
    }
};
