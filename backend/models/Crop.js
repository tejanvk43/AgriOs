const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Crop = sequelize.define('Crop', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    variety: {
        type: DataTypes.STRING,
        allowNull: true
    },
    season: {
        type: DataTypes.ENUM('Kharif', 'Rabi', 'Zaid'),
        allowNull: false
    },
    idealSoilType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    waterRequirement: {
        type: DataTypes.STRING, // e.g., 'High', 'Medium', 'Low'
        allowNull: true
    },
    growthDurationDays: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Crop;
