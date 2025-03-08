import dbConnect from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(request, { params }) {
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
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return errorResponse("User not found", 404);
    }
    
    return successResponse({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return errorResponse("Failed to delete user", 500);
  }
} 