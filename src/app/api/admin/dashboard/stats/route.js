import dbConnect from "@/lib/db/connect";
import Order from "@/lib/db/models/Order";
import Product from "@/lib/db/models/Product";
import User from "@/lib/db/models/User";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateAdmin, checkPermission } from "@/lib/api/authMiddleware";

// GET /api/admin/dashboard/stats
export async function GET(request) {
  try {
    await dbConnect();
    const { authenticated, response, session } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    // Check if user has permission to view analytics
    if (!await checkPermission(session, 'viewAnalytics')) {
      return errorResponse("You don't have permission to view analytics", 403);
    }
    
    // Get total sales
    const totalSales = await Order.aggregate([
      { $match: { status: { $nin: ['Cancelled', 'Returned'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    // Get total orders
    const totalOrders = await Order.countDocuments();
    
    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get low stock products
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });
    
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get sales by date (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const salesByDate = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sevenDaysAgo },
          status: { $nin: ['Cancelled', 'Returned'] }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    return successResponse({
      totalSales: totalSales.length > 0 ? totalSales[0].total : 0,
      totalOrders,
      ordersByStatus: ordersByStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      lowStockProducts,
      totalUsers,
      recentOrders,
      salesByDate
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return errorResponse("Failed to fetch dashboard stats", 500);
  }
}