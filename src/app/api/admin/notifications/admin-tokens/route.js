import dbConnect from '@/lib/db/connect';
import AdminFCMToken from '@/lib/db/models/AdminFCMToken';
import { authenticateAdmin } from '@/lib/api/authMiddleware';
import { successResponse, errorResponse } from '@/lib/api/apiResponse';

// Get all admin FCM tokens (for sending notifications to all admins)
export async function GET(request) {
  try {
    await dbConnect();
    
    // Authenticate as admin
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    let query = {};
    
    // If userId is provided, filter tokens by that user
    if (userId) {
      query.user = userId;
    }
    
    // Fetch tokens with populated user data
    const tokens = await AdminFCMToken.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    
    // Group tokens by user for easier processing
    const tokensByUser = [];
    const userMap = new Map();
    
    tokens.forEach(token => {
      const userId = token.user._id.toString();
      
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user: token.user,
          tokens: []
        });
        tokensByUser.push(userMap.get(userId));
      }
      
      userMap.get(userId).tokens.push({
        _id: token._id,
        token: token.token,
        device: token.device,
        createdAt: token.createdAt
      });
    });
    
    return successResponse({
      tokens,
      tokensByUser,
      totalTokens: tokens.length,
      uniqueUsers: tokensByUser.length
    });
  } catch (error) {
    console.error('Error fetching admin FCM tokens:', error);
    return errorResponse('Failed to fetch admin FCM tokens', 500);
  }
} 