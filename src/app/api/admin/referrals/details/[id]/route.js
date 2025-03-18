import dbConnect from "@/lib/db/connect";
import Referral from "@/lib/db/models/Referral";
import User from "@/lib/db/models/User";
import Order from "@/lib/db/models/Order";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin } from "@/lib/api/authMiddleware";

// GET /api/admin/referrals/details/[id] - Get referral details with orders from referred users
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    // Authenticate as admin
    const { authenticated, response } = await authenticateAdmin(request);
    if (!authenticated) {
      return response;
    }
    
    const { id } = params;
    
    if (!id) {
      return errorResponse("Referral ID is required", 400);
    }
    
    // Get the referral
    const referral = await Referral.findById(id)
      .populate('user', 'name email avatar referralCommissionPercentage')
      .populate('referredBy', 'name email avatar')
      .lean();
    
    if (!referral) {
      return errorResponse("Referral not found", 404);
    }
    
    // Format the referral data
    const formattedReferral = {
      id: referral._id,
      referralCode: referral.referralCode,
      user: referral.user ? {
        id: referral.user._id,
        name: referral.user.name,
        email: referral.user.email,
        avatar: referral.user.avatar,
        referralCommissionPercentage: referral.user.referralCommissionPercentage || 0
      } : null,
      referredBy: referral.referredBy ? {
        id: referral.referredBy._id,
        name: referral.referredBy.name,
        email: referral.referredBy.email,
        avatar: referral.referredBy.avatar
      } : null,
      stats: referral.stats,
      createdAt: referral.createdAt,
      updatedAt: referral.updatedAt
    };
    
    // Get all referred users (from referees array)
    const refereeIds = referral.referees.map(referee => referee.user);
    
    // Fetch full user details for all referees
    const refereeUsers = await User.find({ _id: { $in: refereeIds } })
      .select('name email avatar phone isActive createdAt updatedAt')
      .lean();
    
    // Get order statistics for each referee
    const refereeStats = await Promise.all(refereeUsers.map(async (user) => {
      const userOrders = await Order.find({ user: user._id })
        .lean();
      
      const totalSpent = userOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      
      return {
        ...user,
        _id: user._id,
        orderCount: userOrders.length,
        totalSpent: totalSpent,
      };
    }));
    
    // Get all orders from referred users
    const orders = await Order.find({ user: { $in: refereeIds } })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    // Format orders data
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      userId: order.user._id,
      userName: order.user.name,
      userEmail: order.user.email,
      orderItems: order.orderItems,
      totalPrice: order.totalPrice,
      itemsPrice: order.itemsPrice,
      shippingPrice: order.shippingPrice,
      taxPrice: order.taxPrice,
      couponDiscount: order.couponDiscount || 0,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      isPaid: order.isPaid,
      paidAt: order.paidAt,
      status: order.status,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));
    
    // Calculate summary statistics
    const summaryStats = {
      totalReferees: refereeUsers.length,
      activeReferees: refereeUsers.filter(user => user.isActive).length,
      totalOrders: orders.length,
      deliveredOrders: orders.filter(order => order.status === 'Delivered').length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalPrice, 0),
      averageOrderValue: orders.length > 0 
        ? orders.reduce((sum, order) => sum + order.totalPrice, 0) / orders.length 
        : 0
    };
    
    // Return the formatted data
    return successResponse({
      referral: formattedReferral,
      referees: refereeStats,
      orders: formattedOrders,
      stats: summaryStats
    });
    
  } catch (error) {
    console.error("Error fetching referral details:", error);
    return errorResponse("Failed to fetch referral details: " + error.message, 500);
  }
} 