import mongoose from 'mongoose';

const ReferralSchema = new mongoose.Schema({
  // The user who created/owns this referral link
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // The referral code associated with this referral
  referralCode: { 
    type: String, 
    required: true 
  },
  
  // The user who referred the owner of this referral (if any)
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Users who have signed up using this referral code
  referees: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'rewarded'],
      default: 'completed'
    }
  }],
  
  // Statistics for this referral
  stats: {
    totalReferrals: {
      type: Number,
      default: 0
    },
    successfulReferrals: {
      type: Number,
      default: 0
    },
    // You can add more stats as needed
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

// Indexes for faster lookups
ReferralSchema.index({ referralCode: 1 }, { unique: true });
ReferralSchema.index({ user: 1 }, { unique: true });
ReferralSchema.index({ 'referees.user': 1 });

export default mongoose.models.Referral || mongoose.model('Referral', ReferralSchema); 