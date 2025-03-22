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
    
    const { 
      userId, 
      userIds, 
      title, 
      body, 
      data, 
      tokens, 
      userTokens,
      onlyWithTokens 
    } = requestData || {};
    
    if (!title || !body) {
      return errorResponse('Title and body are required', 400);
    }
    
    let tokensToSend = [];
    
    try {
      // Case 1: User already provided tokens from the client
      if (tokens && Array.isArray(tokens) && tokens.length > 0) {
        console.log(`Using ${tokens.length} tokens provided by client`);
        tokensToSend = tokens;
      } 
      // Case 2: Specific user ID provided
      else if (userId) {
        console.log(`Finding tokens for specific user: ${userId}`);
        const fcmTokens = await FCMToken.find({ user: userId });
        tokensToSend = fcmTokens.map(t => t.token);
      } 
      // Case 3: Multiple user IDs provided
      else if (userIds && Array.isArray(userIds) && userIds.length > 0) {
        console.log(`Finding tokens for ${userIds.length} users`);
        const fcmTokens = await FCMToken.find({ user: { $in: userIds } });
        tokensToSend = fcmTokens.map(t => t.token);
      } 
      // Case 4: Send to all users
      else {
        console.log('Finding tokens for all users');
        const fcmTokens = await FCMToken.find({});
        tokensToSend = fcmTokens.map(t => t.token);
      }
      
      if (tokensToSend.length === 0) {
        return errorResponse('No FCM tokens found for target users', 404);
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
      
      console.log(`Sending notifications to ${tokensToSend.length} tokens`);
      
      // Send to each token individually since sendMulticast may not be available
      const sendPromises = tokensToSend.map(token => {
        try {
          return messaging.send({
            ...message,
            token: token
          }).then(response => {
            return { success: true, token, response };
          }).catch(err => {
            console.error(`Error sending to token ${token}:`, err);
            return { success: false, token, error: err.message };
          });
        } catch (err) {
          console.error(`Error setting up send for token ${token}:`, err);
          return Promise.resolve({ success: false, token, error: err.message });
        }
      });
      
      const results = await Promise.all(sendPromises);
      
      // Process results
      const successResults = results.filter(r => r.success);
      const failedResults = results.filter(r => !r.success);
      
      const successCount = successResults.length;
      const failureCount = failedResults.length;
      
      // Extract failed tokens
      const failedTokens = failedResults.map(r => r.token);
      
      // Remove failed tokens from database if they exist
      if (failedTokens.length > 0) {
        console.log(`Removing ${failedTokens.length} invalid tokens from database`);
        await FCMToken.deleteMany({ token: { $in: failedTokens } });
      }
      
      return successResponse({
        message: 'Notifications processed',
        success: successCount,
        failure: failureCount,
        totalTokens: tokensToSend.length,
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