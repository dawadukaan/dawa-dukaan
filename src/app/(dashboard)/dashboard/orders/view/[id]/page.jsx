'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import { 
  FiEdit2, FiPrinter, FiMail, FiDownload, 
  FiShoppingCart, FiUser, FiMapPin, FiPackage,
  FiAlertTriangle, FiCheck, FiX
} from 'react-icons/fi';

// Sample orders data for demonstration
const sampleOrders = [
  {
    id: 'ORD-2023-1001',
    customer: {
      id: '1',
      name: 'Rahul Sharma',
      email: 'rahul.s@example.com',
      phone: '+91 98765 43210'
    },
    date: '2023-11-15T10:30:00',
    total: 1250.00,
    items: [
      {
        id: '1',
        name: 'Organic Tomatoes',
        sku: 'VEG-TOM-001',
        baseQuantity: '500',
        quantityUnit: 'g',
        price: 45.00,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
      },
      {
        id: '3',
        name: 'Red Bell Peppers',
        sku: 'VEG-PEP-003',
        baseQuantity: '500',
        quantityUnit: 'g',
        price: 60.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
      },
      {
        id: '4',
        name: 'Organic Carrots',
        sku: 'VEG-CAR-004',
        baseQuantity: '1',
        quantityUnit: 'kg',
        price: 40.00,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
      }
    ],
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'online',
    shippingFee: 40.00,
    discount: 0.00,
    notes: 'Please deliver in the morning.',
    shippingAddress: {
      street: '123 Main Street, Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    timeline: [
      { status: 'pending', date: '2023-11-15T10:30:00', note: 'Order placed' },
      { status: 'processing', date: '2023-11-15T11:45:00', note: 'Payment confirmed' },
      { status: 'shipped', date: '2023-11-16T09:20:00', note: 'Order shipped via Express Delivery' },
      { status: 'delivered', date: '2023-11-17T14:30:00', note: 'Order delivered successfully' }
    ]
  },
  {
    id: 'ORD-2023-1002',
    customer: {
      id: '2',
      name: 'Priya Patel',
      email: 'priya.p@example.com',
      phone: '+91 87654 32109'
    },
    date: '2023-11-14T14:45:00',
    total: 875.50,
    items: [
      {
        id: '2',
        name: 'Fresh Spinach',
        sku: 'VEG-SPI-002',
        baseQuantity: '250',
        quantityUnit: 'g',
        price: 30.00,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
      },
      {
        id: '5',
        name: 'Purple Cabbage',
        sku: 'VEG-CAB-005',
        baseQuantity: '1',
        quantityUnit: 'pcs',
        price: 55.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1594282486552-05a9f0a53ca7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
      }
    ],
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'online',
    shippingFee: 40.00,
    discount: 0.00,
    notes: '',
    shippingAddress: {
      street: '456 Park Avenue',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001'
    },
    timeline: [
      { status: 'pending', date: '2023-11-14T14:45:00', note: 'Order placed' },
      { status: 'processing', date: '2023-11-14T15:30:00', note: 'Payment confirmed' }
    ]
  }
];

export default function ViewOrderPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch(`/api/orders/${id}`);
        // if (!response.ok) throw new Error('Failed to fetch order');
        // const data = await response.json();
        
        // For demo, we'll use sample data
        const foundOrder = sampleOrders.find(order => order.id === id);
        
        if (!foundOrder) {
          console.log(`Order with ID ${id} not found in sample data`);
          setError(`Order with ID ${id} not found. Please check the URL or return to the orders list.`);
          setIsLoading(false);
          return;
        }
        
        setOrder(foundOrder);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError(`Error loading order: ${error.message}`);
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);

  // Calculate order summary
  const calculateSummary = () => {
    if (!order) return { subtotal: 0, shippingFee: 0, discount: 0, total: 0 };
    
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = parseFloat(order.shippingFee) || 0;
    const discount = parseFloat(order.discount) || 0;
    const total = subtotal + shippingFee - discount;
    
    return {
      subtotal,
      shippingFee,
      discount,
      total
    };
  };

  const summary = calculateSummary();

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

  // Handle print invoice
  const handlePrintInvoice = () => {
    // In a real app, you would implement invoice printing functionality
    alert('Print invoice functionality would be implemented here');
  };

  // Handle send invoice email
  const handleSendInvoiceEmail = () => {
    // In a real app, you would implement email sending functionality
    alert('Send invoice email functionality would be implemented here');
  };

  // Handle download invoice
  const handleDownloadInvoice = () => {
    // In a real app, you would implement invoice download functionality
    alert('Download invoice functionality would be implemented here');
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
        <Link href="/dashboard/orders" className="text-red-700 font-medium underline mt-2 inline-block">
          Return to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p>Order not found</p>
        <Link href="/dashboard/orders" className="text-yellow-700 font-medium underline mt-2 inline-block">
          Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order: {order.id}</h1>
          <p className="text-gray-500">
            Placed on {formatDate(order.date)} by {order.customer.name}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrintInvoice}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <FiPrinter className="w-5 h-5 mr-2" />
            Print
          </button>
          <button
            type="button"
            onClick={handleSendInvoiceEmail}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <FiMail className="w-5 h-5 mr-2" />
            Email
          </button>
          <button
            type="button"
            onClick={handleDownloadInvoice}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <FiDownload className="w-5 h-5 mr-2" />
            Download
          </button>
          <Link 
            href={`/dashboard/orders/edit/${id}`}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FiEdit2 className="w-5 h-5 mr-2" />
            Edit Order
          </Link>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center">
        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
        <span className="mx-2 text-gray-500">•</span>
        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
          order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {order.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
        </span>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap border-b">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 flex items-center border-b-2 text-sm font-medium ${
              activeTab === 'details' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiPackage className="mr-2 h-5 w-5" />
            Order Details
          </button>
          
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-3 flex items-center border-b-2 text-sm font-medium ${
              activeTab === 'items' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiShoppingCart className="mr-2 h-5 w-5" />
            Items
          </button>
          
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-4 py-3 flex items-center border-b-2 text-sm font-medium ${
              activeTab === 'customer' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiUser className="mr-2 h-5 w-5" />
            Customer
          </button>
          
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-3 flex items-center border-b-2 text-sm font-medium ${
              activeTab === 'timeline' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiMapPin className="mr-2 h-5 w-5" />
            Timeline
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Order Details Tab */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Information</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order ID</p>
                    <p className="mt-1">{order.id}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date Placed</p>
                    <p className="mt-1">{formatDate(order.date)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order Status</p>
                    <p className="mt-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Status</p>
                    <p className="mt-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="mt-1">
                    {order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                  </p>
                </div>
                
                {order.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order Notes</p>
                    <p className="mt-1 text-gray-700">{order.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-sm">{order.shippingAddress.street}</p>
                  <p className="text-sm">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{summary.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping Fee:</span>
                    <span className="font-medium">₹{summary.shippingFee.toFixed(2)}</span>
                  </div>
                  
                  {summary.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-red-600">-₹{summary.discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Total:</span>
                      <span className="font-bold text-lg">₹{summary.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-sm text-gray-600">{order.customer.email}</p>
                  <p className="text-sm text-gray-600">{order.customer.phone}</p>
                  <div className="mt-2">
                    <Link
                      href={`/dashboard/customers/${order.customer.id}`}
                      className="text-sm text-green-600 hover:text-green-700"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/dashboard/orders/edit/${id}`}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <FiEdit2 className="w-4 h-4 mr-2" />
                    Edit Order
                  </Link>
                  <button
                    type="button"
                    onClick={handlePrintInvoice}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <FiPrinter className="w-4 h-4 mr-2" />
                    Print Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
            
            {order.items.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">No items in this order.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 mr-3">
                              {item.image ? (
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  No image
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                              <div className="text-xs text-gray-500">
                                {item.baseQuantity} {item.quantityUnit}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                        Subtotal:
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">
                        ₹{summary.subtotal.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                        Shipping Fee:
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">
                        ₹{summary.shippingFee.toFixed(2)}
                      </td>
                    </tr>
                    {summary.discount > 0 && (
                      <tr>
                        <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                          Discount:
                        </td>
                        <td className="px-6 py-3 text-sm font-medium text-red-600">
                          -₹{summary.discount.toFixed(2)}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                        Total:
                      </td>
                      <td className="px-6 py-3 text-sm font-bold text-gray-900">
                        ₹{summary.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* Customer Tab */}
        {activeTab === 'customer' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 border mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{order.customer.name}</h3>
                    <p className="text-sm text-gray-500">{order.customer.email}</p>
                    <p className="text-sm text-gray-500">{order.customer.phone}</p>
                  </div>
                  <Link
                    href={`/dashboard/customers/${order.customer.id}`}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
              
              <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-sm">{order.shippingAddress.street}</p>
                <p className="text-sm">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                </p>
              </div>
              
              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Notes</h2>
                
                {order.notes ? (
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <p className="text-sm text-gray-700">{order.notes}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 border text-center">
                    <p className="text-sm text-gray-500">No notes for this order</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order History</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Order ID</span>
                    <span className="text-sm font-medium">{order.id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Date Placed</span>
                    <span className="text-sm">{formatDate(order.date)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Payment Method</span>
                    <span className="text-sm">
                      {order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Payment Status</span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Order Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>₹{summary.subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping Fee:</span>
                      <span>₹{summary.shippingFee.toFixed(2)}</span>
                    </div>
                    
                    {summary.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount:</span>
                        <span className="text-red-600">-₹{summary.discount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold">₹{summary.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Actions</h3>
                <div className="grid grid-cols-1 gap-3">
                  <Link
                    href={`/dashboard/orders/edit/${id}`}
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <FiEdit2 className="w-4 h-4 mr-2" />
                    Edit Order
                  </Link>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handlePrintInvoice}
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <FiPrinter className="w-4 h-4 mr-2" />
                      Print Invoice
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadInvoice}
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <FiDownload className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h2>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="relative p-6">
                {/* Timeline */}
                <div className="ml-6 border-l-2 border-gray-200">
                  {order.timeline.map((event, index) => (
                    <div key={index} className="relative mb-8 ml-6">
                      <div className="absolute -left-8 mt-1.5 h-4 w-4 rounded-full border-2 border-white bg-gray-200">
                        <div className={`h-full w-full rounded-full ${getStatusBadgeClass(event.status).replace('text-', 'bg-').replace('bg-', '')}`}></div>
                      </div>
                      <div className="mb-1 flex items-center">
                        <span className={`mr-2 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(event.status)}`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                        <time className="text-xs text-gray-500">{formatDate(event.date)}</time>
                      </div>
                      <p className="text-sm text-gray-700">{event.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {order.status === 'delivered' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <div className="flex items-start">
                  <FiCheck className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Order Completed</h3>
                    <p className="text-sm text-green-700 mt-1">
                      This order has been successfully delivered to the customer.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {order.status === 'cancelled' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <div className="flex items-start">
                  <FiAlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Order Cancelled</h3>
                    <p className="text-sm text-red-700 mt-1">
                      This order has been cancelled and will not be processed further.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {order.status === 'processing' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-start">
                  <FiPackage className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Order In Progress</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      This order is currently being processed and will be shipped soon.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {order.status === 'shipped' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                <div className="flex items-start">
                  <FiPackage className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-purple-800">Order Shipped</h3>
                    <p className="text-sm text-purple-700 mt-1">
                      This order has been shipped and is on its way to the customer.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}