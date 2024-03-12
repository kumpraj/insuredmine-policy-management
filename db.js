const mongoose = require('mongoose');

const mongoDBUrl = 'mongodb://127.0.0.1:27017/policyHandler';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB is already connected');
    return;
  }

  try {
    await mongoose.connect(mongoDBUrl);
    console.log('MongoDB connected');
    isConnected = true;
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  if (!isConnected) {
    console.log('MongoDB is not connected');
    return;
  }

  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    isConnected = false;
  } catch (err) {
    console.error('Failed to disconnect from MongoDB', err);
    process.exit(1);
  }
};

module.exports = { connectDB, disconnectDB };