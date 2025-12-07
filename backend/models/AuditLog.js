const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
    log_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    entity_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    entity_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    action: {
        type: DataTypes.STRING, // CREATE, UPDATE, DELETE
        allowNull: false
    },
    changed_by_user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    changed_by_role: {
        type: DataTypes.STRING,
        allowNull: true
    },
    changes: {
        type: DataTypes.JSON, // Stores { old: {}, new: {} }
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = AuditLog;
