'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  FiSettings, FiInfo, FiCheckCircle, 
  FiAlertTriangle, FiRefreshCw, FiSave, 
  FiUpload, FiEye, FiEyeOff
} from 'react-icons/fi';
import { getCookie } from 'cookies-next';
import env from '@/lib/config/env';

export default function FirebaseAdminSettings() {
  const [adminConfig, setAdminConfig] = useState({
    projectId: '',
    clientEmail: '',
    privateKey: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const fileInputRef = useRef(null);
  const token = getCookie('token');

  // Fetch current Firebase Admin settings from database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${env.app.apiUrl}/admin/settings?name=firebase-admin`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        console.log('Firebase Admin settings response:', data);
        
        if (data.setting && data.setting.keyValue) {
          const settings = data.setting.keyValue;
          setAdminConfig({
            projectId: settings.projectId || '',
            clientEmail: settings.clientEmail || '',
            privateKey: settings.privateKey || '',
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching Firebase Admin settings:', error);
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [token]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle service account JSON file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const serviceAccount = JSON.parse(event.target.result);
        setAdminConfig({
          projectId: serviceAccount.project_id || '',
          clientEmail: serviceAccount.client_email || '',
          privateKey: serviceAccount.private_key || '',
        });
      } catch (error) {
        console.error('Error parsing service account JSON:', error);
        setTestResult({
          success: false,
          message: 'Invalid service account JSON file. Please check the file and try again.'
        });
      }
    };
    reader.readAsText(file);
  };

  // Save Firebase Admin settings to database
  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      
      // Validate required fields
      if (!adminConfig.projectId || !adminConfig.clientEmail || !adminConfig.privateKey) {
        throw new Error('Project ID, Client Email, and Private Key are required');
      }
      
      // Convert the config object to a format compatible with our Setting model
      const settingData = {
        name: 'firebase-admin',
        keyValue: {
          ...adminConfig
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
      console.log('Save admin settings response:', data);
      
      setIsLoading(false);
      
      // Show success message
      setTestResult({
        success: true,
        message: 'Firebase Admin settings saved successfully to database!'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setTestResult(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving Firebase Admin settings:', error);
      setIsLoading(false);
      
      // Show error message
      setTestResult({
        success: false,
        message: error.message || 'Failed to save Firebase Admin settings. Please try again.'
      });
    }
  };

  // Test Firebase Admin connection
  const testConnection = async () => {
    try {
      setIsTesting(true);
      
      // Validate required fields
      if (!adminConfig.projectId || !adminConfig.clientEmail || !adminConfig.privateKey) {
        throw new Error('Project ID, Client Email, and Private Key are required');
      }
      
      // Send a request to test the connection with the current settings
      const response = await fetch(`${env.app.apiUrl}/admin/settings/test-firebase-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adminConfig),
      });
      
      const data = await response.json();
      console.log('Test admin connection response:', data);
      
      setIsTesting(false);
      
      if (response.ok) {
        // Show success message
        setTestResult({
          success: true,
          message: data.message || 'Successfully connected to Firebase Admin!'
        });
      } else {
        // Show error message
        setTestResult({
          success: false,
          message: data.error || 'Failed to connect to Firebase Admin. Please check your credentials.'
        });
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setTestResult(null);
      }, 3000);
    } catch (error) {
      console.error('Error testing Firebase Admin connection:', error);
      setIsTesting(false);
      
      // Show error message
      setTestResult({
        success: false,
        message: error.message || 'Failed to connect to Firebase Admin. Please check your credentials.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Firebase Admin Settings</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => fileInputRef.current.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <FiUpload className="mr-2" />
            Upload Service Account
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="application/json"
            className="hidden"
          />
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
          <h2 className="text-lg font-medium text-gray-900 mb-4">Firebase Admin Service Account</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                Project ID
              </label>
              <input
                type="text"
                id="projectId"
                name="projectId"
                value={adminConfig.projectId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Client Email
              </label>
              <input
                type="text"
                id="clientEmail"
                name="clientEmail"
                value={adminConfig.clientEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="privateKey" className="block text-sm font-medium text-gray-700 mb-1">
                Private Key
              </label>
              <div className="relative">
                <textarea
                  id="privateKey"
                  name="privateKey"
                  value={adminConfig.privateKey}
                  onChange={handleChange}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                  style={{ display: showSecrets ? 'block' : 'none' }}
                />
                {!showSecrets && (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 h-32 flex items-center justify-center">
                    <span className="text-gray-500">Private key is hidden. Click "Show sensitive values" to view or edit.</span>
                  </div>
                )}
              </div>
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
                <h3 className="text-sm font-medium text-blue-800">About Firebase Admin SDK</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    The Firebase Admin SDK enables server-side functionality for your application, including sending push notifications, managing users, and accessing Firebase services with admin privileges.
                  </p>
                  <p className="mt-1">
                    You need a service account to use the Firebase Admin SDK. You can generate a service account key in your <a href="https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a> under Project Settings &gt; Service accounts.
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
                    <li>Go to your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
                    <li>Select your project and go to Project Settings</li>
                    <li>Go to the "Service accounts" tab</li>
                    <li>Click "Generate new private key" to download a JSON file</li>
                    <li>Upload the JSON file using the "Upload Service Account" button above</li>
                    <li>Save the settings and test the connection</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Security Warning</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    The private key grants admin access to your Firebase project. Keep it confidential and never share it publicly.
                  </p>
                  <p className="mt-1">
                    This key is stored securely in your database and is only used server-side to authenticate with Firebase services.
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