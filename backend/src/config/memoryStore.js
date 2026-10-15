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
  },
  {
    _id: 'ex_9',
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
    _id: 'ex_10',
    name: 'Standing Knee Bend',
    slug: 'standing-knee-bend',
    description: 'Standing hamstring curls for lower body mobility and glycemic control',
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
    _id: 'ex_11',
    name: 'Ankle Pump',
    slug: 'ankle-pump',
    description: 'Ankle flexion exercises for peripheral circulation and diabetic neuropathy relief',
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
    _id: 'ex_12',
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
    _id: 'ex_13',
    name: 'Prenatal Yoga',
    slug: 'prenatal-yoga',
    description: 'Gentle restorative yoga postures to maintain pelvic mobility, reduce stress, and improve breathing.',
    category: 'flexibility',
    difficulty: 'beginner',
    targetReps: 10,
    targetSets: 2,
    caloriesPerMinute: 3,
    isDiabetesRecommended: true,
    instructions: ['Begin in a comfortable seated position', 'Perform gentle side reaches and cat-cow breathing', 'Hold each stretch for 3 deep breaths'],
    precautions: ['Do not overstretch', 'Avoid lying flat on back after first trimester'],
    landmarks: { primaryJoints: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'], angleThresholds: { minAngle: 30, maxAngle: 150 } },
    thumbnail: '/images/exercises/prenatal-yoga.png'
  },
  {
    _id: 'ex_14',
    name: 'Kegel Pelvic Floor Exercises',
    slug: 'kegels',
    description: 'Targeted pelvic floor muscle contractions to strengthen pelvic support and circulation during pregnancy.',
    category: 'core',
    difficulty: 'beginner',
    targetReps: 15,
    targetSets: 3,
    caloriesPerMinute: 2,
    isDiabetesRecommended: true,
    instructions: ['Contract pelvic floor muscles', 'Hold for 5 seconds', 'Release gently for 5 seconds', 'Repeat rhythmically'],
    precautions: ['Do not hold your breath while contracting', 'Relax completely between contractions'],
    landmarks: { primaryJoints: ['left_hip', 'right_hip'], angleThresholds: { minAngle: 0, maxAngle: 90 } },
    thumbnail: '/images/exercises/kegels.png'
  },
  {
    _id: 'ex_15',
    name: 'Gentle Stretching',
    slug: 'gentle-stretching',
    description: 'Safe, low-intensity stretching for back, hips, and calves to alleviate muscle cramps and joint tightness.',
    category: 'flexibility',
    difficulty: 'beginner',
    targetReps: 10,
    targetSets: 2,
    caloriesPerMinute: 2,
    isDiabetesRecommended: true,
    instructions: ['Extend arms forward slowly', 'Gently reach toward sides within comfort', 'Hold stretches for 10-15 seconds'],
    precautions: ['Stop immediately if you feel sharp pain or dizziness'],
    landmarks: { primaryJoints: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'], angleThresholds: { minAngle: 30, maxAngle: 120 } },
    thumbnail: '/images/exercises/gentle-stretching.png'
  },
  {
    _id: 'ex_16',
    name: 'Stationary Cycling',
    slug: 'stationary-cycling',
    description: 'Low-impact cardiovascular exercise on a stationary bike to lower blood glucose safely.',
    category: 'cardio',
    difficulty: 'beginner',
    targetReps: 20,
    targetSets: 3,
    caloriesPerMinute: 6,
    isDiabetesRecommended: true,
    instructions: ['Adjust seat to hip height', 'Pedal at a smooth, moderate pace', 'Keep handlebars comfortably within reach'],
    precautions: ['Stay well hydrated', 'Do not exceed moderate exertion level'],
    landmarks: { primaryJoints: ['left_hip', 'left_knee', 'right_hip', 'right_knee'], angleThresholds: { minAngle: 60, maxAngle: 150 } },
    thumbnail: '/images/exercises/stationary-cycling.png'
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

function applyDotNotationUpdates(target, updates) {
  if (!target || !updates) return target;
  for (const [key, val] of Object.entries(updates)) {
    if (key.includes('.')) {
      const parts = key.split('.');
      let curr = target;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!curr[parts[i]] || typeof curr[parts[i]] !== 'object') {
          curr[parts[i]] = {};
        }
        curr = curr[parts[i]];
      }
      curr[parts[parts.length - 1]] = val;
    } else {
      if (typeof val === 'object' && val !== null && !Array.isArray(val) && !(val instanceof Date)) {
        target[key] = { ...(target[key] || {}), ...val };
      } else {
        target[key] = val;
      }
    }
  }
  return target;
}

function makeDocInstance(data) {
  const cleanData = { ...data };
  const profile = { ...(cleanData.profile || {}) };
  const patientInfo = { ...(cleanData.patientInfo || {}) };
  const doctorInfo = { ...(cleanData.doctorInfo || {}) };

  // Parse any dot-notation keys that may have been placed on cleanData
  for (const [k, v] of Object.entries(cleanData)) {
    if (k.startsWith('profile.')) {
      applyDotNotationUpdates(profile, { [k.replace('profile.', '')]: v });
      delete cleanData[k];
    } else if (k.startsWith('patientInfo.')) {
      applyDotNotationUpdates(patientInfo, { [k.replace('patientInfo.', '')]: v });
      delete cleanData[k];
    } else if (k.startsWith('doctorInfo.')) {
      applyDotNotationUpdates(doctorInfo, { [k.replace('doctorInfo.', '')]: v });
      delete cleanData[k];
    }
  }

  cleanData.profile = profile;
  cleanData.patientInfo = patientInfo;
  cleanData.doctorInfo = doctorInfo;

  const doc = {
    _id: cleanData._id || 'doc_' + Math.random().toString(36).substring(2, 10),
    ...cleanData,
    profile,
    patientInfo,
    doctorInfo,
    isActive: cleanData.isActive !== undefined ? cleanData.isActive : true,
    createdAt: cleanData.createdAt || new Date(),
    updatedAt: cleanData.updatedAt || new Date(),
    get fullName() {
      return `${this.firstName || ''} ${this.lastName || ''}`.trim() || 'Patient';
    },
    get bmi() {
      if (!this.profile?.height || !this.profile?.weight) return null;
      const heightM = this.profile.height / 100;
      return parseFloat((this.profile.weight / (heightM * heightM)).toFixed(1));
    },
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
      } else {
        users.push(this);
      }
      return this;
    },
    toObject: function () {
      return { ...this, bmi: this.bmi, fullName: this.fullName };
    },
    toJSON: function () {
      return { ...this, bmi: this.bmi, fullName: this.fullName };
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

// Seed initial users
function seedInitialUsers() {
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
      const targetId = id ? id.toString() : '';
      const idx = users.findIndex(u => u._id.toString() === targetId);
      if (idx !== -1) {
        const raw = { ...users[idx] };
        if (update) {
          applyDotNotationUpdates(raw, update);
        }
        raw.updatedAt = new Date();
        const doc = makeDocInstance(raw);
        users[idx] = doc;
        return makeQueryPromise(doc);
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
      let res = healthRecords;
      if (query && query.userId) {
        res = res.filter(r => r.userId?.toString() === query.userId?.toString());
      }
      return makeQueryPromise(res);
    };

    const origHealthCount = HealthRecord.countDocuments;
    HealthRecord.countDocuments = function () {
      if (mongoose.connection.readyState === 1) {
        return origHealthCount.apply(this, arguments);
      }
      return makeQueryPromise(healthRecords.length);
    };

    const origHealthAggregate = HealthRecord.aggregate;
    HealthRecord.aggregate = function (pipeline) {
      if (mongoose.connection.readyState === 1) {
        return origHealthAggregate.apply(this, arguments);
      }
      // Simple mock for trends
      const sugarLogs = healthRecords.filter(r => ['fasting', 'postprandial', 'random'].includes(r.metricType));
      return makeQueryPromise(sugarLogs);
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
        save: async function () {
          const idx = exerciseSessions.findIndex(s => s._id === this._id);
          if (idx !== -1) exerciseSessions[idx] = this;
          return this;
        },
        deleteOne: async function () {
          const idx = exerciseSessions.findIndex(s => s._id === this._id);
          if (idx !== -1) exerciseSessions.splice(idx, 1);
          return true;
        }
      };
      exerciseSessions.push(doc);
      return doc;
    };

    const origSessionFind = ExerciseSession.find;
    ExerciseSession.find = function (query) {
      if (mongoose.connection.readyState === 1) {
        return origSessionFind.apply(this, arguments);
      }
      let res = exerciseSessions;
      if (query && query.userId) {
        res = res.filter(s => s.userId?.toString() === query.userId?.toString());
      }
      return makeQueryPromise(res);
    };

    const origSessionFindById = ExerciseSession.findById;
    ExerciseSession.findById = function (id) {
      if (mongoose.connection.readyState === 1) {
        return origSessionFindById.apply(this, arguments);
      }
      const targetId = id ? id.toString() : '';
      const doc = exerciseSessions.find(s => s._id.toString() === targetId);
      if (!doc) return makeQueryPromise(null);
      const wrapped = {
        ...doc,
        save: async function () {
          const idx = exerciseSessions.findIndex(s => s._id === this._id);
          if (idx !== -1) exerciseSessions[idx] = this;
          return this;
        },
        deleteOne: async function () {
          const idx = exerciseSessions.findIndex(s => s._id === this._id);
          if (idx !== -1) exerciseSessions.splice(idx, 1);
          return true;
        }
      };
      return makeQueryPromise(wrapped);
    };

    const origSessionFindOne = ExerciseSession.findOne;
    ExerciseSession.findOne = function (query) {
      if (mongoose.connection.readyState === 1) {
        return origSessionFindOne.apply(this, arguments);
      }
      let res = exerciseSessions;
      if (query && query.userId) {
        res = res.filter(s => s.userId?.toString() === query.userId?.toString());
      }
      const doc = res[res.length - 1] || null;
      return makeQueryPromise(doc);
    };

    const origSessionCount = ExerciseSession.countDocuments;
    ExerciseSession.countDocuments = function () {
      if (mongoose.connection.readyState === 1) {
        return origSessionCount.apply(this, arguments);
      }
      return makeQueryPromise(exerciseSessions.length);
    };

    const origSessionAggregate = ExerciseSession.aggregate;
    ExerciseSession.aggregate = function (pipeline) {
      if (mongoose.connection.readyState === 1) {
        return origSessionAggregate.apply(this, arguments);
      }
      const totalSessions = exerciseSessions.length;
      let totalDuration = 0;
      let totalCalories = 0;
      let totalAccuracy = 0;
      let totalReps = 0;
      exerciseSessions.forEach(s => {
        totalDuration += s.duration || 0;
        totalCalories += s.caloriesBurned || 0;
        totalAccuracy += s.accuracyScore || 100;
        totalReps += s.repsCompleted || 0;
      });
      const avgAccuracy = totalSessions > 0 ? totalAccuracy / totalSessions : 0;
      return makeQueryPromise([{
        totalSessions,
        totalDuration,
        totalCalories,
        avgAccuracy,
        totalReps
      }]);
    };

    // 7. DietPlan Fallbacks
    try {
      const DietPlan = require('../models/DietPlan');
      const dietPlans = [];

      DietPlan.updateMany = function (query, update) {
        if (mongoose.connection.readyState === 1) {
          return DietPlan.prototype.constructor.updateMany?.apply(this, arguments) || makeQueryPromise({ acknowledged: true });
        }
        dietPlans.forEach(p => {
          if (update.isActive !== undefined) p.isActive = update.isActive;
        });
        return makeQueryPromise({ acknowledged: true, modifiedCount: dietPlans.length });
      };

      DietPlan.create = async function (data) {
        if (mongoose.connection.readyState === 1) {
          return DietPlan.prototype.constructor.create?.apply(this, arguments);
        }
        const doc = {
          _id: 'diet_' + Math.random().toString(36).substring(2, 10),
          ...data,
          createdAt: new Date(),
          save: async function () { return this; }
        };
        dietPlans.push(doc);
        return doc;
      };

      DietPlan.findOne = function (query) {
        if (mongoose.connection.readyState === 1) {
          return DietPlan.prototype.constructor.findOne?.apply(this, arguments);
        }
        const found = dietPlans.find(p => p.isActive) || dietPlans[0] || null;
        return makeQueryPromise(found);
      };

      DietPlan.find = function (query) {
        if (mongoose.connection.readyState === 1) {
          return DietPlan.prototype.constructor.find?.apply(this, arguments);
        }
        return makeQueryPromise(dietPlans);
      };
    } catch (dpErr) {
      console.warn('DietPlan fallback registration note:', dpErr.message);
    }

    // 8. Appointment & ChatMessage Fallbacks
    try {
      const Appointment = require('../models/Appointment');
      Appointment.find = Appointment.find || function () { return makeQueryPromise([]); };
      Appointment.countDocuments = Appointment.countDocuments || function () { return makeQueryPromise(0); };

      const ChatMessage = require('../models/ChatMessage');
      ChatMessage.find = ChatMessage.find || function () { return makeQueryPromise([]); };
      ChatMessage.create = ChatMessage.create || async function (d) { return { _id: 'msg_1', ...d }; };
    } catch (acErr) {}

    console.log('✓ [Data Layer] In-memory model fallbacks initialized successfully.');
  } catch (err) {
    console.warn('⚠️ [Data Layer] Model fallbacks initialization note:', err.message);
  }
}

module.exports = {
  users,
  otps,
  exercises,
  defaultAccounts,
  alerts,
  healthRecords,
  exerciseSessions,
  initModelFallbacks,
  seedInitialUsers
};
