import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Notification from '@/lib/db/models/Notification';
import { authenticateAdmin } from '@/lib/api/authMiddleware';
import { successResponse, errorResponse } from '@/lib/api/apiResponse';

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    // Authenticate admin
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const id = params.id;
    
    // Delete the notification
    const result = await Notification.findByIdAndDelete(id);
    
    if (!result) {
      return errorResponse('Notification not found', 404);
    }
    
    return successResponse({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return errorResponse('Failed to delete notification', 500);
  }
}

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    // Authenticate admin
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const id = params.id;
    
    // Get the notification
    const notification = await Notification.findById(id).populate('user', 'name email');
    
    if (!notification) {
      return errorResponse('Notification not found', 404);
    }
    
    return successResponse({
      notification
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    return errorResponse('Failed to fetch notification', 500);
  }
} 