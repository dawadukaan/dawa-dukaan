import dbConnect from "@/lib/db/connect";
import Order from "@/lib/db/models/Order";
import Product from "@/lib/db/models/Product";
import User from "@/lib/db/models/Address";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateUser } from "@/lib/api/authMiddleware";
import mongoose from "mongoose";

// GET /api/user/orders/[id] (Get order details)
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateUser(request);
    
    if (!authenticated) {
      return response;
    }
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return errorResponse("Invalid order ID format", 400);
    }
    
    const order = await Order.findById(params.id)
      .populate('shippingAddress')
      .populate('couponApplied')
      .lean();
    
    if (!order) {
      return errorResponse("Order not found", 404);
    }
    
    // Ensure user can only access their own orders
    if (order.user.toString() !== session.user.id) {
      return errorResponse("Not authorized to access this order", 403);
    }
    
    return successResponse({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return errorResponse(error.message || "Failed to fetch order", 500);
  }
}

// PUT /api/user/orders/[id]/cancel (Cancel an order)
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateUser(request);
    
    if (!authenticated) {
      return response;
    }
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return errorResponse("Invalid order ID format", 400);
    }
    
    // Start a session for transaction
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();
    
    try {
      const order = await Order.findById(params.id).session(mongoSession);
      
      if (!order) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return errorResponse("Order not found", 404);
      }
      
      // Ensure user can only cancel their own orders
      if (order.user.toString() !== session.user.id) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return errorResponse("Not authorized to cancel this order", 403);
      }
      
      // Only allow cancellation if order is in Processing state
      if (order.status !== 'Processing') {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return errorResponse("Order cannot be cancelled in its current state", 400);
      }
      
      // Update order status
      order.status = 'Cancelled';
      
      // Add to status history
      order.statusHistory.push({
        status: 'Cancelled',
        timestamp: Date.now(),
        note: 'Cancelled by customer'
      });
      
      // Restore product stock
      const productUpdates = [];
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product).session(mongoSession);
        if (product) {
          product.stock += item.quantity;
          productUpdates.push(product.save({ session: mongoSession }));
        }
      }
      
      await Promise.all([
        order.save({ session: mongoSession }),
        ...productUpdates
      ]);
      
      // Commit transaction
      await mongoSession.commitTransaction();
      mongoSession.endSession();
      
      return successResponse({ 
        message: "Order cancelled successfully",
        order 
      });
    } catch (error) {
      // Abort transaction on error
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error cancelling order:", error);
    return errorResponse(error.message || "Failed to cancel order", 500);
  }
} 