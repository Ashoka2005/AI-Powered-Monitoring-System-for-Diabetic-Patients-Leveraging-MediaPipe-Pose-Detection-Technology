const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: String, required: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    metadata: {
      intent: { type: String },
      confidence: { type: Number },
      entities: [String],
      sources: [String],
    },
    isHelpful: { type: Boolean },
  },
  { timestamps: true }
);

chatMessageSchema.index({ userId: 1, sessionId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
