'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { setCookie, getCookie } from 'cookies-next';
import { registerAdminFCMToken } from '@/lib/fcm/adminTokenManager';
import { requestNotificationPermission } from '@/lib/firebase/firebase';

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const token = getCookie('token');
    if (token) {
      try {
        // Decode token to check role
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        
        const payload = JSON.parse(jsonPayload);
        
        // If user is admin or vendor, redirect to dashboard
        if (payload.role === 'admin' || payload.role === 'vendor') {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        // If token is invalid, remove it
        setCookie('token', '', { maxAge: 0, path: '/' });
      }
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get API URL from environment variable or use default
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      
      // Make API request to login endpoint
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }

      // Check if user has admin role
      const userRole = data.data.user?.role;
      
      if (userRole !== 'admin' && userRole !== 'vendor') {
        setError('You are not authorized to access the admin dashboard.');
        setLoading(false);
        toast.error('You are not authorized to access the admin dashboard.', {
          duration: 3000,
        });
        return;
      }
      
      // Set the token in a cookie
      if (data.data && data.data.token) {
        setCookie('token', data.data.token, {
          maxAge: 30 * 24 * 60 * 60, // 30 days - same as JWT expiration
          path: '/',
          sameSite: 'strict', // Enhance security
          secure: process.env.NODE_ENV === 'production' // Use secure in production
        });
        
        // Store user data in localStorage for easy access
        localStorage.setItem('userData', JSON.stringify({
          id: data.data.user.id,
          name: data.data.user.name,
          email: data.data.user.email,
          role: data.data.user.role
        }));
      }
      
      // Show success message
      toast.success('Login successful!', {
        duration: 3000,
      });
      
      // Call registerFCMToken without await - it will handle navigation internally
      registerFCMToken(data.data.user.id).catch(err => {
        console.error('FCM registration error (non-blocking):', err);
      });
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
      toast.error(error.message || 'An error occurred during login', {
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Update the registerFCMToken function
  const registerFCMToken = async (userId) => {
    try {
      console.log("Starting FCM token registration process...");
      
      // Check if notifications are supported in this browser
      if (!("Notification" in window)) {
        console.warn("This browser does not support notifications");
        return;
      }
      
      // First navigate to dashboard to avoid blocking
      router.push('/dashboard');
      
      // Delay the notification permission request to ensure it doesn't block navigation
      setTimeout(async () => {
        try {
          // Get FCM token using Firebase utility
          const token = await requestNotificationPermission();
          
          if (token) {
            // Get device info
            const deviceInfo = {
              browser: navigator.userAgent.match(/(firefox|msie|chrome|safari|trident)/i)?.[1] || 'Unknown',
              os: navigator.userAgent.match(/windows|mac|linux|android|iphone|ipad/i)?.[0] || 'Unknown',
              name: `Admin Dashboard (${window.innerWidth}x${window.innerHeight})`
            };
            
            // Register the token with the server
            const result = await registerAdminFCMToken(token, deviceInfo);
            console.log('FCM token registration result:', result);
            
            toast.success('Notifications enabled for this device', {
              duration: 3000,
              icon: '🔔'
            });
          }
        } catch (error) {
          console.error('Error in FCM token registration process:', error);
          // Only show error for permission denied, not for technical errors
          if (error.message.includes('permission')) {
            toast.error('To receive notifications, please enable them in your browser settings.', {
              duration: 5000,
            });
          }
        }
      }, 1000); // Delay by 1 second
      
    } catch (error) {
      console.error('Error in FCM token registration outer process:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-full mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 sm:p-6 text-center">
        <div className="inline-flex items-center justify-center bg-white rounded-full p-2 shadow-lg mb-3 sm:mb-4">
          <Image
            src="https://images.unsplash.com/photo-1563213126-a4273aed2016?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="DavaDukaan Logo"
            width={50}
            height={50}
            className="rounded-full"
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Dawa Dukaan Admin Portal</h1>
        <p className="text-blue-100 text-xs sm:text-sm mt-1">Manage your medical store efficiently</p>
      </div>

      {/* Login Form */}
      <div className="p-4 sm:p-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
          Administrator Login
        </h2>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm">
            <div className="flex">
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[45px] sm:h-[50px] flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clipRule="evenodd" />
                </svg>
                Sign in to Dashboard
              </span>
            )}
          </button>
        </form>
      </div>
      
      <div className="px-4 sm:px-8 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <Link href="/" className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Return to main site
        </Link>
        <p className="text-xs sm:text-sm text-gray-500">
          © {new Date().getFullYear()} DavaDukaan
        </p>
      </div>
    </div>
  );
}

