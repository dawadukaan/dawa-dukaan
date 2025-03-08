'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { setCookie, getCookie } from 'cookies-next';

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
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/'
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
      
      // Redirect to dashboard
      router.push('/dashboard');
      
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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-green-800 to-green-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-10">
          <div className="bg-white rounded-full p-3 inline-block mb-4 shadow-lg">
            <Image
              src="/images/logo.jpg"
              alt="DavaDukaan Logo"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">DavaDukaan Admin</h1>
          <p className="text-green-200 text-sm">Manage your vegetable marketplace</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Sign In</h2>
            
            {/* Fixed height error container to prevent layout shifts */}
            <div className="min-h-[60px] mb-4">
              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                  <div className="flex">
                    <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p>{error}</p>
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="••••••••"
                />
              </div>

              {/* Fixed height button with consistent content layout */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[50px] flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <span>Sign in to Dashboard</span>
                )}
              </button>
            </form>
          </div>
          
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <Link href="/" className="text-sm text-green-600 hover:text-green-800 font-medium">
              Return to main site
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-green-200">
          <p>© {new Date().getFullYear()} DavaDukaan. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

