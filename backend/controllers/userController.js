const { User, LandRecord } = require('../models');

// @desc    Get user profile with land records
// @route   GET /api/users/profile
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware

        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'email', 'mobileNumber', 'role', 'houseAddress', 'pincode', 'state', 'district', 'city'],
            include: [{
                model: LandRecord,
                as: 'landRecords',
                attributes: ['id', 'state', 'district', 'mandal', 'village', 'surveyNumber', 'totalAcres', 'landType', 'ownerName', 'createdAt']
            }]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                ...user.toJSON(),
                landRecordCount: user.landRecords ? user.landRecords.length : 0
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getUserProfile
};
