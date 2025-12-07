const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database Connected.');

        const users = [
            {
                name: 'Super Admin',
                email: 'admin@agrios.com',
                mobileNumber: '9999999999',
                password: 'admin',
                role: 'SUPER_ADMIN',
                assigned_state: null,
                assigned_district: null,
                assigned_mandal: null
            },
            {
                name: 'Godown Manager',
                email: 'manager@agrios.com',
                mobileNumber: '8888888888',
                password: 'admin',
                role: 'GODOWN_MANAGER',
                assigned_state: 'Maharashtra',
                assigned_district: 'Nagpur',
                assigned_mandal: 'Nagpur Rural'
            },
            {
                name: 'Mandal Officer',
                email: 'officer@agrios.com',
                mobileNumber: '7777777777',
                password: 'admin',
                role: 'GOV_BODY_OFFICER',
                assigned_state: 'Maharashtra',
                assigned_district: 'Nagpur',
                assigned_mandal: 'Nagpur Rural'
            }
        ];

        for (const user of users) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);

            await User.create({
                ...user,
                password: hashedPassword
            });
            console.log(`Created user: ${user.name} (${user.role})`);
        }

        console.log('Seeding Complete.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedAdmin();
