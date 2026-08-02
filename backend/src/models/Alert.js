const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      required: true,
      enum: ['fall_detected', 'high_blood_sugar', 'low_blood_sugar', 'missed_medication', 'emergency', 'user_absent'],
    },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed },
    acknowledged: { type: Boolean, default: false },
    acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    acknowledgedAt: { type: Date },
    notifiedContacts: [{ name: String, phone: String, email: String, notifiedAt: Date, method: String }],
    location: { latitude: Number, longitude: Number, address: String },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

alertSchema.index({ userId: 1, createdAt: -1 });
alertSchema.index({ acknowledged: 1, severity: 1 });

module.exports = mongoose.model('Alert', alertSchema);
