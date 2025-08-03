const mongoose = require('mongoose');
const User = require('./models/user.model');

require('dotenv').config();

mongoose.connect(process.env.ATLAS_URI);

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }
    
    // Create admin user
    const adminUser = new User({
      username: 'admin',
      fullName: 'System Administrator',
      email: 'admin@rentacube.com',
      password: 'admin123', // In production, use a strong password and hashing
      userType: 'renter' // Admin can access renter features too
    });
    
    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();
