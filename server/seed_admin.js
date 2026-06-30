import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL.replace('localhost', '127.0.0.1');
        await mongoose.connect(mongoUrl);
        console.log('Connected to MongoDB for admin seeding');

        const adminEmail = 'admin@gmail.com';
        const adminPassword = 'admin@1234';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists');
            mongoose.connection.close();
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        const adminUser = new User({
            name: 'System Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            isApproved: true,
            estPro: true
        });

        await adminUser.save();
        console.log('Admin user seeded successfully');
        mongoose.connection.close();
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedAdmin();
