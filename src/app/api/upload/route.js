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
    
    // Determine resource type based on file type
    let resourceType = 'image';
    if (file.type === 'application/pdf') {
      resourceType = 'raw';
    } else if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image or PDF files are allowed' },
        { status: 400 }
      );
    }
    
    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    // Set up upload options based on resource type
    const uploadOptions = {
      folder: folder,
      resource_type: resourceType,
      tags: ['dava-dukaan'],
      context: {
        uploaded_from: 'dashboard'
      }
    };
    
    // Add transformations for images only
    if (resourceType === 'image') {
      uploadOptions.transformation = [
        { width: 1200, crop: "limit" }, // Resize large images
        { quality: "auto:good" }, // Optimize quality
        { fetch_format: "auto" } // Convert to optimal format (webp when supported)
      ];
      uploadOptions.context.alt = 'Customer image';
    }
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64String,
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    return NextResponse.json({ 
      success: true, 
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type,
        created_at: result.created_at
      }
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
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: statusCode }
    );
  }
}