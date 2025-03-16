'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiSave, FiPlus, FiX, FiSearch, 
  FiShoppingCart, FiUser, FiMapPin, FiPackage,
  FiLoader
} from 'react-icons/fi';
import { getCookie } from 'cookies-next';
import env from '@/lib/config/env';


export default function CreateOrderPage() {
  const router = useRouter();
  const token = getCookie('token');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('customer');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  });
  const [orderItems, setOrderItems] = useState([]);
  const [orderDetails, setOrderDetails] = useState({
    shippingFee: 40,
    discount: 0,
    notes: '',
    paymentMethod: 'online',
    status: 'pending'
  });

  // State for API data
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [error, setError] = useState(null);

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoadingCustomers(true);
        setError(null);
        
        const response = await fetch(`${env.app.apiUrl}/admin/users`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        
        const data = await response.json();
        if (data.success && data.data.users) {
          setCustomers(data.data.users);
        } else {
          throw new Error(data.message || 'Failed to fetch customers');
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError(err.message);
      } finally {
        setIsLoadingCustomers(false);
      }
    };
    
    fetchCustomers();
  }, []);

  // Fetch products based on search term
  useEffect(() => {
    const fetchProducts = async () => {
      if (!productSearchTerm || productSearchTerm.length < 2) {
        return;
      }
      
      try {
        setIsLoadingProducts(true);
        setError(null);
        
        const response = await fetch(`${env.app.apiUrl}/admin/products?search=${encodeURIComponent(productSearchTerm)}`, {
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
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    
    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [productSearchTerm, token]);

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => {
    if (!customerSearchTerm) return true;
    
    const searchLower = customerSearchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
      (customer.phone && customer.phone.includes(customerSearchTerm))
    );
  });

  // Calculate order summary
  const calculateSummary = () => {
    const subtotal = orderItems.reduce((sum, item) => {
      const price = item.userType === 'licensee' ? 
        (item.salePrice?.licensedPrice || item.price.licensedPrice) : 
        (item.salePrice?.unlicensedPrice || item.price.unlicensedPrice);
      return sum + (price * item.quantity);
    }, 0);
    
    const shippingFee = parseFloat(orderDetails.shippingFee) || 0;
    const discount = parseFloat(orderDetails.discount) || 0;
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
    const existingItemIndex = orderItems.findIndex(item => item._id === product._id);
    
    if (existingItemIndex >= 0) {
      // Product already in cart, increment quantity
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += 1;
      setOrderItems(updatedItems);
    } else {
      // Add new product to cart
      const userType = selectedCustomer?.type || 'unlicensed';
      const price = userType === 'licensee' ? 
        product.price.licensedPrice : 
        product.price.unlicensedPrice;
      
      setOrderItems([
        ...orderItems,
        {
          _id: product._id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          salePrice: product.salePrice,
          baseQuantity: product.baseQuantity,
          quantityUnit: product.quantityUnit,
          image: product.images && product.images.length > 0 ? product.images[0] : null,
          quantity: 1,
          userType
        }
      ]);
    }
    
    // Clear search after adding
    setProductSearchTerm('');
    setProducts([]);
  };

  // Handle removing product from order
  const handleRemoveProduct = (productId) => {
    setOrderItems(orderItems.filter(item => item._id !== productId));
  };

  // Handle quantity change
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = orderItems.map(item => {
      if (item._id === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setOrderItems(updatedItems);
  };

  // Handle selecting a customer
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    
    // Update product prices based on customer type
    if (orderItems.length > 0) {
      const updatedItems = orderItems.map(item => ({
        ...item,
        userType: customer.type || 'unlicensed'
      }));
      setOrderItems(updatedItems);
    }
    
    // Try to set default address if available
    if (customer.defaultAddress) {
      setSelectedAddress(customer.defaultAddress);
    } else if (customer.addresses && customer.addresses.length > 0) {
      setSelectedAddress(customer.addresses[0]);
    } else {
      setSelectedAddress(null);
    }
    
    setCustomerSearchTerm('');
  };

  // Handle new customer form changes
  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setNewCustomer({
        ...newCustomer,
        address: {
          ...newCustomer.address,
          [addressField]: value
        }
      });
    } else {
      setNewCustomer({
        ...newCustomer,
        [name]: value
      });
    }
  };

  // Handle order details changes
  const handleOrderDetailsChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails({
      ...orderDetails,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedCustomer && (!newCustomer.name || !newCustomer.phone)) {
      alert('Please select a customer or enter customer details');
      setActiveTab('customer');
      return;
    }
    
    if (!selectedAddress && (!newCustomer.address.street || !newCustomer.address.city || !newCustomer.address.pincode)) {
      alert('Please select or enter a shipping address');
      setActiveTab('customer');
      return;
    }
    
    if (orderItems.length === 0) {
      alert('Please add at least one product to the order');
      setActiveTab('products');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare order data
      const orderData = {
        customer: selectedCustomer ? selectedCustomer._id : null,
        newCustomer: !selectedCustomer ? {
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          type: 'unlicensed'
        } : null,
        shippingAddress: selectedAddress ? selectedAddress._id : null,
        newAddress: !selectedAddress ? {
          addressLine1: newCustomer.address.addressLine1,
          addressLine2: newCustomer.address.addressLine2 || '',
          city: newCustomer.address.city,
          state: newCustomer.address.state,
          pincode: newCustomer.address.pincode,
          addressType: 'shop'
        } : null,
        items: orderItems.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.userType === 'licensee' ? 
            (item.salePrice?.licensedPrice || item.price.licensedPrice) : 
            (item.salePrice?.unlicensedPrice || item.price.unlicensedPrice)
        })),
        status: orderDetails.status,
        paymentMethod: orderDetails.paymentMethod,
        shippingFee: parseFloat(orderDetails.shippingFee) || 0,
        discount: parseFloat(orderDetails.discount) || 0,
        notes: orderDetails.notes,
        total: summary.total
      };
      
      console.log('Sending order data:', orderData);
      
      const response = await fetch(`${env.app.apiUrl}/admin/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }
      
      const result = await response.json();
      console.log('Order created:', result);
      
      // Redirect to orders page after successful creation
      router.push('/dashboard/orders');
      router.refresh();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Format price based on customer type
  const formatPrice = (item) => {
    const userType = item.userType || (selectedCustomer?.type || 'unlicensed');
    const price = userType === 'licensee' ? 
      (item.salePrice?.licensedPrice || item.price.licensedPrice) : 
      (item.salePrice?.unlicensedPrice || item.price.unlicensedPrice);
    
    return price.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Create New Order</h1>
        <div className="flex gap-2">
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
                Creating...
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5 mr-2" />
                Create Order
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap border-b">
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-4 py-3 flex items-center border-b-2 text-sm font-medium ${
              activeTab === 'customer' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiUser className="mr-2 h-5 w-5" />
            Customer & Shipping
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-3 flex items-center border-b-2 text-sm font-medium ${
              activeTab === 'products' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiShoppingCart className="mr-2 h-5 w-5" />
            Products
          </button>
          
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-4 py-3 flex items-center border-b-2 text-sm font-medium ${
              activeTab === 'payment' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiPackage className="mr-2 h-5 w-5" />
            Order Details
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer & Shipping Tab */}
          {activeTab === 'customer' && (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
                
                {!selectedCustomer ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-700">Select Existing Customer</h3>
                      <Link
                        href="/dashboard/customers/add"
                        className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md flex items-center"
                      >
                        <FiPlus className="h-4 w-4 mr-1" />
                        Add New Customer
                      </Link>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search customers by name, email or phone"
                        className="pl-10 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={customerSearchTerm}
                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto border rounded-lg">
                      {isLoadingCustomers ? (
                        <div className="p-4 text-center text-gray-500">
                          <FiLoader className="animate-spin h-5 w-5 mx-auto mb-2" />
                          Loading customers...
                        </div>
                      ) : filteredCustomers.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No customers found. Try a different search or create a new customer.
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {filteredCustomers.map(customer => (
                            <li 
                              key={customer._id}
                              className="p-4 hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleSelectCustomer(customer)}
                            >
                              <div className="flex justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">{customer.name}</p>
                                  <p className="text-sm text-gray-500">{customer.email}</p>
                                  <p className="text-sm text-gray-500">{customer.phone}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Type: <span className="capitalize">{customer.type || 'unlicensed'}</span>
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  className="text-green-600 hover:text-green-700"
                                >
                                  Select
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{selectedCustomer.name}</h3>
                        <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                        <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Type: <span className="capitalize">{selectedCustomer.type || 'unlicensed'}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(null)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
                
                {selectedCustomer && selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedCustomer.addresses.map((address, index) => (
                        <div 
                          key={address._id || `address-${index}`}
                          className={`border rounded-lg p-4 cursor-pointer ${
                            selectedAddress && selectedAddress._id === address._id 
                              ? 'border-green-500 bg-green-50' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedAddress(address)}
                        >
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium text-gray-900 capitalize">{address.addressType || 'Default'} Address</p>
                              <p className="text-sm text-gray-500">{address.addressLine1 || 'No address provided'}</p>
                              {address.addressLine2 && (
                                <p className="text-sm text-gray-500">{address.addressLine2}</p>
                              )}
                              <p className="text-sm text-gray-500">
                                {address.city || 'No city'}, {address.state || 'No state'} {address.pincode || 'No pincode'}
                              </p>
                            </div>
                            {selectedAddress && selectedAddress._id === address._id && (
                              <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700 text-sm">
                      {selectedCustomer ? 
                        "No addresses found for this customer. Please add an address in the customer profile first." :
                        "Please select a customer to see available shipping addresses."}
                    </p>
                    {selectedCustomer && (
                      <Link 
                        href={`/dashboard/customers/edit/${selectedCustomer._id}`}
                        className="mt-2 inline-block text-sm bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md"
                      >
                        <FiMapPin className="inline-block h-4 w-4 mr-1" />
                        Add Address
                      </Link>
                    )}
                  </div>
                )}
              </div>
              
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Continue to Products
                </button>
              </div>
            </div>
          )}
          
          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Add Products</h2>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products by name or SKU (min 2 characters)"
                    className="pl-10 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="mt-4 max-h-60 overflow-y-auto border rounded-lg">
                  {isLoadingProducts ? (
                    <div className="p-4 text-center text-gray-500">
                      <FiLoader className="animate-spin h-5 w-5 mx-auto mb-2" />
                      Searching products...
                    </div>
                  ) : productSearchTerm.length < 2 ? (
                    <div className="p-4 text-center text-gray-500">
                      Type at least 2 characters to search for products
                    </div>
                  ) : products.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No products found. Try a different search term.
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {products.map(product => (
                        <li 
                          key={product._id}
                          className="p-4 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleAddProduct(product)}
                        >
                          <div className="flex items-center justify-between">
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
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                                <p className="text-sm text-gray-500">
                                  {product.baseQuantity} {product.quantityUnit} | ₹
                                  {selectedCustomer?.type === 'licensee' 
                                    ? (product.salePrice?.licensedPrice || product.price.licensedPrice).toFixed(2)
                                    : (product.salePrice?.unlicensedPrice || product.price.unlicensedPrice).toFixed(2)
                                  }
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
              </div>
              
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
                
                {orderItems.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">No items added to this order yet.</p>
                    <p className="text-gray-500 text-sm mt-1">Search and select products above to add them to the order.</p>
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
                        {orderItems.map((item) => (
                          <tr key={item._id}>
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
                              ₹{formatPrice(item)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                  className="p-1 border rounded-l-md hover:bg-gray-100"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                                  className="w-12 border-t border-b text-center py-1"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                  className="p-1 border rounded-r-md hover:bg-gray-100"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{(parseFloat(formatPrice(item)) * item.quantity).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                type="button"
                                onClick={() => handleRemoveProduct(item._id)}
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
              </div>
              
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('payment')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Continue to Order Details
                </button>
              </div>
            </div>
          )}
          
          {/* Order Details Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Order Details</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                        Order Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={orderDetails.status}
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
                      <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method
                      </label>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={orderDetails.paymentMethod}
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
                        value={orderDetails.shippingFee}
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
                        value={orderDetails.discount}
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
                        value={orderDetails.notes}
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
                      {selectedCustomer ? (
                        <div>
                          <p className="font-medium">{selectedCustomer.name}</p>
                          <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                          <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Type: <span className="capitalize">{selectedCustomer.type || 'unlicensed'}</span>
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium">{newCustomer.name || 'New Customer'}</p>
                          <p className="text-sm text-gray-600">{newCustomer.email || 'No email provided'}</p>
                          <p className="text-sm text-gray-600">{newCustomer.phone || 'No phone provided'}</p>
                          <p className="text-xs text-gray-500 mt-1">Type: unlicensed</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Shipping Address</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      {selectedAddress ? (
                        <div>
                          <p className="text-sm">{selectedAddress.addressLine1 || 'No address provided'}</p>
                          {selectedAddress.addressLine2 && (
                            <p className="text-sm">{selectedAddress.addressLine2}</p>
                          )}
                          <p className="text-sm">
                            {selectedAddress.city || 'No city'}, {selectedAddress.state || 'No state'} {selectedAddress.pincode || 'No pincode'}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm">{newCustomer.address.street || 'No street provided'}</p>
                          <p className="text-sm">
                            {newCustomer.address.city || 'No city'}, {newCustomer.address.state || 'No state'} {newCustomer.address.pincode || 'No pincode'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Order Items</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      {orderItems.length === 0 ? (
                        <p className="text-sm text-gray-500">No items added to this order yet.</p>
                      ) : (
                        <ul className="space-y-2">
                          {orderItems.map(item => (
                            <li key={item._id || `item-${item.sku}-${Math.random()}`} className="flex justify-between text-sm">
                              <span>
                                {item.name} x {item.quantity}
                              </span>
                              <span className="font-medium">
                                ₹{(parseFloat(formatPrice(item)) * item.quantity).toFixed(2)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t flex justify-end space-x-3">
                <Link
                  href="/dashboard/orders"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSaving || orderItems.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isSaving ? 'Creating Order...' : 'Create Order'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}