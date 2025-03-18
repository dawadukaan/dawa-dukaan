import dbConnect from "@/lib/db/connect";
import Referral from "@/lib/db/models/Referral";
import User from "@/lib/db/models/User";
import Order from "@/lib/db/models/Order";
import { successResponse, errorResponse } from "@/lib/api/apiResponse";
import { authenticateUser } from "@/lib/api/authMiddleware";

/**
 * Get authenticated user's referral details
 * GET /api/user/referrals
 */
export async function GET(request) {
  try {
    await dbConnect();
    
    // Authenticate user
    const { authenticated, response, session } = await authenticateUser(request);
    if (!authenticated) {
      return response;
    }
    
    const userId = session.user.id;
    
    // Get the user's referral
    const referral = await Referral.findOne({ user: userId })
      .populate('user', 'name email avatar referralCommissionPercentage')
      .populate('referredBy', 'name email avatar')
      .lean();
    
    if (!referral) {
      return errorResponse("You don't have a referral profile yet", 404);
    }
    
    // Format the referral data
    const formattedReferral = {
      referralCode: referral.referralCode,
      referralUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://yoursite.com"}/register?ref=${referral.referralCode}`,
      commissionRate: referral.user?.referralCommissionPercentage || 0,
      referredBy: referral.referredBy ? {
        name: referral.referredBy.name,
        // Protect email privacy
        email: `${referral.referredBy.email.charAt(0)}***@${referral.referredBy.email.split('@')[1]}`,
        avatar: referral.referredBy.avatar
      } : null,
      createdAt: referral.createdAt
    };
    
    // Get all referred users (from referees array)
    const refereeIds = referral.referees.map(referee => referee.user);
    
    // Fetch limited user details for referees (protect privacy)
    const referees = await User.find({ _id: { $in: refereeIds } })
      .select('name avatar isActive createdAt')
      .lean();
    
    // Get basic order statistics for calculating earnings
    const refereeOrders = await Order.find({ 
      user: { $in: refereeIds },
      status: { $in: ['Delivered', 'Completed'] } // Only count completed orders for commission
    })
    .select('user totalPrice createdAt status')
    .lean();
    
    // Calculate total revenue and commission
    const totalRevenue = refereeOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const commissionEarned = (totalRevenue * (formattedReferral.commissionRate / 100)).toFixed(2);
    
    // Format referees with registration date and status only
    const formattedReferees = referees.map(referee => ({
      name: referee.name,
      avatar: referee.avatar,
      isActive: referee.isActive,
      joinedAt: referee.createdAt,
      // Calculate orders and spend for this referee
      ordersCount: refereeOrders.filter(order => order.user.toString() === referee._id.toString()).length
    }));
    
    // Calculate referral statistics
    const stats = {
      totalReferrals: referees.length,
      activeReferrals: referees.filter(referee => referee.isActive).length,
      totalOrders: refereeOrders.length,
      totalRevenue: totalRevenue,
      commissionEarned: parseFloat(commissionEarned),
      // Last 30 days stats
      last30Days: calculateLast30DaysStats(referees, refereeOrders, formattedReferral.commissionRate)
    };
    
    // Get latest orders (limited info)
    const latestOrders = refereeOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(order => {
        const refereeUser = referees.find(user => user._id.toString() === order.user.toString());
        return {
          amount: order.totalPrice,
          commission: (order.totalPrice * (formattedReferral.commissionRate / 100)).toFixed(2),
          date: order.createdAt,
          status: order.status,
          userName: refereeUser?.name || 'Unknown User'
        };
      });
    
    return successResponse({
      referral: formattedReferral,
      referees: formattedReferees,
      stats: stats,
      latestOrders: latestOrders
    });
    
  } catch (error) {
    console.error("Error fetching user referral details:", error);
    return errorResponse("Failed to fetch referral details: " + error.message, 500);
  }
}

/**
 * Calculate referral statistics for the last 30 days
 */
function calculateLast30DaysStats(referees, orders, commissionRate) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Filter referees and orders from last 30 days
  const recentReferees = referees.filter(referee => 
    new Date(referee.createdAt) >= thirtyDaysAgo
  );
  
  const recentOrders = orders.filter(order => 
    new Date(order.createdAt) >= thirtyDaysAgo
  );
  
  const recentRevenue = recentOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const recentCommission = (recentRevenue * (commissionRate / 100)).toFixed(2);
  
  return {
    newReferrals: recentReferees.length,
    orders: recentOrders.length,
    revenue: recentRevenue,
    commission: parseFloat(recentCommission)
  };
}