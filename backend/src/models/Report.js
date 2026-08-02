const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['health_summary', 'exercise_report', 'blood_sugar_trends', 'diet_compliance', 'comprehensive', 'doctor_notes'],
      required: true,
    },
    title: { type: String, required: true },
    period: { startDate: { type: Date }, endDate: { type: Date } },
    summary: { type: String },
    data: { type: mongoose.Schema.Types.Mixed },
    filePath: { type: String },
    fileSize: { type: Number },
    status: { type: String, enum: ['pending', 'generating', 'completed', 'failed'], default: 'pending' },
    sharedWith: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, sharedAt: Date }],
  },
  { timestamps: true }
);

reportSchema.index({ userId: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
