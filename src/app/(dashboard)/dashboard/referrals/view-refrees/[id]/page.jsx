// src/app/(dashboard)/dashboard/referrals/view-refrees/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCookie } from 'cookies-next';
import { toast } from 'react-hot-toast';
import env from '@/lib/config/env';
import { use } from 'react';
import { 
  FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar, 
  FiTag, FiPackage, FiDollarSign, FiTruck, FiShoppingBag,
  FiClock, FiCheckCircle, FiAlertCircle, FiFilter, FiChevronDown, 
  FiChevronUp, FiX, FiSearch, FiEye, FiUsers
} from 'react-icons/fi';

export default function ViewRefereesPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const referralId = unwrappedParams.id;
  const [referral, setReferral] = useState(null);
  const [referees, setReferees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    orderStatus: '',
    minAmount: '',
    dateRange: {
      start: '',
      end: ''
    }
  });
  const [stats, setStats] = useState({
    totalReferees: 0,
    activeReferees: 0,
    totalOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    totalCommission: 0,
    averageOrderValue: 0
  });

  useEffect(() => {
    const fetchReferralDetails = async () => {
      try {
        setIsLoading(true);
        const token = getCookie('token');
        
        // Fetch referral details
        const response = await fetch(`${env.app.apiUrl}/admin/referrals/details/${referralId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch referral details');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setReferral(data.data.referral);
          setReferees(data.data.referees || []);
          setOrders(data.data.orders || []);
          
          // Calculate statistics
          const activeRefs = data.data.referees.filter(ref => ref.isActive).length;
          const deliveredOrds = data.data.orders.filter(order => order.status === 'Delivered').length;
          const totalRevenue = data.data.orders.reduce((sum, order) => sum + order.totalPrice, 0);
          
          // Calculate total earned commission
          const commissionPercentage = data.data.referral.user?.referralCommissionPercentage || 0;
          const totalCommission = (commissionPercentage / 100) * totalRevenue;
          
          setStats({
            totalReferees: data.data.referees.length,
            activeReferees: activeRefs,
            totalOrders: data.data.orders.length,
            deliveredOrders: deliveredOrds,
            totalRevenue: totalRevenue,
            totalCommission: totalCommission,
            averageOrderValue: data.data.orders.length ? totalRevenue / data.data.orders.length : 0
          });
        } else {
          throw new Error(data.error || 'Failed to fetch referral details');
        }
      } catch (error) {
        console.error('Error fetching referral details:', error);
        setError(error.message);
        toast.error('Failed to load referral details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReferralDetails();
  }, [referralId]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
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
      orderStatus: '',
      minAmount: '',
      dateRange: {
        start: '',
        end: ''
      }
    });
    setSearchTerm('');
  };

  // Get order status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesId = order.orderNumber.toLowerCase().includes(searchLower);
      const matchesUser = order.userName.toLowerCase().includes(searchLower);
      
      if (!matchesId && !matchesUser) return false;
    }
    
    // Apply order status filter
    if (filters.orderStatus && order.status !== filters.orderStatus) return false;
    
    // Apply minimum amount filter
    if (filters.minAmount && order.totalPrice < parseFloat(filters.minAmount)) return false;
    
    // Apply date range filter
    if (filters.dateRange.start) {
      const orderDate = new Date(order.createdAt);
      const startDate = new Date(filters.dateRange.start);
      if (orderDate < startDate) return false;
    }
    
    if (filters.dateRange.end) {
      const orderDate = new Date(order.createdAt);
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59); // Set to end of day
      if (orderDate > endDate) return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <button 
            onClick={() => router.back()} 
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Referred User Orders</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <FiAlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Go Back
          </button>
        </div>
      ) : (
        <>
          {/* Referral Info Card */}
          {referral && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                    <FiUser className="mr-2" /> Referrer Details
                  </h2>
                  <div className="flex items-center mb-3">
                    <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      {referral.user?.avatar ? (
                        <img 
                          src={referral.user.avatar} 
                          alt={referral.user.name} 
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <FiUser className="h-6 w-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{referral.user?.name}</p>
                      <p className="text-gray-500 text-sm">{referral.user?.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-sm">
                      <FiTag className="mr-2 text-gray-400" />
                      <span className="font-medium mr-2">Referral Code:</span>
                      <span className="text-green-600 font-medium">{referral.referralCode}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FiDollarSign className="mr-2 text-gray-400" />
                      <span className="font-medium mr-2">Commission Rate:</span>
                      <span className="text-blue-600 font-medium">{referral.user?.referralCommissionPercentage || 0}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                    <FiUsers className="mr-2" /> Referees
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-xs text-gray-500">Total Referred Users</p>
                      <p className="text-xl font-bold text-blue-600">{stats.totalReferees}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-xs text-gray-500">Active Users</p>
                      <p className="text-xl font-bold text-green-600">{stats.activeReferees}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                    <FiShoppingBag className="mr-2" /> Order Summary
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-3 rounded-md">
                      <p className="text-xs text-gray-500">Total Orders</p>
                      <p className="text-xl font-bold text-purple-600">{stats.totalOrders}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-md">
                      <p className="text-xs text-gray-500">Delivered Orders</p>
                      <p className="text-xl font-bold text-yellow-600">{stats.deliveredOrders}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-xs text-gray-500">Total Revenue</p>
                      <p className="text-xl font-bold text-gray-800">₹{stats.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-xs text-gray-500">Total Commission</p>
                      <p className="text-xl font-bold text-green-700">₹{stats.totalCommission.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        ({referral.user?.referralCommissionPercentage || 0}% of revenue)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by order ID or customer name"
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700 mb-1">
                      Order Status
                    </label>
                    <select
                      id="orderStatus"
                      name="orderStatus"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={filters.orderStatus}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Statuses</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="minAmount" className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Amount
                    </label>
                    <input
                      type="number"
                      id="minAmount"
                      name="minAmount"
                      placeholder="Min order amount"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={filters.minAmount}
                      onChange={handleFilterChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="dateRangeStart" className="block text-sm font-medium text-gray-700 mb-1">
                      From Date
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
                      To Date
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
          
          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <FiShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No orders found matching your criteria</p>
                {(searchTerm || filters.orderStatus || filters.minAmount || filters.dateRange.start || filters.dateRange.end) && (
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
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
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.userName}</div>
                          <div className="text-sm text-gray-500">{order.userEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{order.totalPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            href={`/dashboard/orders/view/${order._id}`}
                            className="text-blue-600 hover:text-blue-900 flex items-center justify-end"
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
            )}
          </div>
          
          {/* Referees List */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
              <FiUsers className="mr-2" /> Referred Users ({referees.length})
            </h2>
            
            {referees.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No users have been referred yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {referees.map((referee) => (
                  <div key={referee._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        {referee.avatar ? (
                          <img 
                            src={referee.avatar} 
                            alt={referee.name} 
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <FiUser className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{referee.name}</p>
                        <p className="text-gray-500 text-sm">{referee.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 flex items-center">
                          <FiCalendar className="mr-1 h-4 w-4" /> Registered
                        </span>
                        <span className="text-gray-900">{formatDate(referee.createdAt)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 flex items-center">
                          <FiPackage className="mr-1 h-4 w-4" /> Orders
                        </span>
                        <span className="text-gray-900">{referee.orderCount || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 flex items-center">
                          <FiDollarSign className="mr-1 h-4 w-4" /> Total Spent
                        </span>
                        <span className="text-gray-900">₹{(referee.totalSpent || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 flex items-center">
                          <FiCheckCircle className="mr-1 h-4 w-4" /> Status
                        </span>
                        <span className={referee.isActive ? 'text-green-600' : 'text-red-600'}>
                          {referee.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t flex justify-end">
                      <Link 
                        href={`/dashboard/customers/view/${referee._id}`}
                        className="text-blue-600 hover:text-blue-900 text-sm flex items-center"
                      >
                        <FiEye className="mr-1 h-4 w-4" />
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Add FiUsers icon to imports at the top
