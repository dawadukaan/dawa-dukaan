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
    
    const addresses = await Address.find({ user: session.user.id });
    
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
    
    // Create address
    const address = new Address({
      ...data,
      user: session.user.id
    });
    
    await address.save();
    
    // If this is the first address or isDefault is true, set as default
    const user = await User.findById(session.user.id);
    
    if (!user.defaultAddress || data.isDefault) {
      user.defaultAddress = address._id;
      
      // If this is set as default, unset isDefault on other addresses
      if (data.isDefault) {
        await Address.updateMany(
          { user: session.user.id, _id: { $ne: address._id } },
          { isDefault: false }
        );
      }
    }
    
    // Add to user's addresses array
    if (!user.addresses.includes(address._id)) {
      user.addresses.push(address._id);
    }
    
    await user.save();
    
    return successResponse(address, 201);
  } catch (error) {
    console.error("Error creating address:", error);
    return errorResponse(error.message || "Failed to create address", 500);
  }
}