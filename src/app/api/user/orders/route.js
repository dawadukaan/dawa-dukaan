// src/app/api/user/orders/route.js
import dbConnect from "@/lib/db/connect";
import Order from "@/lib/db/models/Order";
import Product from "@/lib/db/models/Product";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateUser } from "@/lib/api/authMiddleware";
import mongoose from "mongoose";
import User from "@/lib/db/models/User";
import Address from "@/lib/db/models/Address";

// POST /api/user/orders (Create a new order for the authenticated user)
export async function POST(request) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateUser(request);
    
    if (!authenticated) {
      return response;
    }
    
    const data = await request.json();
    console.log("Received order data:", data);
    
    // Validate required fields
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return errorResponse("Order must contain at least one item", 400);
    }
    
    // Use the authenticated user's ID
    const userId = session.user.id;
    
    // Ensure we have a shipping address
    if (!data.shippingAddressId) {
      return errorResponse("Shipping address ID is required", 400);
    }
    
    // Verify the shipping address belongs to the user
    const address = await Address.findById(data.shippingAddressId);
    if (!address) {
      return errorResponse("Shipping address not found", 404);
    }
    
    if (address.userId.toString() !== userId) {
      return errorResponse("Unauthorized access to this address", 403);
    }
    
    // Validate and process order items
    const orderItems = [];
    let itemsPrice = 0;
    
    for (const item of data.items) {
      try {
        const product = await Product.findById(item.productId);
        
        if (!product) {
          return errorResponse(`Product with ID ${item.productId} not found`, 404);
        }
        
        // Determine price based on user type
        const user = await User.findById(userId);
        const userType = user.type || 'unlicensed';
        const price = userType === 'licensee' 
          ? (product.salePrice?.licensedPrice || product.price.licensedPrice) 
          : (product.salePrice?.unlicensedPrice || product.price.unlicensedPrice);
        
        // Validate quantity
        if (!item.quantity || item.quantity < 1) {
          return errorResponse(`Invalid quantity for product ${product.name}`, 400);
        }
        
        // Add to order items
        orderItems.push({
          product: product._id,
          name: product.name,
          quantity: item.quantity,
          price: price,
          baseQuantity: product.baseQuantity || "1",
          image: product.images && product.images.length > 0 ? product.images[0] : null
        });
        
        // Calculate item total
        itemsPrice += price * item.quantity;
      } catch (error) {
        console.error(`Error processing product ${item.productId}:`, error);
        return errorResponse(`Error processing product: ${error.message}`, 400);
      }
    }
    
    // Calculate order totals
    const shippingPrice = parseFloat(data.shippingFee) || 40; // Default shipping fee
    const taxPrice = parseFloat(data.taxPrice) || 0;
    const discount = parseFloat(data.discount) || 0;
    const totalPrice = itemsPrice + shippingPrice + taxPrice - discount;
    
    // Set payment method (validate against schema enum)
    let paymentMethod = 'COD'; // Default to COD
    if (data.paymentMethod === 'PhonePe' || data.paymentMethod === 'Razorpay') {
      paymentMethod = data.paymentMethod;
    }
    
    // Generate a unique order number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    const orderNumber = `TK-${year}${month}${day}-${random}`;
    
    // Create the order
    const newOrder = new Order({
      orderNumber,
      user: userId,
      orderItems: orderItems,
      shippingAddress: data.shippingAddressId,
      paymentMethod: paymentMethod,
      paymentStatus: 'Pending',
      itemsPrice: itemsPrice,
      taxPrice: taxPrice,
      shippingPrice: shippingPrice,
      totalPrice: totalPrice,
      isPaid: false,
      status: 'Processing', // Default status for new orders
      notes: data.notes || '',
      statusHistory: [{
        status: 'Processing',
        timestamp: new Date(),
        note: 'Order placed by customer'
      }],
      deliverySlot: data.deliverySlot || null
    });
    
    const savedOrder = await newOrder.save();
    
    // Populate order details for response
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('shippingAddress')
      .populate('couponApplied');
    
    // If this is an online payment, generate payment link/details
    let paymentDetails = null;
    if (paymentMethod !== 'COD') {
      // This would integrate with your payment gateway
      // For now, just return a placeholder
      paymentDetails = {
        paymentUrl: `https://example.com/pay/${savedOrder._id}`,
        orderId: savedOrder._id,
        amount: totalPrice
      };
    }
    
    return successResponse({
      message: "Order placed successfully",
      order: populatedOrder,
      paymentDetails
    }, 201);
    
  } catch (error) {
    console.error("Error creating order:", error);
    return errorResponse("Failed to create order: " + error.message, 500);
  }
}

// GET /api/user/orders (Get authenticated user's orders)
export async function GET(request) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateUser(request);

    if (!authenticated) {
      return response;
    }

    // Always use the authenticated user's ID from the session
    const userId = session.user.id;
    
    // Parse query parameters for optional filtering
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    
    // Build query
    const query = { user: userId };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalOrders = await Order.countDocuments(query);
    
    // Fetch orders with pagination
    const orders = await Order.find(query)
      .populate('shippingAddress')
      .populate('couponApplied')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalOrders / limit);
    
    return successResponse({
      orders,
      pagination: {
        total: totalOrders,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return errorResponse(error.message || "Failed to fetch orders", 500);
  }
}
