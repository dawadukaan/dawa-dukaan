import mongoose from 'mongoose';

const FCMTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  device: {
    type: String,
    default: 'unknown',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 24 * 60 * 60, // Automatically expire tokens after 60 days
  },
});

// Create a compound index to ensure uniqueness of user+token combination
FCMTokenSchema.index({ user: 1, token: 1 }, { unique: true });

export default mongoose.models.FCMToken || mongoose.model('FCMToken', FCMTokenSchema);