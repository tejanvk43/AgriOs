const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Farm = sequelize.define('Farm', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.JSONB, // { lat, lng, address }
        allowNull: false
    },
    sizeAcres: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    soilType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    irrigationType: {
        type: DataTypes.STRING, // e.g., 'Drip', 'Canal', 'Rainfed'
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Farm;
