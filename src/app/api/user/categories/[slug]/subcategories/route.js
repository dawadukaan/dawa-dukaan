import dbConnect from "@/lib/db/connect";
import Category from "@/lib/db/models/Category";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";

// GET /api/categories/[slug]/subcategories
export async function GET(request, context) {
  try {
    await dbConnect();
    const { slug } = context.params;
    
    // Find the parent category
    const parentCategory = await Category.findOne({ slug });
    
    if (!parentCategory) {
      return errorResponse("Category not found", 404);
    }
    
    // Find all subcategories
    const subcategories = await Category.find({ parentCategory: parentCategory._id })
      .sort({ order: 1, name: 1 });
    
    return successResponse(subcategories);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return errorResponse("Failed to fetch subcategories", 500);
  }
} 