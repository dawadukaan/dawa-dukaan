import dbConnect from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";

// PATCH /api/admin/users/status - Update a user's active status
export async function PATCH(request) {
  try {
    await dbConnect();
    
    // Ensure the request is from an admin
    const { authenticated, response } = await authenticateAdmin(request);
    if (!authenticated) {
      return response;
    }
    
    const { userId, isActive, reason } = await request.json();
    
    // Validate inputs
    if (!userId) {
      return errorResponse("User ID is required", 400);
    }
    
    if (isActive === undefined || isActive === null) {
      return errorResponse("Active status is required", 400);
    }
    
    // Find and update the user
    const user = await User.findById(userId);
    
    if (!user) {
      return errorResponse("User not found", 404);
    }
    
    // Check if status is already set to the requested value
    if (user.isActive === isActive) {
      return successResponse({
        message: `User's active status is already set to ${isActive ? 'active' : 'inactive'}`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
          lastUpdated: user.updatedAt
        }
      });
    }
    
    // Update user status
    user.isActive = isActive;
    user.updatedAt = new Date();
    
    // Optional: Add status change history if you want to track status changes
    if (!user.statusHistory) {
      user.statusHistory = [];
    }
    
    user.statusHistory.push({
      status: isActive,
      changedAt: new Date(),
      reason: reason || (isActive ? 'Activated by admin' : 'Deactivated by admin')
    });
    
    await user.save();
    
    // Return success response
    return successResponse({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        lastUpdated: user.updatedAt
      }
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return errorResponse("Failed to update user status: " + error.message, 500);
  }
}

// PUT /api/admin/users/status/bulk - Update multiple users' statuses at once
export async function PUT(request) {
  try {
    await dbConnect();
    
    // Ensure the request is from an admin
    const { authenticated, response } = await authenticateAdmin(request);
    if (!authenticated) {
      return response;
    }
    
    const { userIds, isActive, reason } = await request.json();
    
    // Validate inputs
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return errorResponse("At least one user ID is required", 400);
    }
    
    if (isActive === undefined || isActive === null) {
      return errorResponse("Active status is required", 400);
    }
    
    // Update all specified users
    const updateResults = await Promise.all(
      userIds.map(async (userId) => {
        try {
          const user = await User.findById(userId);
          
          if (!user) {
            return {
              id: userId,
              success: false,
              message: "User not found"
            };
          }
          
          // Update user status
          user.isActive = isActive;
          user.updatedAt = new Date();
          
          // Optional: Add status change history
          if (!user.statusHistory) {
            user.statusHistory = [];
          }
          
          user.statusHistory.push({
            status: isActive,
            changedAt: new Date(),
            reason: reason || (isActive ? 'Bulk activated by admin' : 'Bulk deactivated by admin')
          });
          
          await user.save();
          
          return {
            id: userId,
            success: true,
            name: user.name,
            email: user.email,
            isActive: user.isActive
          };
        } catch (err) {
          return {
            id: userId,
            success: false,
            message: err.message
          };
        }
      })
    );
    
    // Count successful updates
    const successCount = updateResults.filter(result => result.success).length;
    
    return successResponse({
      message: `${successCount} out of ${userIds.length} users ${isActive ? 'activated' : 'deactivated'} successfully`,
      results: updateResults
    });
  } catch (error) {
    console.error("Error updating user statuses in bulk:", error);
    return errorResponse("Failed to update user statuses: " + error.message, 500);
  }
} 