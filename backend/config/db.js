const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Fallback to SQLite if Postgres fails or for dev
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('SQLite Connected Successfully.');
        await sequelize.sync();
        console.log('Database Synced.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
