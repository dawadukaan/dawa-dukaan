import dbConnect from "@/lib/db/connect";
import Referral from "@/lib/db/models/Referral";
import User from "@/lib/db/models/User";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";

/**
 * Validate a referral code
 * GET /api/referrals/validate?code=ABCD1234
 */
export async function GET(request) {
  try {
    await dbConnect();
    
    // Extract the referral code from query parameters
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return errorResponse("Referral code is required", 400);
    }
    
    // Find the referral with the provided code
    const referral = await Referral.findOne({ referralCode: code })
      .populate('user', 'name email isActive')
      .lean();
    
    if (!referral) {
      return errorResponse("Invalid referral code", 404);
    }
    
    // Check if the associated user exists and is active
    if (!referral.user) {
      return errorResponse("Referral owner no longer exists", 404);
    }
    
    if (!referral.user.isActive) {
      return errorResponse("Referral owner account is inactive", 400);
    }
    
    // Return success with basic referral information (avoid exposing sensitive data)
    return successResponse({
      valid: true
    });
    
  } catch (error) {
    console.error("Error validating referral code:", error);
    return errorResponse("Failed to validate referral code: " + error.message, 500);
  }
} 