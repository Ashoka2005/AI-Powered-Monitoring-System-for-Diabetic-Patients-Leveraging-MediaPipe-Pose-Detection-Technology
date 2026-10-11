require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const connectDB = require('./src/config/db');

// Route imports
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const exerciseRoutes = require('./src/routes/exercises');
const healthRoutes = require('./src/routes/health');
const appointmentRoutes = require('./src/routes/appointments');
const alertRoutes = require('./src/routes/alerts');
const dietRoutes = require('./src/routes/diet');
const chatRoutes = require('./src/routes/chat');
const reportRoutes = require('./src/routes/reports');
const analyticsRoutes = require('./src/routes/analytics');
const iotRoutes = require('./src/routes/iot');
const adminRoutes = require('./src/routes/admin');
const doctorRoutes = require('./src/routes/doctor');

// Initialize app
const app = express();
const server = http.createServer(app);

// Dynamic CORS handler for development & production
const getCorsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  if (isDev) return callback(null, true);
  const allowed = process.env.FRONTEND_URL || 'http://localhost:5173';
  if (origin === allowed) return callback(null, true);
  return callback(new Error('Not allowed by CORS'));
};

// Socket.io setup
const io = new Server(server, {
  cors: { origin: getCorsOrigin, methods: ['GET', 'POST'] },
});
app.set('io', io);

// Connect to MongoDB and auto-seed
connectDB().then(async () => {
  const Exercise = require('./src/models/Exercise');
  const exerciseCount = await Exercise.countDocuments();
  if (exerciseCount === 0) {
    console.log('Seeding exercises...');
    try {
      const exData = [
        {
          name: 'Shoulder Press',
          slug: 'shoulder-press',
          description: 'Overhead shoulder press for upper body strength',
          category: 'upper_body',
          difficulty: 'beginner',
          targetReps: 12,
          targetSets: 3,
          caloriesPerMinute: 6,
          isDiabetesRecommended: true,
          instructions: ['Stand with feet shoulder-width apart', 'Hold weights at shoulder height', 'Press overhead until arms are straight', 'Lower slowly back to shoulders'],
          precautions: ['Avoid if you have shoulder injuries', 'Start with light weights'],
          landmarks: { primaryJoints: ['left_shoulder', 'left_elbow', 'right_shoulder', 'right_elbow'], angleThresholds: { minAngle: 30, maxAngle: 170 } },
          thumbnail: '/images/exercises/shoulder-press.png'
        },
        {
          name: 'Bicep Curl',
          slug: 'bicep-curl',
          description: 'Classic bicep curl for arm strength',
          category: 'upper_body',
          difficulty: 'beginner',
          targetReps: 15,
          targetSets: 3,
          caloriesPerMinute: 4,
          isDiabetesRecommended: true,
          instructions: ['Stand with arms at sides', 'Curl weights up to shoulders', 'Lower slowly'],
          precautions: ['Keep elbows close to body'],
          landmarks: { primaryJoints: ['left_elbow', 'right_elbow'], angleThresholds: { minAngle: 20, maxAngle: 160 } },
          thumbnail: '/images/exercises/bicep-curl.png'
        },
        {
          name: 'Bodyweight Squat',
          slug: 'squat',
          description: 'Basic squat for lower body strength',
          category: 'lower_body',
          difficulty: 'beginner',
          targetReps: 15,
          targetSets: 3,
          caloriesPerMinute: 8,
          isDiabetesRecommended: true,
          instructions: ['Stand with feet shoulder-width apart', 'Lower body as if sitting in a chair', 'Keep knees behind toes', 'Return to standing'],
          precautions: ['Knee pain - reduce depth'],
          landmarks: { primaryJoints: ['left_hip', 'left_knee', 'right_hip', 'right_knee'], angleThresholds: { minAngle: 60, maxAngle: 170 } },
          thumbnail: '/images/exercises/squat.png'
        },
        {
          name: 'Lateral Raise',
          slug: 'lateral-raise',
          description: 'Side arm raises for shoulder development',
          category: 'upper_body',
          difficulty: 'intermediate',
          targetReps: 12,
          targetSets: 3,
          caloriesPerMinute: 5,
          isDiabetesRecommended: true,
          instructions: ['Stand with arms at sides', 'Raise arms out to sides until parallel', 'Lower slowly'],
          precautions: ['Avoid if shoulder pain'],
          landmarks: { primaryJoints: ['left_shoulder', 'right_shoulder'], angleThresholds: { minAngle: 10, maxAngle: 100 } },
          thumbnail: '/images/exercises/lateral-raise.png'
        },
        {
          name: 'Leg Raise',
          slug: 'leg-raise',
          description: 'Supine leg raises for core strength',
          category: 'core',
          difficulty: 'intermediate',
          targetReps: 10,
          targetSets: 3,
          caloriesPerMinute: 5,
          isDiabetesRecommended: true,
          instructions: ['Lie on your back', 'Raise legs to 90 degrees', 'Lower slowly without touching ground'],
          precautions: ['Lower back pain - bend knees'],
          landmarks: { primaryJoints: ['left_hip', 'right_hip'], angleThresholds: { minAngle: 10, maxAngle: 90 } },
          thumbnail: '/images/exercises/leg-raise.png'
        },
        {
          name: 'Wall Push-Up',
          slug: 'wall-pushup',
          description: 'Modified push-up against wall',
          category: 'upper_body',
          difficulty: 'beginner',
          targetReps: 15,
          targetSets: 3,
          caloriesPerMinute: 4,
          isDiabetesRecommended: true,
          instructions: ['Stand arm length from wall', 'Place hands on wall', 'Bend elbows to bring face toward wall', 'Push back'],
          precautions: ['Wrist issues - use fists'],
          landmarks: { primaryJoints: ['left_elbow', 'right_elbow', 'left_shoulder', 'right_shoulder'], angleThresholds: { minAngle: 40, maxAngle: 170 } },
          thumbnail: '/images/exercises/wall-pushup.png'
        },
        {
          name: 'Seated March',
          slug: 'seated-march',
          description: 'Seated marching for cardio, mobility, and posture control',
          category: 'cardio',
          difficulty: 'beginner',
          targetReps: 20,
          targetSets: 2,
          caloriesPerMinute: 3,
          isDiabetesRecommended: true,
          instructions: ['Sit upright in a chair with back straight', 'Lift one knee toward chest', 'Lower and alternate legs'],
          precautions: ['Use stable chair', 'Do not slouch'],
          landmarks: { primaryJoints: ['left_hip', 'right_hip', 'left_knee', 'right_knee'], angleThresholds: { minAngle: 30, maxAngle: 120 } },
          thumbnail: '/images/exercises/seated-march.png'
        },
        {
          name: 'Arm Circle',
          slug: 'arm-circle',
          description: 'Circular arm movements for shoulder flexibility and upper back posture',
          category: 'flexibility',
          difficulty: 'beginner',
          targetReps: 10,
          targetSets: 2,
          caloriesPerMinute: 3,
          isDiabetesRecommended: true,
          instructions: ['Extend arms to sides', 'Make small circles forward', 'Gradually increase circle size', 'Reverse direction'],
          precautions: ['Shoulder pain - reduce range'],
          landmarks: { primaryJoints: ['left_shoulder', 'right_shoulder'], angleThresholds: { minAngle: 0, maxAngle: 360 } },
          thumbnail: '/images/exercises/arm-circle.png'
        },
        {
          name: 'Standing Knee Bend',
          slug: 'standing-knee-bend',
          description: 'Standing hamstring curls',
          category: 'lower_body',
          difficulty: 'beginner',
          targetReps: 12,
          targetSets: 3,
          caloriesPerMinute: 4,
          isDiabetesRecommended: true,
          instructions: ['Stand holding onto support', 'Bend one knee bringing heel to buttock', 'Lower slowly and alternate'],
          precautions: ['Use support for balance'],
          landmarks: { primaryJoints: ['left_knee', 'right_knee'], angleThresholds: { minAngle: 30, maxAngle: 150 } },
          thumbnail: '/images/exercises/standing-knee-bend.png'
        },
        {
          name: 'Ankle Pump',
          slug: 'ankle-pump',
          description: 'Ankle flexion exercises for circulation',
          category: 'flexibility',
          difficulty: 'beginner',
          targetReps: 20,
          targetSets: 3,
          caloriesPerMinute: 2,
          isDiabetesRecommended: true,
          instructions: ['Sit or lie down', 'Point toes away from body', 'Pull toes toward body', 'Repeat rhythmically'],
          precautions: ['None - safe for all'],
          landmarks: { primaryJoints: ['left_ankle', 'right_ankle'], angleThresholds: { minAngle: 0, maxAngle: 50 } },
          thumbnail: '/images/exercises/ankle-pump.png'
        },
        {
          name: 'Seated Spinal Twist',
          slug: 'seated-twist',
          description: 'Gentle seated twist to improve spinal mobility, digestion, and posture for diabetic patients.',
          category: 'flexibility',
          difficulty: 'beginner',
          targetReps: 10,
          targetSets: 3,
          caloriesPerMinute: 2,
          isDiabetesRecommended: true,
          instructions: [
            'Sit tall on a stable chair with feet flat on the floor.',
            'Place your right hand on your left outer thigh and left hand behind you.',
            'Inhale to lengthen your spine, exhale to twist gently to the left.',
            'Hold for a deep breath, return to center, and repeat on the other side.'
          ],
          precautions: [
            'Do not force the twist if you feel any strain.',
            'Keep spine tall and avoid slouching.'
          ],
          landmarks: {
            primaryJoints: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'],
            angleThresholds: { minAngle: 60, maxAngle: 90 }
          },
          thumbnail: '/images/exercises/seated-twist.png'
        },
        {
          name: 'Walking in Place',
          slug: 'walking-place',
          description: 'Active marching in place to boost circulation, cardiovascular health, and lower blood sugar.',
          category: 'cardio',
          difficulty: 'beginner',
          targetReps: 30,
          targetSets: 3,
          caloriesPerMinute: 5,
          isDiabetesRecommended: true,
          instructions: [
            'Stand tall with feet shoulder-width apart.',
            'Lift your left knee up, then lower it while lifting your right knee.',
            'Pump your arms in rhythm with your steps.',
            'Maintain a steady, comfortable pace and breathe deeply.'
          ],
          precautions: [
            'Wear supportive athletic shoes.',
            'Hold onto a wall or sturdy chair if you experience balance issues.'
          ],
          landmarks: {
            primaryJoints: ['left_hip', 'right_hip', 'left_knee', 'right_knee'],
            angleThresholds: { minAngle: 100, maxAngle: 165 }
          },
          thumbnail: '/images/exercises/walking-place.png'
        },
        {
          name: 'Prenatal Yoga',
          slug: 'prenatal-yoga',
          description: 'Gentle yoga poses designed for pregnancy to improve balance, strength, and breathing.',
          category: 'flexibility',
          difficulty: 'beginner',
          targetReps: 10,
          targetSets: 2,
          caloriesPerMinute: 3,
          isDiabetesRecommended: true,
          instructions: [
            'Sit comfortably on a yoga mat.',
            'Focus on slow, deep diaphragmatic breathing.',
            'Transition into gentle cat-cow stretch on hands and knees.',
            'Keep movements slow, controlled, and fluid.'
          ],
          precautions: [
            'Avoid extreme twists or lying flat on your back after the first trimester.',
            'Listen to your body and stop if you feel dizzy or short of breath.'
          ],
          landmarks: {
            primaryJoints: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'],
            angleThresholds: { minAngle: 60, maxAngle: 120 }
          },
          thumbnail: '/images/exercises/prenatal-yoga.png'
        },
        {
          name: 'Pelvic Floor (Kegel) Exercises',
          slug: 'kegels',
          description: 'Strengthens the pelvic floor muscles which support the bladder, uterus, and bowels during pregnancy.',
          category: 'core',
          difficulty: 'beginner',
          targetReps: 10,
          targetSets: 3,
          caloriesPerMinute: 2,
          isDiabetesRecommended: true,
          instructions: [
            'Sit or lie in a comfortable position.',
            'Squeeze and lift your pelvic floor muscles as if trying to stop the flow of urine.',
            'Hold the squeeze for 5 seconds, then relax completely for 5 seconds.',
            'Repeat without contracting your abdomen, buttocks, or thighs.'
          ],
          precautions: [
            'Do not hold your breath during the contractions.',
            'Perform them consistently but without straining.'
          ],
          landmarks: {
            primaryJoints: ['left_hip', 'right_hip'],
            angleThresholds: { minAngle: 0, maxAngle: 10 }
          },
          thumbnail: '/images/exercises/kegels.png'
        },
        {
          name: 'Gentle Stretching',
          slug: 'gentle-stretching',
          description: 'Gentle full-body stretching to relieve muscle tension and improve flexibility during pregnancy.',
          category: 'flexibility',
          difficulty: 'beginner',
          targetReps: 8,
          targetSets: 2,
          caloriesPerMinute: 2,
          isDiabetesRecommended: true,
          instructions: [
            'Sit tall with legs stretched comfortably apart.',
            'Reach gently toward your shins, ankles, or toes.',
            'Hold the stretch for 15-20 seconds while breathing deeply.',
            'Inhale deep, sit up slowly, and relax.'
          ],
          precautions: [
            'Do not overstretch or bounce.',
            'Avoid sudden, jerky movements.'
          ],
          landmarks: {
            primaryJoints: ['left_shoulder', 'left_hip'],
            angleThresholds: { minAngle: 45, maxAngle: 135 }
          },
          thumbnail: '/images/exercises/gentle-stretching.png'
        },
        {
          name: 'Stationary Cycling',
          slug: 'stationary-cycling',
          description: 'Low-impact cardiovascular cycling on a stationary bike, which is safe for joints and balance.',
          category: 'cardio',
          difficulty: 'beginner',
          targetReps: 15,
          targetSets: 1,
          caloriesPerMinute: 6,
          isDiabetesRecommended: true,
          instructions: [
            'Sit on a stationary bike with height adjusted so your knees are slightly bent at the bottom of the pedal stroke.',
            'Pedal at a gentle to moderate pace.',
            'Keep your back straight and hold the handlebars lightly.'
          ],
          precautions: [
            'Keep a bottle of water close to stay hydrated.',
            'Avoid overheating and stop if you feel fatigued.'
          ],
          landmarks: {
            primaryJoints: ['left_hip', 'left_knee', 'right_hip', 'right_knee'],
            angleThresholds: { minAngle: 40, maxAngle: 150 }
          },
          thumbnail: '/images/exercises/stationary-cycling.png'
        }
      ];
      await Exercise.insertMany(exData);
      console.log('Exercises seeded!');
    } catch (e) { console.error('Seed error:', e.message); }
  }

  const User = require('./src/models/User');
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    try {
      await User.create({
        firstName: 'Demo',
        lastName: 'Patient',
        email: 'demo@diafit.com',
        password: 'password123',
        role: 'patient',
        profile: {
          gender: 'male',
          height: 175,
          weight: 70,
          profession: 'Engineer',
          emergencyContact: {
            name: 'Emergency Contact',
            phone: '+1234567890',
            email: 'emergency@diafit.com',
            relationship: 'Family'
          }
        },
        patientInfo: {
          diabetesType: 'type2'
        }
      });
      console.log('Demo user seeded: demo@diafit.com / password123');
    } catch (err) {
      console.error('Demo user seed error:', err.message);
    }
  }

  // Ensure configured email account exists so user can log in directly
  const primaryEmail = (process.env.SMTP_USER || 'a09022762@gmail.com').toLowerCase().trim();
  const primaryExists = await User.findOne({ email: primaryEmail });
  if (!primaryExists) {
    try {
      await User.create({
        firstName: 'Ashoka',
        lastName: 'User',
        email: primaryEmail,
        password: 'password123',
        role: 'patient',
        profile: {
          gender: 'male',
          height: 175,
          weight: 70,
          profession: 'Member',
          emergencyContact: {
            name: 'Emergency',
            phone: '+1234567890',
            email: primaryEmail,
            relationship: 'Family'
          }
        },
        patientInfo: {
          diabetesType: 'type2'
        }
      });
      console.log(`Primary user seeded: ${primaryEmail} / password123`);
    } catch (err) {
      console.error('Primary user seed error:', err.message);
    }
  }
}).catch(err => console.error('DB init error:', err));

// Middleware
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: getCorsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: 'text/plain' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, message: 'Too many requests, please try again later' });
app.use('/api/', limiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Direct Android APK download route
app.get(['/diafit-ai.apk', '/download/apk'], (req, res) => {
  const fs = require('fs');
  const apkPaths = [
    path.join(__dirname, '../DiaFit-AI.apk'),
    path.join(__dirname, '../frontend/dist/diafit-ai.apk'),
    path.join(__dirname, '../frontend/public/diafit-ai.apk'),
    path.join(__dirname, '../frontend/android/app/build/outputs/apk/debug/app-debug.apk'),
  ];
  const target = apkPaths.find((f) => fs.existsSync(f));
  if (target) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="DiaFit-AI.apk"');
    return res.sendFile(target);
  }
  return res.status(404).send('APK is currently building. Please wait a moment and refresh.');
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/diet', dietRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/iot', iotRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/doctor', doctorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'DiaFit AI Backend is running', version: '1.0.0', timestamp: new Date().toISOString() });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined`);
  });

  socket.on('exercise_update', (data) => {
    socket.to(`user_${data.userId}`).emit('exercise_update', data);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Serve Frontend built assets & SPA Fallback
const frontendDist = path.join(__dirname, '../frontend/dist');
const fs = require('fs');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/socket.io')) {
      return next();
    }
    const indexPath = path.join(frontendDist, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
}

// 404 handler for API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=========================================================`);
  console.log(`  DiaFit AI Server running on port ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  API: http://localhost:${PORT}/api/v1`);
  console.log(`  LAN Web App: http://10.189.225.89:${PORT}`);
  console.log(`  APK Download: http://10.189.225.89:${PORT}/diafit-ai.apk`);
  console.log(`=========================================================\n`);
});

module.exports = { app, server };
