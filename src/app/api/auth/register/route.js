// src/app/api/auth/register/route.js
import dbConnect from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import jwt from "jsonwebtoken";

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-for-development";

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return errorResponse("User with this email already exists", 400);
    }

    // Create new user
    const user = new User({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone
    });
    
    await user.save();
    
    // Create token payload
    const payload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: 'customer',
      model: 'User',
      permissions: null,
    };
    
    // Generate token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    
    // Don't return password in response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return successResponse({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: 'customer'
      },
      token
    }, 201);
  } catch (error) {
    console.error("Error registering user:", error);
    return errorResponse(error.message || "Failed to register user", 500);
  }
}