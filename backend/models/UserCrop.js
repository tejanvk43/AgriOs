const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserCrop = sequelize.define('UserCrop', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    landRecordId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    cropName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sowingDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Active', 'Harvested'),
        defaultValue: 'Active'
    },
    areaAcres: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = UserCrop;
