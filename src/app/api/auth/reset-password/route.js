// src/app/api/auth/reset-password/route.js
import dbConnect from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import AdminUser from "@/lib/db/models/AdminUser";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";

export async function POST(request) {
  try {
    await dbConnect();
    
    // Parse request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return errorResponse('Invalid JSON in request body', 400);
    }
    
    const { email, newPassword } = requestData || {};
    
    // Validate required fields
    if (!email) {
      return errorResponse("Email is required", 400);
    }
    
    if (!newPassword) {
      return errorResponse("New password is required", 400);
    }
    
    // Basic password validation
    if (newPassword.length < 6) {
      return errorResponse("Password must be at least 6 characters", 400);
    }
    
    // First try to find the user in AdminUser collection
    let user = await AdminUser.findOne({ email }).select('+password');
    let userModel = 'AdminUser';
    
    // If not found, try regular User collection
    if (!user) {
      user = await User.findOne({ email }).select('+password');
      userModel = 'User';
      
      if (!user) {
        return errorResponse("No account found with this email", 404);
      }
    }
    
    // Update the password
    user.password = newPassword; // The pre-save hook will hash this
    user.updatedAt = new Date();
    
    await user.save();
    
    // Log for audit purposes (you may want to enhance this in production)
    console.log(`Password updated for ${userModel} with email: ${email}`);
    
    return successResponse({
      message: "Password has been updated successfully"
    });
  } catch (error) {
    console.error("Password update error:", error);
    return errorResponse("An error occurred while updating the password", 500);
  }
}
