const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['upper_body', 'lower_body', 'core', 'full_body', 'cardio', 'flexibility', 'balance'],
      required: true,
    },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    duration: { type: Number, default: 300 }, // seconds
    targetReps: { type: Number, default: 10 },
    targetSets: { type: Number, default: 3 },
    caloriesPerMinute: { type: Number, default: 5 },
    isDiabetesRecommended: { type: Boolean, default: true },
    precautions: [String],
    instructions: [String],
    landmarks: {
      primaryJoints: [String],
      angleThresholds: {
        minAngle: { type: Number, default: 0 },
        maxAngle: { type: Number, default: 180 },
      },
    },
    thumbnail: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exercise', exerciseSchema);
