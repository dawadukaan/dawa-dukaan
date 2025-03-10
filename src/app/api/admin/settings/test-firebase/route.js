import { NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/api/authMiddleware';
import { successResponse, errorResponse } from '@/lib/api/apiResponse';
import { saveSettings } from '@/lib/db/services/settingsService';
import { initializeApp } from 'firebase/app';

export async function POST(request) {
  try {
    // Authenticate admin
    const { authenticated, response } = await authenticateAdmin(request);
    
    if (!authenticated) {
      return response;
    }
    
    // Get Firebase config from request
    const config = await request.json();
    
    // Validate required fields
    if (!config.apiKey || !config.projectId || !config.messagingSenderId || !config.appId) {
      return errorResponse('Missing required Firebase configuration fields', 400);
    }
    
    // Test the configuration by trying to initialize Firebase
    try {
      // We're just testing if the config is valid, not actually using the app
      const testApp = initializeApp(config, 'test-app-' + Date.now());
      
      // If we get here, the configuration is valid
      
      // Save the Firebase web config to the database
      await saveSettings('firebase', config);
      
      return successResponse({ 
        message: 'Firebase configuration validated and saved successfully',
        note: 'For full Firebase Admin functionality, please also configure the Firebase Admin settings.'
      });
    } catch (error) {
      console.error('Firebase configuration test error:', error);
      return errorResponse(`Failed to validate Firebase configuration: ${error.message}`, 500);
    }
  } catch (error) {
    console.error('Error testing Firebase connection:', error);
    return errorResponse(`Failed to test Firebase connection: ${error.message}`, 500);
  }
} 