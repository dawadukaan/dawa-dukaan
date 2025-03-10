import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data.cloudName || !data.apiKey || !data.apiSecret) {
      return NextResponse.json({ 
        error: 'Cloud name, API key, and API secret are required' 
      }, { status: 400 });
    }
    
    // Configure cloudinary with the provided credentials
    cloudinary.config({
      cloud_name: data.cloudName,
      api_key: data.apiKey,
      api_secret: data.apiSecret,
      secure: true
    });
    
    // Test the connection by requesting account info
    const result = await cloudinary.api.ping();
    
    return NextResponse.json({ 
      message: 'Cloudinary connection successful',
      result
    });
  } catch (error) {
    console.error('Error testing Cloudinary connection:', error);
    return NextResponse.json({ 
      error: 'Failed to connect to Cloudinary', 
      message: error.message || 'Invalid credentials'
    }, { status: 500 });
  }
} 