// src/app/(dashboard)/dashboard/customers/edit/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiHome, 
  FiSave, FiX, FiArrowLeft, FiInfo, FiAlertCircle,
  FiTrash2, FiShoppingBag, FiCalendar
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
  }
];

export default function EditCustomerPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Customer form state
  const [customer, setCustomer] = useState(null);
  const [originalCustomer, setOriginalCustomer] = useState(null);

  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
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
          setFormError(`Customer with ID ${id} not found. Please check the URL or return to the customers list.`);
          setIsLoading(false);
          return;
        }
        
        setCustomer(foundCustomer);
        setOriginalCustomer(foundCustomer);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching customer:', error);
        setFormError(`Error loading customer: ${error.message}`);
        setIsLoading(false);
      }
    };
    
    fetchCustomer();
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setCustomer({
        ...customer,
        address: {
          ...customer.address,
          [addressField]: value
        }
      });
    } else {
      setCustomer({
        ...customer,
        [name]: value
      });
    }
  };

  // Form validation
  const validateForm = () => {
    if (!customer.name.trim()) {
      setFormError('Customer name is required');
      return false;
    }
    
    if (!customer.email.trim()) {
      setFormError('Email address is required');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      setFormError('Please enter a valid email address');
      return false;
    }
    
    if (!customer.phone.trim()) {
      setFormError('Phone number is required');
      return false;
    }
    
    // Basic Indian phone number validation (10 digits, may start with +91)
    const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
    if (!phoneRegex.test(customer.phone.replace(/\s+/g, ''))) {
      setFormError('Please enter a valid Indian phone number');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, you would send data to your API
      // const response = await fetch(`/api/customers/${id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(customer),
      // });
      
      // if (!response.ok) throw new Error('Failed to update customer');
      
      // For demo, we'll simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to customers list
      router.push('/dashboard/customers');
    } catch (error) {
      console.error('Error updating customer:', error);
      setFormError('Failed to update customer. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async () => {
    setIsSubmitting(true);
    
    try {
      // In a real app, you would send delete request to your API
      // const response = await fetch(`/api/customers/${id}`, {
      //   method: 'DELETE',
      // });
      
      // if (!response.ok) throw new Error('Failed to delete customer');
      
      // For demo, we'll simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to customers list
      router.push('/dashboard/customers');
    } catch (error) {
      console.error('Error deleting customer:', error);
      setFormError('Failed to delete customer. Please try again.');
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/dashboard/customers');
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!customer && !isLoading) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>{formError || 'Customer not found'}</p>
        <Link href="/dashboard/customers" className="text-red-700 font-medium underline mt-2 inline-block">
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
          <h1 className="text-2xl font-bold text-gray-800">Edit Customer: {customer.name}</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <FiX className="w-5 h-5 mr-2" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Form Error Message */}
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <FiAlertCircle className="w-5 h-5 mr-2 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {/* Customer Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Full Name"
                        className="pl-10 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={customer.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="email@example.com"
                        className="pl-10 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={customer.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="+91 98765 43210"
                        className="pl-10 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={customer.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Format: +91 or 10 digits</p>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={customer.status}
                      onChange={handleChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Address Information */}
              <div className="pt-6 border-t">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Address Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiHome className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="street"
                        name="address.street"
                        placeholder="123 Main Street, Apartment 4B"
                        className="pl-10 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={customer.address.street}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="address.city"
                      placeholder="Mumbai"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={customer.address.city}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <select
                      id="state"
                      name="address.state"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={customer.address.state}
                      onChange={handleChange}
                    >
                      <option value="">Select State</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                      PIN Code
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="pincode"
                        name="address.pincode"
                        placeholder="400001"
                        className="pl-10 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={customer.address.pincode}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Information */}
              <div className="pt-6 border-t">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="4"
                    placeholder="Add any additional notes about this customer..."
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={customer.notes || ''}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
              
              {/* Danger Zone */}
              <div className="pt-6 border-t">
                <h2 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <FiAlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Delete this customer</h3>
                      <p className="mt-1 text-sm text-red-700">
                        Once you delete a customer, there is no going back. This action cannot be undone.
                        All associated data will be permanently removed.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isSubmitting}
                        className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiTrash2 className="w-5 h-5 mr-2" />
                        Delete Customer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <FiX className="w-5 h-5 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave className="w-5 h-5 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Customer Information Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <FiUser className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    <div className="text-sm text-gray-500">
                      {customer.status === 'active' ? (
                        <span className="text-green-600">● Active</span>
                      ) : (
                        <span className="text-gray-500">● Inactive</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="text-sm text-gray-500 flex items-center mb-2">
                    <FiCalendar className="h-4 w-4 mr-2 text-gray-400" />
                    Customer since {formatDate(customer.dateJoined)}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center mb-2">
                    <FiShoppingBag className="h-4 w-4 mr-2 text-gray-400" />
                    {customer.totalOrders} orders
                  </div>
                  <div className="text-sm text-gray-900 font-medium">
                    Total spent: ₹{customer.totalSpent.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <Link
                  href={`/dashboard/customers/view/${customer.id}`}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center justify-center"
                >
                  <FiUser className="w-5 h-5 mr-2" />
                  View Customer Profile
                </Link>
                
                <Link
                  href={`/dashboard/orders/add?customer=${customer.id}`}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
                >
                  <FiShoppingBag className="w-5 h-5 mr-2" />
                  Create New Order
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <FiInfo className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Editing a Customer</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Update the customer details as needed. Fields marked with an asterisk (*) are required.
                    Changes will be saved when you click the "Save Changes" button.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete <span className="font-medium">{customer.name}</span>? 
              This action cannot be undone and all associated data will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomer}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}