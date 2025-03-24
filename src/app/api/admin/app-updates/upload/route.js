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

// Change maxDuration to 60 seconds (Vercel Hobby plan limit)
export const maxDuration = 60;
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
    
    // Reduce max file size to 50MB for faster uploads
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 50MB' },
        { status: 400 }
      );
    }

    // Check if file is APK
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
    
    // Optimize upload options for faster processing
    const uploadOptions = {
      folder: 'app-updates',
      resource_type: 'raw',
      tags: ['app-update', 'apk'],
      context: {
        uploaded_from: 'dashboard',
        file_type: 'apk'
      },
      timeout: 55000, // 55 second timeout (leaving buffer for other operations)
      chunk_size: 5000000, // 5MB chunks for faster uploads
      format: 'apk'
    };
    
    // Upload to Cloudinary with optimized chunking
    const result = await new Promise((resolve, reject) => {
      let uploadTimeout = setTimeout(() => {
        reject(new Error('Upload timeout - please try again with a smaller file'));
      }, 55000); // Set timeout to 55 seconds

      const uploadStream = cloudinary.uploader.upload_chunked(
        base64String,
        uploadOptions,
        (error, result) => {
          clearTimeout(uploadTimeout);
          if (error) reject(error);
          else resolve(result);
        }
      );

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

    if (error.message.includes('timeout')) {
      errorMessage = 'Upload timeout - please try with a smaller file or use direct URL upload';
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