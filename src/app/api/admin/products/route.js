// src/app/api/admin/products/route.js
import dbConnect from "@/lib/db/connect";
import Product from "@/lib/db/models/Product";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";

// GET /api/admin/products - Admin only
export async function GET(request) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const { searchParams } = new URL(request.url);
    
    // Build query
    const query = {};
    
    // Filter by publish status
    const publishStatus = searchParams.get('publishStatus');
    if (publishStatus) {
      query.publishStatus = publishStatus;
    }
    
    // Filter by stock status
    const stockStatus = searchParams.get('stockStatus');
    if (stockStatus) {
      query.stockStatus = stockStatus;
    }
    
    // Filter by on sale
    const onSale = searchParams.get('onSale');
    if (onSale === 'true') {
      query.onSale = true;
    } else if (onSale === 'false') {
      query.onSale = false;
    }
    
    // Filter by prescription requirement
    const prescriptionRequired = searchParams.get('prescriptionRequired');
    if (prescriptionRequired === 'true') {
      query.prescriptionRequired = true;
    } else if (prescriptionRequired === 'false') {
      query.prescriptionRequired = false;
    }
    
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
        case 'price-asc-licensed':
          sortOption = { 'price.licensedPrice': 1 };
          break;
        case 'price-desc-licensed':
          sortOption = { 'price.licensedPrice': -1 };
          break;
        case 'price-asc-unlicensed':
          sortOption = { 'price.unlicensedPrice': 1 };
          break;
        case 'price-desc-unlicensed':
          sortOption = { 'price.unlicensedPrice': -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
      }
    }
    
    // Execute query
    const products = await Product.find(query)
      .populate('primaryCategory', 'name slug')
      .populate('categories', 'name slug')
      .populate('publishedBy', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments(query);
    
    // Get counts for dashboard
    const draftCount = await Product.countDocuments({ publishStatus: 'draft' });
    const publishedCount = await Product.countDocuments({ publishStatus: 'published' });
    const prescriptionRequiredCount = await Product.countDocuments({ prescriptionRequired: true });
    
    return successResponse({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      counts: {
        draft: draftCount,
        published: publishedCount,
        prescriptionRequired: prescriptionRequiredCount,
        total: draftCount + publishedCount
      }
    });
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return errorResponse("Failed to fetch products", 500);
  }
}

// POST /api/admin/products - Admin only
export async function POST(request) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const data = await request.json();
    
    // Check if slug already exists
    if (data.slug) {
      const existingProduct = await Product.findOne({ slug: data.slug });
      if (existingProduct) {
        return errorResponse("A product with this slug already exists", 400);
      }
    }
    
    // Calculate discount percentages if price and salePrice are provided
    if (data.price && data.salePrice) {
      // For licensed users
      if (data.price.licensedPrice && data.salePrice.licensedPrice) {
        if (!data.discountPercentage) {
          data.discountPercentage = {};
        }
        data.discountPercentage.licensedDiscount = Math.round(
          ((data.price.licensedPrice - data.salePrice.licensedPrice) / data.price.licensedPrice) * 100
        );
      }
      
      // For unlicensed users
      if (data.price.unlicensedPrice && data.salePrice.unlicensedPrice) {
        if (!data.discountPercentage) {
          data.discountPercentage = {};
        }
        data.discountPercentage.unlicensedDiscount = Math.round(
          ((data.price.unlicensedPrice - data.salePrice.unlicensedPrice) / data.price.unlicensedPrice) * 100
        );
      }
      
      // Set onSale flag if either price has a discount
      data.onSale = (
        (data.salePrice.licensedPrice && data.salePrice.licensedPrice < data.price.licensedPrice) ||
        (data.salePrice.unlicensedPrice && data.salePrice.unlicensedPrice < data.price.unlicensedPrice)
      );
    }
    
    // Set stock status based on stock
    if (data.stock !== undefined) {
      if (data.stock <= 0) {
        data.stockStatus = 'out of stock';
      } else if (data.stock < 10) {
        data.stockStatus = 'low stock';
      } else {
        data.stockStatus = 'in stock';
      }
    }
    
    // Set publish date if status is published
    if (data.publishStatus === 'published' && !data.publishDate) {
      data.publishDate = new Date();
    }
    
    // Create new product
    const product = new Product({
      ...data,
      publishedBy: session.user.id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    await product.save();
    
    return successResponse(product, 201);
  } catch (error) {
    console.error("Error creating product:", error);
    return errorResponse(error.message || "Failed to create product", 500);
  }
}