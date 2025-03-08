// src/app/api/user/orders/route.js
import dbConnect from "@/lib/db/connect";
import Order from "@/lib/db/models/Order";
import Product from "@/lib/db/models/Product";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateUser } from "@/lib/api/authMiddleware";
import mongoose from "mongoose";

// POST /api/user/orders (Create a new order)
export async function POST(request) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateUser(request);
    
    if (!authenticated) {
      return response;
    }
    
    const data = await request.json();
    
    // Validate order items and calculate prices
    let itemsPrice = 0;
    const orderItems = [];
    
    for (const item of data.orderItems) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return errorResponse(`Product not found: ${item.product}`, 400);
      }
      
      if (product.stock < item.quantity) {
        return errorResponse(`Insufficient stock for ${product.name}`, 400);
      }
      
      // Use sale price if available, otherwise use regular price
      const price = product.salePrice || product.price;
      
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: price,
        baseQuantity: product.baseQuantity,
        image: product.images[0] || '',
      });
      
      itemsPrice += price * item.quantity;
      
      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }
    
    // Calculate taxes and shipping
    const taxRate = 0.05; // 5% tax
    const taxPrice = itemsPrice * taxRate;
    
    // Free shipping for orders over 500, otherwise 50
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    
    // Calculate total
    const totalPrice = itemsPrice + taxPrice + shippingPrice;
    
    // Create order
    const order = new Order({
      user: session.user.id,
      orderItems,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      deliverySlot: data.deliverySlot,
      notes: data.notes
    });
    
    await order.save();
    
    return successResponse(order, 201);
  } catch (error) {
    console.error("Error creating order:", error);
    return errorResponse(error.message || "Failed to create order", 500);
  }
}

// Get /api/user/orders?userId= (Get user's orders)
export async function GET(request) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateUser(request);

    if (!authenticated) {
      return response;
    }

    // Parse query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    // Ensure userId is provided
    if (!userId) {
      // If no userId provided, use the authenticated user's ID
      const userId = session.user.id;
    }
    
    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return errorResponse("Invalid user ID format", 400);
    }

    // Check if user is requesting their own orders or if they're an admin
    const isOwnOrders = session.user.id === userId;
    const isAdmin = session.user.role === 'admin';
    
    if (!isOwnOrders && !isAdmin) {
      return errorResponse("Not authorized to access these orders", 403);
    }

    const orders = await Order.find({ user: userId })
      .populate('shippingAddress')
      .populate('couponApplied')
      .sort({ createdAt: -1 });

    return successResponse({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return errorResponse(error.message || "Failed to fetch orders", 500);
  }
}
