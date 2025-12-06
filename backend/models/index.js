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

// Sync all models
const syncModels = async () => {
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
    syncModels
};
