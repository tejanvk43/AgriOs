const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const GovAdvisory = sequelize.define('GovAdvisory', {
    advisory_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    target_state: {
        type: DataTypes.STRING,
        allowNull: true // Null means all
    },
    target_district: {
        type: DataTypes.STRING,
        allowNull: true
    },
    target_mandal: {
        type: DataTypes.STRING,
        allowNull: true
    },
    target_crop: {
        type: DataTypes.STRING,
        allowNull: true
    },
    valid_from: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    valid_to: {
        type: DataTypes.DATE,
        allowNull: true
    },
    created_by_user_id: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = GovAdvisory;
