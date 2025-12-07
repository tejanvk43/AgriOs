const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const StockLog = sequelize.define('StockLog', {
    log_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    godown_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Godowns',
            key: 'godown_id'
        }
    },
    farmer_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    crop_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity_tonnes: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    movement_type: {
        type: DataTypes.ENUM('IN', 'OUT'),
        allowNull: false
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    logged_by_user_id: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = StockLog;
