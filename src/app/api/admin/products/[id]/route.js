// src/app/api/admin/products/[id]/route.js
import dbConnect from "@/lib/db/connect";
import Product from "@/lib/db/models/Product";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";
import mongoose from 'mongoose';

// GET /api/admin/products/[id]
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const { id } = params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid product ID", 400);
    }
    
    const product = await Product.findById(id)
      .populate('primaryCategory', 'name slug')
      .populate('categories', 'name slug')
      .populate('publishedBy', 'name email');
    
    if (!product) {
      return errorResponse("Product not found", 404);
    }
    
    return successResponse(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return errorResponse("Failed to fetch product", 500);
  }
}

// PUT /api/admin/products/[id]
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const { id } = params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid product ID", 400);
    }
    
    const data = await request.json();
    
    // Handle publish status changes
    if (data.publishStatus) {
      // If changing to published, set the publish date if not already set
      if (data.publishStatus === 'published') {
        data.publishDate = data.publishDate || new Date();
      }
      
      // If scheduling for future, ensure a publish date is provided
      if (data.publishStatus === 'scheduled' && !data.publishDate) {
        return errorResponse("Publish date is required for scheduled products", 400);
      }
    }
    
    // Check if slug is being changed and if new slug already exists
    if (data.slug) {
      const existingProduct = await Product.findOne({ 
        slug: data.slug,
        _id: { $ne: id }
      });
      
      if (existingProduct) {
        return errorResponse("A product with this slug already exists", 400);
      }
    }
    
    // Calculate discount percentages if price and salePrice are provided
    if (data.price && data.salePrice) {
      if (!data.discountPercentage) {
        data.discountPercentage = {};
      }
      
      // For licensed users
      if (data.price.licensedPrice && data.salePrice.licensedPrice) {
        data.discountPercentage.licensedDiscount = Math.round(
          ((data.price.licensedPrice - data.salePrice.licensedPrice) / data.price.licensedPrice) * 100
        );
      }
      
      // For unlicensed users
      if (data.price.unlicensedPrice && data.salePrice.unlicensedPrice) {
        data.discountPercentage.unlicensedDiscount = Math.round(
          ((data.price.unlicensedPrice - data.salePrice.unlicensedPrice) / data.price.unlicensedPrice) * 100
        );
      }
      
      // Set onSale flag if either price has a discount
      data.onSale = (
        (data.salePrice.licensedPrice && data.salePrice.licensedPrice < data.price.licensedPrice) ||
        (data.salePrice.unlicensedPrice && data.salePrice.unlicensedPrice < data.price.unlicensedPrice)
      );
    } else if (data.price && !data.salePrice) {
      // If price is updated but salePrice is removed
      data.onSale = false;
      data.discountPercentage = {
        licensedDiscount: 0,
        unlicensedDiscount: 0
      };
    }
    
    // Update stock status if stock is updated
    if (data.stock !== undefined) {
      if (data.stock <= 0) {
        data.stockStatus = 'out of stock';
      } else if (data.stock < 10) { // Assuming 10 is the threshold for low stock
        data.stockStatus = 'low stock';
      } else {
        data.stockStatus = 'in stock';
      }
    }
    
    const product = await Product.findByIdAndUpdate(
      id,
      { 
        ...data, 
        updatedAt: Date.now(),
        lastUpdatedBy: session.user.id
      },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return errorResponse("Product not found", 404);
    }
    
    return successResponse(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return errorResponse(error.message || "Failed to update product", 500);
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const { id } = params;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid product ID", 400);
    }
    
    // Hard delete the product
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return errorResponse("Product not found", 404);
    }
    
    return successResponse({ 
      message: "Product deleted successfully",
      softDelete: false
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return errorResponse("Failed to delete product", 500);
  }
}
