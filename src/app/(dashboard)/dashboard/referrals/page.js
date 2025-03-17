// src/app/(dashboard)/dashboard/referrals/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import env from '@/lib/config/env';
import { getCookie } from 'cookies-next';
import { toast } from 'react-hot-toast';
import { 
  FiSearch, FiFilter, FiEye, FiDownload, FiEdit, 
  FiCalendar, FiChevronDown, FiChevronUp, FiX, FiLink,
  FiUser, FiMail, FiUsers, FiPercent, FiBarChart2,
  FiClock, FiUserPlus, FiDollarSign, FiArrowRight, FiShare2, FiCopy, FiCheck
} from 'react-icons/fi';

export default function ReferralsPage() {
  const router = useRouter();
  const [referrals, setReferrals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minReferrals: '',
    dateRange: {
      start: '',
      end: ''
    }
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editCommissionMode, setEditCommissionMode] = useState(false);
  const [commissionValue, setCommissionValue] = useState(0);
  const [editingCommissionId, setEditingCommissionId] = useState(null);
  const [inlineCommissionValue, setInlineCommissionValue] = useState(0);

  // Fetch referrals data
  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setIsLoading(true);
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('page', pagination.page.toString());
        queryParams.append('limit', pagination.limit.toString());
        
        if (searchTerm) queryParams.append('search', searchTerm);
        if (filters.minReferrals) queryParams.append('minReferrals', filters.minReferrals);
        if (filters.dateRange.start) queryParams.append('startDate', filters.dateRange.start);
        if (filters.dateRange.end) queryParams.append('endDate', filters.dateRange.end);
        
        // Add sorting parameters
        queryParams.append('sortBy', sortConfig.key);
        queryParams.append('sortOrder', sortConfig.direction);
        
        const token = getCookie('token');
        const response = await fetch(`${env.app.apiUrl}/admin/referrals?${queryParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch referrals');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setReferrals(data.data.referrals || []);
          setPagination(data.data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          });
        } else {
          throw new Error(data.error || 'Failed to fetch referrals');
        }
      } catch (error) {
        console.error('Error fetching referrals:', error);
        toast.error('Failed to load referrals');
        setReferrals([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReferrals();
  }, [searchTerm, filters, sortConfig, pagination.page, pagination.limit]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('dateRange.')) {
      const dateField = name.split('.')[1];
      setFilters({
        ...filters,
        dateRange: {
          ...filters.dateRange,
          [dateField]: value
        }
      });
    } else {
      setFilters({
        ...filters,
        [name]: value
      });
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      minReferrals: '',
      dateRange: {
        start: '',
        end: ''
      }
    });
    setSearchTerm('');
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
  
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
    if (diffMonths < 12) return `${diffMonths} months ago`;
    return `${diffYears} years ago`;
  };

  // View referral details
  const handleViewReferral = (referral) => {
    setSelectedReferral(referral);
    setCommissionValue(referral.user?.referralCommissionPercentage || 0);
    setShowDetailsModal(true);
  };

  // Export referrals as CSV
  const exportReferrals = () => {
    // Implementation for CSV export would go here
    toast.success("Exporting referrals data...");
  };

  // Handle pagination
  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination({
        ...pagination,
        page: newPage
      });
    }
  };

  // Update commission percentage
  const updateCommission = async () => {
    if (!selectedReferral || commissionValue < 0 || commissionValue > 100) {
      toast.error("Please enter a valid commission percentage (0-100)");
      return;
    }

    if (!selectedReferral.user || !selectedReferral.user.id) {
      toast.error("User information is missing");
      setEditCommissionMode(false);
      return;
    }

    try {
      const token = getCookie('token');
      const response = await fetch(`${env.app.apiUrl}/admin/referrals/commission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedReferral.user.id,
          percentage: parseFloat(commissionValue)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update commission');
      }
      
      // Update the referral in the state with the new commission value
      setReferrals(referrals.map(ref => {
        if (ref.id === selectedReferral.id) {
          return {
            ...ref,
            user: {
              ...ref.user,
              referralCommissionPercentage: parseFloat(commissionValue)
            }
          };
        }
        return ref;
      }));
      
      setSelectedReferral({
        ...selectedReferral,
        user: {
          ...selectedReferral.user,
          referralCommissionPercentage: parseFloat(commissionValue)
        }
      });
      
      setEditCommissionMode(false);
      toast.success("Commission percentage updated successfully");
    } catch (error) {
      console.error('Error updating commission:', error);
      toast.error(error.message || 'Failed to update commission percentage');
    }
  };

  // Add this function to handle inline commission editing
  const handleCommissionClick = (referral) => {
    setEditingCommissionId(referral.id);
    setInlineCommissionValue(referral.user?.referralCommissionPercentage || 0);
  };

  // Add this function to save the commission update
  const saveInlineCommission = async (referralId) => {
    try {
      if (inlineCommissionValue < 0 || inlineCommissionValue > 100) {
        toast.error("Please enter a valid commission percentage (0-100)");
        return;
      }

      const referral = referrals.find(ref => ref.id === referralId);
      if (!referral) {
        toast.error("Referral not found");
        setEditingCommissionId(null);
        return;
      }

      if (!referral.user || !referral.user.id) {
        toast.error("User information is missing");
        setEditingCommissionId(null);
        return;
      }

      const token = getCookie('token');
      const response = await fetch(`${env.app.apiUrl}/admin/referrals/commission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: referral.user.id,
          percentage: parseFloat(inlineCommissionValue)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update commission');
      }
      
      // Update the referral in the state with the new commission value
      setReferrals(referrals.map(ref => {
        if (ref.id === referralId) {
          return {
            ...ref,
            user: {
              ...ref.user,
              referralCommissionPercentage: parseFloat(inlineCommissionValue)
            }
          };
        }
        return ref;
      }));
      
      // Reset editing state
      setEditingCommissionId(null);
      toast.success("Commission percentage updated successfully");
    } catch (error) {
      console.error('Error updating commission:', error);
      toast.error(error.message || 'Failed to update commission percentage');
      setEditingCommissionId(null);
    }
  };

  // Add this function to handle keypress events
  const handleCommissionKeyPress = (e, referralId) => {
    if (e.key === 'Enter') {
      saveInlineCommission(referralId);
    } else if (e.key === 'Escape') {
      setEditingCommissionId(null);
    }
  };

  // Add this function to cancel commission editing
  const cancelInlineCommission = () => {
    setEditingCommissionId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Referrals Management</h1>
        <div className="flex gap-2">
          <button
            onClick={exportReferrals}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <FiDownload className="w-5 h-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by code or user name"
              className="pl-10 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <FiFilter className="h-5 w-5 mr-2" />
            Filters
            {showFilters ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="minReferrals" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Referrals
                </label>
                <input
                  type="number"
                  id="minReferrals"
                  name="minReferrals"
                  min="0"
                  placeholder="Min number of referrals"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={filters.minReferrals}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div>
                <label htmlFor="dateRangeStart" className="block text-sm font-medium text-gray-700 mb-1">
                  Created From
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="dateRangeStart"
                    name="dateRange.start"
                    className="pl-10 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={filters.dateRange.start}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="dateRangeEnd" className="block text-sm font-medium text-gray-700 mb-1">
                  Created To
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="dateRangeEnd"
                    name="dateRange.end"
                    className="pl-10 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={filters.dateRange.end}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-800 flex items-center"
              >
                <FiX className="h-4 w-4 mr-1" />
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total Referrals</h3>
            <FiUsers className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {referrals.reduce((sum, ref) => sum + (ref.stats?.totalReferrals || 0), 0)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Successful Conversions</h3>
            <FiUserPlus className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {referrals.reduce((sum, ref) => sum + (ref.stats?.successfulReferrals || 0), 0)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
            <FiBarChart2 className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {(() => {
              const total = referrals.reduce((sum, ref) => sum + (ref.stats?.totalReferrals || 0), 0);
              const successful = referrals.reduce((sum, ref) => sum + (ref.stats?.successfulReferrals || 0), 0);
              return total ? `${Math.round((successful / total) * 100)}%` : '0%';
            })()}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Avg. Referrals per User</h3>
            <FiShare2 className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {(() => {
              const total = referrals.reduce((sum, ref) => sum + (ref.stats?.totalReferrals || 0), 0);
              return referrals.length ? (total / referrals.length).toFixed(1) : '0';
            })()}
          </p>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No referrals found matching your criteria</p>
            {(searchTerm || filters.minReferrals || filters.dateRange.start || filters.dateRange.end) && (
              <button
                onClick={clearFilters}
                className="mt-2 text-green-600 hover:text-green-700"
              >
                Clear filters and try again
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('user.name')}
                  >
                    <div className="flex items-center">
                      User
                      {sortConfig.key === 'user.name' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('referralCode')}
                  >
                    <div className="flex items-center">
                      Referral Code
                      {sortConfig.key === 'referralCode' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('stats.totalReferrals')}
                  >
                    <div className="flex items-center">
                      Referrals
                      {sortConfig.key === 'stats.totalReferrals' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('user.referralCommissionPercentage')}
                  >
                    <div className="flex items-center">
                      Commission
                      {sortConfig.key === 'user.referralCommissionPercentage' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Created
                      {sortConfig.key === 'createdAt' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {referrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {referral.user?.avatar ? (
                            <img 
                              src={referral.user.avatar} 
                              alt={referral.user?.name} 
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <FiUser className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {referral.user?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <FiMail className="h-4 w-4 mr-1 text-gray-400" />
                            {referral.user?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <FiLink className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {referral.referralCode}
                        </span>
                      </div>
                      {referral.referredBy && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                          <span>Referred by:</span>
                          <span className="ml-1 font-medium">{referral.referredBy.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {referral.stats?.totalReferrals || 0}
                        </div>
                        <span className="mx-2 text-gray-400">•</span>
                        <div className="text-sm text-gray-500">
                          {referral.stats?.successfulReferrals || 0} successful
                        </div>
                      </div>
                      <div className="w-32 h-2 bg-gray-200 rounded-full mt-2">
                        <div 
                          className="h-2 bg-green-500 rounded-full" 
                          style={{ 
                            width: `${referral.stats?.totalReferrals ? 
                              Math.min(100, (referral.stats.successfulReferrals / referral.stats.totalReferrals) * 100) : 0}%` 
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCommissionId === referral.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={inlineCommissionValue}
                            onChange={(e) => setInlineCommissionValue(e.target.value)}
                            onKeyDown={(e) => handleCommissionKeyPress(e, referral.id)}
                            className="border rounded-md px-2 py-1 w-16 text-sm"
                            autoFocus
                          />
                          <span className="text-gray-500">%</span>
                          <button 
                            onClick={() => saveInlineCommission(referral.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Save commission"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={cancelInlineCommission}
                            className="text-red-600 hover:text-red-800"
                            title="Cancel"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded"
                          onClick={() => handleCommissionClick(referral)}
                          title="Click to edit commission"
                        >
                          <FiPercent className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {referral.user?.referralCommissionPercentage || 0}%
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(referral.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(referral.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewReferral(referral)}
                          className="text-green-600 hover:text-green-900"
                          title="View referral details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/dashboard/customers/view/${referral.user?.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="View user profile"
                        >
                          <FiUser className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!isLoading && referrals.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span> of{' '}
              <span className="font-medium">{pagination.total}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 py-1 rounded-md ${
                  pagination.page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`px-3 py-1 rounded-md ${
                  pagination.page === pagination.pages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Referral Details Modal */}
      {showDetailsModal && selectedReferral && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Referral Details</h2>
                  <p className="text-gray-500 mt-1">
                    Code: <span className="font-medium">{selectedReferral.referralCode}</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                    <FiUser className="mr-2" /> User Information
                  </h3>
                  
                  <div className="flex items-center mb-4">
                    <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                      {selectedReferral.user?.avatar ? (
                        <img 
                          src={selectedReferral.user.avatar} 
                          alt={selectedReferral.user?.name} 
                          className="h-14 w-14 rounded-full object-cover"
                        />
                      ) : (
                        <FiUser className="h-6 w-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedReferral.user?.name || 'Unknown User'}</h4>
                      <p className="text-gray-500 text-sm">{selectedReferral.user?.email || 'No email'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-sm font-medium">{formatDate(selectedReferral.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="text-sm font-medium">{formatDate(selectedReferral.updatedAt)}</p>
                    </div>
                  </div>

                  {/* Commission Setting */}
                  <div className="mt-4 border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-md font-medium text-gray-700 flex items-center">
                        <FiPercent className="mr-2" /> Commission Percentage
                      </h4>
                      {!editCommissionMode && (
                        <button 
                          onClick={() => setEditCommissionMode(true)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    
                    {editCommissionMode ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={commissionValue}
                          onChange={(e) => setCommissionValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') updateCommission();
                            if (e.key === 'Escape') {
                              setEditCommissionMode(false);
                              setCommissionValue(selectedReferral.user?.referralCommissionPercentage || 0);
                            }
                          }}
                          className="border rounded-md px-3 py-2 w-24"
                          autoFocus
                        />
                        <span className="text-gray-500">%</span>
                        <button 
                          onClick={updateCommission}
                          className="ml-2 bg-green-600 text-white px-3 py-2 rounded-md text-sm"
                          title="Save commission"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setEditCommissionMode(false);
                            setCommissionValue(selectedReferral.user?.referralCommissionPercentage || 0);
                          }}
                          className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm"
                          title="Cancel"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="bg-blue-50 p-3 rounded-md flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-blue-600">
                            {selectedReferral.user?.referralCommissionPercentage || 0}%
                          </span>
                          <span className="ml-2 text-sm text-blue-600">
                            commission on sales
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Referral Stats */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                    <FiBarChart2 className="mr-2" /> Referral Statistics
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-md">
                      <p className="text-xs text-gray-500">Total Referrals</p>
                      <p className="text-xl font-bold text-blue-600">{selectedReferral.stats?.totalReferrals || 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded-md">
                      <p className="text-xs text-gray-500">Successful Conversions</p>
                      <p className="text-xl font-bold text-green-600">{selectedReferral.stats?.successfulReferrals || 0}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs text-gray-500">Conversion Rate</p>
                      <p className="text-sm font-medium">
                        {(() => {
                          const { totalReferrals, successfulReferrals } = selectedReferral.stats || {};
                          return totalReferrals 
                            ? `${Math.round((successfulReferrals / totalReferrals) * 100)}%` 
                            : '0%';
                        })()}
                      </p>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full" 
                        style={{ 
                          width: `${(() => {
                            const { totalReferrals, successfulReferrals } = selectedReferral.stats || {};
                            return totalReferrals 
                              ? Math.round((successfulReferrals / totalReferrals) * 100) 
                              : 0;
                          })()}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Referral URL */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Referral URL</h4>
                    <div className="bg-white border rounded-md p-2 flex items-center justify-between">
                      <div className="overflow-hidden overflow-ellipsis whitespace-nowrap flex-1 text-sm">
                        {`${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/register?ref=${selectedReferral.referralCode}`}
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/register?ref=${selectedReferral.referralCode}`);
                          toast.success("Referral link copied to clipboard");
                        }}
                        className="ml-2 bg-gray-100 hover:bg-gray-200 p-2 rounded-md"
                        title="Copy referral link"
                      >
                        <FiCopy className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Referred Users */}
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                  <FiUsers className="mr-2" /> Referred Users ({selectedReferral.referees?.length || 0})
                </h3>
                
                {selectedReferral.referees?.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registered
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedReferral.referees.map((referee, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                  {referee.avatar ? (
                                    <img 
                                      src={referee.avatar} 
                                      alt={referee.name} 
                                      className="h-10 w-10 rounded-full"
                                    />
                                  ) : (
                                    <FiUser className="h-5 w-5 text-gray-500" />
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {referee.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {referee.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDate(referee.registeredAt)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatTimeAgo(referee.registeredAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                referee.status === 'completed' ? 'bg-green-100 text-green-800' :
                                referee.status === 'rewarded' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {referee.status.charAt(0).toUpperCase() + referee.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                href={`/dashboard/customers/view/${referee.id}`}
                                className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                              >
                                <FiEye className="w-4 h-4 mr-1" />
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 rounded-lg text-center">
                    <FiUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-700 mb-2">No Referrals Yet</h4>
                    <p className="text-gray-500 max-w-md mx-auto">
                      This user hasn't referred anyone yet. When they do, the referred users will appear here.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Referral Chain */}
              {selectedReferral.referredBy && (
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                    <FiArrowRight className="mr-2" /> Referral Chain
                  </h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {selectedReferral.referredBy?.avatar ? (
                          <img 
                            src={selectedReferral.referredBy.avatar} 
                            alt={selectedReferral.referredBy.name} 
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <FiUser className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="mx-4 text-gray-500">
                        <FiArrowRight className="h-5 w-5" />
                      </div>
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {selectedReferral.user?.avatar ? (
                          <img 
                            src={selectedReferral.user.avatar} 
                            alt={selectedReferral.user.name} 
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <FiUser className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      {selectedReferral.referees?.length > 0 && (
                        <>
                          <div className="mx-4 text-gray-500">
                            <FiArrowRight className="h-5 w-5" />
                          </div>
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <div className="text-sm font-medium text-gray-700">+{selectedReferral.referees.length}</div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex mt-3">
                      <div className="text-sm text-gray-700 flex-1">
                        <span className="font-medium">{selectedReferral.referredBy.name}</span>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="font-medium">{selectedReferral.user?.name}</span>
                        {selectedReferral.referees?.length > 0 && (
                          <>
                            <span className="mx-2 text-gray-400">→</span>
                            <span className="font-medium">{selectedReferral.referees.length} users</span>
                          </>
                        )}
                      </div>
                      <Link
                        href={`/dashboard/customers/view/${selectedReferral.referredBy.id}`}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        View referrer
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Actions Footer */}
              <div className="mt-8 pt-6 border-t flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}