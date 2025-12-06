const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MarketPrice = sequelize.define('MarketPrice', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    mandiName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cropName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    variety: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pricePerQuintal: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true
});

module.exports = MarketPrice;
