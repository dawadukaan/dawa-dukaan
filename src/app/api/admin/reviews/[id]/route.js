import dbConnect from "@/lib/db/connect";
import Review from "@/lib/db/models/Review";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin, checkPermission } from "@/lib/api/authMiddleware";

// PUT /api/admin/reviews/[id]
export async function PUT(request, { params }) {
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
    
    const { id } = params;
    const data = await request.json();
    
    // If approving the review, add approver info
    if (data.isApproved) {
      data.approvedBy = session.user.id;
    }
    
    const review = await Review.findByIdAndUpdate(
      id,
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!review) {
      return errorResponse("Review not found", 404);
    }
    
    return successResponse(review);
  } catch (error) {
    console.error("Error updating review:", error);
    return errorResponse(error.message || "Failed to update review", 500);
  }
}

// DELETE /api/admin/reviews/[id]
export async function DELETE(request, { params }) {
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
    
    const { id } = params;
    
    const review = await Review.findByIdAndDelete(id);
    
    if (!review) {
      return errorResponse("Review not found", 404);
    }
    
    return successResponse({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return errorResponse("Failed to delete review", 500);
  }
}