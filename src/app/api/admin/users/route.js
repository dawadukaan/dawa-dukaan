// src/app/api/admin/users/route.js
import dbConnect from "@/lib/db/connect";
import User from "@/lib/db/models/User";
// Import the Address model to ensure it's registered
import Address from "@/lib/db/models/Address";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";

// GET /api/admin/users - Get all users with pagination and filtering
export async function GET(request) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const type = url.searchParams.get('type') || '';
    const isActive = url.searchParams.get('isActive');
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type && ['licensee', 'unlicensed'].includes(type)) {
      query.type = type;
    }
    
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query with error handling for populate
    const total = await User.countDocuments(query);
    
    // Try to fetch with populate, but fallback to no populate if it fails
    let users;
    try {
      users = await User.find(query)
        .populate('defaultAddress')
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } catch (populateError) {
      console.error("Error populating addresses, fetching without populate:", populateError);
      
      // Fallback to fetching without populate
      users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }
    
    // Prepare pagination info
    const pagination = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
    
    return successResponse({ users, pagination });
  } catch (error) {
    console.error("Error fetching users:", error);
    return errorResponse("Failed to fetch users: " + error.message, 500);
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const userData = await request.json();
    
    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return errorResponse("Email already in use", 400);
    }
    
    // Create new user
    const user = await User.create({
      ...userData,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return successResponse(userResponse, 201);
  } catch (error) {
    console.error("Error creating user:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return errorResponse(validationErrors.join(', '), 400);
    }
    
    return errorResponse("Failed to create user: " + error.message, 500);
  }
}