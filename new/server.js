const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// MongoDB Connection (MongoDB Atlas Cloud)
// Replace the connection string below with your own MongoDB Atlas connection string
// Get it from: https://cloud.mongodb.com/ → Connect → Drivers → Connection String
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health_monitor';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  if (MONGODB_URI.includes('mongodb.net')) {
    console.log('☁️  Using MongoDB Atlas (Cloud Database)');
  } else {
    console.log('💻 Using Local MongoDB');
  }
})
.catch(err => {
  console.warn('⚠️  MongoDB not connected:', err.message);
  console.warn('⚠️  App will run with limited features (no data persistence)');
  console.warn('⚠️  To enable database:');
  console.warn('   1. Create free account at https://www.mongodb.com/cloud/atlas');
  console.warn('   2. Create a cluster and get connection string');
  console.warn('   3. Add connection string to .env file or update server.js');
});

// ==================
// Mongoose Schemas
// ==================

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  age: Number,
  gender: String,
  createdAt: { type: Date, default: Date.now }
});

// BMI Record Schema
const bmiSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  weight: Number,
  height: Number,
  bmi: Number,
  category: String,
  timestamp: { type: Date, default: Date.now }
});

// Exercise Session Schema
const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  condition: String,
  asanaName: String,
  reps: Number,
  accuracy: Number,
  glycemicScore: Number,
  patientLevel: String,
  duration: Number, // in seconds
  sugarLevel: Number,
  predictedSugarLevel: Number,
  timestamp: { type: Date, default: Date.now }
});

// Progress Tracking Schema
const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  condition: String,
  totalSessions: { type: Number, default: 0 },
  totalReps: { type: Number, default: 0 },
  averageAccuracy: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const BMI = mongoose.model('BMI', bmiSchema);
const Session = mongoose.model('Session', sessionSchema);
const Progress = mongoose.model('Progress', progressSchema);

// ==================
// API Routes
// ==================

// User Routes
app.post('/api/users', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'Database not connected' });
    }
    const { name, email, age, gender } = req.body;
    const user = new User({ name, email, age, gender });
    await user.save();
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/users/:email', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'Database not connected' });
    }
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a user and all associated data
app.delete('/api/users/:userId', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'Database not connected' });
    }
    
    const userId = req.params.userId;
    
    // Delete user
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Delete all associated data
    await Session.deleteMany({ userId });
    await BMI.deleteMany({ userId });
    await Progress.deleteMany({ userId });
    
    res.json({ 
      success: true, 
      message: 'User and all associated data deleted successfully',
      deletedUser: user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// BMI Routes
app.post('/api/bmi', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'Database not connected' });
    }
    const { userId, weight, height, bmi, category } = req.body;
    const bmiRecord = new BMI({ userId, weight, height, bmi, category });
    await bmiRecord.save();
    res.status(201).json({ success: true, bmiRecord });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/bmi/:userId', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, records: [] });
    }
    const records = await BMI.find({ userId: req.params.userId }).sort({ timestamp: -1 });
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Exercise Session Routes
app.post('/api/sessions', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️  Session data not saved (MongoDB not connected)');
      return res.json({ success: true, message: 'Session completed (not saved - database offline)' });
    }
    const { userId, condition, asanaName, reps, accuracy, glycemicScore, patientLevel, duration, sugarLevel, predictedSugarLevel } = req.body;
    const session = new Session({ userId, condition, asanaName, reps, accuracy, glycemicScore, patientLevel, duration, sugarLevel, predictedSugarLevel });
    await session.save();

    // Update Progress
    let progress = await Progress.findOne({ userId, condition });
    if (!progress) {
      progress = new Progress({ userId, condition });
    }
    
    progress.totalSessions += 1;
    progress.totalReps += reps || 0;
    
    // Calculate new average accuracy
    const allSessions = await Session.find({ userId, condition });
    const avgAccuracy = allSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / allSessions.length;
    progress.averageAccuracy = avgAccuracy;
    progress.lastUpdated = new Date();
    
    await progress.save();

    res.status(201).json({ success: true, session, progress });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/sessions/:userId', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, sessions: [] });
    }
    const sessions = await Session.find({ userId: req.params.userId }).sort({ timestamp: -1 }).limit(20);
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a session
app.delete('/api/sessions/:sessionId', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'Database not connected' });
    }
    
    const session = await Session.findByIdAndDelete(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    
    res.json({ success: true, message: 'Session deleted successfully', session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a BMI record
app.delete('/api/bmi/:bmiId', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'Database not connected' });
    }
    
    const bmiRecord = await BMI.findByIdAndDelete(req.params.bmiId);
    
    if (!bmiRecord) {
      return res.status(404).json({ success: false, error: 'BMI record not found' });
    }
    
    res.json({ success: true, message: 'BMI record deleted successfully', bmiRecord });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a progress record
app.delete('/api/progress/:progressId', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'Database not connected' });
    }
    
    const progressRecord = await Progress.findByIdAndDelete(req.params.progressId);
    
    if (!progressRecord) {
      return res.status(404).json({ success: false, error: 'Progress record not found' });
    }
    
    res.json({ success: true, message: 'Progress record deleted successfully', progressRecord });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Progress Routes
app.get('/api/progress/:userId', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, progress: [] });
    }
    const progress = await Progress.find({ userId: req.params.userId });
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/progress/:userId/:condition', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, progress: null });
    }
    const progress = await Progress.findOne({ 
      userId: req.params.userId, 
      condition: req.params.condition 
    });
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analytics Route
app.get('/api/analytics/:userId', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ 
        success: true, 
        analytics: {
          totalSessions: 0,
          totalReps: 0,
          averageAccuracy: 0,
          totalDuration: 0,
          progressByCondition: [],
          recentBMI: []
        }
      });
    }
    const sessions = await Session.find({ userId: req.params.userId });
    const progress = await Progress.find({ userId: req.params.userId });
    const bmiHistory = await BMI.find({ userId: req.params.userId }).sort({ timestamp: -1 }).limit(10);

    const analytics = {
      totalSessions: sessions.length,
      totalReps: sessions.reduce((sum, s) => sum + (s.reps || 0), 0),
      averageAccuracy: sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / sessions.length 
        : 0,
      totalDuration: sessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      progressByCondition: progress,
      recentBMI: bmiHistory
    };

    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API to view all data (for debugging)
app.get('/api/view/users', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: false, message: 'Database not connected', users: [] });
    }
    const users = await User.find().limit(50);
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/view/sessions', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: false, message: 'Database not connected', sessions: [] });
    }
    const sessions = await Session.find().sort({ timestamp: -1 }).limit(50).populate('userId');
    res.json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/view/bmi', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: false, message: 'Database not connected', bmi: [] });
    }
    const bmi = await BMI.find().sort({ timestamp: -1 }).limit(50).populate('userId');
    res.json({ success: true, count: bmi.length, bmi });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/view/progress', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: false, message: 'Database not connected', progress: [] });
    }
    const progress = await Progress.find().populate('userId');
    res.json({ success: true, count: progress.length, progress });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/view/all', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ 
        success: false, 
        message: 'Database not connected',
        data: { users: [], sessions: [], bmi: [], progress: [] }
      });
    }
    const users = await User.find();
    const sessions = await Session.find().sort({ timestamp: -1 }).limit(50);
    const bmi = await BMI.find().sort({ timestamp: -1 }).limit(50);
    const progress = await Progress.find();
    
    res.json({ 
      success: true,
      data: {
        users: { count: users.length, data: users },
        sessions: { count: sessions.length, data: sessions },
        bmi: { count: bmi.length, data: bmi },
        progress: { count: progress.length, data: progress }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('📌 To connect MongoDB Atlas:');
  console.log('   1. Visit: https://www.mongodb.com/cloud/atlas/register');
  console.log('   2. Create FREE cluster (M0 tier)');
  console.log('   3. Create database user (username + password)');
  console.log('   4. Get connection string: Database → Connect → Drivers');
  console.log('   5. Replace <password> and <dbname> in connection string');
  console.log('   6. Add to .env file: MONGODB_URI=your_connection_string');
  console.log('   Or update MONGODB_URI in server.js line 17');
  console.log('');
});
