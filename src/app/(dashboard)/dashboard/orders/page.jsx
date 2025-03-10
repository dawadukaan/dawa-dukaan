// src/app/(dashboard)/dashboard/orders/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiSearch, FiFilter, FiEye, FiDownload, 
  FiCalendar, FiChevronDown, FiChevronUp, FiX, FiPlus 
} from 'react-icons/fi';
import { getCookie } from 'cookies-next';
import env from '@/lib/config/env';

export default function OrdersPage() {
  const router = useRouter();
  const token = getCookie('token');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    dateRange: {
      start: '',
      end: ''
    }
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Build query parameters for filtering
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.dateRange.start) queryParams.append('startDate', filters.dateRange.start);
        if (filters.dateRange.end) queryParams.append('endDate', filters.dateRange.end);
        queryParams.append('sortBy', sortConfig.key);
        queryParams.append('sortOrder', sortConfig.direction);
        
        const url = `${env.app.apiUrl}/admin/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        
        if (data.success && data.data.orders) {
          // Transform API data to match the expected format
          const formattedOrders = data.data.orders.map(order => ({
            id: order.orderNumber,
            _id: order._id,
            customer: {
              name: order.user?.name || 'Unknown',
              email: order.user?.email || 'No email',
              phone: order.user?.phone || 'No phone'
            },
            date: order.createdAt,
            total: order.totalPrice,
            items: order.orderItems.length,
            status: order.status.toLowerCase(),
            paymentStatus: order.isPaid ? 'paid' : 'pending',
            paymentMethod: order.paymentMethod === 'PhonePe' ? 'online' : 'cod',
            shippingAddress: {
              street: order.shippingAddress?.street || order.shippingAddress?.location || '',
              city: order.shippingAddress?.city || '',
              state: order.shippingAddress?.state || '',
              pincode: order.shippingAddress?.pincode || ''
            },
            orderItems: order.orderItems
          }));
          
          setOrders(formattedOrders);
        } else {
          throw new Error(data.message || 'Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [filters, sortConfig.key, sortConfig.direction, token]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply search filter locally
  const filteredOrders = orders.filter(order => {
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesId = order.id.toLowerCase().includes(searchLower);
      const matchesCustomer = 
        order.customer.name.toLowerCase().includes(searchLower) || 
        order.customer.email.toLowerCase().includes(searchLower) ||
        (order.customer.phone && order.customer.phone.includes(searchTerm));
      
      if (!matchesId && !matchesCustomer) return false;
    }
    
    // Payment status filter (this is applied locally since we're not sending it to the API)
    if (filters.paymentStatus && order.paymentStatus !== filters.paymentStatus) return false;
    
    return true;
  });

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
      status: '',
      paymentStatus: '',
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment status badge class
  const getPaymentStatusBadgeClass = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // View order details
  const handleViewOrder = (orderId) => {
    router.push(`/dashboard/orders/view/${orderId}`);
  };

  // Export orders as CSV
  const exportOrders = () => {
    // In a real app, you would implement CSV export functionality
    alert('Export functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <div className="flex gap-2">
          <Link
            href="/dashboard/orders/add"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Create Order
          </Link>
          <button
            onClick={exportOrders}
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
              placeholder="Search by order ID, customer name, email or phone"
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
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Order Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Statuses</option>
                  <option value="Processing">Processing</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={filters.paymentStatus}
                  onChange={handleFilterChange}
                >
                  <option value="">All Payment Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
                  <option value="failed">Failed</option>
                </select>
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
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-green-600 hover:text-green-700"
            >
              Try again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No orders found matching your criteria</p>
            {(searchTerm || filters.status || filters.paymentStatus || filters.dateRange.start || filters.dateRange.end) && (
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
                    onClick={() => requestSort('orderNumber')}
                  >
                    <div className="flex items-center">
                      Order ID
                      {sortConfig.key === 'orderNumber' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Date
                      {sortConfig.key === 'createdAt' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('totalPrice')}
                  >
                    <div className="flex items-center">
                      Total
                      {sortConfig.key === 'totalPrice' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
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
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                      <div className="text-sm text-gray-500">{order.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{order.total.toFixed(2)}
                      <div className="text-xs text-gray-500">{order.items} items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status.toLowerCase())}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewOrder(order._id)}
                        className="text-green-600 hover:text-green-900 flex items-center justify-end"
                      >
                        <FiEye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Processing Orders</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {orders.filter(order => order.status.toLowerCase() === 'processing').length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Shipped Orders</h3>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {orders.filter(order => order.status.toLowerCase() === 'shipped').length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Delivered Orders</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {orders.filter(order => order.status.toLowerCase() === 'delivered').length}
          </p>
        </div>
      </div>
    </div>
  );
}
