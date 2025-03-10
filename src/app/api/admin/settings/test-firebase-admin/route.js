import { NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/api/authMiddleware';
import { successResponse, errorResponse } from '@/lib/api/apiResponse';
import { saveSettings } from '@/lib/db/services/settingsService';
import admin from 'firebase-admin';

export async function POST(request) {
  try {
    // Authenticate admin
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    // Get Firebase Admin config from request
    const config = await request.json();
    
    // Validate required fields
    if (!config.projectId || !config.clientEmail || !config.privateKey) {
      return errorResponse('Missing required Firebase Admin configuration fields', 400);
    }
    
    // Test the configuration by trying to initialize Firebase Admin
    try {
      // Create a unique app name for testing
      const appName = `test-admin-app-${Date.now()}`;
      
      // Check if an app with this name already exists
      if (admin.apps.find(app => app.name === appName)) {
        admin.app(appName).delete();
      }
      
      // Initialize a new Firebase Admin app with the provided credentials
      const testApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.projectId,
          clientEmail: config.clientEmail,
          privateKey: config.privateKey.replace(/\\n/g, '\n'),
        }),
      }, appName);
      
      // Try to access a Firebase service to verify the credentials
      await testApp.auth().listUsers(1);
      
      // Clean up the test app
      await testApp.delete();
      
      // Save the Firebase Admin config to the database
      await saveSettings('firebase-admin', config);
      
      return successResponse({ 
        message: 'Firebase Admin configuration validated and saved successfully'
      });
    } catch (error) {
      console.error('Firebase Admin configuration test error:', error);
      return errorResponse(`Failed to validate Firebase Admin configuration: ${error.message}`, 500);
    }
  } catch (error) {
    console.error('Error testing Firebase Admin connection:', error);
    return errorResponse(`Failed to test Firebase Admin connection: ${error.message}`, 500);
  }
} 