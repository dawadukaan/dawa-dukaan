'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiSave, FiPlus, FiX, FiSearch, FiMinus, 
  FiShoppingCart, FiUser, FiMapPin, FiPackage,
  FiAlertTriangle, FiPrinter, FiMail, FiTrash2
} from 'react-icons/fi';
import { getCookie } from 'cookies-next';
import env from '@/lib/config/env';

export default function EditOrderPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const token = getCookie('token');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [newStatusNote, setNewStatusNote] = useState('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${env.app.apiUrl}/admin/orders/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log(response);
        
        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Transform API data to match the expected format
          const orderData = data.data;
          
          // Format the order data
          const formattedOrder = {
            id: orderData.orderNumber,
            _id: orderData._id,
            customer: {
              id: orderData.user?._id || '',
              name: orderData.user?.name || 'Unknown',
              email: orderData.user?.email || 'No email',
              phone: orderData.user?.phone || 'No phone'
            },
            date: orderData.createdAt,
            total: orderData.totalPrice,
            items: orderData.orderItems.map(item => ({
              id: item._id,
              productId: item.product,
              name: item.name,
              sku: item.product,
              baseQuantity: item.baseQuantity || '',
              quantityUnit: '',
              price: item.price,
              quantity: item.quantity,
              image: item.image
            })),
            status: orderData.status.toLowerCase(),
            paymentStatus: orderData.paymentStatus ? orderData.paymentStatus.toLowerCase() : (orderData.isPaid ? 'paid' : 'pending'),
            paymentMethod: orderData.paymentMethod === 'PhonePe' ? 'online' : 'cod',
            shippingFee: orderData.shippingPrice,
            discount: orderData.couponDiscount || 0,
            notes: orderData.notes || '',
            shippingAddress: {
              street: orderData.shippingAddress?.street || '',
              city: orderData.shippingAddress?.city || '',
              state: orderData.shippingAddress?.state || '',
              pincode: orderData.shippingAddress?.pincode || ''
            },
            timeline: orderData.statusHistory.map(status => ({
              status: status.status.toLowerCase(),
              date: status.timestamp,
              note: status.note || 'Status updated'
            }))
          };
          
          setOrder(formattedOrder);
        } else {
          throw new Error(data.message || 'Failed to fetch order');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError(`Error loading order: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchOrder();
    }
  }, [id, token]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        
        const response = await fetch(`${env.app.apiUrl}/admin/products`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        if (data.success && data.data.products) {
          setProducts(data.data.products);
        } else {
          throw new Error(data.message || 'Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    
    fetchProducts();
  }, [token]);

  // Filter products based on search term
  useEffect(() => {
    if (!productSearchTerm) {
      setFilteredProducts(products);
      return;
    }
    
    const searchLower = productSearchTerm.toLowerCase();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.sku?.toLowerCase().includes(searchLower)
    );
    
    setFilteredProducts(filtered);
  }, [productSearchTerm, products]);

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
    const existingItemIndex = order.items.findIndex(item => item.productId === product._id);
    
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
            id: `temp-${Date.now()}`, // Temporary ID until saved
            productId: product._id,
            name: product.name,
            sku: product.sku || product._id,
            price: product.price,
            baseQuantity: product.baseQuantity || '',
            quantityUnit: product.unit || '',
            image: product.images?.[0] || '',
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
    
    if (name === 'status' || name === 'paymentStatus') {
      // For status fields, store the value in lowercase in the state
      // This ensures consistency with how we're handling it elsewhere
      setOrder({
        ...order,
        [name]: value.toLowerCase()
      });
    } else {
      // For other fields, store the value as is
      setOrder({
        ...order,
        [name]: value
      });
    }
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
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Packed':
        return 'bg-indigo-100 text-indigo-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Returned':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Add this helper function for payment status notifications
  const getPaymentStatusMessage = (status, orderId) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return `Payment received for order #${orderId}. Thank you!`;
      case 'refunded':
        return `Refund processed for order #${orderId}.`;
      case 'failed':
        return `Payment failed for order #${orderId}. Please update your payment method.`;
      default:
        return `Payment status updated for order #${orderId}: ${status}`;
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
      // Ensure status has the correct capitalization
      const formattedStatus = order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase();
      const formattedPaymentStatus = order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1).toLowerCase();
      
      // Prepare data for API
      const orderData = {
        status: formattedStatus,
        paymentStatus: formattedPaymentStatus,
        isPaid: formattedPaymentStatus === 'Paid',
        paymentMethod: order.paymentMethod === 'online' ? 'PhonePe' : 'COD',
        notes: order.notes,
        shippingPrice: parseFloat(order.shippingFee),
        couponDiscount: parseFloat(order.discount),
        note: `Order updated by admin on ${new Date().toLocaleString()}`
      };
      
      // Update order
      const response = await fetch(`${env.app.apiUrl}/admin/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order');
      }

      // Send notification about status change
      const notificationResponse = await fetch(`${env.app.apiUrl}/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: order.customer.id, // Send to specific customer
          title: `Order ${order.id} ${formattedStatus}`,
          body: getStatusNotificationMessage(formattedStatus, order.id),
          data: {
            type: 'order',
            orderId: order.id,
            status: formattedStatus,
            orderNumber: order.id
          },
          type: 'order'
        })
      });

      if (!notificationResponse.ok) {
        console.error('Failed to send notification:', await notificationResponse.json());
      }

      // send email to customer about order status
      const emailResponse = await fetch(`${env.app.apiUrl}/admin/orders/send-mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: order.customer.email,
          subject: `Order ${order.id} ${formattedStatus}`,
          orderNumber: order.id,
          status: formattedStatus,
          paymentStatus: formattedPaymentStatus
        })
      });

      if (!emailResponse.ok) {
        console.error('Failed to send email:', await emailResponse.json());
      }
      
      // In handleSubmit, add payment status notification
      // if (formattedPaymentStatus !== order.paymentStatus) {
      //   // Send payment status notification
      //   await fetch(`${env.app.apiUrl}/notifications/send`, {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       'Authorization': `Bearer ${token}`
      //     },
      //     body: JSON.stringify({
      //       userId: order.customer.id,
      //       title: `Payment ${formattedPaymentStatus}`,
      //       body: getPaymentStatusMessage(formattedPaymentStatus, order.id),
      //       data: {
      //         type: 'order',
      //         orderId: order.id,
      //         paymentStatus: formattedPaymentStatus,
      //         orderNumber: order.id
      //       },
      //       type: 'order'
      //     })
      //   }).catch(error => {
      //     console.error('Failed to send payment notification:', error);
      //   });
      // }
      
      // Redirect to orders page after successful update
      router.push('/dashboard/orders');
      router.refresh();
    } catch (error) {
      console.error('Error updating order:', error);
      alert(`Failed to update order: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Add this helper function to get appropriate notification message
  const getStatusNotificationMessage = (status, orderId) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return `Your order #${orderId} is now being processed.`;
      case 'packed':
        return `Great news! Your order #${orderId} has been packed and will be shipped soon.`;
      case 'shipped':
        return `Your order #${orderId} is on its way to you!`;
      case 'delivered':
        return `Your order #${orderId} has been delivered. Thank you for shopping with us!`;
      case 'cancelled':
        return `Your order #${orderId} has been cancelled. Please contact support for any questions.`;
      case 'returned':
        return `Return for order #${orderId} has been processed.`;
      default:
        return `Status update for your order #${orderId}: ${status}`;
    }
  };

  // Handle print invoice
  const handlePrintInvoice = () => {
    window.print();
  };

  // Handle send invoice email
  const handleSendInvoiceEmail = async () => {
    try {
      const response = await fetch(`${env.app.apiUrl}/admin/orders/${id}/send-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Invoice sent successfully');
      } else {
        alert(`Failed to send invoice: ${data.message}`);
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Failed to send invoice. Please try again.');
    }
  };

  // Handle delete order
  const handleDeleteOrder = async () => {
    setShowDeleteModal(true);
  };

  // Confirm delete order
  const confirmDeleteOrder = async () => {
    try {
      const response = await fetch(`${env.app.apiUrl}/admin/orders/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowDeleteModal(false);
        alert('Order deleted successfully');
        router.push('/dashboard/orders');
      } else {
        setShowDeleteModal(false);
        alert(`Failed to delete order: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      setShowDeleteModal(false);
      alert('Failed to delete order. Please try again.');
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
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
        <div className="flex flex-wrap gap-2">
          {/* <button
            type="button"
            onClick={handlePrintInvoice}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <FiPrinter className="w-5 h-5 mr-2" />
            Print
          </button> */}
          {/* <button
            type="button"
            onClick={handleSendInvoiceEmail}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <FiMail className="w-5 h-5 mr-2" />
            Email
          </button> */}
          <button
            type="button"
            onClick={handleDeleteOrder}
            className="px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 flex items-center"
          >
            <FiTrash2 className="w-5 h-5 mr-2" />
            Delete
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
                      value={order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}
                      onChange={handleOrderDetailsChange}
                    >
                      <option value="Pending">Pending</option>
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
                      value={order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1).toLowerCase()}
                      onChange={handleOrderDetailsChange}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Refunded">Refunded</option>
                      <option value="Failed">Failed</option>
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
                      <span className="font-medium">₹{Math.round(summary.subtotal).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping Fee:</span>
                      <span className="font-medium">₹{Math.round(summary.shippingFee).toFixed(2)}</span>
                    </div>
                    
                    {summary.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount:</span>
                        <span className="font-medium text-red-600">-₹{Math.round(summary.discount).toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Total:</span>
                        <span className="font-bold text-lg">₹{Math.round(summary.total).toFixed(2)}</span>
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
                
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <FiAlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Important Note</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Changing order status will update the customer about their order. Make sure all details are correct before saving.
                      </p>
                    </div>
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
                                {item.baseQuantity && (
                                  <div className="text-xs text-gray-500">
                                    {item.baseQuantity} {item.quantityUnit}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{Math.round(item.price).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                                disabled={item.quantity <= 1}
                              >
                                <FiMinus className="w-4 h-4" />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                className="mx-2 w-12 text-center border rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                              >
                                <FiPlus className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{Math.round(item.price * item.quantity).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
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
                          ₹{Math.round(summary.subtotal).toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
              
              {/* Add Product Modal */}
              {showAddProductModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="text-lg font-medium">Add Product to Order</h3>
                      <button
                        type="button"
                        onClick={() => setShowAddProductModal(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <FiX className="w-5 h-5" />
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
                    
                    <div className="flex-1 overflow-y-auto p-4">
                      {isLoadingProducts ? (
                        <div className="flex justify-center items-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No products found matching your search.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {filteredProducts.map((product) => (
                            <div 
                              key={product._id}
                              className="border rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleAddProduct(product)}
                            >
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 mr-3">
                                  {product.images && product.images.length > 0 ? (
                                    <img 
                                      src={product.images[0]} 
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
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                  <div className="text-sm text-gray-500">
                                    SKU: {product.sku || 'N/A'} | Price: ₹{product.price.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="bg-green-50 text-green-600 p-1 rounded-full hover:bg-green-100"
                              >
                                <FiPlus className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 border-t flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddProductModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mr-2"
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
                
                <div className="bg-gray-50 rounded-lg p-4 border mb-6">
                  <div>
                    <h3 className="font-medium text-gray-900">{order.customer.name}</h3>
                    <p className="text-sm text-gray-500">{order.customer.email}</p>
                    <p className="text-sm text-gray-500">{order.customer.phone}</p>
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
                      Pincode
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
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">₹{Math.round(summary.subtotal).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping Fee:</span>
                      <span className="font-medium">₹{Math.round(summary.shippingFee).toFixed(2)}</span>
                    </div>
                    
                    {summary.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount:</span>
                        <span className="font-medium text-red-600">-₹{Math.round(summary.discount).toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Total:</span>
                        <span className="font-bold text-lg">₹{Math.round(summary.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Order Items</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <ul className="divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <li key={item.id} className="py-2 flex justify-between">
                          <div>
                            <span className="text-sm font-medium">{item.name}</span>
                            <span className="text-xs text-gray-500 block">
                              {item.quantity} x ₹{Math.round(item.price).toFixed(2)}
                            </span>
                          </div>
                          <span className="text-sm">₹{Math.round(item.price * item.quantity).toFixed(2)}</span>
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
              
              <div className="border rounded-lg overflow-hidden">
                <div className="relative p-6">
                  {/* Timeline */}
                  <div className="ml-6 border-l-2 border-gray-200">
                    {order.timeline && order.timeline.length > 0 ? (
                      order.timeline.map((event, index) => (
                        <div key={`timeline-${index}`} className="relative mb-8 ml-6">
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
                      ))
                    ) : (
                      <div className="relative mb-8 ml-6">
                        <div className="absolute -left-8 mt-1.5 h-4 w-4 rounded-full border-2 border-white bg-gray-200">
                          <div className="h-full w-full rounded-full bg-yellow-800"></div>
                        </div>
                        <div className="mb-1 flex items-center">
                          <span className="mr-2 rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                            Created
                          </span>
                          <time className="text-xs text-gray-500">{formatDate(order.date)}</time>
                        </div>
                        <p className="text-sm text-gray-700">Order was created</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* <div className="mt-6 border rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Add Status Update</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="newStatusNote" className="block text-sm font-medium text-gray-700 mb-1">
                      Status Note
                    </label>
                    <textarea
                      id="newStatusNote"
                      rows="3"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newStatusNote}
                      onChange={(e) => setNewStatusNote(e.target.value)}
                      placeholder="Add a note about this status update"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleStatusUpdate}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                      <FiPlus className="w-4 h-4 mr-2" />
                      Add Update
                    </button>
                  </div>
                </div>
              </div> */}
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t flex justify-end">
            <Link 
              href="/dashboard/orders" 
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mr-2"
            >
              Cancel
            </Link>
            <button
              type="submit"
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
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FiTrash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Order</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete order <span className="font-medium">{order.id}</span>? This action cannot be undone and all data associated with this order will be permanently removed.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}