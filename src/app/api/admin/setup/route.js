import dbConnect from "@/lib/db/connect";
import AdminUser from "@/lib/db/models/AdminUser";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";

// This endpoint should be removed after initial setup
export async function POST(request) {
  try {
    await dbConnect();
    
    // Check if any admin users already exist
    const adminCount = await AdminUser.countDocuments();
    if (adminCount > 0) {
      return errorResponse("Setup already completed. Admin users already exist.", 400);
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.password) {
      return errorResponse("Name, email, and password are required", 400);
    }
    
    // Create first admin user (always with full admin role)
    const adminUser = new AdminUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'admin',
      phone: data.phone || '',
      permissions: {
        manageProducts: true,
        manageCategories: true,
        manageOrders: true,
        manageUsers: true,
        manageCoupons: true,
        manageSettings: true,
        viewAnalytics: true,
      }
    });
    
    await adminUser.save();
    
    // Don't return password in response
    const adminResponse = adminUser.toObject();
    delete adminResponse.password;
    
    return successResponse({
      message: "Initial admin setup completed successfully",
      user: adminResponse
    }, 201);
  } catch (error) {
    console.error("Error in admin setup:", error);
    return errorResponse(error.message || "Failed to complete admin setup", 500);
  }
} 