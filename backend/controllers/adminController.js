const { User, AuditLog, Godown, UserCrop, FarmerActivity, ChatMessage, Crop } = require('../models');
const bcrypt = require('bcryptjs');

// @desc    Get all users (with filters)
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
    try {
        const { role, state, district } = req.query;
        const where = {};
        if (role) where.role = role;
        if (state) where.assigned_state = state;
        if (district) where.assigned_district = district;

        const users = await User.findAll({ where });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new user (admin, manager, etc)
// @route   POST /api/admin/users
const createUser = async (req, res) => {
    try {
        const { name, email, mobileNumber, password, role, assigned_state, assigned_district, assigned_mandal, godownCapacity } = req.body;

        const userExists = await User.findOne({ where: { mobileNumber } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate Godown Capacity
        if (role === 'GODOWN_MANAGER' && !godownCapacity) {
            return res.status(400).json({ message: 'Godown capacity is required for managers' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            mobileNumber,
            password: hashedPassword,
            role,
            assigned_state,
            assigned_district,
            assigned_mandal
        });

        // Create Godown if role is manager
        if (role === 'GODOWN_MANAGER') {
            await Godown.create({
                name: `Godown - ${assigned_mandal}`,
                state: assigned_state,
                district: assigned_district,
                mandal: assigned_mandal,
                total_capacity_tonnes: parseFloat(godownCapacity),
                used_capacity_tonnes: 0,
                manager_user_id: user.id
            });
        }

        // Audit Log
        await AuditLog.create({
            entity_type: 'User',
            entity_id: user.id,
            action: 'CREATE',
            changed_by_user_id: req.user.id,
            changed_by_role: req.user.role,
            changes: { new: user }
        });

        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get system stats
// @route   GET /api/admin/stats
const getStats = async (req, res) => {
    try {
        const totalFarmers = await User.count({ where: { role: 'FARMER' } }); // Or checking specific role logic
        const totalGodowns = await Godown.count();
        // Add more stats...
        res.json({
            totalFarmers,
            totalGodowns
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

// @desc    Get detailed farmer profile (crops, ai usage, activities)
// @route   GET /api/admin/farmers/:id
const getFarmerDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const farmer = await User.findOne({
            where: { id, role: 'FARMER' },
            include: [
                {
                    model: UserCrop,
                    include: [{ model: Crop }]
                },
                { model: FarmerActivity, as: 'activities' }, // Assuming aliased in index.js or default
                {
                    model: ChatMessage,
                    attributes: ['id', 'message', 'role', 'createdAt'],
                    limit: 20, // Limit history for overview
                    order: [['createdAt', 'DESC']]
                }
            ]
        });

        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        res.json(farmer);
    } catch (error) {
        console.error('Error fetching farmer details:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getUsers,
    createUser,
    getStats,
    getFarmerDetails
};
