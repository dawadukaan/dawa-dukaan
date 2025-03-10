// src/app/api/payment/phonepe/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Setting from '@/lib/db/models/Setting';

// Helper function to get PhonePe settings from database
async function getPhonePeSettings() {
  try {
    const db = await dbConnect();
    console.log('Database connected:', db);

    const setting = await Setting.findOne({ name: 'phonepe' });

    console.log('PhonePe settings:', setting);
    
    if (!setting || !setting.keyValue) {
      throw new Error('PhonePe settings not found');
    }
    
    // Direct access to the raw values from the Map
    const clientId = setting.keyValue.get('clientId');
    const clientSecret = setting.keyValue.get('clientSecret');
    const clientVersion = setting.keyValue.get('clientVersion') || '1';
    const isProduction = setting.keyValue.get('isProduction') === 'true';
    
    // Handle the malformed merchantId
    let merchantId = { uat: '', prod: '' };
    try {
      const merchantIdString = setting.keyValue.get('merchantId');
      if (merchantIdString) {
        const parsedMerchantId = JSON.parse(merchantIdString);
        // Extract the actual values we need
        merchantId = {
          uat: parsedMerchantId.uat || '',
          prod: parsedMerchantId.prod || ''
        };
      }
    } catch (e) {
      console.error('Error parsing merchantId:', e);
    }
    
    // Parse endpoints
    let endpoints = {
      oauth: {
        uat: 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
        prod: 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token'
      },
      pay: {
        uat: 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay',
        prod: 'https://api.phonepe.com/apis/pg/checkout/v2/pay'
      }
    };
    
    try {
      const endpointsString = setting.keyValue.get('endpoints');
      if (endpointsString) {
        endpoints = JSON.parse(endpointsString);
      }
    } catch (e) {
      console.error('Error parsing endpoints:', e);
    }
    
    console.log('Parsed settings:', {
      clientId,
      clientSecret: clientSecret ? '****' : undefined,
      clientVersion,
      isProduction,
      merchantId,
      endpoints
    });
    
    return {
      clientId,
      clientSecret,
      clientVersion,
      isProduction,
      merchantId,
      endpoints
    };
  } catch (error) {
    console.error('Error fetching PhonePe settings:', error);
    throw error;
  }
}

// Generate OAuth token
export async function POST(request) {
  try {
    // Get PhonePe settings from database
    const settings = await getPhonePeSettings();
    
    // Determine which environment to use
    const isProduction = settings.isProduction;
    
    // Get the appropriate endpoint based on environment
    const tokenEndpoint = isProduction 
      ? settings.endpoints.oauth.prod 
      : settings.endpoints.oauth.uat;
    
    // Get credentials from settings
    const clientId = settings.clientId;
    const clientSecret = settings.clientSecret;
    const clientVersion = settings.clientVersion;
    
    // Validate required credentials
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { success: false, error: 'PhonePe credentials not configured' },
        { status: 500 }
      );
    }
    
    // Create form data as required by PhonePe API
    const formData = new URLSearchParams();
    formData.append('client_id', clientId);
    formData.append('client_version', clientVersion);
    formData.append('client_secret', clientSecret);
    formData.append('grant_type', 'client_credentials');
    
    // Make request to PhonePe API
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          error: `PhonePe API error: ${errorData.message || response.statusText}`,
          status: response.status
        },
        { status: response.status }
      );
    }
    
    // Parse and return the token data
    const tokenData = await response.json();
    
    return NextResponse.json({
      success: true,
      data: {
        access_token: tokenData.access_token,
        expires_at: tokenData.expires_at,
        token_type: tokenData.token_type || 'O-Bearer',
        environment: isProduction ? 'Production' : 'Test (UAT)'
      }
    });
  } catch (error) {
    console.error('Error generating PhonePe token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate PhonePe token: ' + error.message },
      { status: 500 }
    );
  }
}

// Get the current token or generate a new one
export async function GET(request) {
  try {
    // In a real implementation, you would check for a cached token here
    // and only generate a new one if needed
    
    // For simplicity, we'll just generate a new token
    const tokenResponse = await POST(request);
    const tokenData = await tokenResponse.json();
    
    return NextResponse.json(tokenData);
  } catch (error) {
    console.error('Error fetching PhonePe token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch PhonePe token' },
      { status: 500 }
    );
  }
}
