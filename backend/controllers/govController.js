const { GovAdvisory } = require('../models');

// @desc    Create Advisory
// @route   POST /api/gov/advisories
const createAdvisory = async (req, res) => {
    try {
        const advisory = await GovAdvisory.create({
            ...req.body,
            created_by_user_id: req.user.id
        });
        res.status(201).json(advisory);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Advisories
// @route   GET /api/gov/advisories
const getAdvisories = async (req, res) => {
    try {
        // Can filter by target area if needed
        const advisories = await GovAdvisory.findAll();
        res.json(advisories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createAdvisory,
    getAdvisories
};
