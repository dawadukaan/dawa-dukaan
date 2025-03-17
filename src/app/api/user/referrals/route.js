import dbConnect from "@/lib/db/connect";
import User from "@/lib/db/models/User";
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
    
    // Get user's basic info including referral code
    const user = await User.findById(userId)
      .select('name email referralCode')
      .lean();
    
    if (!user) {
      return errorResponse("User not found", 404);
    }
    
    // Get the referral document for this user
    let referral = await Referral.findOne({ user: userId })
      .populate('referredBy', 'name email avatar')
      .populate('referees.user', 'name email avatar createdAt')
      .lean();
    
    // If no referral document exists, create one
    if (!referral) {
      const newReferral = new Referral({
        user: userId,
        referralCode: user.referralCode,
        referees: [],
        stats: {
          totalReferrals: 0,
          successfulReferrals: 0
        }
      });
      
      await newReferral.save();
      referral = newReferral.toObject();
    }
    
    // Generate share text and URL
    const appName = process.env.APP_NAME || "Our Platform";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourapp.com";
    const referralUrl = `${baseUrl}/register?ref=${user.referralCode}`;
    const shareText = `Join me on ${appName}! Use my referral code ${user.referralCode} to sign up.`;
    
    // Create social share links
    const encodedUrl = encodeURIComponent(referralUrl);
    const encodedText = encodeURIComponent(shareText);
    
    const shareLinks = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      email: `mailto:?subject=Join me on ${appName}&body=${encodedText}%0A%0A${referralUrl}`
    };
    
    // Format referees for the response
    const formattedReferees = (referral.referees || []).map(referee => ({
      id: referee.user?._id,
      name: referee.user?.name || 'Unknown User',
      email: referee.user?.email || '',
      avatar: referee.user?.avatar || '',
      registeredAt: referee.registeredAt,
      status: referee.status
    }));
    
    return successResponse({
      referralCode: user.referralCode,
      referralUrl,
      shareText,
      shareLinks,
      stats: referral.stats || { totalReferrals: 0, successfulReferrals: 0 },
      referredBy: referral.referredBy ? {
        id: referral.referredBy._id,
        name: referral.referredBy.name,
        email: referral.referredBy.email,
        avatar: referral.referredBy.avatar
      } : null,
      referees: formattedReferees
    });
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return errorResponse("Failed to fetch referrals: " + error.message, 500);
  }
} 