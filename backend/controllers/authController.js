const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    const { name, email, password, role, mobileNumber, landRecords, houseAddress, pincode, state, district, city } = req.body;

    console.log('=== Registration Request ===');
    console.log('Name:', name);
    console.log('Mobile:', mobileNumber);
    console.log('Email:', email);
    console.log('Has Password:', !!password);
    console.log('Land Records Count:', landRecords ? landRecords.length : 0);

    try {
        // Check if user exists by mobile number (primary identifier)
        if (mobileNumber) {
            const userExistsByPhone = await User.findOne({ where: { mobileNumber } });
            if (userExistsByPhone) {
                console.log('❌ User already exists with mobile:', mobileNumber);
                return res.status(400).json({ message: 'User with this mobile number already exists' });
            }
        }

        // If email is provided, check for duplicates
        if (email) {
            const userExistsByEmail = await User.findOne({ where: { email } });
            if (userExistsByEmail) {
                console.log('❌ User already exists with email:', email);
                return res.status(400).json({ message: 'User with this email already exists' });
            }
        }

        // Generate email from mobile number if not provided
        const userEmail = email || (mobileNumber ? `${mobileNumber}@farmer.app` : `user${Date.now()}@farmer.app`);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email: userEmail,
            password: hashedPassword,
            role: role || 'Farmer',
            mobileNumber: mobileNumber || '',
            houseAddress: houseAddress || '',
            pincode: pincode || '',
            state: state || '',
            district: district || '',
            city: city || ''
        });

        if (user) {
            // Save land records to database if provided
            console.log('✅ User created successfully:', user.id);
            console.log('Land records for user:', landRecords);

            // Save each land record to the database
            if (landRecords && Array.isArray(landRecords) && landRecords.length > 0) {
                const { LandRecord } = require('../models');

                for (const record of landRecords) {
                    await LandRecord.create({
                        userId: user.id,
                        state: record.state,
                        district: record.district,
                        mandal: record.mandal,
                        village: record.village,
                        surveyNumber: record.surveyNumber,
                        totalAcres: record.totalAcres,
                        landType: record.landType,
                        ownerName: record.ownerName
                    });
                }
                console.log(`✅ Saved ${landRecords.length} land record(s) for user ${user.id}`);
            }

            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                mobileNumber: user.mobileNumber,
                token: generateToken(user.id),
            });
        } else {
            console.log('❌ Failed to create user');
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('❌ Registration error:', error);
        console.error('Error details:', error.message);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'User already exists with this information' });
        }
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    const { mobileNumber, password } = req.body;

    console.log('=== Login Request ===');
    console.log('Mobile:', mobileNumber);
    console.log('Has Password:', !!password);

    try {
        const user = await User.findOne({ where: { mobileNumber } });

        if (user && (await bcrypt.compare(password, user.password))) {
            console.log('✅ Login successful for:', mobileNumber);
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                mobileNumber: user.mobileNumber,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            console.log('❌ Invalid credentials for:', mobileNumber);
            res.status(401).json({ message: 'Invalid mobile number or password' });
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
const getUserProfile = async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
    });

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile
};
