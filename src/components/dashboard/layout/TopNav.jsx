'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiBell, FiMenu, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { deleteCookie, getCookie } from 'cookies-next';
import toast from 'react-hot-toast';

export function TopNav({ onToggleSidebar }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Get user data from token and localStorage on component mount
  useEffect(() => {
    // First try to get from localStorage for faster access
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }

    // Then verify with token
    const token = getCookie('token');
    if (token) {
      try {
        // Decode the JWT token to get user info
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        
        const payload = JSON.parse(jsonPayload);
        
        // Update userData from token
        setUserData({
          name: payload.name,
          email: payload.email,
          role: payload.role
        });
        
        // If token data is different from localStorage, update localStorage
        if (storedUserData) {
          const parsedStoredData = JSON.parse(storedUserData);
          if (
            parsedStoredData.name !== payload.name ||
            parsedStoredData.email !== payload.email ||
            parsedStoredData.role !== payload.role
          ) {
            localStorage.setItem('userData', JSON.stringify({
              id: payload.id,
              name: payload.name,
              email: payload.email,
              role: payload.role
            }));
          }
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        // If token is invalid, redirect to login
        deleteCookie('token');
        localStorage.removeItem('userData');
        router.push('/admin/login');
      }
    } else if (!storedUserData) {
      // If no token and no stored data, redirect to login
      router.push('/admin/login');
    }
  }, [router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Delete the auth token cookie
    deleteCookie('token');
    
    // Clear localStorage
    localStorage.removeItem('userData');
    
    // Show success message
    toast.success('Logged out successfully');
    
    // Redirect to login page
    router.push('/admin/login');
  };

  return (
    <nav className="bg-white shadow-sm fixed w-full z-40">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-md p-1"
            aria-label="Toggle sidebar"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          <Link href="/dashboard" className="ml-4 flex items-center">
            <span className="text-lg font-semibold text-green-600">DavaDukaan Admin</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-600 hover:text-gray-800 relative">
            <FiBell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              className="flex items-center focus:outline-none p-1 rounded-full hover:bg-gray-100"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                {userData?.name ? userData.name.charAt(0).toUpperCase() : <FiUser className="w-5 h-5" />}
              </div>
            </button>
            
            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userData?.name || 'Admin User'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {userData?.email || 'admin@example.com'}
                  </p>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {userData?.role || 'admin'}
                    </span>
                  </div>
                </div>
                
                <div className="py-1">
                  <Link 
                    href="/admin/profile" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FiUser className="mr-3 h-4 w-4 text-gray-500" />
                    Profile
                  </Link>
                  
                  <Link 
                    href="/admin/settings" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FiSettings className="mr-3 h-4 w-4 text-gray-500" />
                    Settings
                  </Link>
                </div>
                
                <div className="py-1 border-t border-gray-100">
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut className="mr-3 h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}