import dbConnect from "@/lib/db/connect";
import Order from "@/lib/db/models/Order";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";

// GET /api/admin/orders/[id] (Get order details)
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const order = await Order.findById(params.id)
      .populate('user', 'name email phone')
      .populate('shippingAddress')
      .populate('couponApplied')
      .populate('statusHistory.updatedBy', 'name email phone');
    
    if (!order) {
      return errorResponse("Order not found", 404);
    }
    
    return successResponse(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return errorResponse("Failed to fetch order", 500);
  }
}

// PUT /api/admin/orders/[id] (Update order status)
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const data = await request.json();
    const order = await Order.findById(params.id);
    
    if (!order) {
      return errorResponse("Order not found", 404);
    }
    
    // Update order status
    if (data.status) {
      order.status = data.status;
      
      // Add to status history
      order.statusHistory.push({
        status: data.status,
        timestamp: Date.now(),
        note: data.note || '',
        updatedBy: session.user.id
      });
      
      // If delivered, set deliveredAt
      if (data.status === 'Delivered') {
        order.deliveredAt = Date.now();
      }
    }
    
    // Update payment status
    if (data.isPaid !== undefined) {
      order.isPaid = data.isPaid;
      if (data.isPaid) {
        order.paidAt = Date.now();
        
        // Update payment result if provided
        if (data.paymentResult) {
          order.paymentResult = data.paymentResult;
        }
      }
    }
    
    // Update delivery slot if provided
    if (data.deliverySlot) {
      order.deliverySlot = data.deliverySlot;
    }
    
    // Update notes if provided
    if (data.notes !== undefined) {
      order.notes = data.notes;
    }
    
    await order.save();
    
    return successResponse(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return errorResponse("Failed to update order", 500);
  }
}

// DELETE /api/admin/orders/[id] (Delete an order)
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const order = await Order.findById(params.id);
    
    if (!order) {
      return errorResponse("Order not found", 404);
    }
    
    await Order.findByIdAndDelete(params.id);
    
    return successResponse({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return errorResponse("Failed to delete order", 500);
  }
}