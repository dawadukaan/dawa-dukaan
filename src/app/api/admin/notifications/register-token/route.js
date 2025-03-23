import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import AdminFCMToken from '@/lib/db/models/AdminFCMToken';
import { authenticateAdmin } from '@/lib/api/authMiddleware';
import { successResponse, errorResponse } from '@/lib/api/apiResponse';

// Register a new FCM token for an admin user
export async function POST(request) {
  try {
    await dbConnect();
    
    // Authenticate the admin user
    const { authenticated, response, session } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    // Add error handling for empty request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return errorResponse('Invalid JSON in request body', 400);
    }
    
    const { token, device } = requestData || {};
    
    if (!token) {
      return errorResponse('FCM token is required', 400);
    }
    
    // Save or update the token
    const fcmToken = await AdminFCMToken.findOneAndUpdate(
      { user: session.user.id, token },
      { 
        user: session.user.id, 
        token, 
        device: device || 'unknown', 
        createdAt: new Date() 
      },
      { upsert: true, new: true }
    );
    
    return successResponse({ 
      message: 'FCM token registered successfully',
      tokenId: fcmToken._id
    });
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return errorResponse('Failed to register FCM token', 500);
  }
}

// Get all FCM tokens for the current admin user
export async function GET(request) {
  try {
    await dbConnect();
    
    // Authenticate the admin user
    const { authenticated, response, session } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    // Fetch all tokens for the current user
    const tokens = await AdminFCMToken.find({ user: session.user.id });
    
    return successResponse({
      tokens,
      count: tokens.length
    });
  } catch (error) {
    console.error('Error fetching FCM tokens:', error);
    return errorResponse('Failed to fetch FCM tokens', 500);
  }
}

// DELETE - Remove a token
export async function DELETE(request) {
  try {
    await dbConnect();
    
    // Authenticate the admin user
    const { authenticated, response, session } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    const url = new URL(request.url);
    const tokenId = url.searchParams.get('id');
    const allDevices = url.searchParams.get('all') === 'true';
    
    if (allDevices) {
      // Delete all tokens for this user
      const result = await AdminFCMToken.deleteMany({ user: session.user.id });
      
      return successResponse({
        message: `Deleted ${result.deletedCount} FCM tokens for your account`,
        deletedCount: result.deletedCount
      });
    } else if (tokenId) {
      // Delete a specific token (ensure it belongs to the current user)
      const result = await AdminFCMToken.findOneAndDelete({
        _id: tokenId,
        user: session.user.id
      });
      
      if (!result) {
        return errorResponse('Token not found or not owned by you', 404);
      }
      
      return successResponse({
        message: 'FCM token deleted successfully',
        deletedToken: result.token
      });
    } else {
      return errorResponse('Token ID or all=true parameter is required', 400);
    }
  } catch (error) {
    console.error('Error deleting FCM token:', error);
    return errorResponse('Failed to delete FCM token', 500);
  }
}