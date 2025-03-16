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
    
    // Create new address with updated schema fields
    const address = await Address.create({
      userId: addressData.userId,
      addressType: addressData.addressType || 'other',
      addressLine1: addressData.addressLine1 || '',
      addressLine2: addressData.addressLine2 || '',
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

// PUT /api/admin/addresses/:id - Update an address
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    // Get the address ID from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const addressId = pathParts[pathParts.length - 1];
    
    if (!addressId) {
      return errorResponse("Address ID is required", 400);
    }
    
    const addressData = await request.json();
    
    // Find the address
    const address = await Address.findById(addressId);
    if (!address) {
      return errorResponse("Address not found", 404);
    }
    
    // If this is set as default, unset any existing default addresses
    if (addressData.isDefault) {
      await Address.updateMany(
        { userId: address.userId, isDefault: true, _id: { $ne: addressId } },
        { $set: { isDefault: false } }
      );
      
      // Update user's defaultAddress
      await User.findByIdAndUpdate(
        address.userId,
        { defaultAddress: addressId }
      );
    }
    
    // Update address fields
    address.addressType = addressData.addressType || address.addressType;
    address.addressLine1 = addressData.addressLine1 || address.addressLine1;
    address.addressLine2 = addressData.addressLine2 || '';
    address.city = addressData.city || address.city;
    address.state = addressData.state || address.state;
    address.pincode = addressData.pincode || address.pincode;
    address.isDefault = addressData.isDefault || address.isDefault;
    address.updatedAt = Date.now();
    
    await address.save();
    
    return successResponse(address);
  } catch (error) {
    console.error("Error updating address:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return errorResponse(validationErrors.join(', '), 400);
    }
    
    return errorResponse("Failed to update address: " + error.message, 500);
  }
} 