// /api/user/notifications get notifications by user id

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Notification from '@/lib/db/models/Notification';
import { authenticateUser } from '@/lib/api/authMiddleware';
import { successResponse, errorResponse } from '@/lib/api/apiResponse';

/**
 * GET user notifications
 * @route GET /api/user/notifications
 * @access Private - User
 */
export async function GET(request) {
  try {
    await dbConnect();
    
    // Authenticate user
    const { authenticated, session, response: authResponse } = await authenticateUser(request);
    
    if (!authenticated) {
      return authResponse;
    }
    
    const userId = session.user.id || session.user._id;
    
    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const type = url.searchParams.get('type'); // Optional filter by notification type
    const unreadOnly = url.searchParams.get('unread') === 'true';
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { user: userId };
    
    // Add type filter if provided
    if (type && ['alert', 'order', 'message'].includes(type)) {
      query.type = type;
    }
    
    // Count total notifications for pagination
    const total = await Notification.countDocuments(query);
    
    // Get notifications with pagination and sorting
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);
    
    const totalPages = Math.ceil(total / limit);
    
    return successResponse({
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return errorResponse('Failed to fetch notifications', 500);
  }
}

