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
    
    // Ensure params is awaited if it's a promise
    const id = params.id;
    
    const order = await Order.findById(id)
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
    
    // Ensure params is awaited if it's a promise
    const id = params.id;
    
    const data = await request.json();
    const order = await Order.findById(id);
    
    if (!order) {
      return errorResponse("Order not found", 404);
    }
    
    // Update order status - ensure first letter is capitalized to match enum values
    if (data.status) {
      // Convert status to proper case (first letter uppercase, rest lowercase)
      const formattedStatus = data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase();
      
      // Validate that the status is one of the allowed enum values
      const validStatuses = ['Pending', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
      if (!validStatuses.includes(formattedStatus)) {
        return errorResponse(`Invalid status: ${data.status}. Valid statuses are: ${validStatuses.join(', ')}`, 400);
      }
      
      order.status = formattedStatus;
      
      // Add to status history with properly formatted status
      order.statusHistory.push({
        status: formattedStatus,
        timestamp: Date.now(),
        note: data.note || '',
        updatedBy: session.user.id
      });
      
      // If delivered, set deliveredAt
      if (formattedStatus === 'Delivered') {
        order.deliveredAt = Date.now();
      }
    }
    
    // Update payment status
    if (data.paymentStatus) {
      // Convert payment status to proper case (first letter uppercase, rest lowercase)
      const formattedPaymentStatus = data.paymentStatus.charAt(0).toUpperCase() + data.paymentStatus.slice(1).toLowerCase();
      
      // Validate that the payment status is one of the allowed enum values
      const validPaymentStatuses = ['Pending', 'Paid', 'Refunded', 'Failed'];
      if (!validPaymentStatuses.includes(formattedPaymentStatus)) {
        return errorResponse(`Invalid payment status: ${data.paymentStatus}. Valid payment statuses are: ${validPaymentStatuses.join(', ')}`, 400);
      }
      
      order.paymentStatus = formattedPaymentStatus;
      
      // Also update the isPaid field for backward compatibility
      order.isPaid = formattedPaymentStatus === 'Paid';
      
      if (formattedPaymentStatus === 'Paid' && !order.paidAt) {
        order.paidAt = Date.now();
      }
    } else if (data.isPaid !== undefined) {
      // For backward compatibility
      order.isPaid = data.isPaid;
      if (data.isPaid) {
        order.paidAt = Date.now();
        order.paymentStatus = 'Paid';
      } else {
        order.paymentStatus = 'Pending';
      }
      
      // Update payment result if provided
      if (data.paymentResult) {
        order.paymentResult = data.paymentResult;
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
    
    // Update shipping price if provided
    if (data.shippingPrice !== undefined) {
      order.shippingPrice = data.shippingPrice;
    }
    
    // Update coupon discount if provided
    if (data.couponDiscount !== undefined) {
      order.couponDiscount = data.couponDiscount;
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
    
    // Ensure params is awaited if it's a promise
    const id = params.id;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return errorResponse("Order not found", 404);
    }
    
    await Order.findByIdAndDelete(id);
    
    return successResponse({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return errorResponse("Failed to delete order", 500);
  }
}