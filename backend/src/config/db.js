const mongoose = require('mongoose');
const { initModelFallbacks, seedInitialUsers } = require('./memoryStore');

let mongoServer;

const connectDB = async () => {
  // Initialize resilient model fallbacks immediately so no route ever hangs or crashes
  initModelFallbacks();

  const uri = process.env.MONGODB_URI;
  let connected = false;

  // 1. Try connecting to configured MONGODB_URI if provided
  if (uri && uri.trim() && !uri.includes('localhost:27017')) {
    try {
      const sanitizedUri = uri.replace(/:([^:@]+)@/, ':****@');
      console.log(`[Database] Attempting connection to MongoDB (${sanitizedUri})...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000
      });
      console.log(`✓ [Database] Connected to MongoDB: ${conn.connection.host}`);
      connected = true;
    } catch (error) {
      console.warn(`⚠️ [Database] Primary MongoDB connection failed (${error.message})`);
    }
  }

  // 2. If running locally (not on Vercel) and primary failed, attempt local MongoMemoryServer
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (!connected && !isServerless) {
    try {
      console.log('[Database] Checking local In-Memory MongoDB engine...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const memUri = mongoServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`✓ [Database] In-Memory MongoDB connected successfully (${conn.connection.host})`);
      connected = true;
    } catch (memError) {
      console.log(`ℹ️ [Database] MongoMemoryServer skipped (${memError.message}). Operating with direct in-memory datastore.`);
    }
  }

  // 3. Fallback to resilient in-memory store
  if (!connected) {
    seedInitialUsers();
    console.log(`✓ [Database] Running with zero-latency in-memory datastore. All auth, OTP, and monitoring features active.`);
  }

  return connected;
};

module.exports = connectDB;
