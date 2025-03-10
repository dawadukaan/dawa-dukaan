// app/delete/page.js

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiAlertTriangle, FiInfo, FiLock, FiShield, FiDatabase, FiCheck } from 'react-icons/fi';

export default function DeletePage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    reason: '',
    confirmDelete: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Send the deletion request to our API endpoint
      const response = await fetch('/api/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          reason: formData.reason
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit request');
      }
      
      setSubmitStatus({
        success: true,
        message: data.message || 'Your account deletion request has been submitted successfully.',
        requestId: data.requestId
      });
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        reason: '',
        confirmDelete: false
      });
    } catch (error) {
      console.error('Error submitting deletion request:', error);
      setSubmitStatus({
        success: false,
        message: error.message || 'There was an error submitting your request. Please try again or contact support.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Account Deletion Request</h2>
            <p className="mt-2 text-gray-600">
              Fill out this form to request the deletion of your account and associated data.
            </p>
          </div>
          
          {submitStatus ? (
            <div className={`rounded-md p-4 mb-6 ${submitStatus.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {submitStatus.success ? (
                    <FiCheck className="h-5 w-5 text-green-400" />
                  ) : (
                    <FiAlertTriangle className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${submitStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                    {submitStatus.message}
                  </p>
                  
                  {submitStatus.success && submitStatus.requestId && (
                    <p className="mt-1 text-sm text-gray-600">
                      Request ID: {submitStatus.requestId}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <Link 
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Registered Phone Number
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Registered Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                  Reason for Deletion
                </label>
                <div className="mt-1">
                  <textarea
                    id="reason"
                    name="reason"
                    rows="4"
                    required
                    value={formData.reason}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Please tell us why you want to delete your account"
                  ></textarea>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiInfo className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Data Deletion Information</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        When you delete your account, we will:
                      </p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Remove your personal information (name, email, phone)</li>
                        <li>Delete your profile picture and account settings</li>
                        <li>Remove your saved addresses and payment information</li>
                      </ul>
                      <p className="mt-2">
                        Some information may be retained for legal and regulatory purposes for up to 90 days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="confirmDelete"
                    name="confirmDelete"
                    type="checkbox"
                    required
                    checked={formData.confirmDelete}
                    onChange={handleChange}
                    className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="confirmDelete" className="font-medium text-gray-700">
                    I understand that this action cannot be undone
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="text-sm font-medium text-green-600 hover:text-green-500"
                >
                  Cancel and return to home
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.confirmDelete}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex items-center mt-4">
              <FiShield className="h-5 w-5 text-gray-400" />
              <h3 className="ml-2 text-sm font-medium text-gray-900">Need Help?</h3>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              If you need assistance with your account or have questions about data deletion,
              please contact our support team at <a href="mailto:contact@dozit.in" className="text-green-600 hover:text-green-500">contact@dozit.in</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

