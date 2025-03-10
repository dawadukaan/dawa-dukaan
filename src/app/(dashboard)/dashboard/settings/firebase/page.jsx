// src/app/(dashboard)/dashboard/settings/firebase/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { 
  FiSettings, FiInfo, FiCheckCircle, 
  FiAlertTriangle, FiRefreshCw, FiSave, 
  FiEye, FiEyeOff, FiBell
} from 'react-icons/fi';
import { getCookie } from 'cookies-next';
import env from '@/lib/config/env';

export default function FirebaseSettings() {
  const [firebaseConfig, setFirebaseConfig] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
    vapidKey: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const token = getCookie('token');

  // Fetch current Firebase settings from database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${env.app.apiUrl}/admin/settings?name=firebase`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        console.log('Firebase settings response:', data);
        
        // Check if we have settings data in the expected format
        if (data.setting && data.setting.keyValue) {
          const settings = data.setting.keyValue;
          setFirebaseConfig({
            apiKey: settings.apiKey || '',
            authDomain: settings.authDomain || '',
            projectId: settings.projectId || '',
            storageBucket: settings.storageBucket || '',
            messagingSenderId: settings.messagingSenderId || '',
            appId: settings.appId || '',
            measurementId: settings.measurementId || '',
            vapidKey: settings.vapidKey || ''
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching Firebase settings:', error);
        // Fallback to environment variables if DB fetch fails
        setFirebaseConfig({
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
          measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || ''
        });
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [token]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFirebaseConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save Firebase settings to database
  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      
      // Convert the config object to a format compatible with our Setting model
      const settingData = {
        name: 'firebase',
        keyValue: {
          ...firebaseConfig
        }
      };
      
      // Send the data to our API endpoint
      const response = await fetch(`${env.app.apiUrl}/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settingData),
      });
      
      const data = await response.json();
      console.log('Save settings response:', data);
      
      setIsLoading(false);
      
      // Show success message
      setTestResult({
        success: true,
        message: 'Firebase settings saved successfully to database!'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setTestResult(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving Firebase settings:', error);
      setIsLoading(false);
      
      // Show error message
      setTestResult({
        success: false,
        message: error.message || 'Failed to save Firebase settings. Please try again.'
      });
    }
  };

  // Test Firebase connection
  const testConnection = async () => {
    try {
      setIsTesting(true);
      
      // Send a request to test the connection with the current settings
      const response = await fetch(`${env.app.apiUrl}/admin/settings/test-firebase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(firebaseConfig),
      });
      
      const data = await response.json();
      console.log('Test connection response:', data);
      
      setIsTesting(false);
      
      // Show success message
      setTestResult({
        success: true,
        message: data.message || 'Successfully connected to Firebase Cloud Messaging!'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setTestResult(null);
      }, 3000);
    } catch (error) {
      console.error('Error testing Firebase connection:', error);
      setIsTesting(false);
      
      // Show error message
      setTestResult({
        success: false,
        message: error.message || 'Failed to connect to Firebase. Please check your credentials.'
      });
    }
  };

  // Generate test notification
  const sendTestNotification = async () => {
    try {
      setIsTesting(true);
      
      // Send a request to send a test notification
      const response = await fetch(`${env.app.apiUrl}/admin/settings/test-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: 'Test Notification',
          body: 'This is a test notification from your admin dashboard.',
          data: {
            url: '/dashboard',
            timestamp: new Date().toISOString()
          }
        }),
      });
      
      const data = await response.json();
      console.log('Test notification response:', data);
      
      setIsTesting(false);
      
      if (response.ok) {
        // Show success message
        setTestResult({
          success: true,
          message: data.message || 'Test notification sent successfully!'
        });
      } else {
        // Show error message
        setTestResult({
          success: false,
          message: data.error || 'Failed to send test notification. Please check your configuration.'
        });
      }
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setTestResult(null);
      }, 3000);
    } catch (error) {
      console.error('Error sending test notification:', error);
      setIsTesting(false);
      
      // Show error message
      setTestResult({
        success: false,
        message: error.message || 'Failed to send test notification. Please check your configuration.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Firebase Cloud Messaging Settings</h1>
        <div className="flex space-x-2">
          <button
            onClick={testConnection}
            disabled={isTesting || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? (
              <>
                <FiRefreshCw className="animate-spin mr-2" />
                Testing...
              </>
            ) : (
              <>
                <FiCheckCircle className="mr-2" />
                Test Connection
              </>
            )}
          </button>
          <button
            onClick={sendTestNotification}
            disabled={isTesting || isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiBell className="mr-2" />
            Send Test Notification
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave className="mr-2" />
            Save Settings
          </button>
        </div>
      </div>

      {/* Test Result Alert */}
      {testResult && (
        <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {testResult.success ? (
                <FiCheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <FiAlertTriangle className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{testResult.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Firebase Configuration</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showSecrets ? "text" : "password"}
                  id="apiKey"
                  name="apiKey"
                  value={firebaseConfig.apiKey}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="authDomain" className="block text-sm font-medium text-gray-700 mb-1">
                Auth Domain
              </label>
              <input
                type="text"
                id="authDomain"
                name="authDomain"
                value={firebaseConfig.authDomain}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                Project ID
              </label>
              <input
                type="text"
                id="projectId"
                name="projectId"
                value={firebaseConfig.projectId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="storageBucket" className="block text-sm font-medium text-gray-700 mb-1">
                Storage Bucket
              </label>
              <input
                type="text"
                id="storageBucket"
                name="storageBucket"
                value={firebaseConfig.storageBucket}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="messagingSenderId" className="block text-sm font-medium text-gray-700 mb-1">
                Messaging Sender ID
              </label>
              <input
                type="text"
                id="messagingSenderId"
                name="messagingSenderId"
                value={firebaseConfig.messagingSenderId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="appId" className="block text-sm font-medium text-gray-700 mb-1">
                App ID
              </label>
              <div className="relative">
                <input
                  type={showSecrets ? "text" : "password"}
                  id="appId"
                  name="appId"
                  value={firebaseConfig.appId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="measurementId" className="block text-sm font-medium text-gray-700 mb-1">
                Measurement ID (optional)
              </label>
              <input
                type="text"
                id="measurementId"
                name="measurementId"
                value={firebaseConfig.measurementId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="vapidKey" className="block text-sm font-medium text-gray-700 mb-1">
                VAPID Key (Web Push Certificate)
              </label>
              <div className="relative">
                <input
                  type={showSecrets ? "text" : "password"}
                  id="vapidKey"
                  name="vapidKey"
                  value={firebaseConfig.vapidKey}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Required for web push notifications. Generate this in your Firebase Console under Project Settings Cloud Messaging.
              </p>
            </div>
            
            <div className="flex items-center mt-4">
              <input
                id="showSecrets"
                name="showSecrets"
                type="checkbox"
                checked={showSecrets}
                onChange={() => setShowSecrets(!showSecrets)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="showSecrets" className="ml-2 block text-sm text-gray-700 flex items-center">
                {showSecrets ? <FiEyeOff className="mr-1" /> : <FiEye className="mr-1" />}
                {showSecrets ? "Hide sensitive values" : "Show sensitive values"}
              </label>
            </div>
          </div>
          
          <div className="mt-6 bg-blue-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiInfo className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">About Firebase Cloud Messaging</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Firebase Cloud Messaging (FCM) provides a reliable and battery-efficient connection between your server and devices, allowing you to deliver and receive messages and notifications on iOS, Android, and the web at no cost.
                  </p>
                  <p className="mt-1">
                    You can find your Firebase credentials in your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a> under Project Settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-yellow-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiInfo className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Configuration Steps</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Create a Firebase project in the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
                    <li>Register your app in the Firebase project</li>
                    <li>Copy the Firebase configuration from Project Settings</li>
                    <li>Enable Cloud Messaging in the Firebase Console</li>
                    <li>Generate a Web Push Certificate (VAPID Key) in Cloud Messaging settings</li>
                    <li>Paste all the configuration values in this form</li>
                    <li>Save the settings and test the connection</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-purple-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiBell className="h-5 w-5 text-purple-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-purple-800">Service Worker Setup</h3>
                <div className="mt-2 text-sm text-purple-700">
                  <p>
                    For push notifications to work, you need to have a Firebase Messaging Service Worker file in your public directory. This file should be named <code>firebase-messaging-sw.js</code>.
                  </p>
                  <p className="mt-1">
                    Make sure this file exists in your public directory and contains the correct Firebase configuration. You can use the "Send Test Notification" button to verify that everything is working correctly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
