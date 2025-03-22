// Get all FCM tokens api endpoint == /api/admin/notifications/fcm-tokens
import dbConnect from "@/lib/db/connect";
import FCMToken from "@/lib/db/models/FCMToken";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";

/**
 * GET /api/admin/notifications/fcm-tokens
 * Returns all FCM tokens with populated user information
 */
export async function GET(request) {
  try {
    await dbConnect();
    
    // Authenticate the admin user
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    // Parse query parameters for potential filtering
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const active = url.searchParams.get('active');
    
    // Build query
    const query = {};
    
    // Filter by user if specified
    if (userId) {
      query.user = userId;
    }
    
    // Get all FCM tokens with populated user data
    let tokens = await FCMToken.find(query)
      .populate({
        path: 'user',
        select: 'name email phone isActive role type avatar', // Select necessary user fields only
      })
      .sort({ createdAt: -1 });
    
    // Optional: Filter by active status if requested
    if (active === 'true') {
      tokens = tokens.filter(token => token.user && token.user.isActive);
    } else if (active === 'false') {
      tokens = tokens.filter(token => token.user && !token.user.isActive);
    }
    
    // Group tokens by user for better organization (optional)
    const tokensByUser = {};
    
    tokens.forEach(token => {
      if (token.user) {
        const userId = token.user._id.toString();
        if (!tokensByUser[userId]) {
          tokensByUser[userId] = {
            user: token.user,
            tokens: []
          };
        }
        tokensByUser[userId].tokens.push({
          _id: token._id,
          token: token.token,
          device: token.device,
          createdAt: token.createdAt
        });
      }
    });
    
    // Return both formats for flexibility
    return successResponse({
      tokens: tokens, // Flat list of tokens with populated user data
      tokensByUser: Object.values(tokensByUser), // Grouped by user
      totalTokens: tokens.length,
      uniqueUsers: Object.keys(tokensByUser).length
    });
  } catch (error) {
    console.error("Error fetching FCM tokens:", error);
    return errorResponse("Failed to fetch FCM tokens: " + error.message, 500);
  }
}

