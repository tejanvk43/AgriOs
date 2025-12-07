const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Godown = sequelize.define('Godown', {
    godown_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    district: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mandal: {
        type: DataTypes.STRING,
        allowNull: false
    },
    village: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gps_lat: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    gps_lng: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    total_capacity_tonnes: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    used_capacity_tonnes: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    manager_user_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    storage_type: {
        type: DataTypes.STRING, // e.g., "Cold Storage", "Silo"
        defaultValue: 'Standard'
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'MAINTENANCE', 'CLOSED'),
        defaultValue: 'ACTIVE'
    }
}, {
    timestamps: true
});

module.exports = Godown;
