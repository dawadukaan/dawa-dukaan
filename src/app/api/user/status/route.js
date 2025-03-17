// GET /api/user/status
import dbConnect from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateUser } from "@/lib/api/authMiddleware";

// GET /api/user/status - Check if the authenticated user is active
export async function GET(request) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateUser(request);
    
    if (!authenticated) {
      return response;
    }
    
    const userId = session.user.id;
    
    // Get the user data, focusing only on the active status and essential info
    const user = await User.findById(userId)
      .select('isActive name email role type lastLogin')
      .lean();
    
    if (!user) {
      return errorResponse("User not found", 404);
    }
    
    // Update lastLogin time
    await User.findByIdAndUpdate(
      userId,
      { lastLogin: new Date() },
      { new: true }
    );
    
    // Return the status and basic user info
    return successResponse({
      isActive: user.isActive,
      lastLogin: user.lastLogin || new Date()
    });
  } catch (error) {
    console.error("Error checking user status:", error);
    return errorResponse("Failed to check user status: " + error.message, 500);
  }
}

// POST /api/user/status/ping - Simple ping endpoint to update last login and check status
export async function POST(request) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateUser(request);
    
    if (!authenticated) {
      return response;
    }
    
    const userId = session.user.id;
    
    // Get the user's active status
    const user = await User.findByIdAndUpdate(
      userId,
      { lastLogin: new Date() },
      { new: true }
    ).select('isActive').lean();
    
    if (!user) {
      return errorResponse("User not found", 404);
    }
    
    // Just return a simple active status
    return successResponse({
      isActive: user.isActive,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Error pinging user status:", error);
    return errorResponse("Failed to ping user status", 500);
  }
}
