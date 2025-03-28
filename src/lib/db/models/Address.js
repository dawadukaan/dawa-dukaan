// src/lib/db/models/Address.js
import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  addressType: {
    type: String,
    enum: ['shop', 'home', 'office', 'other'],
    default: 'other'
  },
  addressLine1: {
    type: String,
    trim: true,
  },
  addressLine2: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  state: {
    type: String,
    trim: true,
  },
  pincode: {
    type: String,
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
AddressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Use this pattern to avoid model recompilation errors in Next.js
export default mongoose.models.Address || mongoose.model('Address', AddressSchema);