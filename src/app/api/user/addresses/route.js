// src/app/api/users/addresses/route.js
import dbConnect from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import Address from "@/lib/db/models/Address";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateUser } from "@/lib/api/authMiddleware";

// GET /api/users/addresses
export async function GET(request) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateUser(request);
    
    if (!authenticated) {
      return response;
    }
    
    const addresses = await Address.find({ userId: session.user.id });
    console.log(addresses);
    
    return successResponse(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return errorResponse("Failed to fetch addresses", 500);
  }
}

// POST /api/users/addresses
export async function POST(request) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateUser(request);
    
    if (!authenticated) {
      return response;
    }
    
    const data = await request.json();
    const userId = session.user.id;
    
    // Validate required fields
    if (!data.addressType || !data.addressLine1 || !data.city || !data.state || !data.pincode) {
      return errorResponse("Address type, address line 1, city, state, and pincode are required", 400);
    }
    
    // Check if the user already has an address of this type
    const existingAddressWithType = await Address.findOne({ 
      userId: userId, 
      addressType: data.addressType 
    });
    
    if (existingAddressWithType) {
      return errorResponse(`You already have an address with type '${data.addressType}'. Please update the existing address or choose a different type.`, 400);
    }
    
    // Create new address
    const address = new Address({
      userId: userId,
      addressType: data.addressType,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2 || '',
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      isDefault: data.isDefault || false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    // If this address is set as default, unset any existing default addresses
    if (data.isDefault) {
      await Address.updateMany(
        { userId: userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }
    
    await address.save();
    
    // Update user's addresses array and defaultAddress if needed
    const user = await User.findById(userId);
    
    if (!user.addresses) {
      user.addresses = [];
    }
    
    user.addresses.push(address._id);
    
    // Set as default if it's the first address or isDefault is true
    if (data.isDefault || user.addresses.length === 1) {
      user.defaultAddress = address._id;
      // Ensure isDefault flag is set if this is the first address
      if (user.addresses.length === 1 && !data.isDefault) {
        address.isDefault = true;
        await address.save();
      }
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