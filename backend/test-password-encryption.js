const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

// Connect to MongoDB
const url = process.env.ATLAS_URI || 'mongodb://localhost:27017/rentacube';
mongoose.connect(url);

const testPasswordEncryption = async () => {
    try {
        console.log('Testing password encryption...');
        
        // Find the admin user
        const admin = await User.findOne({ username: 'admin' });
        
        if (!admin) {
            console.log('Admin user not found');
            return;
        }
        
        console.log('Admin user found:');
        console.log('Username:', admin.username);
        console.log('Email:', admin.email);
        console.log('Encrypted password (first 20 chars):', admin.password.substring(0, 20) + '...');
        console.log('Password length:', admin.password.length);
        
        // Test password comparison
        const isCorrectPassword = await admin.comparePassword('Adm!n12$$2');
        const isWrongPassword = await admin.comparePassword('wrongpassword');
        
        console.log('\nPassword verification tests:');
        console.log('Correct password (Adm!n12$$2):', isCorrectPassword ? '✅ PASS' : '❌ FAIL');
        console.log('Wrong password (wrongpassword):', isWrongPassword ? '❌ FAIL' : '✅ PASS');
        
        if (isCorrectPassword && !isWrongPassword) {
            console.log('\n🎉 Password encryption is working correctly!');
        } else {
            console.log('\n❌ Password encryption has issues!');
        }
        
    } catch (error) {
        console.error('Error testing password encryption:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
    testPasswordEncryption();
});

connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
