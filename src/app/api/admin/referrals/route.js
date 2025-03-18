import dbConnect from "@/lib/db/connect";
import Referral from "@/lib/db/models/Referral";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";

export async function GET(request) {
  try {
    await dbConnect();
    
    // Authenticate as admin
    const { authenticated, response } = await authenticateAdmin(request);
    if (!authenticated) {
      return response;
    }
    
    // Handle pagination
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Optional filters
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    
    // Build query object
    const query = {};
    if (search) {
      query.$or = [
        { referralCode: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total for pagination
    const total = await Referral.countDocuments(query);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Fetch referrals with pagination and populated fields
    const referrals = await Referral.find(query)
      .populate('user', 'name email avatar referralCommissionPercentage')
      .populate('referredBy', 'name email avatar')
      .populate('referees.user', 'name email avatar createdAt')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Format data for response
    const formattedReferrals = referrals.map(ref => ({
      id: ref._id,
      referralCode: ref.referralCode,
      user: ref.user ? {
        id: ref.user._id,
        name: ref.user.name,
        email: ref.user.email,
        avatar: ref.user.avatar,
        referralCommissionPercentage: ref.user.referralCommissionPercentage || 0
      } : null,
      referredBy: ref.referredBy ? {
        id: ref.referredBy._id,
        name: ref.referredBy.name,
        email: ref.referredBy.email,
        avatar: ref.referredBy.avatar
      } : null,
      referees: (ref.referees || []).map(referee => ({
        id: referee.user?._id,
        name: referee.user?.name,
        email: referee.user?.email,
        avatar: referee.user?.avatar,
        registeredAt: referee.registeredAt,
        status: referee.status
      })),
      stats: ref.stats,
      createdAt: ref.createdAt,
      updatedAt: ref.updatedAt
    }));
    
    return successResponse({
      referrals: formattedReferrals,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching admin referrals:", error);
    return errorResponse("Failed to fetch referrals: " + error.message, 500);
  }
} 