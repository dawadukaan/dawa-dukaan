// src/app/(dashboard)/dashboard/settings/phonepe/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { 
  FiSettings, FiInfo, FiCheckCircle, 
  FiAlertTriangle, FiRefreshCw, FiSave, 
  FiEye, FiEyeOff, FiCreditCard, FiKey,
  FiLink
} from 'react-icons/fi';
import { getCookie } from 'cookies-next';
import env from '@/lib/config/env';

export default function PhonePeSettings() {
  const [phonePeConfig, setPhonePeConfig] = useState({
    clientId: '',
    clientSecret: '',
    clientVersion: '1',
    // Split merchant ID into test/prod versions
    merchantId: {
      uat: '',
      prod: ''
    },
    saltKey: '',
    saltIndex: '1',
    isProduction: false,
    endpoints: {
      oauth: {
        uat: 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
        prod: 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token'
      },
      pay: {
        uat: 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay',
        prod: 'https://api.phonepe.com/apis/pg/checkout/v2/pay'
      }
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [showEndpoints, setShowEndpoints] = useState(false);
  const token = getCookie('token');

  // Fetch current PhonePe settings from database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${env.app.apiUrl}/admin/settings?name=phonepe`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.setting && data.setting.keyValue) {
          const settings = data.setting.keyValue;
          
          // Handle merchantId specially due to the malformed data
          let merchantIdValue = { uat: '', prod: '' };
          try {
            if (settings.merchantId) {
              const parsedMerchantId = JSON.parse(settings.merchantId);
              // Extract only the uat and prod properties
              merchantIdValue = {
                uat: parsedMerchantId.uat || '',
                prod: parsedMerchantId.prod || ''
              };
            }
          } catch (e) {
            console.error('Error parsing merchantId:', e);
            // If parsing fails, use empty values
            merchantIdValue = { uat: '', prod: '' };
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
            if (settings.endpoints) {
              endpoints = JSON.parse(settings.endpoints);
            }
          } catch (e) {
            console.error('Error parsing endpoints:', e);
          }
          
          // Set the config with properly parsed values
          setPhonePeConfig({
            clientId: settings.clientId || '',
            clientSecret: settings.clientSecret || '',
            clientVersion: settings.clientVersion || '1',
            merchantId: merchantIdValue,
            saltKey: settings.saltKey || '',
            saltIndex: settings.saltIndex || '1',
            isProduction: settings.isProduction === 'true' || false,
            endpoints
          });
          
          console.log('Loaded PhonePe settings:', {
            clientId: settings.clientId,
            merchantId: merchantIdValue,
            isProduction: settings.isProduction === 'true'
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching PhonePe settings:', error);
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [token]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPhonePeConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle merchant ID changes
  const handleMerchantIdChange = (env, value) => {
    setPhonePeConfig(prev => ({
      ...prev,
      merchantId: {
        ...prev.merchantId,
        [env]: value
      }
    }));
  };

  // Handle endpoint changes
  const handleEndpointChange = (type, env, value) => {
    setPhonePeConfig(prev => ({
      ...prev,
      endpoints: {
        ...prev.endpoints,
        [type]: {
          ...prev.endpoints[type],
          [env]: value
        }
      }
    }));
  };

  // Fix for the endpoint input fields
  const getEndpointValue = (type, env) => {
    try {
      return phonePeConfig.endpoints?.[type]?.[env] || '';
    } catch (e) {
      return '';
    }
  };

  // Save PhonePe settings to database
  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      
      // Create a deep copy of the config to avoid modifying the original
      const configCopy = JSON.parse(JSON.stringify(phonePeConfig));
      
      // Convert nested objects to JSON strings to comply with the Setting model
      const settingData = {
        name: 'phonepe',
        keyValue: {}
      };
      
      // Process each key in the config
      Object.keys(configCopy).forEach(key => {
        // If the value is an object, stringify it
        if (typeof configCopy[key] === 'object' && configCopy[key] !== null) {
          // For merchantId, ensure we only include the uat and prod properties
          if (key === 'merchantId') {
            const cleanMerchantId = {
              uat: configCopy.merchantId.uat || '',
              prod: configCopy.merchantId.prod || ''
            };
            settingData.keyValue[key] = JSON.stringify(cleanMerchantId);
          } else {
            settingData.keyValue[key] = JSON.stringify(configCopy[key]);
          }
        } else {
          // Otherwise keep the primitive value as is
          settingData.keyValue[key] = configCopy[key];
        }
      });
      
      console.log('Saving settings:', settingData);
      
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
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save settings');
      }
      
      setIsLoading(false);
      
      // Show success message
      setTestResult({
        success: true,
        message: 'PhonePe settings saved successfully!'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setTestResult(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving PhonePe settings:', error);
      setIsLoading(false);
      
      // Show error message
      setTestResult({
        success: false,
        message: error.message || 'Failed to save PhonePe settings. Please try again.'
      });
    }
  };

  // Test PhonePe connection by generating an auth token
  const testConnection = async () => {
    try {
      setIsTesting(true);
      setTokenInfo(null);
      
      // Send a request to test the connection with the current settings
      const response = await fetch(`${env.app.apiUrl}/payment/phonepe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to connect to PhonePe');
      }
      
      setIsTesting(false);
      setTokenInfo(data.data);
      
      // Show success message
      setTestResult({
        success: true,
        message: 'Successfully connected to PhonePe and generated auth token!'
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setTestResult(null);
      }, 5000);
    } catch (error) {
      console.error('Error testing PhonePe connection:', error);
      setIsTesting(false);
      
      // Show error message
      setTestResult({
        success: false,
        message: error.message || 'Failed to connect to PhonePe. Please check your credentials.'
      });
    }
  };

  // Format date from timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Get the active merchant ID based on environment
  const getActiveMerchantId = () => {
    return phonePeConfig.isProduction 
      ? phonePeConfig.merchantId.prod 
      : phonePeConfig.merchantId.uat;
  };

  // Get the active endpoints based on environment
  const getActiveEndpoints = () => {
    const env = phonePeConfig.isProduction ? 'prod' : 'uat';
    return {
      oauth: phonePeConfig.endpoints.oauth[env],
      pay: phonePeConfig.endpoints.pay[env],
      merchantId: phonePeConfig.merchantId[env]
    };
  };

  // Handle environment change
  const handleEnvironmentChange = (isProduction) => {
    setPhonePeConfig(prev => ({
      ...prev,
      isProduction
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">PhonePe Payment Gateway Settings</h1>
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

      {/* Token Info */}
      {tokenInfo && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-md font-medium text-blue-800 mb-2 flex items-center">
            <FiKey className="mr-2" /> Auth Token Generated Successfully
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700 font-medium">Token:</p>
              <p className="text-blue-600 font-mono text-xs break-all bg-blue-100 p-2 rounded">
                {tokenInfo.access_token}
              </p>
            </div>
            <div>
              <p className="text-blue-700 font-medium">Expires At:</p>
              <p className="text-blue-600">{formatDate(tokenInfo.expires_at)}</p>
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
          <h2 className="text-lg font-medium text-gray-900 mb-4">PhonePe Configuration</h2>
          
          {/* Environment Selection */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-3">Environment</h3>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleEnvironmentChange(false)}
                className={`px-4 py-2 rounded-md flex items-center ${
                  !phonePeConfig.isProduction 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                <div className={`w-3 h-3 rounded-full mr-2 ${!phonePeConfig.isProduction ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                Test Mode (UAT)
              </button>
              <button
                type="button"
                onClick={() => handleEnvironmentChange(true)}
                className={`px-4 py-2 rounded-md flex items-center ${
                  phonePeConfig.isProduction 
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                <div className={`w-3 h-3 rounded-full mr-2 ${phonePeConfig.isProduction ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                Production Mode
              </button>
            </div>
            
            <div className={`mt-3 p-3 rounded-md text-sm border-l-4 ${
              phonePeConfig.isProduction 
                ? 'bg-yellow-50 text-yellow-700 border-yellow-500' 
                : 'bg-blue-50 text-blue-700 border-blue-500'
            }`}>
              {phonePeConfig.isProduction ? (
                <p className="flex items-center">
                  <FiAlertTriangle className="mr-2 text-yellow-500" />
                  <strong>Production Mode:</strong> Real transactions will be processed using live endpoints.
                </p>
              ) : (
                <p className="flex items-center">
                  <FiInfo className="mr-2 text-blue-500" />
                  <strong>Test Mode:</strong> Transactions will be processed in the UAT environment.
                </p>
              )}
            </div>
          </div>
          
          {/* Merchant ID Section */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-3">Merchant ID</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Merchant ID (UAT)
                </label>
                <input
                  type="text"
                  value={phonePeConfig.merchantId.uat}
                  onChange={(e) => handleMerchantIdChange('uat', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                    !phonePeConfig.isProduction 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter test environment merchant ID"
                />
                {!phonePeConfig.isProduction && !phonePeConfig.merchantId.uat && (
                  <p className="mt-1 text-xs text-red-500">
                    Test Merchant ID is required for Test Mode
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Production Merchant ID
                </label>
                <input
                  type="text"
                  value={phonePeConfig.merchantId.prod}
                  onChange={(e) => handleMerchantIdChange('prod', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                    phonePeConfig.isProduction 
                      ? 'border-yellow-300 bg-yellow-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter production environment merchant ID"
                />
                {phonePeConfig.isProduction && !phonePeConfig.merchantId.prod && (
                  <p className="mt-1 text-xs text-red-500">
                    Production Merchant ID is required for Production Mode
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              <p>The Merchant ID for the currently selected environment will be used for all transactions.</p>
            </div>
          </div>
          
          {/* Active Configuration Display */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-medium text-gray-900 flex items-center">
                <FiLink className="mr-2" /> API Endpoints
              </h3>
              <button
                type="button"
                onClick={() => setShowEndpoints(!showEndpoints)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                {showEndpoints ? "Hide Details" : "Show Details"}
              </button>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <p className="text-xs font-medium text-gray-500">Active Environment:</p>
                  <p className="text-sm font-medium">
                    {phonePeConfig.isProduction 
                      ? <span className="text-yellow-600">Production</span> 
                      : <span className="text-blue-600">Test (UAT)</span>}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Active Merchant ID:</p>
                  <p className="text-sm font-mono">
                    {getActiveMerchantId() || <span className="text-red-500 italic">Not set</span>}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">OAuth Token Endpoint:</p>
                  <p className="text-sm font-mono break-all">
                    {getActiveEndpoints().oauth}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Payment Endpoint:</p>
                  <p className="text-sm font-mono break-all">
                    {getActiveEndpoints().pay}
                  </p>
                </div>
              </div>
            </div>
            
            {showEndpoints && (
              <div className="mt-4 space-y-6 border border-gray-200 rounded-md p-4 bg-gray-50">
                {/* OAuth Token Endpoints */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">OAuth Token Endpoints</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        UAT (Test)
                      </label>
                      <input
                        type="text"
                        value={getEndpointValue('oauth', 'uat')}
                        onChange={(e) => handleEndpointChange('oauth', 'uat', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Production
                      </label>
                      <input
                        type="text"
                        value={getEndpointValue('oauth', 'prod')}
                        onChange={(e) => handleEndpointChange('oauth', 'prod', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Payment Endpoints */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Endpoints</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        UAT (Test)
                      </label>
                      <input
                        type="text"
                        value={getEndpointValue('pay', 'uat')}
                        onChange={(e) => handleEndpointChange('pay', 'uat', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Production
                      </label>
                      <input
                        type="text"
                        value={getEndpointValue('pay', 'prod')}
                        onChange={(e) => handleEndpointChange('pay', 'prod', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 italic">
                  <p>These endpoints are automatically selected based on your environment (Test/Production).</p>
                  <p className="mt-1">Only modify these URLs if PhonePe has updated their API endpoints.</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Credentials Section */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-3">API Credentials</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
                    Client ID
                  </label>
                  <input
                    type="text"
                    id="clientId"
                    name="clientId"
                    value={phonePeConfig.clientId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-700 mb-1">
                    Client Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets ? "text" : "password"}
                      id="clientSecret"
                      name="clientSecret"
                      value={phonePeConfig.clientSecret}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="clientVersion" className="block text-sm font-medium text-gray-700 mb-1">
                    Client Version
                  </label>
                  <input
                    type="text"
                    id="clientVersion"
                    name="clientVersion"
                    value={phonePeConfig.clientVersion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Use 1 for UAT. For production, use the value provided in credentials email.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="saltKey" className="block text-sm font-medium text-gray-700 mb-1">
                    Salt Key
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets ? "text" : "password"}
                      id="saltKey"
                      name="saltKey"
                      value={phonePeConfig.saltKey}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="saltIndex" className="block text-sm font-medium text-gray-700 mb-1">
                  Salt Index
                </label>
                <input
                  type="text"
                  id="saltIndex"
                  name="saltIndex"
                  value={phonePeConfig.saltIndex}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 max-w-xs"
                />
              </div>
              
              <div className="flex items-center mt-2">
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
          </div>
          
          <div className="mt-6 bg-blue-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiInfo className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">About PhonePe Payment Gateway</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    PhonePe is a leading digital payments platform in India that allows you to accept payments via UPI, cards, and wallets.
                  </p>
                  <p className="mt-1">
                    You can find your PhonePe credentials in your merchant dashboard or the onboarding email sent by PhonePe.
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
                <h3 className="text-sm font-medium text-yellow-800">Integration Steps</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Enter your PhonePe credentials provided during merchant onboarding</li>
                    <li>Save the settings and test the connection to verify your credentials</li>
                    <li>For UAT testing, use the test credentials provided by PhonePe</li>
                    <li>Switch to Production mode only when you're ready to accept real payments</li>
                    <li>Ensure your callback URLs are properly configured in your PhonePe merchant dashboard</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-purple-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiCreditCard className="h-5 w-5 text-purple-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-purple-800">Testing Information</h3>
                <div className="mt-2 text-sm text-purple-700">
                  <p>
                    In UAT mode, you can use the following test credentials:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>UPI:</strong> Use any valid UPI ID format (e.g., test@ybl)</li>
                    <li><strong>Cards:</strong> Use test card numbers provided by PhonePe</li>
                    <li><strong>OTP:</strong> Use 123456 for all OTP verifications</li>
                  </ul>
                  <p className="mt-2">
                    Refer to the <a href="https://developer.phonepe.com/docs/sandbox-testing" target="_blank" rel="noopener noreferrer" className="underline text-purple-800">PhonePe Developer Documentation</a> for more testing details.
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


