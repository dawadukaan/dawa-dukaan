'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  FiTrash2, 
  FiSearch, 
  FiFilter, 
  FiCheck,
  FiX,
  FiMoreVertical,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiInfo,
  FiMessageCircle,
  FiSend,
  FiUsers,
  FiUser,
  FiCalendar,
  FiClock,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiBell
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

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

  // New notification form state
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    recipients: 'all', // all, users, vendors, providers
    scheduledFor: '',
    sendNow: true
  });

  // Fetch notifications data
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        
        // Simulating API call with sample data
        setTimeout(() => {
          const sampleNotifications = [
            {
              id: '1',
              title: 'System Maintenance',
              message: 'The system will be down for maintenance on Sunday, July 10th from 2:00 AM to 4:00 AM.',
              type: 'system',
              status: 'sent',
              recipients: 'all',
              recipientCount: 1250,
              readCount: 875,
              createdAt: '2023-07-05T10:30:00Z',
              sentAt: '2023-07-05T10:30:00Z',
              scheduledFor: null,
              sender: {
                id: '1',
                name: 'System Admin',
                avatar: 'https://source.unsplash.com/random/100x100/?admin'
              }
            },
            {
              id: '2',
              title: 'New Feature: Dark Mode',
              message: 'We\'ve added a new dark mode feature. Try it out by clicking on your profile and selecting "Appearance".',
              type: 'feature',
              status: 'sent',
              recipients: 'users',
              recipientCount: 950,
              readCount: 423,
              createdAt: '2023-07-03T14:45:00Z',
              sentAt: '2023-07-03T14:45:00Z',
              scheduledFor: null,
              sender: {
                id: '1',
                name: 'System Admin',
                avatar: 'https://source.unsplash.com/random/100x100/?admin'
              }
            },
            {
              id: '3',
              title: 'Special Discount for Vendors',
              message: 'All vendors can now enjoy a 10% reduction in commission rates for the next month.',
              type: 'promotion',
              status: 'sent',
              recipients: 'vendors',
              recipientCount: 120,
              readCount: 98,
              createdAt: '2023-07-01T09:15:00Z',
              sentAt: '2023-07-01T09:15:00Z',
              scheduledFor: null,
              sender: {
                id: '2',
                name: 'Marketing Team',
                avatar: 'https://source.unsplash.com/random/100x100/?marketing'
              }
            },
            {
              id: '4',
              title: 'Service Provider Training',
              message: 'Join our online training session for service providers on July 15th at 3:00 PM.',
              type: 'event',
              status: 'scheduled',
              recipients: 'providers',
              recipientCount: 85,
              readCount: 0,
              createdAt: '2023-07-08T11:20:00Z',
              sentAt: null,
              scheduledFor: '2023-07-12T09:00:00Z',
              sender: {
                id: '3',
                name: 'Training Department',
                avatar: 'https://source.unsplash.com/random/100x100/?training'
              }
            },
            {
              id: '5',
              title: 'Security Alert',
              message: 'We\'ve detected unusual login attempts. Please ensure your password is strong and consider enabling two-factor authentication.',
              type: 'alert',
              status: 'draft',
              recipients: 'all',
              recipientCount: 0,
              readCount: 0,
              createdAt: '2023-07-09T16:30:00Z',
              sentAt: null,
              scheduledFor: null,
              sender: {
                id: '4',
                name: 'Security Team',
                avatar: 'https://source.unsplash.com/random/100x100/?security'
              }
            }
          ];
          
          setNotifications(sampleNotifications);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load notifications');
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

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
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Sort notifications
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        const dateA = a.sentAt || a.scheduledFor || a.createdAt;
        const dateB = b.sentAt || b.scheduledFor || b.createdAt;
        comparison = new Date(dateA) - new Date(dateB);
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      default:
        const defaultDateA = a.sentAt || a.scheduledFor || a.createdAt;
        const defaultDateB = b.sentAt || b.scheduledFor || b.createdAt;
        comparison = new Date(defaultDateA) - new Date(defaultDateB);
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
      setSelectedNotifications(sortedNotifications.map(notification => notification.id));
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedNotifications.length > 0) {
      // In a real app, you would call your API to delete the notifications
      setNotifications(prev => prev.filter(notification => !selectedNotifications.includes(notification.id)));
      setSelectedNotifications([]);
      toast.success(`${selectedNotifications.length} notifications deleted successfully`);
    }
    
    setShowDeleteModal(false);
  };

  // Handle send notification
  const handleSendNotification = () => {
    // Validate form
    if (!newNotification.title || !newNotification.message) {
      toast.error('Please fill all required fields');
      return;
    }
    
    // In a real app, you would call your API to send the notification
    const newId = (notifications.length + 1).toString();
    const now = new Date().toISOString();
    
    const newNotificationData = {
      ...newNotification,
      id: newId,
      status: newNotification.sendNow ? 'sent' : 'scheduled',
      recipientCount: newNotification.recipients === 'all' ? 1250 : 
                      newNotification.recipients === 'users' ? 950 : 
                      newNotification.recipients === 'vendors' ? 120 : 85,
      readCount: 0,
      createdAt: now,
      sentAt: newNotification.sendNow ? now : null,
      scheduledFor: newNotification.sendNow ? null : newNotification.scheduledFor,
      sender: {
        id: '1',
        name: 'System Admin',
        avatar: 'https://source.unsplash.com/random/100x100/?admin'
      }
    };
    
    setNotifications(prev => [...prev, newNotificationData]);
    setShowSendModal(false);
    setNewNotification({
      title: '',
      message: '',
      type: 'info',
      recipients: 'all',
      scheduledFor: '',
      sendNow: true
    });
    
    toast.success(newNotification.sendNow ? 'Notification sent successfully' : 'Notification scheduled successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <button
          onClick={() => setShowSendModal(true)}
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
              <h3 className="text-2xl font-bold text-gray-900">{notifications.length}</h3>
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
                {notifications.filter(notification => notification.status === 'sent').length}
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
                {notifications.filter(notification => notification.status === 'scheduled').length}
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
                {Math.round(
                  (notifications.reduce((sum, notification) => sum + (notification.readCount || 0), 0) / 
                  Math.max(1, notifications.reduce((sum, notification) => sum + (notification.recipientCount || 0), 0))) * 100
                )}%
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
                  <tr key={notification.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => toggleNotificationSelection(notification.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="h-10 w-10 flex-shrink-0">
                          <Image
                            src={notification.sender.avatar}
                            alt={notification.sender.name}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{notification.message}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(notification.type)}
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(notification.type)}`}>
                          {getTypeLabel(notification.type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRecipientIcon(notification.recipients)}
                        <span className="ml-2 text-sm text-gray-900">{getRecipientLabel(notification.recipients)}</span>
                      </div>
                      {notification.recipientCount > 0 && (
                        <div className="text-xs text-gray-500">{notification.recipientCount} recipients</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {notification.status === 'sent' && (
                        <div className="text-sm text-gray-900">Sent: {formatDate(notification.sentAt)}</div>
                      )}
                      {notification.status === 'scheduled' && (
                        <div className="text-sm text-gray-900">Scheduled: {formatDate(notification.scheduledFor)}</div>
                      )}
                      {notification.status === 'draft' && (
                        <div className="text-sm text-gray-900">Created: {formatDate(notification.createdAt)}</div>
                      )}
                      <div className="text-xs text-gray-500">
                        {notification.status === 'sent' && formatTime(notification.sentAt)}
                        {notification.status === 'scheduled' && formatTime(notification.scheduledFor)}
                        {notification.status === 'draft' && formatTime(notification.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(notification.status)}`}>
                        {getStatusLabel(notification.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {notification.status === 'sent' ? (
                        <div>
                          <div className="text-sm text-gray-900">{notification.readCount} / {notification.recipientCount}</div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${Math.round((notification.readCount / notification.recipientCount) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <FiEye className="w-5 h-5" />
                        </button>
                        {notification.status === 'draft' && (
                          <button
                            className="text-green-600 hover:text-green-900"
                            title="Send Now"
                          >
                            <FiSend className="w-5 h-5" />
                          </button>
                        )}
                        {notification.status === 'scheduled' && (
                          <button
                            className="text-purple-600 hover:text-purple-900"
                            title="Reschedule"
                          >
                            <FiClock className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedNotifications([notification.id]);
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

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Send New Notification</h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  placeholder="Enter notification title"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  rows="4"
                  placeholder="Enter notification message"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newNotification.message}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Type
                </label>
                <select
                  id="type"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newNotification.type}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="system">System</option>
                  <option value="feature">Feature Update</option>
                  <option value="promotion">Promotion</option>
                  <option value="event">Event</option>
                  <option value="alert">Alert</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-1">
                  Recipients
                </label>
                <select
                  id="recipients"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newNotification.recipients}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, recipients: e.target.value }))}
                >
                  <option value="all">All Users</option>
                  <option value="users">Customers Only</option>
                  <option value="vendors">Vendors Only</option>
                  <option value="providers">Service Providers Only</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendNow"
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 mr-2"
                  checked={newNotification.sendNow}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, sendNow: e.target.checked }))}
                />
                <label htmlFor="sendNow" className="text-sm font-medium text-gray-700">
                  Send immediately
                </label>
              </div>
              
              {!newNotification.sendNow && (
                <div>
                  <label htmlFor="scheduledFor" className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule Date and Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="scheduledFor"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newNotification.scheduledFor}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, scheduledFor: e.target.value }))}
                  />
                </div>
              )}
              
              <div className="pt-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotification}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  {newNotification.sendNow ? (
                    <>
                      <FiSend className="w-4 h-4 mr-2" />
                      Send Now
                    </>
                  ) : (
                    <>
                      <FiClock className="w-4 h-4 mr-2" />
                      Schedule
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}