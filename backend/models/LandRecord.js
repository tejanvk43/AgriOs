const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LandRecord = sequelize.define('LandRecord', {
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
        allowNull: false
    },
    surveyNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    totalAcres: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    landType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ownerName: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = LandRecord;
