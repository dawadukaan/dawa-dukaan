import mongoose from 'mongoose';

const AdminFCMTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
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
AdminFCMTokenSchema.index({ user: 1, token: 1 }, { unique: true });

export default mongoose.models.FCMToken || mongoose.model('AdminFCMToken', AdminFCMTokenSchema);