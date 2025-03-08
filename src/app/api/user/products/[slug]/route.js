// src/app/api/products/[slug]/route.js
import dbConnect from "@/lib/db/connect";
import Product from "@/lib/db/models/Product";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";

// GET /api/products/[slug] - Public
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { slug } = params;
    
    const product = await Product.findOne({ 
      slug, 
      publishStatus: 'published' // Only show published products
    })
      .populate('primaryCategory', 'name slug')
      .populate('categories', 'name slug')
      .populate('publishedBy', 'name email');
    
    if (!product) {
      return errorResponse("Product not found", 404);
    }
    
    // Get related products from the same primary category
    const relatedProducts = await Product.find({
      primaryCategory: product.primaryCategory._id,
      _id: { $ne: product._id },
      isActive: true,
      publishStatus: 'published', // Only show published products
      stock: { $gt: 0 }
    })
      .select('name slug price salePrice images stock stockStatus onSale')
      .limit(4);
    
    return successResponse({
      product,
      relatedProducts
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return errorResponse("Failed to fetch product", 500);
  }
}
