// src/app/(dashboard)/dashboard/settings/cloudinary/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { 
  FiSettings, FiInfo, FiCheckCircle, 
  FiAlertTriangle, FiRefreshCw, FiSave, 
  FiEye, FiEyeOff
} from 'react-icons/fi';

export default function CloudinarySettings() {
  const [cloudinaryConfig, setCloudinaryConfig] = useState({
    cloudName: '',
    apiKey: '',
    apiSecret: '',
    uploadPreset: 'ml_default',
    folder: 'davadukaan'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showSecret, setShowSecret] = useState(false);

  // Fetch current Cloudinary settings from database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/settings?name=cloudinary');
        const data = await response.json();
        
        if (data && data.setting && data.setting.keyValue) {
          const settings = data.setting.keyValue;
          setCloudinaryConfig({
            cloudName: settings.cloudName || '',
            apiKey: settings.apiKey || '',
            apiSecret: settings.apiSecret || '',
            uploadPreset: settings.uploadPreset || 'ml_default',
            folder: settings.folder || 'davadukaan'
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching Cloudinary settings:', error);
        // Fallback to environment variables if DB fetch fails
        setCloudinaryConfig({
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
          apiKey: '',
          apiSecret: '',
          uploadPreset: 'ml_default',
          folder: 'davadukaan'
        });
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCloudinaryConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save Cloudinary settings to database
  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      
      // Convert the config object to a format compatible with our Setting model
      const settingData = {
        name: 'cloudinary',
        keyValue: {
          cloudName: cloudinaryConfig.cloudName,
          apiKey: cloudinaryConfig.apiKey,
          apiSecret: cloudinaryConfig.apiSecret,
          uploadPreset: cloudinaryConfig.uploadPreset,
          folder: cloudinaryConfig.folder
        }
      };
      
      // Send the data to our API endpoint
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      setIsLoading(false);
      
      // Show success message
      setTestResult({
        success: true,
        message: 'Cloudinary settings saved successfully to database!'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setTestResult(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving Cloudinary settings:', error);
      setIsLoading(false);
      
      // Show error message
      setTestResult({
        success: false,
        message: 'Failed to save Cloudinary settings. Please try again.'
      });
    }
  };

  // Test Cloudinary connection
  const testConnection = async () => {
    try {
      setIsTesting(true);
      
      // Send a request to test the connection with the current settings
      const response = await fetch('/api/admin/settings/test-cloudinary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cloudinaryConfig),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to connect to Cloudinary');
      }
      
      setIsTesting(false);
      
      // Show success message
      setTestResult({
        success: true,
        message: 'Successfully connected to Cloudinary!'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setTestResult(null);
      }, 3000);
    } catch (error) {
      console.error('Error testing Cloudinary connection:', error);
      setIsTesting(false);
      
      // Show error message
      setTestResult({
        success: false,
        message: error.message || 'Failed to connect to Cloudinary. Please check your credentials.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Cloudinary Settings</h1>
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
          <h2 className="text-lg font-medium text-gray-900 mb-4">Cloudinary Configuration</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="cloudName" className="block text-sm font-medium text-gray-700 mb-1">
                Cloud Name
              </label>
              <input
                type="text"
                id="cloudName"
                name="cloudName"
                value={cloudinaryConfig.cloudName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="text"
                id="apiKey"
                name="apiKey"
                value={cloudinaryConfig.apiKey}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="apiSecret" className="block text-sm font-medium text-gray-700 mb-1">
                API Secret
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  id="apiSecret"
                  name="apiSecret"
                  value={cloudinaryConfig.apiSecret}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="uploadPreset" className="block text-sm font-medium text-gray-700 mb-1">
                Upload Preset
              </label>
              <input
                type="text"
                id="uploadPreset"
                name="uploadPreset"
                value={cloudinaryConfig.uploadPreset}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload presets allow you to define default upload parameters.
              </p>
            </div>
            
            <div>
              <label htmlFor="folder" className="block text-sm font-medium text-gray-700 mb-1">
                Default Folder
              </label>
              <input
                type="text"
                id="folder"
                name="folder"
                value={cloudinaryConfig.folder}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Specify a folder where your uploads will be stored.
              </p>
            </div>
          </div>
          
          <div className="mt-6 bg-blue-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiInfo className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">About Cloudinary</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Cloudinary is a cloud-based service that provides an end-to-end image and video management solution including uploads, storage, manipulations, optimizations and delivery.
                  </p>
                  <p className="mt-1">
                    You can find your Cloudinary credentials in your <a href="https://cloudinary.com/console" target="_blank" rel="noopener noreferrer" className="underline">Cloudinary Dashboard</a>.
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
                <h3 className="text-sm font-medium text-yellow-800">Configuration Tips</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Create a dedicated upload preset in your Cloudinary dashboard for this application</li>
                    <li>Consider using signed uploads for better security</li>
                    <li>Set up proper transformations to optimize images for different devices</li>
                    <li>Use folders to organize your media assets by category</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

