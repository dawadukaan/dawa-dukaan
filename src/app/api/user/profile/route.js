// src/app/api/users/profile/route.js
import dbConnect from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import Address from "@/lib/db/models/Address";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateUser } from "@/lib/api/authMiddleware";

// GET /api/users/profile
export async function GET(request) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateUser(request);
    
    if (!authenticated) {
      return response;
    }
    
    const user = await User.findById(session.user.id)
      .select('-password')
      .populate('defaultAddress');
    
    if (!user) {
      return errorResponse("User not found", 404);
    }
    
    return successResponse(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return errorResponse("Failed to fetch user profile", 500);
  }
}

// PUT /api/users/profile
export async function PUT(request) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateUser(request);
    
    if (!authenticated) {
      return response;
    }
    
    const data = await request.json();
    
    // Don't allow updating email or password through this endpoint
    delete data.email;
    delete data.password;
    
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return errorResponse("User not found", 404);
    }
    
    return successResponse(user);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return errorResponse(error.message || "Failed to update user profile", 500);
  }
}