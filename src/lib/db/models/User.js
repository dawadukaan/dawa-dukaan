// src/lib/db/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't return password in queries
  },
  phone: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  avatar: {
    type: String,
  },
  addresses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  }],
  defaultAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  },
  lastLogin: {
    type: Date,
  },
  role: {
    type: String,
    default: 'customer',
  },
  type: {
    type: String,
    enum: ['licensee', 'unlicensed'],
    default: 'unlicensed',
  },
  licenseDetails: {
    licenseNumber: {
      type: String,
      default: '',
    },
    licenseDocument: {
      type: String,
      default: '',
    },
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined values without unique constraint
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

// Hash password before saving
UserSchema.pre('save', async function(next) {

  // Only run this function if this is a new user or the referralCode is modified
  if (this.isNew && !this.referralCode) {
    // Generate a unique referral code based on name and random string
    const namePart = this.name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.referralCode = `${namePart}${randomPart}`;
    
    // Check if code already exists and regenerate if needed
    const existingUser = await mongoose.models.User.findOne({ referralCode: this.referralCode });
    if (existingUser) {
      const newRandomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      this.referralCode = `${namePart}${newRandomPart}`;
    }
  }


  if (!this.isModified('password')) {
    next();
  }
  
  this.updatedAt = Date.now();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get user's full name
UserSchema.methods.getFullName = function() {
  return this.name;
};

// Method to check if user has a specific address
UserSchema.methods.hasAddress = function(addressId) {
  return this.addresses.some(address => address.toString() === addressId.toString());
};

export default mongoose.models.User || mongoose.model('User', UserSchema);