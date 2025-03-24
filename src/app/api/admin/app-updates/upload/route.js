import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { authenticateAdmin } from "@/lib/api/authMiddleware";
import env from '@/lib/config/env';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret
});

export const maxDuration = 300; // Set max duration to 5 minutes
export const dynamic = 'force-dynamic';

export async function POST(request) {
  // Authenticate admin
  const { authenticated, response } = await authenticateAdmin(request);
  if (!authenticated) return response;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Check file size (limit to 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 100MB' },
        { status: 400 }
      );
    }

    // Check if file is APK by extension
    if (!file.name.toLowerCase().endsWith('.apk')) {
      return NextResponse.json(
        { error: 'Only APK files are allowed' },
        { status: 400 }
      );
    }
    
    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:application/octet-stream;base64,${buffer.toString('base64')}`;
    
    // Set up upload options with increased timeout
    const uploadOptions = {
      folder: 'app-updates',
      resource_type: 'raw',
      tags: ['app-update', 'apk'],
      context: {
        uploaded_from: 'dashboard',
        file_type: 'apk'
      },
      timeout: 120000, // 2 minute timeout
      chunk_size: 6000000, // 6MB chunks
      format: 'apk'
    };
    
    // Upload to Cloudinary with chunking for large files
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_chunked(
        base64String,
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Add progress monitoring if needed
      uploadStream.on('progress', progress => {
        console.log(`Upload progress: ${progress}%`);
      });
    });
    
    return NextResponse.json({ 
      success: true, 
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        created_at: result.created_at,
        bytes: result.bytes,
        format: result.format
      }
    });
  } catch (error) {
    console.error('Error uploading APK:', error);
    
    let errorMessage = 'Failed to upload APK file';
    let statusCode = 500;

    if (error.message === 'Request Timeout' || error.http_code === 499) {
      errorMessage = 'Upload timeout - please try again with a smaller file or better connection';
      statusCode = 408;
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