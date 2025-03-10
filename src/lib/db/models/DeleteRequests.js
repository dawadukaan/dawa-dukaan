// src/lib/db/models/DeleteRequests.js
import mongoose from 'mongoose';

const DeleteRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    trim: true,
    lowercase: true,
  },
  reason: {
    type: String,
    required: [true, 'Please provide a reason'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the timestamp before saving
DeleteRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.DeleteRequest || mongoose.model('DeleteRequest', DeleteRequestSchema);
