'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import { 
  FiSave, FiPlus, FiX, FiSearch, 
  FiShoppingCart, FiUser, FiMapPin, FiPackage,
  FiAlertTriangle, FiPrinter, FiMail
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

// Sample products for demo
const sampleProducts = [
  {
    id: '1',
    name: 'Organic Tomatoes',
    sku: 'VEG-TOM-001',
    baseQuantity: '500',
    quantityUnit: 'g',
    price: 45.00,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
  },
  {
    id: '2',
    name: 'Fresh Spinach',
    sku: 'VEG-SPI-002',
    baseQuantity: '250',
    quantityUnit: 'g',
    price: 30.00,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
  },
  {
    id: '3',
    name: 'Red Bell Peppers',
    sku: 'VEG-PEP-003',
    baseQuantity: '500',
    quantityUnit: 'g',
    price: 60.00,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
  },
  {
    id: '4',
    name: 'Organic Carrots',
    sku: 'VEG-CAR-004',
    baseQuantity: '1',
    quantityUnit: 'kg',
    price: 40.00,
    stock: 200,
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
  },
  {
    id: '5',
    name: 'Purple Cabbage',
    sku: 'VEG-CAB-005',
    baseQuantity: '1',
    quantityUnit: 'pcs',
    price: 55.00,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1594282486552-05a9f0a53ca7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
  },
  {
    id: '6',
    name: 'Organic Potatoes',
    sku: 'VEG-POT-006',
    baseQuantity: '1',
    quantityUnit: 'kg',
    price: 35.00,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
  }
];

export default function EditOrderPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [newStatusNote, setNewStatusNote] = useState('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);

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

  // Filter products based on search term
  const filteredProducts = sampleProducts.filter(product => {
    if (!productSearchTerm) return true;
    
    const searchLower = productSearchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower)
    );
  });

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

  // Handle adding product to order
  const handleAddProduct = (product) => {
    const existingItemIndex = order.items.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Product already in order, increment quantity
      const updatedItems = [...order.items];
      updatedItems[existingItemIndex].quantity += 1;
      setOrder({
        ...order,
        items: updatedItems
      });
    } else {
      // Add new product to order
      setOrder({
        ...order,
        items: [
          ...order.items,
          {
            id: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            baseQuantity: product.baseQuantity,
            quantityUnit: product.quantityUnit,
            image: product.image,
            quantity: 1
          }
        ]
      });
    }
    
    // Clear search and close modal
    setProductSearchTerm('');
    setShowAddProductModal(false);
  };

  // Handle removing product from order
  const handleRemoveProduct = (productId) => {
    setOrder({
      ...order,
      items: order.items.filter(item => item.id !== productId)
    });
  };

  // Handle quantity change
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = order.items.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setOrder({
      ...order,
      items: updatedItems
    });
  };

  // Handle order details changes
  const handleOrderDetailsChange = (e) => {
    const { name, value } = e.target;
    setOrder({
      ...order,
      [name]: value
    });
  };

  // Handle shipping address changes
  const handleShippingAddressChange = (e) => {
    const { name, value } = e.target;
    setOrder({
      ...order,
      shippingAddress: {
        ...order.shippingAddress,
        [name]: value
      }
    });
  };

  // Handle status update
  const handleStatusUpdate = () => {
    if (!newStatusNote.trim()) {
      alert('Please enter a note for the status update');
      return;
    }
    
    const now = new Date().toISOString();
    
    setOrder({
      ...order,
      status: order.status, // Keep the same status or change it if needed
      timeline: [
        ...order.timeline,
        {
          status: order.status,
          date: now,
          note: newStatusNote
        }
      ]
    });
    
    setNewStatusNote('');
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (order.items.length === 0) {
      alert('Order must have at least one product');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // In a real app, you would send this to your API
      // const response = await fetch(`/api/orders/${id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(order),
      // });
      // 
      // if (!response.ok) throw new Error('Failed to update order');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Redirect to orders page after successful update
      router.push('/dashboard/orders');
      router.refresh();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
    } finally {
      setIsSaving(false);
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
          <h1 className="text-2xl font-bold text-gray-800">Edit Order: {order.id}</h1>
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
          <Link 
            href="/dashboard/orders" 
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </button>
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

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Details Tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Order Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={order.status}
                      onChange={handleOrderDetailsChange}
                    >
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
                      value={order.paymentStatus}
                      onChange={handleOrderDetailsChange}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={order.paymentMethod}
                      onChange={handleOrderDetailsChange}
                    >
                      <option value="online">Online Payment</option>
                      <option value="cod">Cash on Delivery</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="shippingFee" className="block text-sm font-medium text-gray-700 mb-1">
                      Shipping Fee (₹)
                    </label>
                    <input
                      id="shippingFee"
                      name="shippingFee"
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={order.shippingFee}
                      onChange={handleOrderDetailsChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Amount (₹)
                    </label>
                    <input
                      id="discount"
                      name="discount"
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={order.discount}
                      onChange={handleOrderDetailsChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Order Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows="4"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={order.notes}
                      onChange={handleOrderDetailsChange}
                      placeholder="Add any special instructions or notes for this order"
                    />
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
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Shipping Address</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <p className="text-sm">{order.shippingAddress.street}</p>
                    <p className="text-sm">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Items Tab */}
          {activeTab === 'items' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(true)}
                  className="bg-green-50 text-green-600 px-3 py-2 rounded-lg flex items-center hover:bg-green-100"
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  Add Product
                </button>
              </div>
              
              {order.items.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500">No items in this order.</p>
                  <p className="text-gray-500 text-sm mt-1">Click "Add Product" to add items to the order.</p>
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
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
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
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="p-1 border rounded-l-md hover:bg-gray-100"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                className="w-12 border-t border-b text-center py-1"
                              />
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-1 border rounded-r-md hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiX className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Add Product Modal */}
              {showAddProductModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Add Product to Order</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddProductModal(false);
                          setProductSearchTerm('');
                        }}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="p-4 border-b">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search products by name or SKU"
                          className="pl-10 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="overflow-y-auto flex-grow">
                      {filteredProducts.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No products found. Try a different search term.
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {filteredProducts.map(product => (
                            <li 
                              key={product.id}
                              className="p-4 hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleAddProduct(product)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 mr-3">
                                    {product.image ? (
                                      <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No image
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{product.name}</p>
                                    <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                                    <p className="text-sm text-gray-500">
                                      {product.baseQuantity} {product.quantityUnit} | ₹{product.price.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <FiPlus className="h-5 w-5" />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    <div className="p-4 border-t">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddProductModal(false);
                          setProductSearchTerm('');
                        }}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Customer Tab */}
          {activeTab === 'customer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
                
                <div className="bg-gray-50 rounded-lg p-4 border mb-4">
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
                      View Customer
                    </Link>
                  </div>
                </div>
                
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      id="street"
                      name="street"
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={order.shippingAddress.street}
                      onChange={handleShippingAddressChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={order.shippingAddress.city}
                        onChange={handleShippingAddressChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        id="state"
                        name="state"
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={order.shippingAddress.state}
                        onChange={handleShippingAddressChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                      PIN Code
                    </label>
                    <input
                      id="pincode"
                      name="pincode"
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={order.shippingAddress.pincode}
                      onChange={handleShippingAddressChange}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">{order.id}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date Placed:</span>
                      <span className="font-medium">{formatDate(order.date)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">
                        {order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </div>
                    
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Total:</span>
                        <span className="font-bold text-lg">₹{summary.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Items in Order</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <ul className="space-y-2">
                      {order.items.map(item => (
                        <li key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.name} x {item.quantity}
                          </span>
                          <span className="font-medium">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-grow">
                    <select
                      id="status"
                      name="status"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={order.status}
                      onChange={handleOrderDetailsChange}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div className="flex-grow">
                    <input
                      type="text"
                      placeholder="Add a note for this status update"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newStatusNote}
                      onChange={(e) => setNewStatusNote(e.target.value)}
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleStatusUpdate}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Add Update
                  </button>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="relative">
                    {/* Timeline */}
                    <div className="ml-6 border-l-2 border-gray-200 py-4">
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
              </div>
              
              {order.status === 'cancelled' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start">
                    <FiAlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Order Cancelled</h3>
                      <p className="text-sm text-red-700 mt-1">
                        This order has been cancelled and cannot be fulfilled. You can change the status if this was done in error.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="pt-6 border-t flex justify-end space-x-3">
            <Link
              href="/dashboard/orders"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving || order.items.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}