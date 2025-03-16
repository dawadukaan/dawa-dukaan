'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import { getCookie } from 'cookies-next';
import { toast } from 'react-hot-toast';
import env from '@/lib/config/env';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiHome, 
  FiEdit2, FiArrowLeft, FiInfo, FiAlertCircle,
  FiShoppingBag, FiCalendar, FiClock, FiDollarSign,
  FiPackage, FiFileText, FiExternalLink, FiPlus,
  FiCreditCard, FiCheck, FiX, FiShield
} from 'react-icons/fi';

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
        setIsLoading(true);
        const token = getCookie('token');
        
        // Fetch customer data from API
        const response = await fetch(`${env.app.apiUrl}/admin/users/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch customer');
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch customer');
        }
        
        setCustomer(data.data);
        
        // Fetch customer orders (if you have an orders API)
        try {
          const ordersResponse = await fetch(`${env.app.apiUrl}/admin/orders?userId=${id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            if (ordersData.success) {
              setCustomerOrders(ordersData.data || []);
            }
          }
        } catch (orderError) {
          console.error('Error fetching orders:', orderError);
          // Don't fail the whole page if orders can't be fetched
          setCustomerOrders([]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching customer:', error);
        setError(error.message || 'Failed to load customer');
        setIsLoading(false);
      }
    };
    
    fetchCustomerData();
  }, [id]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Format date with time for display
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
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
            <p className="text-gray-500">Customer since {formatDate(customer.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Status and Type Badges */}
      <div className="flex items-center space-x-2">
        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
          customer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {customer.isActive ? 'Active' : 'Inactive'}
        </span>
        
        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
          getLicenseTypeBadgeClass(customer.type)
        }`}>
          {customer.type === 'licensee' ? (
            <span className="flex items-center">
              <FiCheck className="mr-1 h-3 w-3" />
              Licensed
            </span>
          ) : (
            <span className="flex items-center">
              <FiX className="mr-1 h-3 w-3" />
              Unlicensed
            </span>
          )}
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
          
          {customer.type === 'licensee' && (
            <button
              onClick={() => setActiveTab('license')}
              className={`px-4 py-3 flex items-center border-b-2 text-sm font-medium ${
                activeTab === 'license' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiCreditCard className="mr-2 h-5 w-5" />
              License Details
            </button>
          )}
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
                      {formatDate(customer.createdAt)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Login</p>
                    <p className="mt-1 flex items-center">
                      <FiClock className="h-5 w-5 text-gray-400 mr-2" />
                      {customer.lastLogin ? formatDateTime(customer.lastLogin) : 'Never'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Customer Type</p>
                    <p className="mt-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        getLicenseTypeBadgeClass(customer.type)
                      }`}>
                        {customer.type === 'licensee' ? (
                          <span className="flex items-center">
                            <FiCheck className="mr-1 h-3 w-3" />
                            Licensed
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <FiX className="mr-1 h-3 w-3" />
                            Unlicensed
                          </span>
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              {customer.defaultAddress && (
                <div className="mt-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Address Information</h2>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-start">
                      <FiHome className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{customer.defaultAddress.addressType.charAt(0).toUpperCase() + customer.defaultAddress.addressType.slice(1)} Address</p>
                        {customer.defaultAddress.addressLine1 && <p className="text-sm">{customer.defaultAddress.addressLine1}</p>}
                        {customer.defaultAddress.addressLine2 && <p className="text-sm">{customer.defaultAddress.addressLine2}</p>}
                        <p className="text-sm">
                          {customer.defaultAddress.city && `${customer.defaultAddress.city}, `}
                          {customer.defaultAddress.state} {customer.defaultAddress.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {customerOrders.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
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
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.orderNumber || order._id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDateTime(order.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{order.totalAmount?.toFixed(2) || '0.00'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                href={`/dashboard/orders/view/${order._id}`}
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
                          onClick={() => setActiveTab('overview')}
                          className="text-sm text-green-600 hover:text-green-700"
                        >
                          View all {customerOrders.length} orders
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              {/* Customer Profile Image */}
              <div className="bg-gray-50 rounded-lg p-6 border text-center">
                {customer.avatar ? (
                  <img 
                    src={customer.avatar} 
                    alt={customer.name} 
                    className="h-32 w-32 rounded-full mx-auto object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full mx-auto bg-gray-200 flex items-center justify-center border-4 border-white shadow-md">
                    <FiUser className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <h3 className="mt-4 text-lg font-medium text-gray-900">{customer.name}</h3>
                <p className="text-sm text-gray-500">{customer.role.charAt(0).toUpperCase() + customer.role.slice(1)}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* License Details Tab */}
        {activeTab === 'license' && customer.type === 'licensee' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">License Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6 border">
                <h3 className="text-md font-medium text-gray-900 mb-4">License Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">License Number</p>
                    <p className="mt-1 flex items-center text-gray-900">
                      <FiCreditCard className="h-5 w-5 text-gray-400 mr-2" />
                      {customer.licenseDetails?.licenseNumber || 'Not provided'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">License Status</p>
                    <p className="mt-1">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        <FiCheck className="mr-1 h-3 w-3" />
                        Active
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Customer Type</p>
                    <p className="mt-1 flex items-center">
                      <FiShield className="h-5 w-5 text-gray-400 mr-2" />
                      Licensed Customer
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 border">
                <h3 className="text-md font-medium text-gray-900 mb-4">License Document</h3>
                {customer.licenseDetails?.licenseDocument ? (
                  <div className="space-y-4">
                    <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100 border">
                      <img 
                        src={customer.licenseDetails.licenseDocument} 
                        alt="License Document" 
                        className="object-contain w-1/2 h-1/2"
                      />
                    </div>
                    
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">No license document uploaded</p>
                    <Link
                      href={`/dashboard/customers/edit/${customer._id}`}
                      className="mt-2 inline-flex items-center text-sm text-green-600 hover:text-green-700"
                    >
                      <FiPlus className="mr-1 h-4 w-4" />
                      Upload Document
                    </Link>
                  </div>
                )}
              </div>
            </div>
            
 
          </div>
        )}
      </div>
      
      {/* Purchase History Summary */}
      {activeTab === 'overview' && customerOrders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Purchase History Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-sm text-gray-500">First Order</p>
              <p className="text-lg font-medium text-gray-900 mt-1">
                {formatDate(customerOrders.reduce((earliest, order) => 
                  new Date(order.createdAt) < new Date(earliest.createdAt) ? order : earliest
                , customerOrders[0]).createdAt)}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-sm text-gray-500">Last Order</p>
              <p className="text-lg font-medium text-gray-900 mt-1">
                {formatDate(customerOrders.reduce((latest, order) => 
                  new Date(order.createdAt) > new Date(latest.createdAt) ? order : latest
                , customerOrders[0]).createdAt)}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-sm text-gray-500">Most Ordered Status</p>
              <p className="text-lg font-medium text-gray-900 mt-1">
                {customerOrders.length > 0 ? (
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
                ) : (
                  'N/A'
                )}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-sm text-gray-500">Preferred Payment</p>
              <p className="text-lg font-medium text-gray-900 mt-1">
                {customerOrders.length > 0 ? (
                  Object.entries(
                    customerOrders.reduce((acc, order) => {
                      acc[order.paymentMethod || 'unknown'] = (acc[order.paymentMethod || 'unknown'] || 0) + 1;
                      return acc;
                    }, {})
                  ).sort((a, b) => b[1] - a[1])[0][0] === 'online' ? 'Online Payment' : 
                  Object.entries(
                    customerOrders.reduce((acc, order) => {
                      acc[order.paymentMethod || 'unknown'] = (acc[order.paymentMethod || 'unknown'] || 0) + 1;
                      return acc;
                    }, {})
                  ).sort((a, b) => b[1] - a[1])[0][0] === 'cod' ? 'Cash on Delivery' : 
                  'Not specified'
                ) : (
                  'N/A'
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}