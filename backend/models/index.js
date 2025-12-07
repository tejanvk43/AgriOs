const { sequelize } = require('../config/db');
const User = require('./User');
const Farm = require('./Farm');
const Crop = require('./Crop');
const MarketPrice = require('./MarketPrice');
const SoilReport = require('./SoilReport');
const Alert = require('./Alert');
const LandRecord = require('./LandRecord');
const UserCrop = require('./UserCrop');
const ChatMessage = require('./ChatMessage');

// New Models
const Godown = require('./Godown');
const GovAdvisory = require('./GovAdvisory');
const FarmerActivity = require('./FarmerActivity');
const AuditLog = require('./AuditLog');
const CropCycle = require('./CropCycle');
const StockLog = require('./StockLog');

// Define Associations
User.hasMany(Farm, { foreignKey: 'userId' });
Farm.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(SoilReport, { foreignKey: 'userId' });
SoilReport.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Alert, { foreignKey: 'userId' });
Alert.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(LandRecord, { foreignKey: 'userId', as: 'landRecords' });
LandRecord.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(UserCrop, { foreignKey: 'userId' });
UserCrop.belongsTo(User, { foreignKey: 'userId' });

LandRecord.hasMany(UserCrop, { foreignKey: 'landRecordId', as: 'crops' });
UserCrop.belongsTo(LandRecord, { foreignKey: 'landRecordId' });

User.hasMany(ChatMessage, { foreignKey: 'userId' });
ChatMessage.belongsTo(User, { foreignKey: 'userId' });

// New Associations
// Godown Manager
User.hasOne(Godown, { foreignKey: 'manager_user_id', as: 'managedGodown' });
Godown.belongsTo(User, { foreignKey: 'manager_user_id', as: 'manager' });

// GovAdvisory
User.hasMany(GovAdvisory, { foreignKey: 'created_by_user_id' });
GovAdvisory.belongsTo(User, { foreignKey: 'created_by_user_id', as: 'author' });

// CropCycle
User.hasMany(CropCycle, { foreignKey: 'farmer_id' });
CropCycle.belongsTo(User, { foreignKey: 'farmer_id', as: 'farmer' });

Godown.hasMany(CropCycle, { foreignKey: 'linked_godown_id' });
CropCycle.belongsTo(Godown, { foreignKey: 'linked_godown_id', as: 'godown' });

// FarmerActivity
User.hasMany(FarmerActivity, { foreignKey: 'farmer_id', as: 'activities' });
FarmerActivity.belongsTo(User, { foreignKey: 'farmer_id', as: 'farmer' });

// StockLog
Godown.hasMany(StockLog, { foreignKey: 'godown_id', as: 'stockLogs' });
StockLog.belongsTo(Godown, { foreignKey: 'godown_id' });
User.hasMany(StockLog, { foreignKey: 'farmer_id', as: 'stockMovements' });
StockLog.belongsTo(User, { foreignKey: 'farmer_id', as: 'farmer' });

// Sync all models
const syncModels = async () => {
    // Force sync for dev to ensure new tables are created. 
    // In prod, use migrations.
    // await sequelize.sync({ alter: true }); 
    await sequelize.sync();
    console.log('All models synced successfully.');
};

module.exports = {
    sequelize,
    User,
    Farm,
    Crop,
    MarketPrice,
    SoilReport,
    Alert,
    LandRecord,
    UserCrop,
    ChatMessage,
    Godown,
    GovAdvisory,
    FarmerActivity,
    AuditLog,
    CropCycle,
    StockLog,
    syncModels
};
