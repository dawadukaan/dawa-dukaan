// src/app/(dashboard)/dashboard/orders/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiSearch, FiFilter, FiEye, FiDownload, 
  FiCalendar, FiChevronDown, FiChevronUp, FiX, FiPlus 
} from 'react-icons/fi';

// Sample orders data for demonstration
const sampleOrders = [
  {
    id: 'ORD-2023-1001',
    customer: {
      name: 'Rahul Sharma',
      email: 'rahul.s@example.com',
      phone: '+91 98765 43210'
    },
    date: '2023-11-15T10:30:00',
    total: 1250.00,
    items: 5,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'online',
    shippingAddress: {
      street: '123 Main Street, Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    }
  },
  {
    id: 'ORD-2023-1002',
    customer: {
      name: 'Priya Patel',
      email: 'priya.p@example.com',
      phone: '+91 87654 32109'
    },
    date: '2023-11-14T14:45:00',
    total: 875.50,
    items: 3,
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'online',
    shippingAddress: {
      street: '456 Park Avenue',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001'
    }
  },
  {
    id: 'ORD-2023-1003',
    customer: {
      name: 'Amit Kumar',
      email: 'amit.k@example.com',
      phone: '+91 76543 21098'
    },
    date: '2023-11-14T09:15:00',
    total: 2340.00,
    items: 8,
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'online',
    shippingAddress: {
      street: '789 Lake View Road',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    }
  },
  {
    id: 'ORD-2023-1004',
    customer: {
      name: 'Sneha Reddy',
      email: 'sneha.r@example.com',
      phone: '+91 65432 10987'
    },
    date: '2023-11-13T16:20:00',
    total: 560.75,
    items: 2,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'cod',
    shippingAddress: {
      street: '101 Hill Road',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001'
    }
  },
  {
    id: 'ORD-2023-1005',
    customer: {
      name: 'Vikram Singh',
      email: 'vikram.s@example.com',
      phone: '+91 54321 09876'
    },
    date: '2023-11-13T11:10:00',
    total: 1875.25,
    items: 6,
    status: 'cancelled',
    paymentStatus: 'refunded',
    paymentMethod: 'online',
    shippingAddress: {
      street: '222 Green Valley',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001'
    }
  },
  {
    id: 'ORD-2023-1006',
    customer: {
      name: 'Neha Gupta',
      email: 'neha.g@example.com',
      phone: '+91 43210 98765'
    },
    date: '2023-11-12T13:40:00',
    total: 945.00,
    items: 4,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'online',
    shippingAddress: {
      street: '333 River View Apartments',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700001'
    }
  },
  {
    id: 'ORD-2023-1007',
    customer: {
      name: 'Rajesh Khanna',
      email: 'rajesh.k@example.com',
      phone: '+91 32109 87654'
    },
    date: '2023-11-12T08:55:00',
    total: 1450.50,
    items: 5,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'cod',
    shippingAddress: {
      street: '444 Mountain View',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001'
    }
  },
  {
    id: 'ORD-2023-1008',
    customer: {
      name: 'Ananya Desai',
      email: 'ananya.d@example.com',
      phone: '+91 21098 76543'
    },
    date: '2023-11-11T15:30:00',
    total: 2150.00,
    items: 7,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'online',
    shippingAddress: {
      street: '555 Sunset Boulevard',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380001'
    }
  }
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
    key: 'date',
    direction: 'desc'
  });

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch('/api/orders');
        // if (!response.ok) throw new Error('Failed to fetch orders');
        // const data = await response.json();
        
        // For demo, we'll use sample data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        setOrders(sampleOrders);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting to orders
  const sortedOrders = [...orders].sort((a, b) => {
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    }
    
    if (sortConfig.key === 'total') {
      return sortConfig.direction === 'asc' 
        ? a.total - b.total
        : b.total - a.total;
    }
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Apply filters and search
  const filteredOrders = sortedOrders.filter(order => {
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesId = order.id.toLowerCase().includes(searchLower);
      const matchesCustomer = order.customer.name.toLowerCase().includes(searchLower) || 
                             order.customer.email.toLowerCase().includes(searchLower) ||
                             order.customer.phone.includes(searchTerm);
      
      if (!matchesId && !matchesCustomer) return false;
    }
    
    // Apply status filter
    if (filters.status && order.status !== filters.status) return false;
    
    // Apply payment status filter
    if (filters.paymentStatus && order.paymentStatus !== filters.paymentStatus) return false;
    
    // Apply date range filter
    if (filters.dateRange.start) {
      const orderDate = new Date(order.date);
      const startDate = new Date(filters.dateRange.start);
      if (orderDate < startDate) return false;
    }
    
    if (filters.dateRange.end) {
      const orderDate = new Date(order.date);
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59); // Set to end of day
      if (orderDate > endDate) return false;
    }
    
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
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
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
                    onClick={() => requestSort('id')}
                  >
                    <div className="flex items-center">
                      Order ID
                      {sortConfig.key === 'id' && (
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
                    onClick={() => requestSort('date')}
                  >
                    <div className="flex items-center">
                      Date
                      {sortConfig.key === 'date' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('total')}
                  >
                    <div className="flex items-center">
                      Total
                      {sortConfig.key === 'total' && (
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
                  <tr key={order.id} className="hover:bg-gray-50">
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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
                        onClick={() => handleViewOrder(order.id)}
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
          <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {orders.filter(order => order.status === 'pending').length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Processing Orders</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {orders.filter(order => order.status === 'processing').length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Delivered Orders</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {orders.filter(order => order.status === 'delivered').length}
          </p>
        </div>
      </div>
    </div>
  );
}
