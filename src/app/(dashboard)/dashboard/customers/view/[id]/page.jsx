'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiHome, 
  FiEdit2, FiArrowLeft, FiInfo, FiAlertCircle,
  FiShoppingBag, FiCalendar, FiClock, FiDollarSign,
  FiPackage, FiFileText, FiExternalLink, FiPlus
} from 'react-icons/fi';

// Sample customers data for demonstration
const sampleCustomers = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul.s@example.com',
    phone: '+91 98765 43210',
    dateJoined: '2023-01-15T10:30:00',
    totalOrders: 12,
    totalSpent: 15250.00,
    address: {
      street: '123 Main Street, Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    status: 'active',
    notes: 'Prefers delivery in the evening after 6 PM.'
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya.p@example.com',
    phone: '+91 87654 32109',
    dateJoined: '2023-02-20T14:45:00',
    totalOrders: 8,
    totalSpent: 9875.50,
    address: {
      street: '456 Park Avenue',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001'
    },
    status: 'active',
    notes: 'Allergic to certain pesticides, prefers organic products only.'
  },
  {
    id: '3',
    name: 'Amit Kumar',
    email: 'amit.k@example.com',
    phone: '+91 76543 21098',
    dateJoined: '2023-03-10T09:15:00',
    totalOrders: 15,
    totalSpent: 22340.00,
    address: {
      street: '789 Lake View Road',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    },
    status: 'active',
    notes: 'Regular customer, part of loyalty program tier 2.'
  },
  {
    id: '4',
    name: 'Sneha Reddy',
    email: 'sneha.r@example.com',
    phone: '+91 65432 10987',
    dateJoined: '2023-02-05T16:20:00',
    totalOrders: 5,
    totalSpent: 6560.75,
    address: {
      street: '101 Hill Road',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001'
    },
    status: 'inactive',
    notes: 'Account inactive since April 2023.'
  },
  // Adding more sample customers including ID 8
  {
    id: '5',
    name: 'Vikram Singh',
    email: 'vikram.s@example.com',
    phone: '+91 54321 09876',
    dateJoined: '2023-01-25T11:10:00',
    totalOrders: 10,
    totalSpent: 11875.25,
    address: {
      street: '222 Green Valley',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001'
    },
    status: 'active',
    notes: 'Prefers organic vegetables only. Has a loyalty card.'
  },
  {
    id: '6',
    name: 'Neha Gupta',
    email: 'neha.g@example.com',
    phone: '+91 43210 98765',
    dateJoined: '2023-04-12T13:40:00',
    totalOrders: 7,
    totalSpent: 8945.00,
    address: {
      street: '333 River View Apartments',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700001'
    },
    status: 'active',
    notes: 'Usually orders on weekends. Prefers morning delivery.'
  },
  {
    id: '7',
    name: 'Rajesh Khanna',
    email: 'rajesh.k@example.com',
    phone: '+91 32109 87654',
    dateJoined: '2023-03-22T08:55:00',
    totalOrders: 3,
    totalSpent: 4450.50,
    address: {
      street: '444 Mountain View',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001'
    },
    status: 'inactive',
    notes: 'Has not ordered since May 2023.'
  },
  {
    id: '8',
    name: 'Ananya Desai',
    email: 'ananya.d@example.com',
    phone: '+91 21098 76543',
    dateJoined: '2023-05-11T15:30:00',
    totalOrders: 9,
    totalSpent: 12150.00,
    address: {
      street: '555 Sunset Boulevard',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380001'
    },
    status: 'active',
    notes: 'Bulk orders for restaurant business. Requires early morning delivery.'
  }
];

// Sample orders data for demonstration
const sampleOrders = [
  {
    id: 'ORD-2023-1001',
    customerId: '1',
    date: '2023-11-15T10:30:00',
    total: 1250.00,
    items: 5,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'online'
  },
  {
    id: 'ORD-2023-1008',
    customerId: '1',
    date: '2023-11-01T15:30:00',
    total: 950.00,
    items: 3,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'online'
  },
  {
    id: 'ORD-2023-1015',
    customerId: '1',
    date: '2023-10-22T09:15:00',
    total: 1875.50,
    items: 7,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'online'
  },
  {
    id: 'ORD-2023-1023',
    customerId: '1',
    date: '2023-10-10T14:20:00',
    total: 560.75,
    items: 2,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'cod'
  },
  {
    id: 'ORD-2023-1002',
    customerId: '2',
    date: '2023-11-14T14:45:00',
    total: 875.50,
    items: 3,
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'online'
  },
  {
    id: 'ORD-2023-1003',
    customerId: '3',
    date: '2023-11-14T09:15:00',
    total: 2340.00,
    items: 8,
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'online'
  },
  // Adding orders for customer ID 8
  {
    id: 'ORD-2023-1025',
    customerId: '8',
    date: '2023-11-10T08:15:00',
    total: 1850.00,
    items: 6,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'online'
  },
  {
    id: 'ORD-2023-1032',
    customerId: '8',
    date: '2023-10-25T07:30:00',
    total: 2250.75,
    items: 8,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'online'
  },
  {
    id: 'ORD-2023-1045',
    customerId: '8',
    date: '2023-10-05T06:45:00',
    total: 1675.50,
    items: 5,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'cod'
  }
];

export default function ViewCustomerPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  
  const [isLoading, setIsLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch customer data
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch(`/api/customers/${id}`);
        // if (!response.ok) throw new Error('Failed to fetch customer');
        // const data = await response.json();
        
        // For demo, we'll use sample data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        
        const foundCustomer = sampleCustomers.find(customer => customer.id === id);
        
        if (!foundCustomer) {
          console.error(`Customer with ID ${id} not found`);
          setError(`Customer with ID ${id} not found. Please check the URL or return to the customers list.`);
          setIsLoading(false);
          return;
        }
        
        // Fetch customer orders
        const customerOrdersData = sampleOrders.filter(order => order.customerId === id);
        
        setCustomer(foundCustomer);
        setCustomerOrders(customerOrdersData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching customer:', error);
        setError(`Error loading customer: ${error.message}`);
        setIsLoading(false);
      }
    };
    
    fetchCustomerData();
  }, [id]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Format date with time for display
  const formatDateTime = (dateString) => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>{error}</p>
        <Link href="/dashboard/customers" className="text-red-700 font-medium underline mt-2 inline-block">
          Return to Customers
        </Link>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p>Customer not found</p>
        <Link href="/dashboard/customers" className="text-yellow-700 font-medium underline mt-2 inline-block">
          Return to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <Link 
            href="/dashboard/customers" 
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{customer.name}</h1>
            <p className="text-gray-500">Customer since {formatDate(customer.dateJoined)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/orders/add?customer=${customer.id}`}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            New Order
          </Link>
          <Link
            href={`/dashboard/customers/edit/${customer.id}`}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <FiEdit2 className="w-5 h-5 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center">
        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
          customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
        </span>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 flex items-center border-b-2 text-sm font-medium ${
              activeTab === 'overview' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiUser className="mr-2 h-5 w-5" />
            Overview
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-3 flex items-center border-b-2 text-sm font-medium ${
              activeTab === 'orders' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiShoppingBag className="mr-2 h-5 w-5" />
            Orders
          </button>
          
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-3 flex items-center border-b-2 text-sm font-medium ${
              activeTab === 'notes' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiFileText className="mr-2 h-5 w-5" />
            Notes
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="mt-1 flex items-center">
                      <FiUser className="h-5 w-5 text-gray-400 mr-2" />
                      {customer.name}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                    <p className="mt-1 flex items-center">
                      <FiMail className="h-5 w-5 text-gray-400 mr-2" />
                      <a href={`mailto:${customer.email}`} className="text-green-600 hover:text-green-700">
                        {customer.email}
                      </a>
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                    <p className="mt-1 flex items-center">
                      <FiPhone className="h-5 w-5 text-gray-400 mr-2" />
                      <a href={`tel:${customer.phone.replace(/\s+/g, '')}`} className="text-green-600 hover:text-green-700">
                        {customer.phone}
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Customer Since</p>
                    <p className="mt-1 flex items-center">
                      <FiCalendar className="h-5 w-5 text-gray-400 mr-2" />
                      {formatDate(customer.dateJoined)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="mt-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="mt-1 flex items-center">
                      <FiShoppingBag className="h-5 w-5 text-gray-400 mr-2" />
                      {customer.totalOrders} orders
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Address Information</h2>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-start">
                    <FiHome className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm">{customer.address.street}</p>
                      <p className="text-sm">
                        {customer.address.city}, {customer.address.state} {customer.address.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
                
                {customerOrders.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">No orders found for this customer.</p>
                    <Link
                      href={`/dashboard/orders/add?customer=${customer.id}`}
                      className="mt-2 inline-flex items-center text-sm text-green-600 hover:text-green-700"
                    >
                      <FiPlus className="mr-1 h-4 w-4" />
                      Create first order
                    </Link>
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
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {customerOrders.slice(0, 3).map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDateTime(order.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{order.total.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                href={`/dashboard/orders/view/${order.id}`}
                                className="text-green-600 hover:text-green-900"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {customerOrders.length > 3 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setActiveTab('orders')}
                          className="text-sm text-green-600 hover:text-green-700"
                        >
                          View all {customerOrders.length} orders
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="bg-gray-50 rounded-lg p-6 border">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Summary</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900 flex items-center">
                      <FiDollarSign className="h-5 w-5 text-gray-400 mr-1" />
                      ₹{customer.totalSpent.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900 flex items-center">
                      <FiShoppingBag className="h-5 w-5 text-gray-400 mr-1" />
                      {customer.totalOrders}
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-500">Average Order Value</p>
                    <p className="text-2xl font-bold text-gray-900 flex items-center">
                      <FiDollarSign className="h-5 w-5 text-gray-400 mr-1" />
                      ₹{customer.totalOrders > 0 
                          ? (customer.totalSpent / customer.totalOrders).toFixed(2) 
                          : '0.00'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                
                <div className="space-y-3">
                  <Link
                    href={`/dashboard/orders/add?customer=${customer.id}`}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
                  >
                    <FiPlus className="w-5 h-5 mr-2" />
                    Create New Order
                  </Link>
                  
                  <Link
                    href={`/dashboard/customers/edit/${customer.id}`}
                    className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                  >
                    <FiEdit2 className="w-5 h-5 mr-2" />
                    Edit Customer
                  </Link>
                  
                  <a
                    href={`mailto:${customer.email}`}
                    className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                  >
                    <FiMail className="w-5 h-5 mr-2" />
                    Send Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Order History</h2>
              <Link
                href={`/dashboard/orders/add?customer=${customer.id}`}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                New Order
              </Link>
            </div>
            
            {customerOrders.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">No orders found for this customer.</p>
                <Link
                  href={`/dashboard/orders/add?customer=${customer.id}`}
                  className="mt-2 inline-flex items-center text-sm text-green-600 hover:text-green-700"
                >
                  <FiPlus className="mr-1 h-4 w-4" />
                  Create first order
                </Link>
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
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customerOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(order.date)}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{order.total.toFixed(2)}
                          <div className="text-xs text-gray-500">{order.items} items</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link
                              href={`/dashboard/orders/view/${order.id}`}
                              className="text-green-600 hover:text-green-900"
                            >
                              View
                            </Link>
                            <Link
                              href={`/dashboard/orders/edit/${order.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Customer Notes</h2>
              <Link
                href={`/dashboard/customers/edit/${customer.id}`}
                className="text-sm text-green-600 hover:text-green-700 flex items-center"
              >
                <FiEdit2 className="w-4 h-4 mr-1" />
                Edit Notes
              </Link>
            </div>
            
            {!customer.notes ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">No notes available for this customer.</p>
                <Link
                  href={`/dashboard/customers/edit/${customer.id}`}
                  className="mt-2 inline-flex items-center text-sm text-green-600 hover:text-green-700"
                >
                  <FiEdit2 className="mr-1 h-4 w-4" />
                  Add notes
                </Link>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 border">
                <div className="flex items-start">
                  <FiFileText className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-gray-700 whitespace-pre-line">{customer.notes}</p>
                    <p className="text-xs text-gray-500 mt-4">
                      Last updated: {formatDate(customer.dateJoined)} {/* In a real app, you'd track when notes were updated */}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex">
                <FiInfo className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">About Customer Notes</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Customer notes are visible to all staff members and can be used to record important information
                      about customer preferences, special requirements, or any other details that might be helpful
                      when processing orders or communicating with the customer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Purchase History Summary */}
      {activeTab === 'overview' && customerOrders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Purchase History Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-sm text-gray-500">First Order</p>
              <p className="text-lg font-medium text-gray-900 mt-1">
                {formatDate(customerOrders.reduce((earliest, order) => 
                  new Date(order.date) < new Date(earliest.date) ? order : earliest
                , customerOrders[0]).date)}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-sm text-gray-500">Last Order</p>
              <p className="text-lg font-medium text-gray-900 mt-1">
                {formatDate(customerOrders.reduce((latest, order) => 
                  new Date(order.date) > new Date(latest.date) ? order : latest
                , customerOrders[0]).date)}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-sm text-gray-500">Most Ordered Status</p>
              <p className="text-lg font-medium text-gray-900 mt-1">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  getStatusBadgeClass(
                    Object.entries(
                      customerOrders.reduce((acc, order) => {
                        acc[order.status] = (acc[order.status] || 0) + 1;
                        return acc;
                      }, {})
                    ).sort((a, b) => b[1] - a[1])[0][0]
                  )
                }`}>
                  {Object.entries(
                    customerOrders.reduce((acc, order) => {
                      acc[order.status] = (acc[order.status] || 0) + 1;
                      return acc;
                    }, {})
                  ).sort((a, b) => b[1] - a[1])[0][0].charAt(0).toUpperCase() + 
                   Object.entries(
                    customerOrders.reduce((acc, order) => {
                      acc[order.status] = (acc[order.status] || 0) + 1;
                      return acc;
                    }, {})
                  ).sort((a, b) => b[1] - a[1])[0][0].slice(1)}
                </span>
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-sm text-gray-500">Preferred Payment</p>
              <p className="text-lg font-medium text-gray-900 mt-1">
                {Object.entries(
                  customerOrders.reduce((acc, order) => {
                    acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
                    return acc;
                  }, {})
                ).sort((a, b) => b[1] - a[1])[0][0] === 'online' ? 'Online Payment' : 'Cash on Delivery'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}