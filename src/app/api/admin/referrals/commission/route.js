import dbConnect from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import Referral from "@/lib/db/models/Referral";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";

// POST /api/admin/referrals/commission - Set commission percentage for a user
export async function POST(request) {
  try {
    await dbConnect();
    
    // Ensure the request is from an admin
    const { authenticated, response } = await authenticateAdmin(request);
    if (!authenticated) {
      return response;
    }
    
    const { userId, percentage } = await request.json();
    
    // Validate inputs
    if (!userId) {
      return errorResponse("User ID is required", 400);
    }
    
    if (percentage === undefined || percentage === null) {
      return errorResponse("Commission percentage is required", 400);
    }
    
    const commissionPercentage = parseFloat(percentage);
    if (isNaN(commissionPercentage) || commissionPercentage < 0 || commissionPercentage > 100) {
      return errorResponse("Commission percentage must be a number between 0 and 100", 400);
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse("User not found", 404);
    }
    
    // Update the user's commission percentage
    user.referralCommissionPercentage = commissionPercentage;
    await user.save();
    
    // Find or create the user's referral document
    let referral = await Referral.findOne({ user: userId });
    
    if (referral) {
      // Update the existing referral with the new lastUpdated time
      referral.updatedAt = new Date();
      await referral.save();
    }
    
    return successResponse({
      userId,
      name: user.name,
      email: user.email,
      commissionPercentage,
      message: `Commission percentage for user ${user.name} updated to ${commissionPercentage}%`
    });
  } catch (error) {
    console.error("Error setting commission percentage:", error);
    return errorResponse("Failed to set commission percentage: " + error.message, 500);
  }
} 