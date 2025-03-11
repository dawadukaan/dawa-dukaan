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
    
    // Parse query parameters
    const url = new URL(request.url);
    const range = url.searchParams.get('range') || 'today';
    
    // Calculate date ranges
    const { currentStart, currentEnd, previousStart, previousEnd } = getDateRanges(range);
    
    // Get total sales for current period
    const currentSales = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: currentStart, $lte: currentEnd },
          status: { $nin: ['Cancelled', 'Returned'] } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    // Get total sales for previous period
    const previousSales = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: previousStart, $lte: previousEnd },
          status: { $nin: ['Cancelled', 'Returned'] } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    // Get total orders for current period
    const currentOrders = await Order.countDocuments({
      createdAt: { $gte: currentStart, $lte: currentEnd }
    });
    
    // Get total orders for previous period
    const previousOrders = await Order.countDocuments({
      createdAt: { $gte: previousStart, $lte: previousEnd }
    });
    
    // Get total users for current period
    const currentUsers = await User.countDocuments({
      createdAt: { $lte: currentEnd }
    });
    
    // Get total users for previous period
    const previousUsers = await User.countDocuments({
      createdAt: { $lte: previousEnd }
    });
    
    // Get low stock products
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });
    
    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get sales by date for the current period
    const salesByDate = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: currentStart, $lte: currentEnd },
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
    
    // Get top selling products
    const topProducts = await Order.aggregate([
      { $match: { status: { $nin: ['Cancelled', 'Returned'] } } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          totalSold: { $sum: '$orderItems.quantity' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);
    
    // Get customer growth by month
    const customerGrowth = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          new: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          pipeline: [
            { $match: { lastLogin: { $exists: true } } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$lastLogin' } },
                active: { $sum: 1 }
              }
            }
          ],
          as: 'activeUsers'
        }
      },
      {
        $addFields: {
          active: {
            $ifNull: [
              { $arrayElemAt: ['$activeUsers.active', 0] },
              0
            ]
          }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 6 }
    ]);
    
    return successResponse({
      totalSales: currentSales.length > 0 ? currentSales[0].total : 0,
      totalOrders: currentOrders,
      lowStockProducts,
      totalUsers: currentUsers,
      recentOrders,
      salesByDate,
      topProducts,
      customerGrowth,
      salesComparison: {
        currentPeriod: currentSales.length > 0 ? currentSales[0].total : 0,
        previousPeriod: previousSales.length > 0 ? previousSales[0].total : 0
      },
      ordersComparison: {
        currentPeriod: currentOrders,
        previousPeriod: previousOrders
      },
      usersComparison: {
        currentPeriod: currentUsers,
        previousPeriod: previousUsers
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return errorResponse("Failed to fetch dashboard stats", 500);
  }
}

// Helper function to calculate date ranges based on selected range
function getDateRanges(range) {
  const now = new Date();
  let currentStart, currentEnd, previousStart, previousEnd;
  
  switch (range) {
    case 'today':
      currentStart = new Date(now.setHours(0, 0, 0, 0));
      currentEnd = new Date();
      previousStart = new Date(now);
      previousStart.setDate(previousStart.getDate() - 1);
      previousStart.setHours(0, 0, 0, 0);
      previousEnd = new Date(now);
      previousEnd.setDate(previousEnd.getDate() - 1);
      previousEnd.setHours(23, 59, 59, 999);
      break;
      
    case 'week':
      currentStart = new Date(now);
      currentStart.setDate(currentStart.getDate() - currentStart.getDay());
      currentStart.setHours(0, 0, 0, 0);
      currentEnd = new Date();
      previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - 7);
      previousEnd = new Date(currentStart);
      previousEnd.setDate(previousEnd.getDate() - 1);
      previousEnd.setHours(23, 59, 59, 999);
      break;
      
    case 'month':
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      currentEnd = new Date();
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
      
    case 'year':
      currentStart = new Date(now.getFullYear(), 0, 1);
      currentEnd = new Date();
      previousStart = new Date(now.getFullYear() - 1, 0, 1);
      previousEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      break;
      
    default:
      currentStart = new Date(now.setHours(0, 0, 0, 0));
      currentEnd = new Date();
      previousStart = new Date(now);
      previousStart.setDate(previousStart.getDate() - 1);
      previousStart.setHours(0, 0, 0, 0);
      previousEnd = new Date(now);
      previousEnd.setDate(previousEnd.getDate() - 1);
      previousEnd.setHours(23, 59, 59, 999);
  }
  
  return { currentStart, currentEnd, previousStart, previousEnd };
}