// src/app/api/auth/admin/register/route.js
import dbConnect from "@/lib/db/connect";
import AdminUser from "@/lib/db/models/AdminUser";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import jwt from "jsonwebtoken";

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-for-development";

// Helper function to verify JWT token
async function verifyToken(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, message: "No token provided" };
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    return { success: true, user: decoded };
  } catch (error) {
    return { success: false, message: "Invalid token" };
  }
}

export async function POST(request) {
  try {
    // Verify that the request is from a super admin
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return errorResponse("Authentication required", 401);
    }

    // Check if the current user is an admin with permission to manage users
    if (authResult.user.model !== 'AdminUser' || 
        !authResult.user.permissions?.manageUsers) {
      return errorResponse("You don't have permission to create admin users", 403);
    }

    await dbConnect();
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.password || !data.role) {
      return errorResponse("Name, email, password, and role are required", 400);
    }
    
    // Check if admin user already exists
    const existingAdmin = await AdminUser.findOne({ email: data.email });
    if (existingAdmin) {
      return errorResponse("Admin with this email already exists", 400);
    }
    
    // Create new admin user
    const adminUser = new AdminUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      phone: data.phone || '',
      createdBy: authResult.user.id,
      // Optional: custom permissions if provided
      permissions: data.permissions || undefined
    });
    
    await adminUser.save();
    
    // Don't return password in response
    const adminResponse = adminUser.toObject();
    delete adminResponse.password;
    
    return successResponse(adminResponse, 201);
  } catch (error) {
    console.error("Error registering admin user:", error);
    return errorResponse(error.message || "Failed to register admin user", 500);
  }
}