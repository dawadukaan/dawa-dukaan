// src/app/(dashboard)/dashboard/customers/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import env from '@/lib/config/env';
import { getCookie } from 'cookies-next';
import { toast } from 'react-hot-toast';
import { 
  FiSearch, FiFilter, FiEye, FiDownload, FiEdit, FiTrash2,
  FiCalendar, FiChevronDown, FiChevronUp, FiX, FiPlus,
  FiUser, FiMail, FiPhone, FiMapPin, FiShoppingBag, FiCheckCircle, FiXCircle,
  FiAlertTriangle, FiToggleLeft, FiToggleRight
} from 'react-icons/fi';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    state: '',
    type: '',
    dateRange: {
      start: '',
      end: ''
    }
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'dateJoined',
    direction: 'desc'
  });

  // Add new state for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    customerId: null,
    customerName: ''
  });

  // Add new state for status update confirmation dialog
  const [statusDialog, setStatusDialog] = useState({
    isOpen: false,
    customerId: null,
    customerName: '',
    currentStatus: false,
    newStatus: true
  });

  // Fetch customers data
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('page', '1');
        queryParams.append('limit', '20');
        
        if (searchTerm) queryParams.append('search', searchTerm);
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.state) queryParams.append('state', filters.state);
        if (filters.dateRange.start) queryParams.append('startDate', filters.dateRange.start);
        if (filters.dateRange.end) queryParams.append('endDate', filters.dateRange.end);
        
        // Add sorting parameters
        queryParams.append('sortBy', sortConfig.key === 'dateJoined' ? 'createdAt' : sortConfig.key);
        queryParams.append('sortOrder', sortConfig.direction);
        
        const token = getCookie('token');
        console.log('Token:', token);
        console.log('API URL:', `${env.app.apiUrl}/admin/users`);
        // Append the query parameters to the URL
        const response = await fetch(`${env.app.apiUrl}/admin/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('API Response:', response);
        
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        
        const data = await response.json();
        console.log('API Response:', data); // Log the response for debugging
        
        if (data.success) {
          // Update to use data.users instead of data.customers
          const users = data.data.users || [];
          
          // Transform the user data to match the expected customer format
          const formattedCustomers = users.map(user => ({
            id: user._id || user.id,
            name: user.name || 'Unknown',
            email: user.email || '',
            phone: user.phone || 'N/A',
            dateJoined: user.createdAt || new Date().toISOString(),
            totalOrders: user.totalOrders || 0,
            totalSpent: user.totalSpent || 0,
            address: user.address || user.defaultAddress || {
              street: '',
              city: '',
              state: '',
              pincode: ''
            },
            status: user.isActive ? 'active' : 'inactive',
            type: user.type || 'unlicensed'
          }));
          
          setCustomers(formattedCustomers);
          
          // If you want to use the pagination from the API
          // setPagination(data.data.pagination);
          
          // If you want to use the unique states from the API
          if (data.data.filters && data.data.filters.uniqueStates) {
            setUniqueStates(data.data.filters.uniqueStates);
          }
        } else {
          throw new Error(data.error || 'Failed to fetch customers');
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        // Uncomment the toast line if you have toast imported
        // toast.error('Failed to load customers');
        
        // Fallback to empty array or sample data in development
        setCustomers([]);
        
        // If you have sample data, you can use it as fallback
        // if (process.env.NODE_ENV === 'development') {
        //   setCustomers(sampleCustomers);
        // }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, [searchTerm, filters, sortConfig]); // Re-fetch when these dependencies change

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting to customers
  const sortedCustomers = [...customers].sort((a, b) => {
    if (sortConfig.key === 'dateJoined') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.dateJoined) - new Date(b.dateJoined)
        : new Date(b.dateJoined) - new Date(a.dateJoined);
    }
    
    if (sortConfig.key === 'totalOrders' || sortConfig.key === 'totalSpent') {
      return sortConfig.direction === 'asc' 
        ? a[sortConfig.key] - b[sortConfig.key]
        : b[sortConfig.key] - a[sortConfig.key];
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
  const filteredCustomers = sortedCustomers.filter(customer => {
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = customer.name.toLowerCase().includes(searchLower);
      const matchesEmail = customer.email.toLowerCase().includes(searchLower);
      const matchesPhone = customer.phone && customer.phone.includes(searchTerm);
      
      if (!matchesName && !matchesEmail && !matchesPhone) return false;
    }
    
    // Apply status filter
    if (filters.status && customer.status !== filters.status) return false;
    
    // Apply state filter - handle missing address data
    if (filters.state && customer.address) {
      if (!customer.address.state || customer.address.state !== filters.state) return false;
    } else if (filters.state) {
      return false; // No address available but filter is set
    }
    
    // Apply license type filter
    if (filters.type && customer.type !== filters.type) return false;
    
    // Apply date range filter
    if (filters.dateRange.start) {
      const customerDate = new Date(customer.dateJoined);
      const startDate = new Date(filters.dateRange.start);
      if (customerDate < startDate) return false;
    }
    
    if (filters.dateRange.end) {
      const customerDate = new Date(customer.dateJoined);
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59); // Set to end of day
      if (customerDate > endDate) return false;
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
      state: '',
      type: '',
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

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get license type badge class
  const getLicenseTypeBadgeClass = (type) => {
    switch (type) {
      case 'licensee':
        return 'bg-blue-100 text-blue-800';
      case 'unlicensed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // View customer details
  const handleViewCustomer = (customerId) => {
    router.push(`/dashboard/customers/view/${customerId}`);
  };

  // Edit customer
  const handleEditCustomer = (customerId) => {
    router.push(`/dashboard/customers/edit/${customerId}`);
  };

  // Export customers as CSV
  const exportCustomers = () => {
    // In a real app, you would implement CSV export functionality
    alert('Export functionality would be implemented here');
  };

  // Get unique states for filter dropdown
  const uniqueStates = [...new Set(customers.map(customer => customer.address.state))];

  // Handle delete customer
  const handleDeleteClick = (customer) => {
    setDeleteDialog({
      isOpen: true,
      customerId: customer.id,
      customerName: customer.name
    });
  };

  // Confirm delete customer
  const confirmDelete = async () => {
    try {
      const token = getCookie('token');
      const response = await fetch(`${env.app.apiUrl}/admin/users/${deleteDialog.customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete customer');
      }

      // Remove the deleted customer from the state
      setCustomers(customers.filter(customer => customer.id !== deleteDialog.customerId));
      
      // Show success message
      toast.success(`Customer "${deleteDialog.customerName}" deleted successfully`);
      
      // Close the dialog
      setDeleteDialog({
        isOpen: false,
        customerId: null,
        customerName: ''
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error(error.message || 'Failed to delete customer');
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteDialog({
      isOpen: false,
      customerId: null,
      customerName: ''
    });
  };

  // Add this function to handle status toggle click
  const handleStatusToggleClick = (customer) => {
    setStatusDialog({
      isOpen: true,
      customerId: customer.id,
      customerName: customer.name,
      currentStatus: customer.status === 'active',
      newStatus: customer.status !== 'active' // Toggle the current status
    });
  };

  // Add this function to confirm status update
  const confirmStatusUpdate = async () => {
    try {
      const token = getCookie('token');
      const response = await fetch(`${env.app.apiUrl}/admin/users/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: statusDialog.customerId,
          isActive: statusDialog.newStatus,
          reason: `Status ${statusDialog.newStatus ? 'activated' : 'deactivated'} from customer list`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user status');
      }

      const responseData = await response.json();
      
      // Update the customer in the local state
      setCustomers(customers.map(customer => {
        if (customer.id === statusDialog.customerId) {
          return {
            ...customer,
            status: statusDialog.newStatus ? 'active' : 'inactive'
          };
        }
        return customer;
      }));
      
      // Show success message
      toast.success(`Customer "${statusDialog.customerName}" ${statusDialog.newStatus ? 'activated' : 'deactivated'} successfully`);
      
      // Close the dialog
      setStatusDialog({
        isOpen: false,
        customerId: null,
        customerName: '',
        currentStatus: false,
        newStatus: true
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(error.message || 'Failed to update user status');
    }
  };

  // Add this function to cancel status update
  const cancelStatusUpdate = () => {
    setStatusDialog({
      isOpen: false,
      customerId: null,
      customerName: '',
      currentStatus: false,
      newStatus: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <div className="flex gap-2">
          <Link
            href="/dashboard/customers/add"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Add Customer
          </Link>
          <button
            onClick={exportCustomers}
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
              placeholder="Search by name, email or phone"
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              {/* License Type Filter */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  License Type
                </label>
                <select
                  id="type"
                  name="type"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={filters.type}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="licensee">Licensee</option>
                  <option value="unlicensed">Unlicensed</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  id="state"
                  name="state"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={filters.state}
                  onChange={handleFilterChange}
                >
                  <option value="">All States</option>
                  {uniqueStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="dateRangeStart" className="block text-sm font-medium text-gray-700 mb-1">
                  Joined From
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
                  Joined To
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

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No customers found matching your criteria</p>
            {(searchTerm || filters.status || filters.state || filters.type || filters.dateRange.start || filters.dateRange.end) && (
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
                    onClick={() => requestSort('name')}
                  >
                    <div className="flex items-center">
                      Customer
                      {sortConfig.key === 'name' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('dateJoined')}
                  >
                    <div className="flex items-center">
                      Joined
                      {sortConfig.key === 'dateJoined' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('totalOrders')}
                  >
                    <div className="flex items-center">
                      Orders
                      {sortConfig.key === 'totalOrders' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('totalSpent')}
                  >
                    <div className="flex items-center">
                      Total Spent
                      {sortConfig.key === 'totalSpent' && (
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
                    License
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <FiUser className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">
                            {customer.address && customer.address.city ? `${customer.address.city}, ` : ''}
                            {customer.address && customer.address.state ? customer.address.state : 'Address not available'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FiMail className="h-4 w-4 mr-1 text-gray-400" />
                        {customer.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <FiPhone className="h-4 w-4 mr-1 text-gray-400" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(customer.dateJoined)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FiShoppingBag className="h-4 w-4 mr-1 text-gray-400" />
                        {customer.totalOrders}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(customer.status)}`}>
                          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </span>
                        <button
                          onClick={() => handleStatusToggleClick(customer)}
                          className={`ml-2 text-gray-500 hover:text-${customer.status === 'active' ? 'red' : 'green'}-600 transition-colors`}
                          title={`${customer.status === 'active' ? 'Deactivate' : 'Activate'} customer`}
                        >
                          {customer.status === 'active' ? (
                            <FiToggleRight className="w-6 h-6 text-green-500" />
                          ) : (
                            <FiToggleLeft className="w-6 h-6 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLicenseTypeBadgeClass(customer.type)}`}>
                        {customer.type === 'licensee' ? (
                          <span className="flex items-center">
                            <FiCheckCircle className="mr-1 h-3 w-3" />
                            Licensed
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <FiXCircle className="mr-1 h-3 w-3" />
                            Unlicensed
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewCustomer(customer.id)}
                          className="text-green-600 hover:text-green-900"
                          title="View customer details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditCustomer(customer.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit customer"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(customer)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete customer"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
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
          <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{customers.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Active Customers</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {customers.filter(customer => customer.status === 'active').length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Licensed Users</h3>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {customers.filter(customer => customer.type === 'licensee').length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            ₹{customers.reduce((sum, customer) => sum + customer.totalSpent, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
            <div className="flex items-center text-red-600 mb-4">
              <FiAlertTriangle className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-medium">Delete Customer</h3>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">{deleteDialog.customerName}</span>? 
              This action cannot be undone and will permanently remove the customer and all associated data.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Confirmation Dialog */}
      {statusDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
            <div className={`flex items-center text-${statusDialog.newStatus ? 'green' : 'red'}-600 mb-4`}>
              <FiAlertTriangle className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-medium">
                {statusDialog.newStatus ? 'Activate' : 'Deactivate'} Customer
              </h3>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to {statusDialog.newStatus ? 'activate' : 'deactivate'} <span className="font-semibold">{statusDialog.customerName}</span>? 
              {!statusDialog.newStatus && (
                <span className="block mt-2 text-red-600">
                  Deactivated customers will not be able to login or place orders.
                </span>
              )}
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelStatusUpdate}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                className={`px-4 py-2 bg-${statusDialog.newStatus ? 'green' : 'red'}-600 text-white rounded-lg hover:bg-${statusDialog.newStatus ? 'green' : 'red'}-700`}
              >
                {statusDialog.newStatus ? 'Activate' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}