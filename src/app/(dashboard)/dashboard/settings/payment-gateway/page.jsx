'use client';

import { useState } from 'react';
import { FiSave, FiCreditCard, FiDollarSign, FiShield, FiToggleRight, FiInfo, FiAlertCircle, FiSmartphone } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// Sample initial payment gateway settings
const initialPaymentSettings = {
  razorpay: {
    enabled: true,
    testMode: true,
    keyId: 'rzp_test_1234567890abcdef',
    keySecret: 'abcdefghijklmnopqrstuvwxyz123456',
    webhookSecret: '',
    displayName: 'Credit/Debit Card, UPI, Netbanking',
    description: 'Pay securely using Razorpay',
    processingFee: '2%',
  },
  cashOnDelivery: {
    enabled: true,
    displayName: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    minOrderAmount: 0,
    maxOrderAmount: 10000,
    additionalFee: 40,
  },
  phonepe: {
    enabled: false,
    testMode: true,
    merchantId: '',
    saltKey: '',
    saltIndex: '1',
    webhookSecret: '',
    displayName: 'PhonePe',
    description: 'Pay using PhonePe wallet, UPI, or cards',
    processingFee: '1.8%',
  },
  paytm: {
    enabled: false,
    testMode: true,
    merchantId: '',
    merchantKey: '',
    website: 'DEFAULT',
    industryType: 'Retail',
    displayName: 'Paytm',
    description: 'Pay using Paytm wallet, UPI, or cards',
    processingFee: '2%',
  },
  cashfree: {
    enabled: false,
    testMode: true,
    appId: '',
    secretKey: '',
    displayName: 'Cashfree',
    description: 'Pay using UPI, cards, or netbanking',
    processingFee: '1.9%',
  },
  flutterwave: {
    enabled: false,
    testMode: true,
    publicKey: '',
    secretKey: '',
    encryptionKey: '',
    displayName: 'Flutterwave',
    description: 'Pay using multiple payment methods',
    processingFee: '2.5%',
  },
};

export default function PaymentGatewaySettingsPage() {
  const [paymentSettings, setPaymentSettings] = useState(initialPaymentSettings);
  const [activeGateway, setActiveGateway] = useState('razorpay');
  const [isSaving, setIsSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState({
    razorpay: false,
    paypal: false,
    stripe: false,
    phonepe: false,
    paytm: false,
    cashfree: false,
    flutterwave: false,
    sabpaisa: false
  });

  const handleChange = (gateway, field, value) => {
    setPaymentSettings(prev => ({
      ...prev,
      [gateway]: {
        ...prev[gateway],
        [field]: value
      }
    }));
  };

  const toggleShowSecret = (gateway) => {
    setShowSecrets(prev => ({
      ...prev,
      [gateway]: !prev[gateway]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would send the settings to your API
      // const response = await fetch('/api/settings/payment-gateways', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(paymentSettings),
      // });
      
      // if (!response.ok) throw new Error('Failed to save settings');
      
      toast.success('Payment gateway settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Payment Gateway Settings</h1>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <FiSave className="w-5 h-5 mr-2" />
              Save Settings
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-gray-50 p-4 border-r overflow-y-auto max-h-[calc(100vh-12rem)]">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Payment Methods</h2>
            <nav className="space-y-1">
                {/* Razorpay */}
              <button
                onClick={() => setActiveGateway('razorpay')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeGateway === 'razorpay' 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiCreditCard className={`mr-3 h-5 w-5 ${
                  activeGateway === 'razorpay' ? 'text-green-500' : 'text-gray-400'
                }`} />
                <span className="flex-1 text-left">Razorpay</span>
                {paymentSettings.razorpay.enabled && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                )}
              </button>
              
              {/* Cash on Delivery */}
              <button
                onClick={() => setActiveGateway('cashOnDelivery')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeGateway === 'cashOnDelivery' 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiDollarSign className={`mr-3 h-5 w-5 ${
                  activeGateway === 'cashOnDelivery' ? 'text-green-500' : 'text-gray-400'
                }`} />
                <span className="flex-1 text-left">Cash on Delivery</span>
                {paymentSettings.cashOnDelivery.enabled && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                )}
              </button>
              
              {/* PhonePe */}
              <button
                onClick={() => setActiveGateway('phonepe')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeGateway === 'phonepe' 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiSmartphone className={`mr-3 h-5 w-5 ${
                  activeGateway === 'phonepe' ? 'text-green-500' : 'text-gray-400'
                }`} />
                <span className="flex-1 text-left">PhonePe</span>
                {paymentSettings.phonepe.enabled && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                )}
              </button>
              
              {/* Paytm */}
              <button
                onClick={() => setActiveGateway('paytm')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeGateway === 'paytm' 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiSmartphone className={`mr-3 h-5 w-5 ${
                  activeGateway === 'paytm' ? 'text-green-500' : 'text-gray-400'
                }`} />
                <span className="flex-1 text-left">Paytm</span>
                {paymentSettings.paytm.enabled && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                )}
              </button>
              
              {/* Cashfree */}
              <button
                onClick={() => setActiveGateway('cashfree')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeGateway === 'cashfree' 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiCreditCard className={`mr-3 h-5 w-5 ${
                  activeGateway === 'cashfree' ? 'text-green-500' : 'text-gray-400'
                }`} />
                <span className="flex-1 text-left">Cashfree</span>
                {paymentSettings.cashfree.enabled && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                )}
              </button>
              
              {/* Flutterwave */}
              <button
                onClick={() => setActiveGateway('flutterwave')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeGateway === 'flutterwave' 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiCreditCard className={`mr-3 h-5 w-5 ${
                  activeGateway === 'flutterwave' ? 'text-green-500' : 'text-gray-400'
                }`} />
                <span className="flex-1 text-left">Flutterwave</span>
                {paymentSettings.flutterwave.enabled && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                )}
              </button>
              
              {/* SabPaisa */}
              {/* Bank Transfer */}
              {/* Paypal */}
              {/* Stripe */}
              
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 p-6">
            {/* Razorpay Settings */}
            {activeGateway === 'razorpay' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Razorpay Settings</h2>
                  <div className="flex items-center">
                    <span className="mr-3 text-sm text-gray-500">
                      {paymentSettings.razorpay.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      type="button"
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                        paymentSettings.razorpay.enabled ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      onClick={() => handleChange('razorpay', 'enabled', !paymentSettings.razorpay.enabled)}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                          paymentSettings.razorpay.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiInfo className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Razorpay is a popular Indian payment gateway that supports UPI, cards, netbanking, and wallets.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="razorpay-test-mode"
                    type="checkbox"
                    checked={paymentSettings.razorpay.testMode}
                    onChange={(e) => handleChange('razorpay', 'testMode', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="razorpay-test-mode" className="ml-2 block text-sm text-gray-700">
                    Test Mode
                  </label>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {paymentSettings.razorpay.testMode ? 'Test' : 'Live'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="razorpay-key-id" className="block text-sm font-medium text-gray-700 mb-1">
                      Key ID
                    </label>
                    <input
                      id="razorpay-key-id"
                      type="text"
                      value={paymentSettings.razorpay.keyId}
                      onChange={(e) => handleChange('razorpay', 'keyId', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="rzp_test_xxxxxxxxxxxxxxxx"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Your Razorpay Key ID
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="razorpay-key-secret" className="block text-sm font-medium text-gray-700 mb-1">
                      Key Secret
                    </label>
                    <div className="relative">
                      <input
                        id="razorpay-key-secret"
                        type={showSecrets.razorpay ? "text" : "password"}
                        value={paymentSettings.razorpay.keySecret}
                        onChange={(e) => handleChange('razorpay', 'keySecret', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="••••••••••••••••••••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => toggleShowSecret('razorpay')}
                      >
                        {showSecrets.razorpay ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Your Razorpay Key Secret
                    </p>
                  </div>
                  
                    <div>
                    <label htmlFor="razorpay-webhook-secret" className="block text-sm font-medium text-gray-700 mb-1">
                      Webhook Secret
                    </label>
                    <div className="relative">
                      <input
                        id="razorpay-webhook-secret"
                        type={showSecrets.razorpay ? "text" : "password"}
                        value={paymentSettings.razorpay.webhookSecret}
                        onChange={(e) => handleChange('razorpay', 'webhookSecret', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="••••••••••••••••••••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => toggleShowSecret('razorpay')}
                      >
                        {showSecrets.razorpay ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Optional: Your Razorpay Webhook Secret for verifying webhook events
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Customer Display Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="razorpay-display-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name
                      </label>
                      <input
                        id="razorpay-display-name"
                        type="text"
                        value={paymentSettings.razorpay.displayName}
                        onChange={(e) => handleChange('razorpay', 'displayName', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Name shown to customers during checkout
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="razorpay-processing-fee" className="block text-sm font-medium text-gray-700 mb-1">
                        Processing Fee
                      </label>
                      <input
                        id="razorpay-processing-fee"
                        type="text"
                        value={paymentSettings.razorpay.processingFee}
                        onChange={(e) => handleChange('razorpay', 'processingFee', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="2%"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        For your reference only (not shown to customers)
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label htmlFor="razorpay-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      id="razorpay-description"
                      type="text"
                      value={paymentSettings.razorpay.description}
                      onChange={(e) => handleChange('razorpay', 'description', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Short description shown to customers during checkout
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cash on Delivery Settings */}
            {activeGateway === 'cashOnDelivery' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Cash on Delivery Settings</h2>
                  <div className="flex items-center">
                    <span className="mr-3 text-sm text-gray-500">
                      {paymentSettings.cashOnDelivery.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      type="button"
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                        paymentSettings.cashOnDelivery.enabled ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      onClick={() => handleChange('cashOnDelivery', 'enabled', !paymentSettings.cashOnDelivery.enabled)}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                          paymentSettings.cashOnDelivery.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiAlertCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Cash on Delivery allows customers to pay when they receive their order. This may lead to higher cancellation rates.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="cod-min-order" className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Order Amount (₹)
                    </label>
                    <input
                      id="cod-min-order"
                      type="number"
                      value={paymentSettings.cashOnDelivery.minOrderAmount}
                      onChange={(e) => handleChange('cashOnDelivery', 'minOrderAmount', parseInt(e.target.value) || 0)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Minimum order amount required for COD (0 for no minimum)
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="cod-max-order" className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Order Amount (₹)
                    </label>
                      <input
                      id="cod-max-order"
                      type="number"
                      value={paymentSettings.cashOnDelivery.maxOrderAmount}
                      onChange={(e) => handleChange('cashOnDelivery', 'maxOrderAmount', parseInt(e.target.value) || 0)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Maximum order amount allowed for COD (0 for no maximum)
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="cod-additional-fee" className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Fee (₹)
                    </label>
                      <input
                      id="cod-additional-fee"
                      type="number"
                      value={paymentSettings.cashOnDelivery.additionalFee}
                      onChange={(e) => handleChange('cashOnDelivery', 'additionalFee', parseInt(e.target.value) || 0)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Extra fee to charge for COD orders (0 for no fee)
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Customer Display Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="cod-display-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name
                      </label>
                      <input
                        id="cod-display-name"
                        type="text"
                        value={paymentSettings.cashOnDelivery.displayName}
                        onChange={(e) => handleChange('cashOnDelivery', 'displayName', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Name shown to customers during checkout
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label htmlFor="cod-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      id="cod-description"
                      type="text"
                      value={paymentSettings.cashOnDelivery.description}
                      onChange={(e) => handleChange('cashOnDelivery', 'description', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Short description shown to customers during checkout
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">COD Recommendations</h3>
                  <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                    <li>Consider adding a small fee to discourage frivolous COD orders</li>
                    <li>Set reasonable minimum and maximum order amounts</li>
                    <li>You may want to restrict COD to certain pin codes or regions</li>
                    <li>Monitor your COD cancellation rate and adjust settings accordingly</li>
                  </ul>
                </div>
              </div>
            )}

            {/* PhonePe Settings */}
            {activeGateway === 'phonepe' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">PhonePe Settings</h2>
                  <div className="flex items-center">
                    <span className="mr-3 text-sm text-gray-500">
                      {paymentSettings.phonepe.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      type="button"
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                        paymentSettings.phonepe.enabled ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      onClick={() => handleChange('phonepe', 'enabled', !paymentSettings.phonepe.enabled)}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                          paymentSettings.phonepe.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiInfo className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-purple-700">
                        PhonePe is a popular Indian payment app that supports UPI, wallet, and card payments.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="phonepe-test-mode"
                    type="checkbox"
                    checked={paymentSettings.phonepe.testMode}
                    onChange={(e) => handleChange('phonepe', 'testMode', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="phonepe-test-mode" className="ml-2 block text-sm text-gray-700">
                    Test Mode
                  </label>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {paymentSettings.phonepe.testMode ? 'Test' : 'Live'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="phonepe-merchant-id" className="block text-sm font-medium text-gray-700 mb-1">
                      Merchant ID
                    </label>
                    <input
                      id="phonepe-merchant-id"
                      type="text"
                      value={paymentSettings.phonepe.merchantId}
                      onChange={(e) => handleChange('phonepe', 'merchantId', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="MERCHANTUAT"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Your PhonePe merchant ID
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="phonepe-salt-key" className="block text-sm font-medium text-gray-700 mb-1">
                      Salt Key
                    </label>
                    <div className="relative">
                      <input
                        id="phonepe-salt-key"
                        type={showSecrets.phonepe ? "text" : "password"}
                        value={paymentSettings.phonepe.saltKey}
                        onChange={(e) => handleChange('phonepe', 'saltKey', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="••••••••••••••••••••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => toggleShowSecret('phonepe')}
                      >
                        {showSecrets.phonepe ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Salt key for securing transactions
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="phonepe-salt-index" className="block text-sm font-medium text-gray-700 mb-1">
                      Salt Index
                    </label>
                    <input
                      id="phonepe-salt-index"
                      type="text"
                      value={paymentSettings.phonepe.saltIndex}
                      onChange={(e) => handleChange('phonepe', 'saltIndex', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="1"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Salt index provided by PhonePe
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Customer Display Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phonepe-display-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name
                      </label>
                      <input
                        id="phonepe-display-name"
                        type="text"
                        value={paymentSettings.phonepe.displayName}
                        onChange={(e) => handleChange('phonepe', 'displayName', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Name shown to customers during checkout
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="phonepe-processing-fee" className="block text-sm font-medium text-gray-700 mb-1">
                        Processing Fee
                      </label>
                      <input
                        id="phonepe-processing-fee"
                        type="text"
                        value={paymentSettings.phonepe.processingFee}
                        onChange={(e) => handleChange('phonepe', 'processingFee', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="1.8%"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        For your reference only (not shown to customers)
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label htmlFor="phonepe-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      id="phonepe-description"
                      type="text"
                      value={paymentSettings.phonepe.description}
                      onChange={(e) => handleChange('phonepe', 'description', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Short description shown to customers during checkout
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Paytm Settings */}
            {activeGateway === 'paytm' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Paytm Settings</h2>
                  <div className="flex items-center">
                    <span className="mr-3 text-sm text-gray-500">
                      {paymentSettings.paytm.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      type="button"
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                        paymentSettings.paytm.enabled ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      onClick={() => handleChange('paytm', 'enabled', !paymentSettings.paytm.enabled)}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                          paymentSettings.paytm.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiInfo className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Paytm is a widely used Indian payment solution that supports wallet, UPI, cards, and netbanking.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="paytm-test-mode"
                    type="checkbox"
                    checked={paymentSettings.paytm.testMode}
                    onChange={(e) => handleChange('paytm', 'testMode', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="paytm-test-mode" className="ml-2 block text-sm text-gray-700">
                    Test Mode
                  </label>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {paymentSettings.paytm.testMode ? 'Test' : 'Live'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="paytm-merchant-id" className="block text-sm font-medium text-gray-700 mb-1">
                      Merchant ID
                    </label>
                    <input
                      id="paytm-merchant-id"
                      type="text"
                      value={paymentSettings.paytm.merchantId}
                      onChange={(e) => handleChange('paytm', 'merchantId', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="PAYTM_MERCHANT_ID"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Your Paytm merchant ID
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="paytm-merchant-key" className="block text-sm font-medium text-gray-700 mb-1">
                      Merchant Key
                    </label>
                    <div className="relative">
                      <input
                        id="paytm-merchant-key"
                        type={showSecrets.paytm ? "text" : "password"}
                        value={paymentSettings.paytm.merchantKey}
                        onChange={(e) => handleChange('paytm', 'merchantKey', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="••••••••••••••••••••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => toggleShowSecret('paytm')}
                      >
                        {showSecrets.paytm ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Your Paytm merchant key
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="paytm-website" className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      id="paytm-website"
                      type="text"
                      value={paymentSettings.paytm.website}
                      onChange={(e) => handleChange('paytm', 'website', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="DEFAULT"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Your Paytm website
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="paytm-industry-type" className="block text-sm font-medium text-gray-700 mb-1">
                      Industry Type
                    </label>
                    <input
                      id="paytm-industry-type"
                      type="text"
                      value={paymentSettings.paytm.industryType}
                      onChange={(e) => handleChange('paytm', 'industryType', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Retail"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Your Paytm industry type
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Customer Display Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="paytm-display-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name
                      </label>
                      <input
                        id="paytm-display-name"
                        type="text"
                        value={paymentSettings.paytm.displayName}
                        onChange={(e) => handleChange('paytm', 'displayName', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Name shown to customers during checkout
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="paytm-processing-fee" className="block text-sm font-medium text-gray-700 mb-1">
                        Processing Fee
                      </label>
                      <input
                        id="paytm-processing-fee"
                        type="text"
                        value={paymentSettings.paytm.processingFee}
                        onChange={(e) => handleChange('paytm', 'processingFee', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="2%"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        For your reference only (not shown to customers)
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label htmlFor="paytm-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      id="paytm-description"
                      type="text"
                      value={paymentSettings.paytm.description}
                      onChange={(e) => handleChange('paytm', 'description', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Short description shown to customers during checkout
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cashfree Settings */}
            {activeGateway === 'cashfree' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Cashfree Settings</h2>
                  <div className="flex items-center">
                    <span className="mr-3 text-sm text-gray-500">
                      {paymentSettings.cashfree.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      type="button"
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                        paymentSettings.cashfree.enabled ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      onClick={() => handleChange('cashfree', 'enabled', !paymentSettings.cashfree.enabled)}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                          paymentSettings.cashfree.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiAlertCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Cashfree is a popular Indian payment solution that supports UPI, cards, or netbanking.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="cashfree-app-id" className="block text-sm font-medium text-gray-700 mb-1">
                      App ID
                    </label>
                    <input
                      id="cashfree-app-id"
                      type="text"
                      value={paymentSettings.cashfree.appId}
                      onChange={(e) => handleChange('cashfree', 'appId', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="APP_ID"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Your Cashfree app ID
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="cashfree-secret-key" className="block text-sm font-medium text-gray-700 mb-1">
                      Secret Key
                    </label>
                    <div className="relative">
                      <input
                        id="cashfree-secret-key"
                        type={showSecrets.cashfree ? "text" : "password"}
                        value={paymentSettings.cashfree.secretKey}
                        onChange={(e) => handleChange('cashfree', 'secretKey', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="••••••••••••••••••••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => toggleShowSecret('cashfree')}
                      >
                        {showSecrets.cashfree ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Your Cashfree secret key
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Customer Display Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="cashfree-display-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name
                      </label>
                      <input
                        id="cashfree-display-name"
                        type="text"
                        value={paymentSettings.cashfree.displayName}
                        onChange={(e) => handleChange('cashfree', 'displayName', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Name shown to customers during checkout
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="cashfree-processing-fee" className="block text-sm font-medium text-gray-700 mb-1">
                        Processing Fee
                      </label>
                      <input
                        id="cashfree-processing-fee"
                        type="text"
                        value={paymentSettings.cashfree.processingFee}
                        onChange={(e) => handleChange('cashfree', 'processingFee', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="1.9%"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        For your reference only (not shown to customers)
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label htmlFor="cashfree-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      id="cashfree-description"
                      type="text"
                      value={paymentSettings.cashfree.description}
                      onChange={(e) => handleChange('cashfree', 'description', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Short description shown to customers during checkout
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Flutterwave Settings */}
            {activeGateway === 'flutterwave' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Flutterwave Settings</h2>
                  <div className="flex items-center">
                    <span className="mr-3 text-sm text-gray-500">
                      {paymentSettings.flutterwave.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      type="button"
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                        paymentSettings.flutterwave.enabled ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      onClick={() => handleChange('flutterwave', 'enabled', !paymentSettings.flutterwave.enabled)}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                          paymentSettings.flutterwave.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiInfo className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-purple-700">
                        Flutterwave is a popular Indian payment solution that supports multiple payment methods.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="flutterwave-test-mode"
                    type="checkbox"
                    checked={paymentSettings.flutterwave.testMode}
                    onChange={(e) => handleChange('flutterwave', 'testMode', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="flutterwave-test-mode" className="ml-2 block text-sm text-gray-700">
                    Test Mode
                  </label>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {paymentSettings.flutterwave.testMode ? 'Test' : 'Live'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="flutterwave-public-key" className="block text-sm font-medium text-gray-700 mb-1">
                      Public Key
                    </label>
                    <input
                      id="flutterwave-public-key"
                      type="text"
                      value={paymentSettings.flutterwave.publicKey}
                      onChange={(e) => handleChange('flutterwave', 'publicKey', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="FLWPUBK-xxxxxxxxxxxxxxxx-X"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Your Flutterwave public key
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="flutterwave-secret-key" className="block text-sm font-medium text-gray-700 mb-1">
                      Secret Key
                    </label>
                    <div className="relative">
                      <input
                        id="flutterwave-secret-key"
                        type={showSecrets.flutterwave ? "text" : "password"}
                        value={paymentSettings.flutterwave.secretKey}
                        onChange={(e) => handleChange('flutterwave', 'secretKey', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="FLWSECK-xxxxxxxxxxxxxxxx-X"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => toggleShowSecret('flutterwave')}
                      >
                        {showSecrets.flutterwave ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Your Flutterwave secret key
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Customer Display Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="flutterwave-display-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name
                      </label>
                      <input
                        id="flutterwave-display-name"
                        type="text"
                        value={paymentSettings.flutterwave.displayName}
                        onChange={(e) => handleChange('flutterwave', 'displayName', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Name shown to customers during checkout
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="flutterwave-processing-fee" className="block text-sm font-medium text-gray-700 mb-1">
                        Processing Fee
                      </label>
                      <input
                        id="flutterwave-processing-fee"
                        type="text"
                        value={paymentSettings.flutterwave.processingFee}
                        onChange={(e) => handleChange('flutterwave', 'processingFee', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="2.5%"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        For your reference only (not shown to customers)
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label htmlFor="flutterwave-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      id="flutterwave-description"
                      type="text"
                      value={paymentSettings.flutterwave.description}
                      onChange={(e) => handleChange('flutterwave', 'description', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Short description shown to customers during checkout
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SabPaisa Settings */}
            {/* PayPal Settings */}
            {/* Stripe Settings */}
         
          </div>
        </div>
      </div>
    </div>
  );
}


