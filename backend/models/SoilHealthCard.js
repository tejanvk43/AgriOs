const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SoilHealthCard = sequelize.define('SoilHealthCard', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    // NPK Values (kg/ha)
    nitrogen: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    phosphorus: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    potassium: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    // Other Parameters
    phLevel: {
        type: DataTypes.FLOAT,
        defaultValue: 7.0
    },
    organicCarbon: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    electricalConductivity: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    // Metadata
    testDate: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    labName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    recommendation_generated: {
        type: DataTypes.JSON, // Stores the AI/Logic generated fertilizer plan
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = SoilHealthCard;
