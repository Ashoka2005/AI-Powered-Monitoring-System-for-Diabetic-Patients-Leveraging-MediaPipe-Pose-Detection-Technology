const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`MongoDB connection failed: ${error.message}`);
    console.log('Starting in-memory MongoDB for development...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      process.env.MONGODB_URI = uri;
      const conn = await mongoose.connect(uri);
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
    } catch (memError) {
      console.error(`In-Memory MongoDB failed: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
