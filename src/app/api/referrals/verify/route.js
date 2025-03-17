import dbConnect from "@/lib/db/connect";
import Referral from "@/lib/db/models/Referral";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";

export async function POST(request) {
  try {
    await dbConnect();
    
    const { referralCode, email } = await request.json();
    
    if (!referralCode) {
      return errorResponse("Referral code is required", 400);
    }
    
    // Find the referral document with this code
    const referral = await Referral.findOne({ referralCode })
      .populate('user', 'name email avatar');
    
    if (!referral) {
      return errorResponse("Invalid referral code", 404);
    }
    
    // If email is provided, check if it's the referrer's email (can't use own code)
    if (email && referral.user.email === email) {
      return errorResponse("You cannot use your own referral code", 400);
    }
    
    // Return basic info about the referrer
    return successResponse({
      valid: true,
      referrer: {
        name: referral.user.name,
        // Only show partial email for privacy
        email: referral.user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
        avatar: referral.user.avatar
      }
    });
  } catch (error) {
    console.error("Error verifying referral code:", error);
    return errorResponse("Failed to verify referral code: " + error.message, 500);
  }
} 