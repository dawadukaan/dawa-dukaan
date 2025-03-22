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
    const { authenticated, response: authResponse } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return authResponse;
    }
    
    // Parse request body with error handling
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return errorResponse('Invalid JSON in request body', 400);
    }
    
    const { userId, title, body, data } = requestData || {};
    
    if (!title || !body) {
      return errorResponse('Title and body are required', 400);
    }
    
    let tokens = [];
    
    try {
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
      
      // Check if Firebase admin is properly initialized
      if (!admin) {
        console.error('Firebase admin module is not properly imported');
        return errorResponse('Notification service configuration error', 500);
      }
      
      const messaging = admin.messaging();
      
      if (!messaging) {
        console.error('Firebase messaging is not available');
        return errorResponse('Firebase messaging service is not available', 500);
      }
      
      // Prepare notification message
      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
      };
      
      // Send to each token individually since sendMulticast may not be available
      const sendPromises = tokens.map(token => {
        try {
          return messaging.send({
            ...message,
            token: token
          });
        } catch (err) {
          console.error(`Error sending to token ${token}:`, err);
          return Promise.resolve({ success: false, token });
        }
      });
      
      const results = await Promise.allSettled(sendPromises);
      
      // Process results
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failedResults = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.success === false));
      const failureCount = failedResults.length;
      
      // Extract failed tokens
      const failedTokens = [];
      failedResults.forEach((result, idx) => {
        if (result.status === 'rejected') {
          failedTokens.push(tokens[idx]);
        } else if (result.status === 'fulfilled' && result.value.success === false) {
          failedTokens.push(result.value.token);
        }
      });
      
      // Remove failed tokens from database
      if (failedTokens.length > 0) {
        await FCMToken.deleteMany({ token: { $in: failedTokens } });
      }
      
      return successResponse({
        message: 'Notifications processed',
        success: successCount,
        failure: failureCount,
      });
    } catch (innerError) {
      console.error('Error in notification processing:', innerError);
      return errorResponse(`Notification error: ${innerError.message}`, 500);
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
    return errorResponse('Failed to send notifications', 500);
  }
}