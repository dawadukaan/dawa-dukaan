// src/app/api/delete/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import DeleteRequest from '@/lib/db/models/DeleteRequests';

export async function POST(request) {
  try {
    // Connect to the database
    await connectDB();
    
    // Parse the request body
    const { name, phone, email, reason } = await request.json();
    
    // Validate the input
    if (!name || !phone || !email || !reason) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create a new mail request in the database
    const deleteRequest = await DeleteRequest.create({
      name,
      phone,
      email,
      reason
    });
    
    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Your account deletion request has been submitted successfully.',
        requestId: deleteRequest._id
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error saving deletion request:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'You already have a pending deletion request.' },
        { status: 409 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { success: false, message: 'Failed to submit deletion request' },
      { status: 500 }
    );
  }
}

// GET method to check the status of a deletion request
export async function GET(request) {
  try {
    // Connect to the database
    await connectDB();
    
    // Get the email from the query parameters
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    
    if (!email && !phone) {
      return NextResponse.json(
        { success: false, message: 'Email or phone is required' },
        { status: 400 }
      );
    }
    
    // Find the most recent deletion request for this email
    const deleteRequest = await DeleteRequest.findOne(
      { $or: [{ email: email.toLowerCase() }, { phone }] },
      null,
      { sort: { createdAt: -1 } }
    );
    
    if (!deleteRequest) {
      return NextResponse.json(
        { success: false, message: 'No deletion request found for this email or phone number' },
        { status: 404 }
      );
    }
    
    // Return the request status
    return NextResponse.json(
      { 
        success: true, 
        data: {
          requestId: deleteRequest._id,
          status: deleteRequest.status,
          createdAt: deleteRequest.createdAt
        }
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error retrieving deletion request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve deletion request' },
      { status: 500 }
    );
  }
}
