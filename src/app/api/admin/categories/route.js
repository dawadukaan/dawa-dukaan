import dbConnect from "@/lib/db/connect";
import Category from "@/lib/db/models/Category";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";

// POST /api/admin/categories - Create a new category
export async function POST(request) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    let data;
    try {
      data = await request.json();
    } catch (error) {
      return errorResponse("Invalid JSON body. Please check your request format.", 400);
    }
    
    if (!data || Object.keys(data).length === 0) {
      return errorResponse("Empty request body. Category data is required.", 400);
    }
    
    if (!data.name) {
      return errorResponse("Category name is required", 400);
    }
    
    // Generate slug if not provided
    if (!data.slug) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug: data.slug });
    if (existingCategory) {
      return errorResponse("A category with this slug already exists", 400);
    }
    
    // Handle order uniqueness
    if (data.order !== undefined) {
      // Check if the order already exists
      const categoryWithSameOrder = await Category.findOne({ order: data.order });
      if (categoryWithSameOrder) {
        // Make space for the new category by shifting others
        await Category.updateMany(
          { order: { $gte: data.order } },
          { $inc: { order: 10 } }
        );
      }
    } else {
      // If no order provided, assign the next available order
      const lastCategory = await Category.findOne().sort({ order: -1 });
      data.order = lastCategory ? lastCategory.order + 10 : 10;
    }
    
    const category = new Category(data);
    await category.save();
    
    return successResponse(category, 201);
  } catch (error) {
    console.error("Error creating category:", error);
    return errorResponse(error.message || "Failed to create category", 500);
  }
}

// GET /api/admin/categories - Get all categories or a single category
export async function GET(request, context) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    // Check if we have a category ID in the params
    if (context && context.params && context.params.id) {
      // Get a single category by ID
      const { id } = context.params;
      
      const category = await Category.findById(id)
        .populate('parentCategory', 'name slug');
      
      if (!category) {
        return errorResponse("Category not found", 404);
      }
      
      return successResponse(category);
    } else {
      // Get all categories with optional filters
      const url = new URL(request.url);
      const featured = url.searchParams.get('featured');
      const parentId = url.searchParams.get('parentId');
      
      let query = {};
      
      if (featured === 'true') {
        query.featured = true;
      }
      
      if (parentId) {
        if (parentId === 'null') {
          // Get top-level categories (no parent)
          query.parentCategory = { $exists: false };
        } else {
          // Get categories with specific parent
          query.parentCategory = parentId;
        }
      }
      
      const categories = await Category.find(query)
        .sort({ order: 1, name: 1 })
        .populate('parentCategory', 'name slug');
      
      return successResponse(categories);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return errorResponse(error.message || "Failed to fetch categories", 500);
  }
}

// PUT /api/admin/categories/:id - Update a category
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const { id } = params;
    
    let data;
    try {
      data = await request.json();
    } catch (error) {
      return errorResponse("Invalid JSON body. Please check your request format.", 400);
    }
    
    if (!data || Object.keys(data).length === 0) {
      return errorResponse("Empty request body. Update data is required.", 400);
    }
    
    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return errorResponse("Category not found", 404);
    }
    
    // If slug is being updated, check for uniqueness
    if (data.slug && data.slug !== category.slug) {
      const existingCategory = await Category.findOne({ 
        slug: data.slug,
        _id: { $ne: id } // Exclude current category
      });
      
      if (existingCategory) {
        return errorResponse("A category with this slug already exists", 400);
      }
    }
    
    // If order is being updated, handle order uniqueness
    if (data.order !== undefined && data.order !== category.order) {
      // Check if the order already exists
      const categoryWithSameOrder = await Category.findOne({ 
        order: data.order,
        _id: { $ne: id } // Exclude current category
      });
      
      if (categoryWithSameOrder) {
        // Make space for the updated category by shifting others
        await Category.updateMany(
          { order: { $gte: data.order }, _id: { $ne: id } },
          { $inc: { order: 10 } }
        );
      }
    }
    
    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name slug');
    
    return successResponse(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return errorResponse(error.message || "Failed to update category", 500);
  }
}

// DELETE /api/admin/categories/:id - Delete a category
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const { id } = params;
    
    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return errorResponse("Category not found", 404);
    }
    
    // Check if category has child categories
    const childCategories = await Category.find({ parentCategory: id });
    if (childCategories.length > 0) {
      return errorResponse("Cannot delete category with child categories. Please delete or reassign child categories first.", 400);
    }
    
    // TODO: Check if category has products (if you have a Product model)
    // const products = await Product.find({ category: id });
    // if (products.length > 0) {
    //   return errorResponse("Cannot delete category with associated products. Please remove or reassign products first.", 400);
    // }
    
    // Delete the category
    await Category.findByIdAndDelete(id);
    
    return successResponse({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return errorResponse(error.message || "Failed to delete category", 500);
  }
}