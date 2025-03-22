'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiTrash2, 
  FiSearch, 
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiMessageCircle,
  FiSend,
  FiUsers,
  FiUser,
  FiCalendar,
  FiClock,
  FiEye,
  FiEyeOff,
  FiBell,
  FiAlertTriangle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getCookie } from 'cookies-next';
import env from '@/lib/config/env';

export default function NotificationsPage() {
  const router = useRouter();
  
  // State variables
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [users, setUsers] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const token = getCookie('token');

  // New notification form state
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    recipients: 'all', // all, users, vendors, providers
    scheduledFor: '',
    sendNow: true
  });

  // Define fetchNotifications at the component level so it can be called from multiple places
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Fetch real notifications from the API
      const response = await fetch(`${env.app.apiUrl}/admin/notifications`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setNotifications(data.data);
      } else if (data.success && data.data && Array.isArray(data.data.notifications)) {
        // Handle case where notifications are nested in data.data.notifications
        setNotifications(data.data.notifications);
      } else {
        console.warn('Unexpected API response format:', data);
        setNotifications([]); // Set to empty array if data format is unexpected
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
      
      // Fallback to empty array if API fails
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch notifications data
  useEffect(() => {
    fetchNotifications();
  }, [token]);

  // Fetch users
  useEffect(() => {
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
        
        if (data.success && data.data) {
          setUsers(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [token]);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'system':
        return <FiInfo className="w-5 h-5 text-blue-500" />;
      case 'feature':
        return <FiMessageCircle className="w-5 h-5 text-purple-500" />;
      case 'promotion':
        return <FiSend className="w-5 h-5 text-green-500" />;
      case 'event':
        return <FiCalendar className="w-5 h-5 text-orange-500" />;
      case 'alert':
        return <FiAlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FiInfo className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'system':
        return 'System';
      case 'feature':
        return 'Feature Update';
      case 'promotion':
        return 'Promotion';
      case 'event':
        return 'Event';
      case 'alert':
        return 'Alert';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'system':
        return 'bg-blue-100 text-blue-800';
      case 'feature':
        return 'bg-purple-100 text-purple-800';
      case 'promotion':
        return 'bg-green-100 text-green-800';
      case 'event':
        return 'bg-orange-100 text-orange-800';
      case 'alert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'sent':
        return 'Sent';
      case 'scheduled':
        return 'Scheduled';
      case 'draft':
        return 'Draft';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getRecipientLabel = (recipients) => {
    switch (recipients) {
      case 'all':
        return 'All Users';
      case 'users':
        return 'Customers';
      case 'vendors':
        return 'Vendors';
      case 'providers':
        return 'Service Providers';
      default:
        return recipients.charAt(0).toUpperCase() + recipients.slice(1);
    }
  };

  const getRecipientIcon = (recipients) => {
    switch (recipients) {
      case 'all':
        return <FiUsers className="w-5 h-5 text-gray-500" />;
      case 'users':
        return <FiUser className="w-5 h-5 text-blue-500" />;
      case 'vendors':
        return <FiUser className="w-5 h-5 text-green-500" />;
      case 'providers':
        return <FiUser className="w-5 h-5 text-purple-500" />;
      default:
        return <FiUsers className="w-5 h-5 text-gray-500" />;
    }
  };

  // Filter notifications
  const filteredNotifications = Array.isArray(notifications) 
    ? notifications.filter(notification => {
        const matchesSearch = 
          notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.body?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = typeFilter === 'all' || notification.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
        
        return matchesSearch && matchesType && matchesStatus;
      })
    : [];

  // Sort notifications
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        const dateA = a.createdAt || a.scheduledFor || a.sentAt;
        const dateB = b.createdAt || b.scheduledFor || b.sentAt;
        comparison = new Date(dateA || 0) - new Date(dateB || 0);
        break;
      case 'title':
        comparison = (a.title || '').localeCompare(b.title || '');
        break;
      case 'type':
        comparison = (a.type || '').localeCompare(b.type || '');
        break;
      case 'status':
        comparison = (a.status || '').localeCompare(b.status || '');
        break;
      default:
        const defaultDateA = a.createdAt || a.scheduledFor || a.sentAt;
        const defaultDateB = b.createdAt || b.scheduledFor || b.sentAt;
        comparison = new Date(defaultDateA || 0) - new Date(defaultDateB || 0);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Handle notification selection
  const toggleNotificationSelection = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(notificationId => notificationId !== id)
        : [...prev, id]
    );
  };

  // Handle bulk selection
  const toggleAllNotifications = () => {
    if (selectedNotifications.length === sortedNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(sortedNotifications.map(notification => notification._id));
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (selectedNotifications.length > 0) {
      setIsLoading(true);
      
      try {
        // Delete each selected notification
        const deletePromises = selectedNotifications.map(notificationId => 
          fetch(`${env.app.apiUrl}/admin/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })
        );
        
        await Promise.all(deletePromises);
        
        // Update the notifications list
        setNotifications(prev => prev.filter(notification => !selectedNotifications.includes(notification._id)));
        setSelectedNotifications([]);
        toast.success(`${selectedNotifications.length} notifications deleted successfully`);
      } catch (error) {
        console.error('Error deleting notifications:', error);
        toast.error('Failed to delete some notifications');
      } finally {
        setIsLoading(false);
      }
      
      setShowDeleteModal(false);
    }
  };

  // Handle send notification
  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    if (!title || !body) {
      setError('Title and body are required');
      return;
    }
    
    setIsSending(true);
    setError(null);
    setSuccess(null);
    
    try {
      const payload = {
        title,
        body,
        data: {
          url: '/notifications',
          timestamp: new Date().toISOString(),
        }
      };
      
      // Add userId if sending to specific user
      if (selectedUser) {
        payload.userId = selectedUser;
      }
      
      console.log('Sending notification with payload:', payload);
      
      const response = await fetch(`${env.app.apiUrl}/admin/notifications/send`, {
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
      setSelectedUser('');
      
      // Close modal after successful send
      setTimeout(() => {
        setShowSendModal(false);
        // Refresh notifications list
        fetchNotifications();
      }, 2000);
    } catch (error) {
      console.error('Error sending notification:', error);
      setError(error.message || 'An error occurred while sending the notification');
    } finally {
      setIsSending(false);
    }
  };

  // Add a function to handle notification deletion
  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`${env.app.apiUrl}/admin/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete notification');
      }
      
      // Update the notifications list
      setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
      toast.success('Notification deleted successfully');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error(error.message || 'Failed to delete notification');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <button
          onClick={() => router.push('/dashboard/notifications/send')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <FiSend className="w-5 h-5 mr-2" />
          Send Notification
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Notifications</p>
              <h3 className="text-2xl font-bold text-gray-900">{Array.isArray(notifications) ? notifications.length : 0}</h3>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <FiBell className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sent</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {Array.isArray(notifications) ? notifications.filter(notification => notification.status === 'sent').length : 0}
              </h3>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <FiCheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Scheduled</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {Array.isArray(notifications) ? notifications.filter(notification => notification.status === 'scheduled').length : 0}
              </h3>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <FiClock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Read Rate</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {Array.isArray(notifications) ? Math.round(
                  (notifications.reduce((sum, notification) => sum + (notification.readCount || 0), 0) / 
                  Math.max(1, notifications.reduce((sum, notification) => sum + (notification.recipientCount || 0), 0))) * 100
                ) : 0}%
              </h3>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
              <FiEye className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-1/3">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center w-full md:w-2/3 justify-end">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="system">System</option>
              <option value="feature">Feature Update</option>
              <option value="promotion">Promotion</option>
              <option value="event">Event</option>
              <option value="alert">Alert</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
            </select>
            
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
                <option value="type">Sort by Type</option>
                <option value="status">Sort by Status</option>
              </select>
              
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
            
            {selectedNotifications.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-50 text-red-600 px-3 py-2 rounded-lg flex items-center hover:bg-red-100"
                >
                  <FiTrash2 className="w-4 h-4 mr-1" />
                  Delete ({selectedNotifications.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                      checked={selectedNotifications.length === sortedNotifications.length && sortedNotifications.length > 0}
                      onChange={toggleAllNotifications}
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notification
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Read
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedNotifications.map((notification) => (
                  <tr key={notification._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        checked={selectedNotifications.includes(notification._id)}
                        onChange={() => toggleNotificationSelection(notification._id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                          {getTypeIcon(notification.type || 'info')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{notification.body}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(notification.type || 'info')}
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(notification.type || 'info')}`}>
                          {getTypeLabel(notification.type || 'info')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {notification.user ? (
                          <>
                            <FiUser className="w-5 h-5 text-blue-500" />
                            <span className="ml-2 text-sm text-gray-900">Individual User</span>
                          </>
                        ) : (
                          <>
                            <FiUsers className="w-5 h-5 text-gray-500" />
                            <span className="ml-2 text-sm text-gray-900">All Users</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Sent: {formatDate(notification.createdAt)}</div>
                      <div className="text-xs text-gray-500">{formatTime(notification.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${notification.read ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {notification.read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {notification.read ? (
                        <FiCheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <FiEyeOff className="w-5 h-5 text-gray-400" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                          onClick={() => router.push(`/dashboard/notifications/${notification._id}`)}
                        >
                          <FiEye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedNotifications([notification._id]);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {sortedNotifications.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center">
                          <FiBell className="w-12 h-12 text-gray-300 mb-2" />
                          <p>No notifications yet</p>
                          <button 
                            onClick={() => setShowSendModal(true)}
                            className="mt-2 text-blue-600 hover:text-blue-800"
                          >
                            Create your first notification
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <FiSearch className="w-12 h-12 text-gray-300 mb-2" />
                          <p>No notifications match your filters</p>
                          <button 
                            onClick={() => {
                              setSearchTerm('');
                              setTypeFilter('all');
                              setStatusFilter('all');
                            }}
                            className="mt-2 text-blue-600 hover:text-blue-800"
                          >
                            Clear all filters
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete {selectedNotifications.length === 1 ? 'this notification' : `these ${selectedNotifications.length} notifications`}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}