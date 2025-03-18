import dbConnect from "@/lib/db/connect";
import Referral from "@/lib/db/models/Referral";
import User from "@/lib/db/models/User";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";
import mongoose from "mongoose";

// DELETE /api/admin/referrals/[id] - Delete a referral
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
      return errorResponse("Referral ID is required", 400);
    }
    
    // Find the referral to get user information before deletion
    const referral = await Referral.findById(id);
    
    if (!referral) {
      return errorResponse("Referral not found", 404);
    }
    
    const userId = referral.user;
    
    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 1. Delete the referral
      await Referral.findByIdAndDelete(id, { session });
      
      // 2. Update any referrals where this referral's user is listed as a referrer
      await Referral.updateMany(
        { referredBy: userId },
        { $unset: { referredBy: "" } },
        { session }
      );
      
      // 3. Remove this referral from any referrals where it appears in the referee array
      await Referral.updateMany(
        { "referees.user": userId },
        { $pull: { referees: { user: userId } } },
        { session }
      );
      
      // 4. Update user record to remove referral code
    //   if (userId) {
    //     await User.findByIdAndUpdate(
    //       userId,
    //       { 
    //         $unset: { referralCode: "" },
    //         referralCommissionPercentage: 0
    //       },
    //       { session }
    //     );
    //   }
      
      // Commit transaction
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
      message: "Referral deleted successfully",
      deletedReferralId: id
    });
    
  } catch (error) {
    console.error("Error deleting referral:", error);
    return errorResponse("Failed to delete referral: " + error.message, 500);
  }
} 