// src/app/api/user/categories/route.js
import dbConnect from "@/lib/db/connect";
import Category from "@/lib/db/models/Category";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";

// GET /api/user/categories
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    // Filter by featured
    const featured = searchParams.get('featured');
    const query = featured === 'true' ? { featured: true } : {};
    
    // Filter by hierarchy level
    const level = searchParams.get('level');
    if (level === 'main') {
      // Main categories (no parent)
      query.parentCategory = { $exists: false };
    } else if (level === 'sub') {
      // Only subcategories (has parent)
      query.parentCategory = { $exists: true };
    }
    
    // Filter by parent category
    const parentId = searchParams.get('parent');
    if (parentId) {
      query.parentCategory = parentId;
    }
    
    let categories = await Category.find(query)
      .populate('parentCategory', 'name slug')
      .sort({ order: 1, name: 1 });
    
    return successResponse(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return errorResponse("Failed to fetch categories", 500);
  }
}

