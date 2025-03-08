import dbConnect from "@/lib/db/connect";
import Address from "@/lib/db/models/Address";
import User from "@/lib/db/models/User";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";

// POST /api/admin/addresses - Create a new address
export async function POST(request) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const addressData = await request.json();
    
    // Validate required fields
    if (!addressData.userId) {
      return errorResponse("User ID is required", 400);
    }
    
    // Check if user exists
    const user = await User.findById(addressData.userId);
    if (!user) {
      return errorResponse("User not found", 404);
    }
    
    // If this is set as default, unset any existing default addresses
    if (addressData.isDefault) {
      await Address.updateMany(
        { userId: addressData.userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }
    
    // Create new address
    const address = await Address.create({
      userId: addressData.userId,
      street: addressData.street || '',
      city: addressData.city || '',
      state: addressData.state || '',
      pincode: addressData.pincode || '',
      isDefault: addressData.isDefault || false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    // Add address to user's addresses array and update defaultAddress if needed
    if (!user.addresses) {
      user.addresses = [];
    }
    
    user.addresses.push(address._id);
    
    if (addressData.isDefault) {
      user.defaultAddress = address._id;
    }
    
    await user.save();
    
    return successResponse(address, 201);
  } catch (error) {
    console.error("Error creating address:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return errorResponse(validationErrors.join(', '), 400);
    }
    
    return errorResponse("Failed to create address: " + error.message, 500);
  }
}

// GET /api/admin/addresses/:userId - Get addresses for a user
export async function GET(request) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    // Parse URL to get userId from query params
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return errorResponse("User ID is required", 400);
    }
    
    // Find addresses for the user
    const addresses = await Address.find({ userId });
    
    return successResponse(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return errorResponse("Failed to fetch addresses: " + error.message, 500);
  }
} 