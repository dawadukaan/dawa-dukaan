// src/app/api/products/route.js
import dbConnect from "@/lib/db/connect";
import Product from "@/lib/db/models/Product";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateUser } from "@/lib/api/authMiddleware";

// GET /api/products - Public with user role detection
export async function GET(request) {
  try {
    await dbConnect();
    
    // Authenticate user to determine if they are licensed or not
    const { authenticated, session } = await authenticateUser(request, false); // false means don't require auth
    const isLicensed = authenticated && session?.user?.type === 'licensee';
    
    const { searchParams } = new URL(request.url);
    
    // Build query
    const query = {
      publishStatus: 'published', // Only show published products
      stock: { $gt: 0 } // Only show in-stock products
    };
    
    // Filter by category
    const category = searchParams.get('category');
    if (category) {
      query.categories = category;
    }
    
    // Filter by primary category
    const primaryCategory = searchParams.get('primaryCategory');
    if (primaryCategory) {
      query.primaryCategory = primaryCategory;
    }
    
    // Search by keyword
    const keyword = searchParams.get('keyword');
    if (keyword) {
      query.$text = { $search: keyword };
    }
    
    // Filter by prescription requirement
    // If user is not licensed, don't show prescription-required products
    if (!isLicensed) {
      query.prescriptionRequired = { $ne: true };
    }
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Sorting
    let sortOption = { updatedAt: -1 }; // Default sort by last updated
    const sort = searchParams.get('sort');
    if (sort) {
      switch (sort) {
        case 'name-asc':
          sortOption = { name: 1 };
          break;
        case 'name-desc':
          sortOption = { name: -1 };
          break;
        case 'price-asc':
          // Sort by the appropriate price based on user type
          sortOption = isLicensed 
            ? { 'price.licensedPrice': 1 } 
            : { 'price.unlicensedPrice': 1 };
          break;
        case 'price-desc':
          // Sort by the appropriate price based on user type
          sortOption = isLicensed 
            ? { 'price.licensedPrice': -1 } 
            : { 'price.unlicensedPrice': -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'popular':
          sortOption = { viewCount: -1 };
          break;
      }
    }
    
    // Execute query
    const products = await Product.find(query)
      .populate('primaryCategory', 'name slug')
      .populate('categories', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments(query);
    
    // Transform products to include only relevant pricing based on user type
    const transformedProducts = products.map(product => {
      const productObj = product.toObject();
      
      // Add a userPrice field for convenience
      productObj.userPrice = isLicensed 
        ? productObj.price.licensedPrice 
        : productObj.price.unlicensedPrice;
      
      productObj.userSalePrice = isLicensed && productObj.salePrice?.licensedPrice
        ? productObj.salePrice.licensedPrice
        : productObj.salePrice?.unlicensedPrice || null;
      
      productObj.userDiscountPercentage = isLicensed && productObj.discountPercentage?.licensedDiscount
        ? productObj.discountPercentage.licensedDiscount
        : productObj.discountPercentage?.unlicensedDiscount || 0;
      
      return productObj;
    });
    
    return successResponse({
      products: transformedProducts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      userType: isLicensed ? 'licensee' : 'unlicensed'
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return errorResponse("Failed to fetch products", 500);
  }
}