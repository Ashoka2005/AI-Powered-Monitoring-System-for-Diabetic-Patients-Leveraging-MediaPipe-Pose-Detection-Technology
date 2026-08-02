const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    metricType: {
      type: String,
      required: true,
      enum: ['fasting', 'postprandial', 'random', 'hba1c', 'heart_rate', 'blood_pressure', 'weight', 'spo2'],
    },
    value: { type: Number, required: true },
    valueSecondary: { type: Number }, // for blood pressure (diastolic)
    unit: { type: String, required: true },
    recordedAt: { type: Date, default: Date.now },
    source: { type: String, enum: ['manual', 'iot_glucose', 'iot_smartwatch', 'iot_bp', 'import'], default: 'manual' },
    deviceId: { type: String },
    notes: { type: String },
    mealContext: { type: String, enum: ['before_meal', 'after_meal', 'fasting', 'bedtime', ''] },
    medicationTaken: { type: Boolean },
  },
  { timestamps: true }
);

healthRecordSchema.index({ userId: 1, metricType: 1, recordedAt: -1 });

// Virtual for blood sugar status
healthRecordSchema.virtual('sugarStatus').get(function () {
  if (!['fasting', 'postprandial', 'random'].includes(this.metricType)) return 'N/A';
  if (this.value < 70) return 'low';
  if (this.value <= 140) return 'normal';
  if (this.value <= 199) return 'high';
  return 'very_high';
});

healthRecordSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
