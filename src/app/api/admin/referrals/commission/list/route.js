import dbConnect from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";

// GET /api/admin/referrals/commission/list - Get all users with commission percentages
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
    const minCommission = parseFloat(url.searchParams.get('minCommission') || '0');
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { 
      referralCommissionPercentage: { $gte: minCommission }
    };
    
    // Count total records
    const total = await User.countDocuments(query);
    
    // Fetch users with commission percentages
    const users = await User.find(query)
      .select('name email avatar referralCode referralCommissionPercentage')
      .sort({ referralCommissionPercentage: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    return successResponse({
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        referralCode: user.referralCode,
        commissionPercentage: user.referralCommissionPercentage || 0
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching commission data:", error);
    return errorResponse("Failed to fetch commission data: " + error.message, 500);
  }
} 