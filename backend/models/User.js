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
        allowNull: true, // Optional if using mobile only
        unique: false, // Not unique since we auto-generate
        validate: { isEmail: true }
    },
    mobileNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true // Nullable if using OTP only
    },
    role: {
        type: DataTypes.ENUM('Farmer', 'GovernmentBody', 'GodownManager', 'MarketManager', 'Admin'),
        defaultValue: 'Farmer',
        allowNull: false
    },
    preferredLanguage: {
        type: DataTypes.STRING,
        defaultValue: 'en'
    },
    location: {
        type: DataTypes.JSONB, // Stores { lat, lng, address }
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
