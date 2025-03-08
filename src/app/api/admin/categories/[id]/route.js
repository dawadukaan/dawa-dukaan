// src/app/api/admin/categories/[id]/route.js
import dbConnect from "@/lib/db/connect";
import Category from "@/lib/db/models/Category";
import Product from "@/lib/db/models/Product";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";
import mongoose from 'mongoose';

// GET /api/admin/categories/[id]
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
      return errorResponse("Invalid category ID", 400);
    }
    
    const category = await Category.findById(id);
    
    if (!category) {
      return errorResponse("Category not found", 404);
    }
    
    // Get product count for this category
    const productCount = await Product.countDocuments({
      $or: [
        { primaryCategory: id },
        { categories: id }
      ],
      isActive: true
    });
    
    // Get featured products in this category (limit to 5)
    const featuredProducts = await Product.find({
      $or: [
        { primaryCategory: id },
        { categories: id }
      ],
      featured: true,
      isActive: true
    })
    .select('name slug images price salePrice stockStatus')
    .limit(5);
    
    // Enhance the response with product information
    const enhancedCategory = {
      ...category.toObject(),
      productCount,
      featuredProducts,
      hasProducts: productCount > 0
    };
    
    return successResponse(enhancedCategory);
  } catch (error) {
    console.error("Error fetching category:", error);
    return errorResponse("Failed to fetch category", 500);
  }
}

// PUT /api/admin/categories/[id]
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
      return errorResponse("Invalid category ID", 400);
    }
    
    // Get the original category first
    const originalCategory = await Category.findById(id);
    if (!originalCategory) {
      return errorResponse("Category not found", 404);
    }
    
    const data = await request.json();
    
    // Check if slug is being changed and if new slug already exists
    if (data.slug && data.slug !== originalCategory.slug) {
      const existingCategory = await Category.findOne({ 
        slug: data.slug,
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        return errorResponse("A category with this slug already exists", 400);
      }
      
      // If slug is changing, we need to check if this will affect products
      const productsWithCategory = await Product.countDocuments({
        $or: [
          { primaryCategory: id },
          { categories: id }
        ]
      });
      
      if (productsWithCategory > 0) {
        // Add a note about products being affected
        data.slugChangeNote = `Slug changed from ${originalCategory.slug} to ${data.slug}. ${productsWithCategory} products affected.`;
      }
    }
    
    // Check if order is being changed and if new order already exists
    if (data.order !== undefined && data.order !== originalCategory.order) {
      const existingCategory = await Category.findOne({
        order: data.order,
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        // Shift other categories to make room
        await Category.updateMany(
          { order: { $gte: data.order }, _id: { $ne: id } },
          { $inc: { order: 1 } }
        );
      }
    }
    
    // Check if parent category is being changed
    if (data.parent && data.parent !== originalCategory.parent?.toString()) {
      // Validate that parent exists
      const parentExists = await Category.findById(data.parent);
      if (!parentExists) {
        return errorResponse("Parent category not found", 400);
      }
      
      // Prevent circular references
      if (data.parent === id) {
        return errorResponse("Category cannot be its own parent", 400);
      }
      
      // Check for deeper circular references
      let currentParent = data.parent;
      let depth = 0;
      const maxDepth = 5; // Prevent infinite loops
      
      while (currentParent && depth < maxDepth) {
        const parent = await Category.findById(currentParent);
        if (!parent || !parent.parent) break;
        
        if (parent.parent.toString() === id) {
          return errorResponse("Circular parent reference detected", 400);
        }
        
        currentParent = parent.parent;
        depth++;
      }
    }
    
    // If isActive is being changed to false, check for products
    if (data.isActive === false && originalCategory.isActive === true) {
      const productsCount = await Product.countDocuments({
        primaryCategory: id,
        isActive: true
      });
      
      if (productsCount > 0) {
        // Option 1: Prevent deactivation
        // return errorResponse(`Cannot deactivate category with ${productsCount} active products`, 400);
        
        // Option 2: Warn about products
        data.deactivationNote = `Category deactivated with ${productsCount} active products.`;
      }
    }
    
    const category = await Category.findByIdAndUpdate(
      id,
      { 
        ...data, 
        updatedAt: Date.now(),
        lastUpdatedBy: session?.user?.id || null
      },
      { new: true, runValidators: true }
    );
    
    // Get product count for updated category
    const productCount = await Product.countDocuments({
      $or: [
        { primaryCategory: id },
        { categories: id }
      ],
      isActive: true
    });
    
    // Enhance the response
    const enhancedCategory = {
      ...category.toObject(),
      productCount,
      hasProducts: productCount > 0
    };
    
    return successResponse(enhancedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return errorResponse(error.message || "Failed to update category", 500);
  }
}

// DELETE /api/admin/categories/[id]
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
      return errorResponse("Invalid category ID", 400);
    }
    
    // Check if category has products as primary category
    const primaryProductCount = await Product.countDocuments({ 
      primaryCategory: id,
      isActive: true
    });
    
    if (primaryProductCount > 0) {
      return errorResponse(
        `Cannot delete category that is the primary category for ${primaryProductCount} products. Reassign products first.`, 
        400
      );
    }
    
    // Check if category is used in products' categories array
    const secondaryProductCount = await Product.countDocuments({ 
      categories: id,
      isActive: true
    });
    
    // Get the category to be deleted
    const category = await Category.findById(id);
    if (!category) {
      return errorResponse("Category not found", 404);
    }
    
    // Check if category has children
    const childrenCount = await Category.countDocuments({ parent: id });
    if (childrenCount > 0) {
      return errorResponse(
        `Cannot delete category with ${childrenCount} child categories. Delete or reassign children first.`,
        400
      );
    }
    
    // If category is used as a secondary category, remove it from those products
    if (secondaryProductCount > 0) {
      await Product.updateMany(
        { categories: id },
        { $pull: { categories: id } }
      );
    }
    
    // Delete the category
    await Category.findByIdAndDelete(id);
    
    // Reorder remaining categories to maintain sequential order
    await Category.updateMany(
      { order: { $gt: category.order } },
      { $inc: { order: -1 } }
    );
    
    // Return simplified response matching the desired format
    return successResponse({ 
      message: "Category deleted successfully",
      softDelete: true
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return errorResponse("Failed to delete category", 500);
  }
}



