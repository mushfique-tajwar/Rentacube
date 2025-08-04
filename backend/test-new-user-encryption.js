const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

// Connect to MongoDB
const url = process.env.ATLAS_URI || 'mongodb://localhost:27017/rentacube';
mongoose.connect(url);

const testNewUserEncryption = async () => {
    try {
        console.log('Testing new user password encryption...');
        
        const testUsername = 'test' + Math.floor(Math.random() * 1000);
        const testPassword = 'TestPass123!';
        
        // Create a test user
        const testUser = new User({
            username: testUsername,
            fullName: 'Test User',
            email: `${testUsername}@test.com`,
            password: testPassword,
            userType: 'customer'
        });
        
        await testUser.save();
        console.log('Test user created successfully');
        
        // Retrieve the user and check encryption
        const savedUser = await User.findOne({ username: testUsername });
        
        console.log('Test user details:');
        console.log('Username:', savedUser.username);
        console.log('Original password:', testPassword);
        console.log('Encrypted password (first 20 chars):', savedUser.password.substring(0, 20) + '...');
        console.log('Passwords match:', testPassword !== savedUser.password ? '✅ Password is encrypted' : '❌ Password is not encrypted');
        
        // Test password verification
        const isCorrectPassword = await savedUser.comparePassword(testPassword);
        const isWrongPassword = await savedUser.comparePassword('wrongpassword');
        
        console.log('\nPassword verification tests:');
        console.log('Correct password:', isCorrectPassword ? '✅ PASS' : '❌ FAIL');
        console.log('Wrong password:', isWrongPassword ? '❌ FAIL' : '✅ PASS');
        
        // Clean up - delete test user
        await User.findByIdAndDelete(savedUser._id);
        console.log('Test user cleaned up');
        
        if (isCorrectPassword && !isWrongPassword && testPassword !== savedUser.password) {
            console.log('\n🎉 New user password encryption is working correctly!');
        } else {
            console.log('\n❌ New user password encryption has issues!');
        }
        
    } catch (error) {
        console.error('Error testing new user encryption:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
    testNewUserEncryption();
});

connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
