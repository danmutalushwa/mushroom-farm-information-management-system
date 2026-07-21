const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
console.log(process.env.MONGODB_URI); 

const User = require('../models/User');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin exists
        const adminExists = await User.findOne({ email: 'admin@kigalifarms.com' });
        if (adminExists) {
            console.log('Admin already exists');
            console.log(`Email: ${adminExists.email}`);
            console.log(`ID: ${adminExists._id}`);
            console.log(`Role: ${adminExists.role}`);
            process.exit(0);
        }

        // Create admin
        const admin = await User.create({
            fullName: 'System Administrator',
            email: 'admin@kigalifarms.com',
            phoneNumber: '+250781962857',
            password: 'Admin@123456',
            role: 'Administrator',
            isActive: true
        });

        console.log('Admin created successfully!');
        console.log('Email: admin@kigalifarms.com');
        console.log('Password: Admin@123456');
        console.log(`User ID: ${admin._id}`);
        console.log(`Role: ${admin.role}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();