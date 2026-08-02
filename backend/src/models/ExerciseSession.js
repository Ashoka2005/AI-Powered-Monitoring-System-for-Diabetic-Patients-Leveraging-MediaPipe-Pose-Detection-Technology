const mongoose = require('mongoose');

const exerciseSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number }, // seconds
    repsCompleted: { type: Number, default: 0 },
    setsCompleted: { type: Number, default: 0 },
    accuracyScore: { type: Number, min: 0, max: 100, default: 0 },
    caloriesBurned: { type: Number, default: 0 },
    avgJointAngles: { type: Map, of: Number },
    postureCorrections: { type: Number, default: 0 },
    feedback: [{ timestamp: Date, message: String, severity: String }],
    landmarksData: [{ timestamp: Date, landmarks: [mongoose.Schema.Types.Mixed] }],
    fallDetected: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    glycemicImpact: {
      preExerciseSugar: { type: Number },
      postExerciseSugar: { type: Number },
      impactScore: { type: Number },
    },
  },
  { timestamps: true }
);

exerciseSessionSchema.index({ userId: 1, createdAt: -1 });
exerciseSessionSchema.index({ exerciseId: 1 });

module.exports = mongoose.model('ExerciseSession', exerciseSessionSchema);
