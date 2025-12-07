const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: { isEmail: true }
    },
    mobileNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('SUPER_ADMIN', 'GODOWN_MANAGER', 'GOV_BODY_OFFICER', 'FARMER_READONLY_VIEW', 'DATA_ANALYST', 'FARMER'), // Kept FARMER for backward compat if needed, though strictly requested otherwise.
        defaultValue: 'FARMER',
        allowNull: false
    },
    // RBAC & Assignment Fields
    assigned_state: {
        type: DataTypes.STRING,
        allowNull: true
    },
    assigned_district: {
        type: DataTypes.STRING,
        allowNull: true
    },
    assigned_mandal: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // Existing fields
    preferredLanguage: {
        type: DataTypes.STRING,
        defaultValue: 'en'
    },
    location: {
        type: DataTypes.JSON, // Changed to JSON for SQLite compatibility
        allowNull: true
    },
    houseAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pincode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true
    },
    district: {
        type: DataTypes.STRING,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true
    },
    profileImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = User;
