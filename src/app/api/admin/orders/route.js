// src/app/api/admin/orders/route.js
import dbConnect from "@/lib/db/connect";
import Order from "@/lib/db/models/Order";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";
import User from "@/lib/db/models/User";
import Address from "@/lib/db/models/Address";

// GET /api/admin/orders (Get all orders with filtering)
export async function GET(request) {
  try {
    await dbConnect();
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');
    const userId = url.searchParams.get('userId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (userId) query.user = userId;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Create sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Get orders with pagination
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('shippingAddress')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Order.countDocuments(query);
    
    return successResponse({
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return errorResponse("Failed to fetch orders", 500);
  }
}

// POST /api/admin/orders (Create a new order)
export async function POST(request) {
  try {
    await dbConnect();
    const { authenticated, response, adminUser } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const data = await request.json();
    console.log("Received order data:", data);
    
    // Validate required fields
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return errorResponse("Order must contain at least one item", 400);
    }
    
    // Ensure we have a customer
    let customerId = data.customer;
    if (!customerId && !data.newCustomer) {
      return errorResponse("Customer information is required", 400);
    }
    
    // Create new customer if needed
    if (!customerId && data.newCustomer) {
      try {
        const newUser = new User({
          name: data.newCustomer.name,
          email: data.newCustomer.email || `customer_${Date.now()}@example.com`, // Fallback email if not provided
          phone: data.newCustomer.phone,
          type: data.newCustomer.type || 'unlicensed',
          role: 'customer',
          isActive: true,
          // Generate a random password for new users
          password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
        });
        
        const savedUser = await newUser.save();
        customerId = savedUser._id;
        console.log("Created new customer:", savedUser._id);
      } catch (error) {
        console.error("Error creating new customer:", error);
        return errorResponse("Failed to create new customer: " + error.message, 500);
      }
    }
    
    // Ensure we have a shipping address
    let shippingAddressId = data.shippingAddress;
    if (!shippingAddressId && !data.newAddress) {
      return errorResponse("Shipping address is required", 400);
    }
    
    // Create new address if needed
    if (!shippingAddressId && data.newAddress) {
      try {
        const newAddress = new Address({
          userId: customerId,
          location: data.newAddress.street, // Map street to location
          city: data.newAddress.city,
          state: data.newAddress.state,
          pincode: data.newAddress.pincode,
          addressType: data.newAddress.addressType || 'home',
          isDefault: true
        });
        
        const savedAddress = await newAddress.save();
        shippingAddressId = savedAddress._id;
        console.log("Created new address:", savedAddress._id);
        
        // Update user's default address if this is a new user
        if (data.newCustomer) {
          await User.findByIdAndUpdate(customerId, {
            defaultAddress: savedAddress._id,
            $push: { addresses: savedAddress._id }
          });
        }
      } catch (error) {
        console.error("Error creating new address:", error);
        return errorResponse("Failed to create new shipping address: " + error.message, 500);
      }
    }
    
    // Calculate prices for order
    const itemsPrice = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingPrice = parseFloat(data.shippingFee) || 0;
    const discount = parseFloat(data.discount) || 0;
    const totalPrice = itemsPrice + shippingPrice - discount;
    
    // Map payment method to match schema enum
    let paymentMethod = 'COD';
    if (data.paymentMethod === 'online') {
      paymentMethod = 'PhonePe'; // Default online payment to PhonePe
    }
    
    // Map status to match schema enum
    let status = 'Processing';
    if (data.status === 'pending') status = 'Processing';
    if (data.status === 'shipped') status = 'Shipped';
    if (data.status === 'delivered') status = 'Delivered';
    if (data.status === 'cancelled') status = 'Cancelled';
    
    // Create order items with required fields
    const Product = require("@/lib/db/models/Product").default;
    const orderItems = [];
    
    for (const item of data.items) {
      try {
        const product = await Product.findById(item.product);
        
        if (!product) {
          console.error(`Product with ID ${item.product} not found`);
          continue; // Skip this item but continue with the order
        }
        
        orderItems.push({
          product: item.product,
          name: product.name,
          quantity: item.quantity,
          price: item.price,
          baseQuantity: product.baseQuantity || "1",
          image: product.images && product.images.length > 0 ? product.images[0] : null
        });
      } catch (error) {
        console.error(`Error processing product ${item.product}:`, error);
        // Continue with other items
      }
    }
    
    if (orderItems.length === 0) {
      return errorResponse("No valid products found in order", 400);
    }
    
    // Generate a unique order number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    const orderNumber = `TK-${year}${month}${day}-${random}`;
    
    // Create status history without updatedBy if adminUser is undefined
    const statusHistoryEntry = {
      status: status,
      timestamp: new Date(),
      note: 'Order created'
    };
    
    // Only add updatedBy if adminUser exists and has _id
    if (adminUser && adminUser._id) {
      statusHistoryEntry.updatedBy = adminUser._id;
    }
    
    // Create the order
    const newOrder = new Order({
      orderNumber,
      user: customerId,
      orderItems: orderItems,
      shippingAddress: shippingAddressId,
      paymentMethod: paymentMethod,
      itemsPrice: itemsPrice,
      taxPrice: 0,
      shippingPrice: shippingPrice,
      totalPrice: totalPrice,
      couponDiscount: discount,
      isPaid: false,
      status: status,
      notes: data.notes || '',
      statusHistory: [statusHistoryEntry]
    });
    
    console.log("Creating order with data:", {
      orderNumber,
      user: customerId,
      itemsCount: orderItems.length,
      shippingAddress: shippingAddressId,
      paymentMethod,
      totalPrice
    });
    
    const savedOrder = await newOrder.save();
    console.log("Order created successfully:", savedOrder._id);
    
    // Populate order details for response
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('user', 'name email phone')
      .populate('shippingAddress')
      .populate('orderItems.product', 'name sku images');
    
    return successResponse({
      message: "Order created successfully",
      order: populatedOrder
    }, 201);
    
  } catch (error) {
    console.error("Error creating order:", error);
    return errorResponse("Failed to create order: " + error.message, 500);
  }
}
