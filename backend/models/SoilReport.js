const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SoilReport = sequelize.define('SoilReport', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    farmId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    reportImageUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    parsedData: {
        type: DataTypes.JSONB, // Stores { N, P, K, pH, etc. }
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Processing', 'Completed', 'Failed'),
        defaultValue: 'Pending'
    },
    analysisResult: {
        type: DataTypes.JSONB, // Stores deficiencies and recommendations
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = SoilReport;
