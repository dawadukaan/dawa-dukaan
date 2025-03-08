import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import env from '@/lib/config/env';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'category-images'; // Allow custom folder
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }
    
    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    // Upload to Cloudinary with transformations
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64String,
        {
          folder: folder,
          resource_type: 'image',
          transformation: [
            { width: 1200, crop: "limit" }, // Resize large images
            { quality: "auto:good" }, // Optimize quality
            { fetch_format: "auto" } // Convert to optimal format (webp when supported)
          ],
          // Add tags for better organization
          tags: ['category', 'dava-dukaan'],
          // Add context metadata
          context: {
            alt: 'Category image',
            uploaded_from: 'dashboard'
          }
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    return NextResponse.json({ 
      success: true, 
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
      created_at: result.created_at
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to upload file';
    let statusCode = 500;
    
    if (error.message) {
      errorMessage = error.message;
      
      // Handle specific Cloudinary errors
      if (error.http_code) {
        statusCode = error.http_code;
      }
      
      if (error.name === 'AbortError') {
        errorMessage = 'Upload was aborted';
        statusCode = 499; // Client Closed Request
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: statusCode }
    );
  }
}