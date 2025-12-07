const { Godown, AuditLog, User, StockLog } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all godowns
// @route   GET /api/godowns
const getGodowns = async (req, res) => {
    try {
        const godowns = await Godown.findAll();
        res.json(godowns);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get manager's assigned godown
// @route   GET /api/godowns/my-godown
const getMyGodown = async (req, res) => {
    try {
        const godown = await Godown.findOne({
            where: { manager_user_id: req.user.id },
            include: [
                {
                    model: StockLog,
                    as: 'stockLogs',
                    limit: 10,
                    order: [['createdAt', 'DESC']]
                }
            ]
        });

        if (!godown) {
            return res.status(404).json({ message: 'No godown assigned to this manager' });
        }

        res.json(godown);
    } catch (error) {
        console.error('Error fetching godown:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create Godown
// @route   POST /api/godowns
const createGodown = async (req, res) => {
    try {
        const godown = await Godown.create(req.body);
        res.status(201).json(godown);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Godown Capacity
// @route   PUT /api/godowns/:id/capacity
const updateCapacity = async (req, res) => {
    try {
        const { id } = req.params;
        const { used_capacity_tonnes, remarks } = req.body;

        const godown = await Godown.findByPk(id);
        if (!godown) return res.status(404).json({ message: 'Godown not found' });

        const oldCapacity = godown.used_capacity_tonnes;
        godown.used_capacity_tonnes = used_capacity_tonnes;
        await godown.save();

        // Audit Log
        await AuditLog.create({
            entity_type: 'Godown',
            entity_id: id,
            action: 'UPDATE_CAPACITY',
            changed_by_user_id: req.user.id,
            changed_by_role: req.user.role,
            changes: { old: oldCapacity, new: used_capacity_tonnes, remarks }
        });

        res.json(godown);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Log stock movement (IN/OUT)
// @route   POST /api/godowns/stock-log
const logStockMovement = async (req, res) => {
    try {
        const { crop_type, quantity_tonnes, movement_type, farmer_id, remarks } = req.body;

        // Get manager's godown
        const godown = await Godown.findOne({
            where: { manager_user_id: req.user.id }
        });

        if (!godown) {
            return res.status(404).json({ message: 'No godown assigned' });
        }

        // Create stock log
        const stockLog = await StockLog.create({
            godown_id: godown.godown_id,
            farmer_id,
            crop_type,
            quantity_tonnes: parseFloat(quantity_tonnes),
            movement_type,
            remarks,
            logged_by_user_id: req.user.id
        });

        // Update godown capacity
        if (movement_type === 'IN') {
            godown.used_capacity_tonnes += parseFloat(quantity_tonnes);
        } else if (movement_type === 'OUT') {
            godown.used_capacity_tonnes -= parseFloat(quantity_tonnes);
        }

        // Ensure capacity doesn't go negative
        if (godown.used_capacity_tonnes < 0) {
            godown.used_capacity_tonnes = 0;
        }

        await godown.save();

        res.status(201).json({ stockLog, godown });
    } catch (error) {
        console.error('Error logging stock movement:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get stock logs for manager's godown
// @route   GET /api/godowns/stock-logs
const getStockLogs = async (req, res) => {
    try {
        const { startDate, endDate, movement_type, crop_type } = req.query;

        // Get manager's godown
        const godown = await Godown.findOne({
            where: { manager_user_id: req.user.id }
        });

        if (!godown) {
            return res.status(404).json({ message: 'No godown assigned' });
        }

        const where = { godown_id: godown.godown_id };

        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        if (movement_type) where.movement_type = movement_type;
        if (crop_type) where.crop_type = crop_type;

        const logs = await StockLog.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'farmer',
                    attributes: ['id', 'name', 'mobileNumber']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(logs);
    } catch (error) {
        console.error('Error fetching stock logs:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get farmers connected to godown
// @route   GET /api/godowns/farmers
const getConnectedFarmers = async (req, res) => {
    try {
        const godown = await Godown.findOne({
            where: { manager_user_id: req.user.id }
        });

        if (!godown) {
            return res.status(404).json({ message: 'No godown assigned' });
        }

        // Get unique farmers from stock logs
        const logs = await StockLog.findAll({
            where: { godown_id: godown.godown_id },
            attributes: ['farmer_id'],
            group: ['farmer_id'],
            include: [
                {
                    model: User,
                    as: 'farmer',
                    attributes: ['id', 'name', 'mobileNumber', 'district', 'mandal']
                }
            ]
        });

        const farmers = logs.map(log => log.farmer).filter(f => f !== null);
        res.json(farmers);
    } catch (error) {
        console.error('Error fetching farmers:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getGodowns,
    getMyGodown,
    createGodown,
    updateCapacity,
    logStockMovement,
    getStockLogs,
    getConnectedFarmers
};
