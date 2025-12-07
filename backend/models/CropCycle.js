const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CropCycle = sequelize.define('CropCycle', {
    crop_cycle_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    farmer_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    season: {
        type: DataTypes.STRING, // e.g., Kharif 2025
        allowNull: false
    },
    crop_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    variety: {
        type: DataTypes.STRING,
        allowNull: true
    },
    sowing_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    expected_yield_tonnes: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    actual_yield_tonnes: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    sell_channel: {
        type: DataTypes.STRING,
        allowNull: true
    },
    linked_godown_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('PLANNED', 'SOWN', 'GROWING', 'HARVESTED', 'SOLD', 'STORED'),
        defaultValue: 'PLANNED'
    }
}, {
    timestamps: true
});

module.exports = CropCycle;
