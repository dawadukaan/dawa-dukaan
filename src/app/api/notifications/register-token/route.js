import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import FCMToken from '@/lib/db/models/FCMToken';
import { authenticateUser } from '@/lib/api/authMiddleware';
import { successResponse, errorResponse } from '@/lib/api/apiResponse';

// Register a new FCM token for a user api endpoint == /api/notifications/register-token
export async function POST(request) {
  try {
    await dbConnect();
    
    // Authenticate the user
    const { authenticated, response, session } = await authenticateUser(request);
    
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
    await FCMToken.findOneAndUpdate(
      { user: session.user.id, token },
      { user: session.user.id, token, device: device || 'unknown', createdAt: new Date() },
      { upsert: true, new: true }
    );
    
    return successResponse({ message: 'FCM token registered successfully' });
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return errorResponse('Failed to register FCM token', 500);
  }
}