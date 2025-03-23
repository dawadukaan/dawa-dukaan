import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import FCMToken from '@/lib/db/models/FCMToken';
import User from '@/lib/db/models/User';
import admin from '@/lib/firebase/adminApp';
import { authenticateAdmin } from '@/lib/api/authMiddleware';
import { successResponse, errorResponse } from '@/lib/api/apiResponse';
import Notification from '@/lib/db/models/Notification';

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
      onlyWithTokens,
      type = 'alert' // Default to 'alert' if not specified
    } = requestData || {};
    
    // Validate notification type against schema enum
    const validTypes = ['alert', 'order', 'message'];
    const notificationType = validTypes.includes(type) ? type : 'alert';
    
    if (!title || !body) {
      return errorResponse('Title and body are required', 400);
    }
    
    let tokensToSend = [];
    let targetUserIds = [];
    
    try {
      // Case 1: User already provided tokens from the client
      if (tokens && Array.isArray(tokens) && tokens.length > 0) {
        console.log(`Using ${tokens.length} tokens provided by client`);
        tokensToSend = tokens;
        
        // If userIds were also provided, use those for saving notifications
        if (userIds && Array.isArray(userIds)) {
          targetUserIds = userIds;
        } else {
          // Otherwise, we need to find users associated with these tokens
          const tokenDocs = await FCMToken.find({ token: { $in: tokens } }).distinct('user');
          targetUserIds = tokenDocs.map(id => id.toString());
        }
      } 
      // Case 2: Specific user ID provided
      else if (userId) {
        console.log(`Finding tokens for specific user: ${userId}`);
        const fcmTokens = await FCMToken.find({ user: userId });
        tokensToSend = fcmTokens.map(t => t.token);
        targetUserIds = [userId];
      } 
      // Case 3: Multiple user IDs provided
      else if (userIds && Array.isArray(userIds) && userIds.length > 0) {
        console.log(`Finding tokens for ${userIds.length} users`);
        const fcmTokens = await FCMToken.find({ user: { $in: userIds } });
        tokensToSend = fcmTokens.map(t => t.token);
        targetUserIds = userIds;
      } 
      // Case 4: Send to all users
      else {
        console.log('Finding tokens for all users');
        const fcmTokens = await FCMToken.find({});
        tokensToSend = fcmTokens.map(t => t.token);
        
        // Get all users for saving notifications
        const allUsers = await User.find({}).select('_id');
        targetUserIds = allUsers.map(user => user._id.toString());
      }
      
      // If we have users but no tokens, still create notifications in the database
      if (targetUserIds.length > 0 && tokensToSend.length === 0) {
        console.log(`No FCM tokens found, but will create database notifications for ${targetUserIds.length} users`);
        
        // Save notifications to database for each target user
        const notificationSavePromises = targetUserIds.map(userId => {
          try {
            return Notification.create({
              user: userId,
              title,
              body,
              type: notificationType,
              data: data || {}
            });
          } catch (err) {
            console.error(`Error creating notification for user ${userId}:`, err);
            return Promise.resolve(null);
          }
        });
        
        // Save all notifications in parallel
        const savedNotifications = await Promise.all(notificationSavePromises);
        const validSavedNotifications = savedNotifications.filter(n => n !== null);
        
        console.log(`Saved ${validSavedNotifications.length} notifications to database`);
        
        return successResponse({
          message: 'Notifications saved to database only (no FCM tokens available)',
          notificationsSaved: validSavedNotifications.length,
          fcmSent: false
        });
      } else if (tokensToSend.length === 0) {
        return errorResponse('No FCM tokens found for target users', 404);
      }
      
      // Save notifications to database for each target user
      const notificationSavePromises = targetUserIds.map(userId => {
        try {
          return Notification.create({
            user: userId,
            title,
            body,
            type: notificationType,
            data: data || {}
          });
        } catch (err) {
          console.error(`Error creating notification for user ${userId}:`, err);
          // We continue even if saving fails for some users
          return Promise.resolve(null);
        }
      });
      
      // Save all notifications in parallel
      const savedNotifications = await Promise.all(notificationSavePromises);
      const validSavedNotifications = savedNotifications.filter(n => n !== null);
      
      console.log(`Saved ${validSavedNotifications.length} notifications to database`);
      
      // Only proceed with sending FCM notifications if we have tokens
      if (tokensToSend.length > 0) {
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
          notificationsSaved: validSavedNotifications.length,
        });
      } else {
        // If we only saved to database but didn't send FCM notifications
        return successResponse({
          message: 'Notifications saved to database',
          notificationsSaved: validSavedNotifications.length,
          fcmSent: false
        });
      }
    } catch (innerError) {
      console.error('Error in notification processing:', innerError);
      return errorResponse(`Notification error: ${innerError.message}`, 500);
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
    return errorResponse('Failed to send notifications', 500);
  }
}