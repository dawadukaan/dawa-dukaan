import { getCookie } from 'cookies-next';
import env from '@/lib/config/env';

export const registerAdminFCMToken = async (token, deviceInfo = {}) => {
  try {
    const authToken = getCookie('token');
    
    if (!authToken) {
      console.error('Authentication token not found when registering FCM token');
      throw new Error('Authentication token not found. Please log in.');
    }
    
    const deviceName = deviceInfo.name || 
      `${deviceInfo.browser || 'Unknown'} on ${deviceInfo.os || 'Unknown'}`;
    
    console.log(`Sending FCM token registration request for device: ${deviceName}`);
    
    // Get API URL from config or env
    const apiUrl = env.app.apiUrl || process.env.NEXT_PUBLIC_API_URL || '';
    const endpoint = `${apiUrl}/admin/notifications/register-token`;
    
    console.log("FCM token registration endpoint:", endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        token,
        device: deviceName
      }),
      credentials: 'include' // Ensure cookies are sent with the request
    });
    
    console.log("FCM token registration response status:", response.status);
    
    // Get response as text first to debug
    const responseText = await response.text();
    console.log("FCM token registration response:", responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Error parsing response JSON:", e);
      throw new Error("Invalid response from server");
    }
    
    if (!data.success) {
      console.error('FCM token registration returned error:', data.error);
      throw new Error(data.error || 'Failed to register token');
    }
    
    console.log('FCM token registered successfully!');
    return data.data;
  } catch (error) {
    console.error('Error registering admin FCM token:', error);
    throw error;
  }
};

export const getAdminFCMTokens = async () => {
  try {
    const authToken = getCookie('token');
    
    if (!authToken) {
      throw new Error('Authentication token not found. Please log in.');
    }
    
    const response = await fetch(`${env.app.apiUrl}/admin/notifications/register-token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch tokens');
    }
    
    return data.data.tokens;
  } catch (error) {
    console.error('Error fetching admin FCM tokens:', error);
    throw error;
  }
};

export const deleteAdminFCMToken = async (tokenId) => {
  try {
    const authToken = getCookie('token');
    
    if (!authToken) {
      throw new Error('Authentication token not found. Please log in.');
    }
    
    const response = await fetch(`${env.app.apiUrl}/admin/notifications/register-token?id=${tokenId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete token');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error deleting admin FCM token:', error);
    throw error;
  }
};

export const deleteAllAdminFCMTokens = async () => {
  try {
    const authToken = getCookie('token');
    
    if (!authToken) {
      throw new Error('Authentication token not found. Please log in.');
    }
    
    const response = await fetch(`${env.app.apiUrl}/admin/notifications/register-token?all=true`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete all tokens');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error deleting all admin FCM tokens:', error);
    throw error;
  }
}; 