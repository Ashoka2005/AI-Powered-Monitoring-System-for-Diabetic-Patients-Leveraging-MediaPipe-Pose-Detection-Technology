require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Exercise = require('../models/Exercise');
const HealthRecord = require('../models/HealthRecord');
const ExerciseSession = require('../models/ExerciseSession');

const exercises = [
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
  }
];

const seedDatabase = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    try {
      await mongoose.connect(uri);
      console.log('Connected to MongoDB');
    } catch (connErr) {
      console.log('MongoDB not available, starting in-memory MongoDB...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log('Connected to in-memory MongoDB');
    }

    // Clear existing data
    await User.deleteMany({});
    await Exercise.deleteMany({});
    await HealthRecord.deleteMany({});
    await ExerciseSession.deleteMany({});
    console.log('Cleared existing data');

    // Create exercises
    await Exercise.insertMany(exercises);
    console.log(`${exercises.length} exercises created`);

    console.log('\n--- Seed Complete (Exercises Only) ---');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
