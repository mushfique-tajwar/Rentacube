const mongoose = require('mongoose');
const User = require('./models/user.model');

require('dotenv').config();

mongoose.connect(process.env.ATLAS_URI);

async function checkAdmin() {
  try {
    // Find the admin user
    const adminUser = await User.findOne({ username: 'admin' });
    
    if (adminUser) {
      console.log('Admin user found:');
      console.log('Username:', adminUser.username);
      console.log('Full Name:', adminUser.fullName);
      console.log('Email:', adminUser.email);
      console.log('User Type:', adminUser.userType);
      console.log('Is Admin (calculated):', adminUser.username === 'admin');
    } else {
      console.log('Admin user not found!');
    }
    
    // Also check all users to see what's in the database
    const allUsers = await User.find({});
    console.log('\nAll users in database:');
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.userType}) - ${user.fullName}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdmin();
