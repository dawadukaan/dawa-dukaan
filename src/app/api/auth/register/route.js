// src/app/api/auth/register/route.js
import dbConnect from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import Referral from "@/lib/db/models/Referral";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import jwt from "jsonwebtoken";

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-for-development";

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return errorResponse("User with this email already exists", 400);
    }

    // Check referral code if provided
    let referrerInfo = null;
    if (data.referralCode) {
      const referralDoc = await Referral.findOne({ referralCode: data.referralCode })
        .populate('user', 'email');
      
      if (!referralDoc) {
        return errorResponse("Invalid referral code", 400);
      }
      
      // Prevent using own referral code (if somehow the email matches)
      if (referralDoc.user.email === data.email) {
        return errorResponse("You cannot use your own referral code", 400);
      }
      
      referrerInfo = {
        referralId: referralDoc._id,
        userId: referralDoc.user._id
      };
    }

    // Create new user
    const user = new User({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      isActive: false,
      avatar: data.avatar,
      type: data.type,
      licenseDetails: {
        licenseNumber: data.licenseNumber,
        licenseDocument: data.licenseDocument,
      },
      // referralCode will be auto-generated in pre-save hook
    });
    
    await user.save();
    
    // Create a referral document for the new user
    const userReferral = new Referral({
      user: user._id,
      referralCode: user.referralCode,
      referredBy: referrerInfo ? referrerInfo.userId : null,
      stats: {
        totalReferrals: 0,
        successfulReferrals: 0
      }
    });
    
    await userReferral.save();
    
    // If user was referred, update the referrer's referral document
    if (referrerInfo) {
      await Referral.findByIdAndUpdate(
        referrerInfo.referralId,
        {
          $push: {
            referees: {
              user: user._id,
              registeredAt: new Date(),
              status: 'completed'
            }
          },
          $inc: {
            'stats.totalReferrals': 1,
            'stats.successfulReferrals': 1
          },
          updatedAt: new Date()
        }
      );
    }
    
    // Create token payload
    const payload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      type: user.type,
      role: 'customer',
      model: 'User',
      permissions: null,
    };
    
    // Generate token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' }); // 30 days
    
    // Don't return password in response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return successResponse({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
        type: user.type,
        role: 'customer',
        referralCode: user.referralCode,
        licenseDetails: {
          licenseNumber: user.licenseDetails.licenseNumber,
          licenseDocument: user.licenseDetails.licenseDocument,
        },
      },
      token,
      referrer: referrerInfo ? { id: referrerInfo.userId } : null
    }, 201);
  } catch (error) {
    console.error("Error registering user:", error);
    return errorResponse(error.message || "Failed to register user", 500);
  }
}