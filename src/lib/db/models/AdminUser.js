// src/lib/db/models/AdminUser.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AdminUserSchema = new mongoose.Schema({
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
  role: {
    type: String,
    enum: ['admin', 'vendor', 'editor', 'delivery'],
    required: [true, 'Please specify a role'],
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
  permissions: {
    manageProducts: {
      type: Boolean,
      default: false,
    },
    manageCategories: {
      type: Boolean,
      default: false,
    },
    manageOrders: {
      type: Boolean,
      default: false,
    },
    manageUsers: {
      type: Boolean,
      default: false,
    },
    manageCoupons: {
      type: Boolean,
      default: false,
    },
    manageSettings: {
      type: Boolean,
      default: false,
    },
    viewAnalytics: {
      type: Boolean,
      default: false,
    },
  },
  lastLogin: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
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

// Set default permissions based on role
AdminUserSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('role')) {
    switch (this.role) {
      case 'admin':
        this.permissions = {
          manageProducts: true,
          manageCategories: true,
          manageOrders: true,
          manageUsers: true,
          manageCoupons: true,
          manageSettings: true,
          viewAnalytics: true,
        };
        break;
      case 'vendor':
        this.permissions = {
          manageProducts: true,
          manageOrders: true,
          viewAnalytics: true,
          manageCategories: false,
          manageUsers: false,
          manageCoupons: false,
          manageSettings: false,
        };
        break;
      case 'editor':
        this.permissions = {
          manageProducts: true,
          manageCategories: true,
          manageOrders: false,
          manageUsers: false,
          manageCoupons: false,
          manageSettings: false,
          viewAnalytics: false,
        };
        break;
      case 'delivery':
        this.permissions = {
          manageOrders: true,
          manageProducts: false,
          manageCategories: false,
          manageUsers: false,
          manageCoupons: false,
          manageSettings: false,
          viewAnalytics: false,
        };
        break;
    }
  }
  next();
});

// Hash password before saving
AdminUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  this.updatedAt = Date.now();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
AdminUserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if user has a specific permission
AdminUserSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

// Method to check if user is an admin
AdminUserSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Method to check if user is a vendor
AdminUserSchema.methods.isVendor = function() {
  return this.role === 'vendor';
};

export default mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);