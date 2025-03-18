import dbConnect from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Address from "@/lib/db/models/Address";
import Order from "@/lib/db/models/Order";
import Referral from "@/lib/db/models/Referral";

// GET /api/admin/users/[id] - Get a single user by ID
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const { id } = params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid user ID", 400);
    }
    
    const user = await User.findById(id)
      .select('-password')
      .populate('addresses')
      .populate('defaultAddress');
    
    if (!user) {
      return errorResponse("User not found", 404);
    }
    
    return successResponse(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return errorResponse("Failed to fetch user", 500);
  }
}

// PUT /api/admin/users/[id] - Update a user
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const { id } = params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid user ID", 400);
    }
    
    const userData = await request.json();
    
    // Check if email is being changed and if it's already in use
    if (userData.email) {
      const existingUser = await User.findOne({ 
        email: userData.email,
        _id: { $ne: id }
      });
      
      if (existingUser) {
        return errorResponse("Email already in use", 400);
      }
    }
    
    // Handle password update separately
    let updateData = { ...userData, updatedAt: Date.now() };
    
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(userData.password, salt);
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return errorResponse("User not found", 404);
    }
    
    return successResponse(user);
  } catch (error) {
    console.error("Error updating user:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return errorResponse(validationErrors.join(', '), 400);
    }
    
    return errorResponse("Failed to update user", 500);
  }
}

// DELETE /api/admin/users/[id] - Delete a user and all related data
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    // Authenticate as admin
    const { authenticated, response } = await authenticateAdmin(request);
    if (!authenticated) {
      return response;
    }
    
    const { id } = params;
    
    if (!id) {
      return errorResponse("User ID is required", 400);
    }
    
    // Find the user first to ensure they exist
    const user = await User.findById(id);
    
    if (!user) {
      return errorResponse("User not found", 404);
    }
    
    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 1. Delete all addresses associated with the user
      await Address.deleteMany({ userId: id }, { session });
      
      // 2. Delete all orders associated with the user
      await Order.deleteMany({ user: id }, { session });
      
      // 3. Delete all referrals where this user is either referred or referrer
      // First, find any referral documents for this user
      const userReferral = await Referral.findOne({ user: id }, null, { session });
      
      if (userReferral) {
        // Delete the user's referral document
        await Referral.findByIdAndDelete(userReferral._id, { session });
      }
      
      // Update any referral documents where this user has referred others
      await Referral.updateMany(
        { "referees.user": id },
        { $pull: { referees: { user: id } } },
        { session }
      );
      
      // 4. Delete the user
      await User.findByIdAndDelete(id, { session });
      
      // Commit the transaction
      await session.commitTransaction();
      
    } catch (error) {
      // If an error occurs, abort the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      // End the session
      session.endSession();
    }
    
    return successResponse({ 
      message: "User and all associated data deleted successfully",
      deletedUserId: id
    });
    
  } catch (error) {
    console.error("Error deleting user:", error);
    return errorResponse("Failed to delete user: " + error.message, 500);
  }
} 