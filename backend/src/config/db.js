const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  let connected = false;

  // 1. Try connecting to configured MONGODB_URI if provided
  if (uri && uri.trim()) {
    try {
      const sanitizedUri = uri.replace(/:([^:@]+)@/, ':****@');
      console.log(`[Database] Attempting connection to MongoDB (${sanitizedUri})...`);
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log(`✓ [Database] Connected to MongoDB: ${conn.connection.host}`);
      connected = true;
    } catch (error) {
      console.warn(`⚠️ [Database] Primary MongoDB connection failed (${error.message})`);
    }
  }

  // 2. If primary connection failed or not provided, fallback to In-Memory MongoDB
  if (!connected) {
    console.log('[Database] Starting local In-Memory MongoDB engine for development...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const memUri = mongoServer.getUri();
      process.env.MONGODB_URI = memUri;
      const conn = await mongoose.connect(memUri);
      console.log(`✓ [Database] In-Memory MongoDB connected successfully (${conn.connection.host})`);
      console.log(`💡 [Database] Tip: Development mode is fully operational. To persist data in cloud, check your MongoDB Atlas credentials in backend/.env`);
      connected = true;
    } catch (memError) {
      console.error(`❌ [Database] Failed to start In-Memory MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
