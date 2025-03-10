import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import FCMToken from '@/lib/db/models/FCMToken';
import Notification from '@/lib/db/models/Notification';
import { authenticateAdmin } from '@/lib/api/authMiddleware';
import { successResponse, errorResponse } from '@/lib/api/apiResponse';
import { getSettings } from '@/lib/db/services/settingsService';
import admin from 'firebase-admin';

export async function POST(request) {
  try {
    await dbConnect();
    
    // Authenticate admin
    const { authenticated, response, session } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    // Get notification data from request
    const { title, body, data } = await request.json();
    
    if (!title || !body) {
      return errorResponse('Title and body are required', 400);
    }
    
    // Get admin's FCM tokens
    const fcmTokens = await FCMToken.find({ user: session.user.id });
    
    if (!fcmTokens || fcmTokens.length === 0) {
      return errorResponse('No FCM tokens found for your account. Please enable notifications in your browser first.', 404);
    }
    
    const tokens = fcmTokens.map(t => t.token);
    
    try {
      // Get Firebase Admin settings
      const firebaseAdminSettings = await getSettings('firebase-admin');
      
      if (!firebaseAdminSettings || !firebaseAdminSettings.projectId || 
          !firebaseAdminSettings.clientEmail || !firebaseAdminSettings.privateKey) {
        return errorResponse('Firebase Admin is not properly configured. Please configure it in the Firebase Admin settings page.', 400);
      }
      
      // Initialize Firebase Admin if not already initialized
      let adminApp;
      if (admin.apps.length === 0) {
        adminApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: firebaseAdminSettings.projectId,
            clientEmail: firebaseAdminSettings.clientEmail,
            privateKey: firebaseAdminSettings.privateKey.replace(/\\n/g, '\n'),
          }),
        });
      } else {
        adminApp = admin.app();
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
      
      // Save notification to database
      await Notification.create({
        user: session.user.id,
        title,
        body,
        data: data || {},
      });
      
      // Send the message
      const fcmResponse = await adminApp.messaging().sendMulticast(message);
      
      // Handle failed tokens
      if (fcmResponse.failureCount > 0) {
        const failedTokens = [];
        fcmResponse.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            console.error('FCM send error:', resp.error);
          }
        });
        
        // Remove failed tokens from database
        if (failedTokens.length > 0) {
          await FCMToken.deleteMany({ token: { $in: failedTokens } });
        }
      }
      
      return successResponse({
        message: 'Test notification sent successfully',
        success: fcmResponse.successCount,
        failure: fcmResponse.failureCount,
      });
    } catch (error) {
      console.error('Firebase messaging error:', error);
      return errorResponse(`Failed to send notification: ${error.message}`, 500);
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    return errorResponse(`Failed to send test notification: ${error.message}`, 500);
  }
} 