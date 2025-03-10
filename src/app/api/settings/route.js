import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Setting from '@/lib/db/models/Setting';

// GET handler to retrieve public settings
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
    
    // For security, if this is firebase-admin, don't return the private key
    if (name === 'firebase-admin' && setting?.keyValue) {
      const { privateKey, ...safeSettings } = setting.keyValue;
      return NextResponse.json({ 
        setting: { 
          ...setting.toObject(), 
          keyValue: safeSettings 
        } 
      });
    }
    
    return NextResponse.json({ setting });
  } catch (error) {
    console.error('Error retrieving settings:', error);
    return NextResponse.json({ error: 'Failed to retrieve settings' }, { status: 500 });
  }
} 