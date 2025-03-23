'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiSend,
  FiUsers,
  FiUser,
  FiFilter,
  FiSearch,
  FiX,
  FiCheck,
  FiAlertTriangle,
  FiInfo,
  FiArrowLeft,
  FiUserCheck,
  FiCheckCircle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getCookie } from 'cookies-next';
import env from '@/lib/config/env';

export default function SendNotificationPage() {
  const router = useRouter();
  const token = getCookie('token');
  
  // Notification form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notificationType, setNotificationType] = useState('info');
  const [recipientType, setRecipientType] = useState('all');
  
  // Users state
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [role, setRole] = useState('all');
  const [userType, setUserType] = useState('all');
  const [activeFilter, setActiveFilter] = useState(true);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Add a new state variable for FCM tokens
  const [fcmTokens, setFcmTokens] = useState([]);
  const [tokensByUser, setTokensByUser] = useState([]);
  const [tokenStats, setTokenStats] = useState({ totalTokens: 0, uniqueUsers: 0 });
  const [recipientSource, setRecipientSource] = useState('tokens'); // Changed default to 'tokens'
  
  // Fetch tokens on component mount - we don't need the conditional anymore
  useEffect(() => {
    fetchFCMTokens();
  }, [token]);
  
  // Filter users when filters change
  useEffect(() => {
    filterUsers();
  }, [searchTerm, role, userType, activeFilter, users]);
  
  // Handle select all when filtered users change
  useEffect(() => {
    if (selectAll) {
      setSelectedUsers(filteredUsers.map(user => user._id));
    }
  }, [selectAll, filteredUsers]);
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${env.app.apiUrl}/admin/users`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      
      // Check if the response has the expected structure
      if (data.success && data.data) {
        // Handle both array and object with users property formats
        const usersArray = Array.isArray(data.data) ? data.data : 
                          (data.data.users && Array.isArray(data.data.users)) ? data.data.users : [];
        
        console.log('Received users data:', usersArray.length, 'users');
        setUsers(usersArray);
        setFilteredUsers(usersArray);
      } else {
        console.warn('Unexpected API response format:', data);
        setUsers([]);
        setFilteredUsers([]);
        throw new Error(data.message || 'Invalid response format from users API');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setError(error.message);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filterUsers = () => {
    if (!Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }
    
    const filtered = users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.phone?.includes(searchTerm);
      
      const matchesRole = role === 'all' || user.role === role;
      const matchesType = userType === 'all' || user.type === userType;
      const matchesActive = !activeFilter || user.isActive;
      
      return matchesSearch && matchesRole && matchesType && matchesActive;
    });
    
    setFilteredUsers(filtered);
    
    // Update selectedUsers based on the new filtered list
    setSelectedUsers(prev => prev.filter(userId => 
      filtered.some(user => user._id === userId)
    ));
  };
  
  const handleSelectAll = () => {
    if (!Array.isArray(filteredUsers)) {
      return;
    }
    
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user._id));
    }
    setSelectAll(!selectAll);
  };
  
  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setRole('all');
    setUserType('all');
    setActiveFilter(true);
  };
  
  const fetchFCMTokens = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${env.app.apiUrl}/admin/notifications/fcm-tokens`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch FCM tokens');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Extract user information from tokens
        const usersWithTokens = data.data.tokensByUser.map(item => ({
          ...item.user,
          tokenCount: item.tokens.length,
          hasTokens: true
        }));
        
        console.log('Received tokens data:', data.data.totalTokens, 'tokens for', usersWithTokens.length, 'users');
        
        setFcmTokens(data.data.tokens);
        setTokensByUser(data.data.tokensByUser);
        setTokenStats({
          totalTokens: data.data.totalTokens || 0,
          uniqueUsers: data.data.uniqueUsers || 0
        });
        
        // Update users state with token-enabled users
        setUsers(usersWithTokens);
        setFilteredUsers(usersWithTokens);
      } else {
        console.warn('Unexpected API response format:', data);
        setFcmTokens([]);
        setTokensByUser([]);
        setTokenStats({ totalTokens: 0, uniqueUsers: 0 });
        setUsers([]);
        setFilteredUsers([]);
        throw new Error(data.message || 'Invalid response format from FCM tokens API');
      }
    } catch (error) {
      console.error('Error fetching FCM tokens:', error);
      toast.error('Failed to load device tokens');
      setError(error.message);
      setFcmTokens([]);
      setTokensByUser([]);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    if (!title || !body) {
      setError('Title and body are required');
      return;
    }
    
    if (tokenStats.uniqueUsers === 0) {
      setError('No users with device tokens found. Cannot send notifications.');
      return;
    }
    
    setIsSending(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Base notification payload
      const payload = {
        title,
        body,
        type: notificationType,
        data: {
          url: '/notifications',
          timestamp: new Date().toISOString(),
        }
      };
      
      // Add token information based on recipient type
      if (recipientType === 'specific' && selectedUsers.length > 0) {
        // Find all tokens for selected users
        const selectedTokens = [];
        const selectedUserTokens = {};
        
        // Create a map of userId -> tokens
        selectedUsers.forEach(userId => {
          const userTokenData = tokensByUser.find(item => item.user._id === userId);
          if (userTokenData && userTokenData.tokens.length > 0) {
            selectedUserTokens[userId] = userTokenData.tokens.map(t => t.token);
            selectedTokens.push(...userTokenData.tokens.map(t => t.token));
          }
        });
        
        if (selectedTokens.length === 0) {
          throw new Error('None of the selected users have registered notification tokens');
        }
        
        // Send tokens directly in the payload
        payload.tokens = selectedTokens;
        payload.userTokens = selectedUserTokens;
        payload.userIds = selectedUsers;
      } else if (recipientType === 'all') {
        // Send all available tokens directly
        const allTokens = fcmTokens.map(t => t.token);
        payload.tokens = allTokens;
        payload.onlyWithTokens = true;
      }
      
      console.log('Sending notification with payload:', payload);
      
      const response = await fetch(`${env.app.apiUrl}/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log('Notification API response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to send notification');
      }
      
      setSuccess(`Notification sent successfully!${data.data?.success ? ` (Success: ${data.data.success}, Failure: ${data.data.failure || 0})` : ''}`);
      
      // Reset form
      setTitle('');
      setBody('');
      
      // Show success toast
      toast.success('Notification sent successfully!');
      
      // Redirect to notifications list after successful send
      setTimeout(() => {
        router.push('/dashboard/notifications');
      }, 2000);
    } catch (error) {
      console.error('Error sending notification:', error);
      setError(error.message || 'An error occurred while sending the notification');
      toast.error('Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push('/dashboard/notifications')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Send Notification</h1>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notification Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <FiSend className="mr-2" />
            Notification Details
          </h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <FiAlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <FiCheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <span>{success}</span>
            </div>
          )}
          
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Notification Title*
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter notification title"
                required
              />
            </div>
            
            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
                Notification Body*
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows="5"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter notification message"
                required
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Notification Type
              </label>
              <select
                id="type"
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="alert">Alert</option>
                <option value="order">Order</option>
                <option value="message">Message</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Information
              </label>
              <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm mb-3">
                <div className="flex items-start">
                  <FiInfo className="mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p><strong>Showing only users with registered device tokens.</strong></p>
                    <p className="mt-1">
                      {tokenStats.uniqueUsers > 0 
                        ? `These ${tokenStats.uniqueUsers} users have ${tokenStats.totalTokens} devices registered that can receive notifications.`
                        : "No users with registered devices found. Users must have the app installed to receive notifications."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipients
              </label>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center">
                  <input
                    id="all-users"
                    name="recipient"
                    type="radio"
                    checked={recipientType === 'all'}
                    onChange={() => setRecipientType('all')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="all-users" className="ml-2 block text-sm text-gray-700 flex items-center">
                    <FiUsers className="mr-1" /> All Users
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="specific-users"
                    name="recipient"
                    type="radio"
                    checked={recipientType === 'specific'}
                    onChange={() => setRecipientType('specific')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="specific-users" className="ml-2 block text-sm text-gray-700 flex items-center">
                    <FiUserCheck className="mr-1" /> Selected Users ({selectedUsers.length})
                  </label>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSending || (recipientType === 'specific' && selectedUsers.length === 0)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend className="w-5 h-5 mr-2" />
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* User Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center justify-between">
            <div className="flex items-center">
              <FiUsers className="mr-2" />
              Select Recipients
            </div>
            <div className="text-sm font-normal text-blue-600">
              {selectedUsers.length} selected
            </div>
          </h2>
          
          {/* Search and filters */}
          <div className="space-y-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email or phone..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <FiFilter className="mr-1" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              {showFilters && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Reset Filters
                </button>
              )}
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="vendor">Vendor</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    User Type
                  </label>
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="licensee">Licensee</option>
                    <option value="unlicensed">Unlicensed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Status
                  </label>
                  <div className="flex items-center h-10">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={activeFilter}
                        onChange={() => setActiveFilter(!activeFilter)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active users only</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* User list */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  checked={selectAll && filteredUsers.length > 0}
                  onChange={handleSelectAll}
                  disabled={filteredUsers.length === 0}
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {selectAll ? 'Deselect All' : 'Select All'}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
              </span>
            </div>
            
            <div className="overflow-y-auto max-h-[400px]">
              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                </div>
              ) : !Array.isArray(filteredUsers) || filteredUsers.length === 0 ? (
                <div className="py-8 text-center">
                  <FiInfo className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">No users found</p>
                  <p className="text-xs text-gray-400">Try adjusting your filters</p>
                </div>
              ) : (
                <>
                  {tokenStats.uniqueUsers === 0 && (
                    <div className="py-8 text-center bg-yellow-50 rounded-lg my-4">
                      <FiAlertTriangle className="h-8 w-8 text-yellow-500 mx-auto" />
                      <p className="mt-2 text-sm font-medium text-yellow-700">No users with device tokens found</p>
                      <p className="text-xs text-yellow-600 mt-1 max-w-md mx-auto">
                        Users must install the app and allow notifications to receive them. 
                        Database notifications will still be created but push notifications can't be delivered.
                      </p>
                    </div>
                  )}
                  <ul className="divide-y divide-gray-200">
                    {filteredUsers.map(user => (
                      <li key={user._id} className="px-4 py-3 hover:bg-gray-50">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleUserSelect(user._id)}
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <div className="flex space-x-2">
                                {user.type === 'licensee' && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Licensee
                                  </span>
                                )}
                                {recipientSource === 'tokens' && user.tokenCount && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {user.tokenCount} {user.tokenCount === 1 ? 'Device' : 'Devices'}
                                  </span>
                                )}
                                {!user.isActive && (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    Inactive
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.phone && (
                              <p className="text-xs text-gray-400">{user.phone}</p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 