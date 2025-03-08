'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiSave, FiPlus, FiX, FiSearch, 
  FiShoppingCart, FiUser, FiMapPin, FiPackage 
} from 'react-icons/fi';

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

// Sample customers for demo
const sampleCustomers = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul.s@example.com',
    phone: '+91 98765 43210',
    addresses: [
      {
        id: 'addr1',
        type: 'home',
        street: '123 Main Street, Apartment 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      {
        id: 'addr2',
        type: 'work',
        street: '456 Business Park, Building C',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400051'
      }
    ]
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya.p@example.com',
    phone: '+91 87654 32109',
    addresses: [
      {
        id: 'addr3',
        type: 'home',
        street: '456 Park Avenue',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001'
      }
    ]
  },
  {
    id: '3',
    name: 'Amit Kumar',
    email: 'amit.k@example.com',
    phone: '+91 76543 21098',
    addresses: [
      {
        id: 'addr4',
        type: 'home',
        street: '789 Lake View Road',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001'
      }
    ]
  }
];

export default function CreateOrderPage() {
  const router = useRouter();
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

  // Filter products based on search term
  const filteredProducts = sampleProducts.filter(product => {
    if (!productSearchTerm) return true;
    
    const searchLower = productSearchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower)
    );
  });

  // Filter customers based on search term
  const filteredCustomers = sampleCustomers.filter(customer => {
    if (!customerSearchTerm) return true;
    
    const searchLower = customerSearchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone.includes(customerSearchTerm)
    );
  });

  // Calculate order summary
  const calculateSummary = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
    const existingItemIndex = orderItems.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Product already in cart, increment quantity
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += 1;
      setOrderItems(updatedItems);
    } else {
      // Add new product to cart
      setOrderItems([
        ...orderItems,
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
      ]);
    }
    
    // Clear search after adding
    setProductSearchTerm('');
  };

  // Handle removing product from order
  const handleRemoveProduct = (productId) => {
    setOrderItems(orderItems.filter(item => item.id !== productId));
  };

  // Handle quantity change
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = orderItems.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setOrderItems(updatedItems);
  };

  // Handle selecting a customer
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setSelectedAddress(customer.addresses[0] || null);
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
      // In a real app, you would send this to your API
      // const orderData = {
      //   customer: selectedCustomer ? selectedCustomer.id : 'new',
      //   newCustomer: !selectedCustomer ? newCustomer : null,
      //   shippingAddress: selectedAddress ? selectedAddress.id : 'new',
      //   newAddress: !selectedAddress ? newCustomer.address : null,
      //   items: orderItems,
      //   ...orderDetails,
      //   total: summary.total
      // };
      // 
      // const response = await fetch('/api/orders', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(orderData),
      // });
      // 
      // if (!response.ok) throw new Error('Failed to create order');
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Redirect to orders page after successful creation
      router.push('/dashboard/orders');
      router.refresh();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(null)}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        Enter New Customer
                      </button>
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
                      {filteredCustomers.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No customers found. Try a different search or create a new customer.
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {filteredCustomers.map(customer => (
                            <li 
                              key={customer.id}
                              className="p-4 hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleSelectCustomer(customer)}
                            >
                              <div className="flex justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">{customer.name}</p>
                                  <p className="text-sm text-gray-500">{customer.email}</p>
                                  <p className="text-sm text-gray-500">{customer.phone}</p>
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
                    
                    <div className="pt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Or Enter New Customer Details</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={newCustomer.name}
                            onChange={handleNewCustomerChange}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="phone"
                            name="phone"
                            type="text"
                            required
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={newCustomer.phone}
                            onChange={handleNewCustomerChange}
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={newCustomer.email}
                            onChange={handleNewCustomerChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{selectedCustomer.name}</h3>
                        <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                        <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
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
                
                {selectedCustomer && selectedCustomer.addresses.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedCustomer.addresses.map(address => (
                        <div 
                          key={address.id}
                          className={`border rounded-lg p-4 cursor-pointer ${
                            selectedAddress && selectedAddress.id === address.id 
                              ? 'border-green-500 bg-green-50' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedAddress(address)}
                        >
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium text-gray-900 capitalize">{address.type} Address</p>
                              <p className="text-sm text-gray-500">{address.street}</p>
                              <p className="text-sm text-gray-500">
                                {address.city}, {address.state} {address.pincode}
                              </p>
                            </div>
                            {selectedAddress && selectedAddress.id === address.id && (
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
                    
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedAddress(null)}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        Enter Different Address
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="address.street"
                        name="address.street"
                        type="text"
                        required
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={newCustomer.address.street}
                        onChange={handleNewCustomerChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="address.city"
                        name="address.city"
                        type="text"
                        required
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={newCustomer.address.city}
                        onChange={handleNewCustomerChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="address.state"
                        name="address.state"
                        type="text"
                        required
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={newCustomer.address.state}
                        onChange={handleNewCustomerChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="address.pincode" className="block text-sm font-medium text-gray-700 mb-1">
                        PIN Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="address.pincode"
                        name="address.pincode"
                        type="text"
                        required
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={newCustomer.address.pincode}
                        onChange={handleNewCustomerChange}
                      />
                    </div>
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
                    placeholder="Search products by name or SKU"
                    className="pl-10 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="mt-4 max-h-60 overflow-y-auto border rounded-lg">
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
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium">{newCustomer.name || 'New Customer'}</p>
                          <p className="text-sm text-gray-600">{newCustomer.email || 'No email provided'}</p>
                          <p className="text-sm text-gray-600">{newCustomer.phone || 'No phone provided'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Shipping Address</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      {selectedAddress ? (
                        <div>
                          <p className="text-sm">{selectedAddress.street}</p>
                          <p className="text-sm">{selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}</p>
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