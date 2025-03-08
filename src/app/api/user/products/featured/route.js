// src/app/api/products/featured/route.js
import dbConnect from "@/lib/db/connect";
import Product from "@/lib/db/models/Product";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";

// GET /api/products/featured
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    // Get limit parameter (default to 8)
    const limit = parseInt(searchParams.get('limit') || '8');
    
    // Query for featured products that are in stock
    const featuredProducts = await Product.find({ 
      featured: true, 
      //isActive: true,
      publishStatus: 'published',
      stockStatus: { $ne: 'out of stock' }
    })
      .select('name slug price salePrice discountPercentage images stock stockStatus onSale baseQuantity quantityUnit')
      .populate('primaryCategory', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return successResponse(featuredProducts);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return errorResponse("Failed to fetch featured products", 500);
  }
}