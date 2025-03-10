// src/app/api/admin/settings/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Setting from '@/lib/db/models/Setting';

// GET handler to retrieve settings
export async function GET(request) {
  try {
    await dbConnect();
    
    // Get the setting name from query parameters
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    
    if (!name) {
      return NextResponse.json({ error: 'Setting name is required' }, { status: 400 });
    }
    
    // Find the setting by name
    const setting = await Setting.findOne({ name });
    
    return NextResponse.json({ setting });
  } catch (error) {
    console.error('Error retrieving settings:', error);
    return NextResponse.json({ error: 'Failed to retrieve settings' }, { status: 500 });
  }
}

// POST handler to create or update settings
export async function POST(request) {
  try {
    await dbConnect();
    
    const data = await request.json();
    
    if (!data.name || !data.keyValue) {
      return NextResponse.json({ error: 'Name and keyValue are required' }, { status: 400 });
    }
    
    // Update the setting if it exists, otherwise create a new one
    const setting = await Setting.findOneAndUpdate(
      { name: data.name },
      { keyValue: data.keyValue },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({ 
      message: 'Settings saved successfully', 
      setting 
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}


