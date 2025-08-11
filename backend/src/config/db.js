const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.ATLAS_URI;
  if (!uri) {
    console.error('MongoDB connection string (ATLAS_URI) not set');
    process.exit(1);
  }
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
