import dbConnect from "@/lib/db/connect";
import Review from "@/lib/db/models/Review";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin, checkPermission } from "@/lib/api/authMiddleware";

// GET /api/admin/reviews
export async function GET(request) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    // Check if user has permission to manage products
    if (!await checkPermission(session, 'manageProducts')) {
      return errorResponse("You don't have permission to manage reviews", 403);
    }
    
    const { searchParams } = new URL(request.url);
    
    // Filter by approval status
    const isApproved = searchParams.get('approved');
    const query = {};
    
    if (isApproved === 'true') {
      query.isApproved = true;
    } else if (isApproved === 'false') {
      query.isApproved = false;
    }
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Execute query
    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Review.countDocuments(query);
    
    return successResponse({
      reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return errorResponse("Failed to fetch reviews", 500);
  }
}