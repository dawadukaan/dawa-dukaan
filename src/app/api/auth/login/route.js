// src/app/api/auth/login/route.js
import dbConnect from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import AdminUser from "@/lib/db/models/AdminUser";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import jwt from "jsonwebtoken";

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-for-development";

export async function POST(request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }
    
    // First check if it's an admin user
    let user = await AdminUser.findOne({ email }).select('+password');
    let isAdmin = true;
    
    // If not found in AdminUser, check regular User
    if (!user) {
      user = await User.findOne({ email }).select('+password');
      isAdmin = false;
    }
    
    // If user not found in either model
    if (!user) {
      return errorResponse("Invalid credentials", 401);
    }
    
    // Check password
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return errorResponse("Invalid credentials", 401);
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Create token payload
    const payload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      type: user.type,
      role: isAdmin ? user.role : 'customer',
      model: isAdmin ? 'AdminUser' : 'User',
      permissions: isAdmin ? user.permissions : null,
    };
    
    // Generate token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    
    return successResponse({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: isAdmin ? user.role : 'customer',
        type: user.type,
      },
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Authentication failed", 500);
  }
}