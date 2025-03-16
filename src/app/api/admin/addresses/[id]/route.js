// src/app/api/admin/addresses/[id]/route.js

import dbConnect from "@/lib/db/connect";
import Address from "@/lib/db/models/Address";
import User from "@/lib/db/models/User";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";

// GET /api/admin/addresses/[id] - Get a specific address
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const { id } = params;
    
    if (!id) {
      return errorResponse("Address ID is required", 400);
    }
    
    // Find the address
    const address = await Address.findById(id);
    
    if (!address) {
      return errorResponse("Address not found", 404);
    }
    
    return successResponse(address);
  } catch (error) {
    console.error("Error fetching address:", error);
    return errorResponse("Failed to fetch address: " + error.message, 500);
  }
}

// PUT /api/admin/addresses/[id] - Update an address
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const { id } = params;
    
    if (!id) {
      return errorResponse("Address ID is required", 400);
    }
    
    const addressData = await request.json();
    
    // Find the address
    const address = await Address.findById(id);
    if (!address) {
      return errorResponse("Address not found", 404);
    }
    
    // If this is set as default, unset any existing default addresses
    if (addressData.isDefault) {
      await Address.updateMany(
        { userId: address.userId, isDefault: true, _id: { $ne: id } },
        { $set: { isDefault: false } }
      );
      
      // Update user's defaultAddress
      await User.findByIdAndUpdate(
        address.userId,
        { defaultAddress: id }
      );
    }
    
    // Update address fields
    address.addressType = addressData.addressType || address.addressType;
    address.addressLine1 = addressData.addressLine1 !== undefined ? addressData.addressLine1 : address.addressLine1;
    address.addressLine2 = addressData.addressLine2 !== undefined ? addressData.addressLine2 : address.addressLine2;
    address.city = addressData.city !== undefined ? addressData.city : address.city;
    address.state = addressData.state !== undefined ? addressData.state : address.state;
    address.pincode = addressData.pincode !== undefined ? addressData.pincode : address.pincode;
    address.isDefault = addressData.isDefault !== undefined ? addressData.isDefault : address.isDefault;
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

// DELETE /api/admin/addresses/[id] - Delete an address
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const { id } = params;
    
    if (!id) {
      return errorResponse("Address ID is required", 400);
    }
    
    // Find the address
    const address = await Address.findById(id);
    
    if (!address) {
      return errorResponse("Address not found", 404);
    }
    
    // Remove address from user's addresses array
    await User.findByIdAndUpdate(
      address.userId,
      { $pull: { addresses: id } }
    );
    
    // If this was the default address, clear the default address reference
    await User.findOneAndUpdate(
      { defaultAddress: id },
      { $unset: { defaultAddress: "" } }
    );
    
    // Delete the address
    await Address.findByIdAndDelete(id);
    
    return successResponse({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    return errorResponse("Failed to delete address: " + error.message, 500);
  }
}

