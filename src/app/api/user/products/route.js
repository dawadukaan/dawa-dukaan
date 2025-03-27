// src/app/api/user/products/route.js
import dbConnect from "@/lib/db/connect";
import Product from "@/lib/db/models/Product";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateUser } from "@/lib/api/authMiddleware";

// GET /api/user/products
export async function GET(request) {
  try {
    await dbConnect();
    
    // Authenticate user
    const { authenticated, session, response } = await authenticateUser(request, true);
    
    if (!authenticated) {
      return response;
    }
    
    const { searchParams } = new URL(request.url);
    
    // Get userType from query params (optional)
    const userTypeParam = searchParams.get('userType');
    
    // Determine pricing display based on userType parameter
    let isLicensed = false;
    
    if (userTypeParam) {
      isLicensed = userTypeParam === 'licensee';
    } else {
      // If no userType specified, use the user's actual type
      isLicensed = session?.user?.type === 'licensee';
    }
    
    // Build query - always show all products regardless of user type
    const query = {
      publishStatus: 'published',
      stock: { $gt: 0 }
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
    
    // Transform products to include pricing based on userType
    const transformedProducts = products.map(product => {
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
      
      // Filter price fields based on user type
      if (isLicensed) {
        // For licensee users, only include licensee prices
        productObj.price = { licensedPrice: productObj.price.licensedPrice };
        
        if (productObj.salePrice) {
          productObj.salePrice = { licensedPrice: productObj.salePrice.licensedPrice };
        }
        
        if (productObj.discountPercentage) {
          productObj.discountPercentage = { licensedDiscount: productObj.discountPercentage.licensedDiscount };
        }
      } else {
        // For unlicensed users, only include unlicensed prices
        productObj.price = { unlicensedPrice: productObj.price.unlicensedPrice };
        
        if (productObj.salePrice) {
          productObj.salePrice = { unlicensedPrice: productObj.salePrice.unlicensedPrice };
        }
        
        if (productObj.discountPercentage) {
          productObj.discountPercentage = { unlicensedDiscount: productObj.discountPercentage.unlicensedDiscount };
        }
      }
      
      // Flag prescription-required products
      productObj.requiresLicense = product.prescriptionRequired;
      
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
      userType: userTypeParam ? (isLicensed ? 'licensee' : 'unlicensed') : 'all'
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return errorResponse("Failed to fetch products", 500);
  }
}