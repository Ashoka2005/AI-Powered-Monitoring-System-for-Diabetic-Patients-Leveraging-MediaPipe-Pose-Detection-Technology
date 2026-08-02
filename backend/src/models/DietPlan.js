const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    generatedBy: { type: String, enum: ['ai', 'doctor', 'manual'], default: 'ai' },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String },
    totalCalories: { type: Number },
    totalCarbs: { type: Number }, // grams
    totalProtein: { type: Number },
    totalFat: { type: Number },
    glycemicLoad: { type: Number },
    meals: [
      {
        name: { type: String, required: true },
        time: { type: String },
        calories: { type: Number },
        carbs: { type: Number },
        protein: { type: Number },
        fat: { type: Number },
        glycemicIndex: { type: Number },
        items: [{ name: String, quantity: String, calories: Number }],
      },
    ],
    restrictions: [String],
    recommendations: [String],
    isActive: { type: Boolean, default: true },
    validFrom: { type: Date },
    validTo: { type: Date },
  },
  { timestamps: true }
);

dietPlanSchema.index({ userId: 1, isActive: -1 });

module.exports = mongoose.model('DietPlan', dietPlanSchema);
