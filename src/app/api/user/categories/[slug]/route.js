// src/app/api/categories/[slug]/route.js
import dbConnect from "@/lib/db/connect";
import Category from "@/lib/db/models/Category";
import Product from "@/lib/db/models/Product";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";

// GET /api/categories/[slug]
export async function GET(request, context) {
  try {
    await dbConnect();
    const { slug } = context.params;
    
    const category = await Category.findOne({ slug })
      .populate('parentCategory', 'name slug');
    
    if (!category) {
      return errorResponse("Category not found", 404);
    }
    
    return successResponse(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return errorResponse("Failed to fetch category", 500);
  }
}

// PUT /api/categories/[slug] (Admin only)
export async function PUT(request, context) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const { slug } = context.params;
    const data = await request.json();
    
    // Find the current category
    const currentCategory = await Category.findOne({ slug });
    if (!currentCategory) {
      return errorResponse("Category not found", 404);
    }
    
    // If name is updated but slug isn't, generate a new slug
    if (data.name && !data.slug) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // If trying to update the slug, check if the new slug already exists
    if (data.slug && data.slug !== slug) {
      const existingCategory = await Category.findOne({ slug: data.slug });
      if (existingCategory) {
        return errorResponse("A category with this slug already exists", 400);
      }
    }
    
    // Handle order uniqueness if order is being updated
    if (data.order !== undefined && data.order !== currentCategory.order) {
      // Check if the new order already exists
      const categoryWithSameOrder = await Category.findOne({ 
        order: data.order,
        _id: { $ne: currentCategory._id } // Exclude current category
      });
      
      if (categoryWithSameOrder) {
        // Make space for the updated category by shifting others
        await Category.updateMany(
          { 
            order: { $gte: data.order },
            _id: { $ne: currentCategory._id } // Exclude current category
          },
          { $inc: { order: 10 } }
        );
      }
    }
    
    const category = await Category.findOneAndUpdate(
      { slug },
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    return successResponse(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return errorResponse(error.message || "Failed to update category", 500);
  }
}

// DELETE /api/categories/[slug] (Admin only)
export async function DELETE(request, context) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const { slug } = context.params;
    
    const category = await Category.findOne({ slug });
    
    if (!category) {
      return errorResponse("Category not found", 404);
    }
    
    // Check if category is used in products
    const productsUsingCategory = await Product.countDocuments({
      $or: [
        { primaryCategory: category._id },
        { categories: category._id }
      ]
    });
    
    if (productsUsingCategory > 0) {
      return errorResponse(
        `Cannot delete category. It is used by ${productsUsingCategory} products.`,
        400
      );
    }
    
    await Category.findOneAndDelete({ slug });
    
    return successResponse({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return errorResponse("Failed to delete category", 500);
  }
}