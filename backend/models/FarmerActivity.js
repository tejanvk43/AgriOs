const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FarmerActivity = sequelize.define('FarmerActivity', {
    activity_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    farmer_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    crop_cycle_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    activity_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    created_by_role: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = FarmerActivity;
