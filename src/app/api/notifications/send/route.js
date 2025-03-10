import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import FCMToken from '@/lib/db/models/FCMToken';
import User from '@/lib/db/models/User';
import admin from '@/lib/firebase/adminApp';
import { authenticateAdmin } from '@/lib/api/authMiddleware';
import { successResponse, errorResponse } from '@/lib/api/apiResponse';

export async function POST(request) {
  try {
    await dbConnect();
    // Authenticate admin
    const { authenticated, authResponse } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return authResponse;
    }
    
    const { userId, title, body, data } = await request.json();
    
    if (!title || !body) {
      return errorResponse('Title and body are required', 400);
    }
    
    let tokens = [];
    
    // If userId is provided, send to specific user
    if (userId) {
      const fcmTokens = await FCMToken.find({ user: userId });
      tokens = fcmTokens.map(t => t.token);
      
      if (tokens.length === 0) {
        return errorResponse('No FCM tokens found for this user', 404);
      }
    } else {
      // Send to all users (admin broadcast)
      const fcmTokens = await FCMToken.find({});
      tokens = fcmTokens.map(t => t.token);
      
      if (tokens.length === 0) {
        return errorResponse('No FCM tokens found', 404);
      }
    }
    
    // Prepare notification message
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      tokens: tokens,
    };
    
    // Send the message
    const response = await admin.messaging().sendMulticast(message);
    
    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      
      // Remove failed tokens from database
      if (failedTokens.length > 0) {
        await FCMToken.deleteMany({ token: { $in: failedTokens } });
      }
    }
    
    return successResponse({
      message: 'Notifications sent successfully',
      success: response.successCount,
      failure: response.failureCount,
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return errorResponse('Failed to send notifications', 500);
  }
}