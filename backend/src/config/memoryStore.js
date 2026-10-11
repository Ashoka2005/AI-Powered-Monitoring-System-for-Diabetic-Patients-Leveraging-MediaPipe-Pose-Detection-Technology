const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// In-Memory Data Store for resilient cloud/serverless operation
const users = [];
const otps = new Map();
const exercises = [
  {
    _id: 'ex_1',
    name: 'Shoulder Press',
    slug: 'shoulder-press',
    description: 'Overhead shoulder press for upper body strength and glucose regulation',
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
    _id: 'ex_2',
    name: 'Bicep Curl',
    slug: 'bicep-curl',
    description: 'Classic bicep curl for arm strength and metabolic activation',
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
    _id: 'ex_3',
    name: 'Bodyweight Squat',
    slug: 'squat',
    description: 'Basic squat for lower body strength and large-muscle glycemic uptake',
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
    _id: 'ex_4',
    name: 'Lateral Raise',
    slug: 'lateral-raise',
    description: 'Side arm raises for shoulder mobility and posture',
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
    _id: 'ex_5',
    name: 'Leg Raise',
    slug: 'leg-raise',
    description: 'Supine leg raises for core strength and abdominal blood flow',
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
    _id: 'ex_6',
    name: 'Wall Push-Up',
    slug: 'wall-pushup',
    description: 'Modified push-up against wall for safe joint-friendly resistance',
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
    _id: 'ex_7',
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
    _id: 'ex_8',
    name: 'Walking in Place',
    slug: 'walking-place',
    description: 'Active marching in place to boost circulation, cardiovascular health, and lower blood sugar.',
    category: 'cardio',
    difficulty: 'beginner',
    targetReps: 30,
    targetSets: 3,
    caloriesPerMinute: 5,
    isDiabetesRecommended: true,
    instructions: ['Stand tall with feet shoulder-width apart', 'Lift your left knee up, then lower it while lifting your right knee', 'Pump your arms in rhythm with your steps'],
    precautions: ['Wear supportive athletic shoes', 'Hold onto a wall or sturdy chair if you experience balance issues'],
    landmarks: { primaryJoints: ['left_hip', 'right_hip', 'left_knee', 'right_knee'], angleThresholds: { minAngle: 100, maxAngle: 165 } },
    thumbnail: '/images/exercises/walking-place.png'
  }
];

const alerts = [];
const healthRecords = [];
const exerciseSessions = [];

function getJwtSecret() {
  return process.env.JWT_SECRET || 'diafit-ai-dev-secret-key-2024-change-in-production';
}

function getJwtRefreshSecret() {
  return process.env.JWT_REFRESH_SECRET || 'diafit-ai-refresh-secret-2024-change-in-production';
}

function makeDocInstance(data) {
  const doc = {
    _id: data._id || 'doc_' + Math.random().toString(36).substring(2, 10),
    ...data,
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
    comparePassword: async function (candidate) {
      if (!this.password) return false;
      return bcrypt.compare(candidate, this.password);
    },
    generateToken: function () {
      return jwt.sign(
        { id: this._id, role: this.role || 'patient' },
        getJwtSecret(),
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );
    },
    generateRefreshToken: function () {
      return jwt.sign(
        { id: this._id },
        getJwtRefreshSecret(),
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
      );
    },
    save: async function () {
      const idx = users.findIndex(u => u._id === this._id);
      if (idx !== -1) {
        users[idx] = this;
      }
      return this;
    },
    toObject: function () {
      return { ...this };
    },
    toJSON: function () {
      return { ...this };
    }
  };
  return doc;
}

function makeQueryPromise(result) {
  const obj = {
    select: function () { return obj; },
    populate: function () { return obj; },
    sort: function () { return obj; },
    limit: function () { return obj; },
    skip: function () { return obj; },
    exec: async function () { return result; },
    then: function (resolve, reject) {
      return Promise.resolve(result).then(resolve, reject);
    },
    catch: function (reject) {
      return Promise.resolve(result).catch(reject);
    }
  };
  return obj;
}

// Seed initial users
function seedInitialUsers() {
  const defaultAccounts = [
    {
      firstName: 'Demo',
      lastName: 'Patient',
      email: 'demo@diafit.com',
      password: 'password123',
      role: 'patient',
      phone: '+1234567890',
      profile: {
        gender: 'male',
        height: 175,
        weight: 70,
        profession: 'Engineer',
        emergencyContact: {
          name: 'Emergency Guardian',
          phone: '+1234567890',
          email: 'emergency@diafit.com',
          relationship: 'Family'
        }
      },
      patientInfo: { diabetesType: 'type2' }
    },
    {
      firstName: 'Ashoka',
      lastName: 'User',
      email: (process.env.SMTP_USER || 'a09022762@gmail.com').toLowerCase().trim(),
      password: 'password123',
      role: 'patient',
      phone: '+919876543210',
      profile: {
        gender: 'male',
        height: 175,
        weight: 70,
        profession: 'Member',
        emergencyContact: {
          name: 'Primary Contact',
          phone: '+919876543210',
          email: (process.env.SMTP_USER || 'a09022762@gmail.com').toLowerCase().trim(),
          relationship: 'Self/Family'
        }
      },
      patientInfo: { diabetesType: 'type2' }
    }
  ];

  for (const acc of defaultAccounts) {
    if (!users.some(u => u.email === acc.email)) {
      const salt = bcrypt.genSaltSync(10);
      const hashed = bcrypt.hashSync(acc.password, salt);
      users.push(makeDocInstance({ ...acc, password: hashed }));
    }
  }
}

seedInitialUsers();

// Hook model fallbacks into Mongoose models
function initModelFallbacks() {
  try {
    const User = require('../models/User');
    const Otp = require('../models/Otp');
    const Exercise = require('../models/Exercise');
    const Alert = require('../models/Alert');
    const HealthRecord = require('../models/HealthRecord');
    const ExerciseSession = require('../models/ExerciseSession');

    // 1. User Model Fallbacks
    const origUserFindOne = User.findOne;
    User.findOne = function (query) {
      if (mongoose.connection.readyState === 1) {
        return origUserFindOne.apply(this, arguments);
      }
      let found = null;
      if (query) {
        if (query.email) {
          const target = (typeof query.email === 'string' ? query.email : '').toLowerCase().trim();
          found = users.find(u => u.email.toLowerCase() === target) || null;
        } else if (query.phone) {
          found = users.find(u => u.phone === query.phone) || null;
        } else if (query._id) {
          found = users.find(u => u._id.toString() === query._id.toString()) || null;
        }
      }
      return makeQueryPromise(found ? makeDocInstance(found) : null);
    };

    const origUserFindById = User.findById;
    User.findById = function (id) {
      if (mongoose.connection.readyState === 1) {
        return origUserFindById.apply(this, arguments);
      }
      const found = users.find(u => u._id.toString() === (id ? id.toString() : ''));
      return makeQueryPromise(found ? makeDocInstance(found) : null);
    };

    const origUserFindByIdAndUpdate = User.findByIdAndUpdate;
    User.findByIdAndUpdate = function (id, update, options) {
      if (mongoose.connection.readyState === 1) {
        return origUserFindByIdAndUpdate.apply(this, arguments);
      }
      const idx = users.findIndex(u => u._id.toString() === (id ? id.toString() : ''));
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...(update || {}), updatedAt: new Date() };
        return makeQueryPromise(makeDocInstance(users[idx]));
      }
      return makeQueryPromise(null);
    };

    const origUserCreate = User.create;
    User.create = async function (data) {
      if (mongoose.connection.readyState === 1) {
        return origUserCreate.apply(this, arguments);
      }
      let password = data.password || 'password123';
      if (!password.startsWith('$2a$') && !password.startsWith('$2b$')) {
        const salt = bcrypt.genSaltSync(10);
        password = bcrypt.hashSync(password, salt);
      }
      const newDoc = makeDocInstance({
        ...data,
        password,
        email: (data.email || '').toLowerCase().trim()
      });
      users.push(newDoc);
      return newDoc;
    };

    const origUserCount = User.countDocuments;
    User.countDocuments = function (query) {
      if (mongoose.connection.readyState === 1) {
        return origUserCount.apply(this, arguments);
      }
      return makeQueryPromise(users.length);
    };

    // 2. Otp Model Fallbacks
    const origOtpFindOneAndUpdate = Otp.findOneAndUpdate;
    Otp.findOneAndUpdate = function (query, update, options) {
      if (mongoose.connection.readyState === 1) {
        return origOtpFindOneAndUpdate.apply(this, arguments);
      }
      const email = (query.email || '').toLowerCase().trim();
      const code = update.code ? update.code.toString() : '';
      const otpRecord = { email, code, createdAt: update.createdAt || new Date() };
      otps.set(email, otpRecord);
      return makeQueryPromise(otpRecord);
    };

    const origOtpFindOne = Otp.findOne;
    Otp.findOne = function (query) {
      if (mongoose.connection.readyState === 1) {
        return origOtpFindOne.apply(this, arguments);
      }
      const email = (query.email || '').toLowerCase().trim();
      const stored = otps.get(email);
      if (!stored) return makeQueryPromise(null);
      if (query.code && query.code.toString() !== stored.code) return makeQueryPromise(null);
      return makeQueryPromise(stored);
    };

    const origOtpDeleteOne = Otp.deleteOne;
    Otp.deleteOne = function (query) {
      if (mongoose.connection.readyState === 1) {
        return origOtpDeleteOne.apply(this, arguments);
      }
      const email = (query.email || '').toLowerCase().trim();
      otps.delete(email);
      return makeQueryPromise({ acknowledged: true, deletedCount: 1 });
    };

    // 3. Exercise Model Fallbacks
    const origExFind = Exercise.find;
    Exercise.find = function (query) {
      if (mongoose.connection.readyState === 1) {
        return origExFind.apply(this, arguments);
      }
      return makeQueryPromise(exercises);
    };

    const origExFindOne = Exercise.findOne;
    Exercise.findOne = function (query) {
      if (mongoose.connection.readyState === 1) {
        return origExFindOne.apply(this, arguments);
      }
      let found = exercises[0];
      if (query && query.slug) {
        found = exercises.find(e => e.slug === query.slug) || exercises[0];
      }
      return makeQueryPromise(found);
    };

    const origExFindById = Exercise.findById;
    Exercise.findById = function (id) {
      if (mongoose.connection.readyState === 1) {
        return origExFindById.apply(this, arguments);
      }
      const found = exercises.find(e => e._id.toString() === (id ? id.toString() : '')) || exercises[0];
      return makeQueryPromise(found);
    };

    const origExCount = Exercise.countDocuments;
    Exercise.countDocuments = function () {
      if (mongoose.connection.readyState === 1) {
        return origExCount.apply(this, arguments);
      }
      return makeQueryPromise(exercises.length);
    };

    // 4. Alert Model Fallbacks
    const origAlertCreate = Alert.create;
    Alert.create = async function (data) {
      if (mongoose.connection.readyState === 1) {
        return origAlertCreate.apply(this, arguments);
      }
      const alertDoc = {
        _id: 'alt_' + Math.random().toString(36).substring(2, 10),
        ...data,
        createdAt: new Date()
      };
      alerts.push(alertDoc);
      return alertDoc;
    };

    const origAlertFind = Alert.find;
    Alert.find = function (query) {
      if (mongoose.connection.readyState === 1) {
        return origAlertFind.apply(this, arguments);
      }
      return makeQueryPromise(alerts);
    };

    // 5. HealthRecord Fallbacks
    const origHealthCreate = HealthRecord.create;
    HealthRecord.create = async function (data) {
      if (mongoose.connection.readyState === 1) {
        return origHealthCreate.apply(this, arguments);
      }
      const doc = {
        _id: 'rec_' + Math.random().toString(36).substring(2, 10),
        ...data,
        recordedAt: data.recordedAt || new Date()
      };
      healthRecords.push(doc);
      return doc;
    };

    const origHealthFind = HealthRecord.find;
    HealthRecord.find = function (query) {
      if (mongoose.connection.readyState === 1) {
        return origHealthFind.apply(this, arguments);
      }
      return makeQueryPromise(healthRecords);
    };

    const origHealthCount = HealthRecord.countDocuments;
    HealthRecord.countDocuments = function () {
      if (mongoose.connection.readyState === 1) {
        return origHealthCount.apply(this, arguments);
      }
      return makeQueryPromise(healthRecords.length);
    };

    // 6. ExerciseSession Fallbacks
    const origSessionCreate = ExerciseSession.create;
    ExerciseSession.create = async function (data) {
      if (mongoose.connection.readyState === 1) {
        return origSessionCreate.apply(this, arguments);
      }
      const doc = {
        _id: 'ses_' + Math.random().toString(36).substring(2, 10),
        ...data,
        startTime: data.startTime || new Date(),
        endTime: data.endTime || new Date(),
        save: async function () { return this; },
        deleteOne: async function () { return true; }
      };
      exerciseSessions.push(doc);
      return doc;
    };

    const origSessionFind = ExerciseSession.find;
    ExerciseSession.find = function (query) {
      if (mongoose.connection.readyState === 1) {
        return origSessionFind.apply(this, arguments);
      }
      return makeQueryPromise(exerciseSessions);
    };

    const origSessionFindById = ExerciseSession.findById;
    ExerciseSession.findById = function (id) {
      if (mongoose.connection.readyState === 1) {
        return origSessionFindById.apply(this, arguments);
      }
      const doc = exerciseSessions.find(s => s._id.toString() === (id ? id.toString() : ''));
      return makeQueryPromise(doc ? {
        ...doc,
        save: async function () { return this; },
        deleteOne: async function () { return true; }
      } : null);
    };

    const origSessionCount = ExerciseSession.countDocuments;
    ExerciseSession.countDocuments = function () {
      if (mongoose.connection.readyState === 1) {
        return origSessionCount.apply(this, arguments);
      }
      return makeQueryPromise(exerciseSessions.length);
    };

    console.log('✓ [Data Layer] In-memory model fallbacks initialized successfully.');
  } catch (err) {
    console.warn('⚠️ [Data Layer] Model fallbacks initialization note:', err.message);
  }
}

module.exports = {
  users,
  otps,
  exercises,
  alerts,
  healthRecords,
  exerciseSessions,
  initModelFallbacks,
  seedInitialUsers
};
