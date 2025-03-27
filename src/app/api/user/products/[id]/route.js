// src/app/api/user/products/[id]/route.js
import dbConnect from "@/lib/db/connect";
import Product from "@/lib/db/models/Product";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateUser } from "@/lib/api/authMiddleware";
import mongoose from "mongoose";

// GET /api/user/products/[id]
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    // Authenticate user
    const { authenticated, session, response } = await authenticateUser(request, true);
    
    if (!authenticated) {
      return response;
    }
    
    const productId = params.id;
    
    // Validate product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return errorResponse("Invalid product ID format", 400);
    }
    
    // Get userType from query params (optional)
    const { searchParams } = new URL(request.url);
    const userTypeParam = searchParams.get('userType');
    
    // Determine pricing display based on userType parameter
    let isLicensed = false;
    
    if (userTypeParam) {
      isLicensed = userTypeParam === 'licensee';
    } else {
      // If no userType specified, use the user's actual type
      isLicensed = session?.user?.type === 'licensee';
    }
    
    // Find the product
    const product = await Product.findById(productId)
      .populate('primaryCategory', 'name slug')
      .populate('categories', 'name slug');
    
    if (!product) {
      return errorResponse("Product not found", 404);
    }
    
    // Check if product is published and in stock
    if (product.publishStatus !== 'published') {
      return errorResponse("Product not available", 404);
    }
    
    if (product.stock <= 0) {
      return errorResponse("Product out of stock", 404);
    }
    
    // Transform product to include pricing based on userType
    const productObj = product.toObject();
    
    // Transform the additionalInfo Map to a regular object
    if (productObj.additionalInfo) {
      // Convert Mongoose Map to JavaScript object
      productObj.additionalInfo = Object.fromEntries(
        product.additionalInfo instanceof Map 
          ? product.additionalInfo.entries() 
          : Object.entries(productObj.additionalInfo || {})
      );
    }
    
    // Add userPrice field based on user type
    productObj.userPrice = isLicensed 
      ? productObj.price.licensedPrice 
      : productObj.price.unlicensedPrice;
    
    productObj.userSalePrice = isLicensed && productObj.salePrice?.licensedPrice
      ? productObj.salePrice.licensedPrice
      : productObj.salePrice?.unlicensedPrice || null;
    
    productObj.userDiscountPercentage = isLicensed && productObj.discountPercentage?.licensedDiscount
      ? productObj.discountPercentage.licensedDiscount
      : productObj.discountPercentage?.unlicensedDiscount || 0;
    
    // Flag prescription-required products
    productObj.requiresLicense = product.prescriptionRequired;
    
    // Find related products (same category, excluding current product)
    const relatedProducts = await Product.find({
      _id: { $ne: productId },
      categories: { $in: product.categories },
      publishStatus: 'published',
      stock: { $gt: 0 }
    })
    .populate('primaryCategory', 'name slug')
    .limit(4);
    
    // Transform related products
    const transformedRelatedProducts = relatedProducts.map(relProduct => {
      const relProductObj = relProduct.toObject();
      
      relProductObj.userPrice = isLicensed 
        ? relProductObj.price.licensedPrice 
        : relProductObj.price.unlicensedPrice;
      
      relProductObj.userSalePrice = isLicensed && relProductObj.salePrice?.licensedPrice
        ? relProductObj.salePrice.licensedPrice
        : relProductObj.salePrice?.unlicensedPrice || null;
      
      relProductObj.userDiscountPercentage = isLicensed && relProductObj.discountPercentage?.licensedDiscount
        ? relProductObj.discountPercentage.licensedDiscount
        : relProductObj.discountPercentage?.unlicensedDiscount || 0;
      
      // Flag prescription-required products
      relProductObj.requiresLicense = relProduct.prescriptionRequired;
      
      return relProductObj;
    });
    
    // Increment view count
    await Product.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } });
    
    return successResponse({
      product: productObj,
      relatedProducts: transformedRelatedProducts,
      userType: isLicensed ? 'licensee' : 'unlicensed',
      allProducts: isLicensed ? true : false
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return errorResponse("Failed to fetch product", 500);
  }
}