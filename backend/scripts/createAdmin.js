const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Script to create admin user
async function createAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ where: { email: 'admin@smartfarmer.com' } });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create admin user
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@smartfarmer.com',
            password: hashedPassword,
            mobileNumber: '9999999999',
            role: 'Admin',
            isActive: true
        });

        console.log('✅ Admin user created successfully!');
        console.log('Email: admin@smartfarmer.com');
        console.log('Password: admin123');
        console.log('Please change the password after first login.');

    } catch (error) {
        console.error('Error creating admin:', error);
    }
}

module.exports = createAdmin;

// Run if called directly
if (require.main === module) {
    const { sequelize } = require('../config/db');
    sequelize.sync().then(() => {
        createAdmin().then(() => process.exit(0));
    });
}
