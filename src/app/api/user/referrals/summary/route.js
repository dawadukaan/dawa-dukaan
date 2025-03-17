import dbConnect from "@/lib/db/connect";
import Referral from "@/lib/db/models/Referral";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateUser } from "@/lib/api/authMiddleware";

export async function GET(request) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateUser(request);
    
    if (!authenticated) {
      return response;
    }
    
    const userId = session.user.id;
    
    // Find the user's referral document
    const referral = await Referral.findOne({ user: userId })
      .select('stats referralCode referees')
      .lean();
    
    if (!referral) {
      return successResponse({
        referralCode: "",
        summary: {
          totalReferrals: 0,
          successfulReferrals: 0,
          pendingReferrals: 0,
          rewardedReferrals: 0,
          conversionRate: 0
        }
      });
    }
    
    // Count statuses
    const statusCounts = {
      pending: 0,
      completed: 0,
      rewarded: 0
    };
    
    // Count referees by status
    if (referral.referees && referral.referees.length > 0) {
      referral.referees.forEach(referee => {
        if (statusCounts[referee.status] !== undefined) {
          statusCounts[referee.status]++;
        }
      });
    }
    
    // Calculate conversion rate
    const totalReferrals = referral.stats.totalReferrals || 0;
    const conversionRate = totalReferrals > 0 
      ? (statusCounts.completed + statusCounts.rewarded) / totalReferrals * 100 
      : 0;
    
    return successResponse({
      referralCode: referral.referralCode,
      summary: {
        totalReferrals: totalReferrals,
        successfulReferrals: statusCounts.completed + statusCounts.rewarded,
        pendingReferrals: statusCounts.pending,
        rewardedReferrals: statusCounts.rewarded,
        conversionRate: parseFloat(conversionRate.toFixed(2))
      }
    });
  } catch (error) {
    console.error("Error fetching referral summary:", error);
    return errorResponse("Failed to fetch referral summary: " + error.message, 500);
  }
} 