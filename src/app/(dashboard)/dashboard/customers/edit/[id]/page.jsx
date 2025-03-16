'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCookie } from 'cookies-next';
import { toast } from 'react-hot-toast';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiHome, 
  FiSave, FiX, FiArrowLeft, FiAlertCircle,
  FiShield, FiCreditCard, FiUpload, FiImage, FiFileText, FiExternalLink, FiInfo
} from 'react-icons/fi';
import env from '@/lib/config/env';

export default function EditCustomerPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingLicense, setIsUploadingLicense] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Customer form state
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    isActive: true,
    type: 'unlicensed',
    avatar: '',
    address: {
      addressType: 'home',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: ''
    },
    licenseDetails: {
      licenseNumber: '',
      licenseDocument: ''
    }
  });
  
  const [originalCustomer, setOriginalCustomer] = useState(null);
  const [defaultAddressId, setDefaultAddressId] = useState(null);

  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setIsLoading(true);
        const token = getCookie('token');
        
        // Fetch customer data
        const response = await fetch(`${env.app.apiUrl}/admin/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch customer');
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch customer');
        }
        
        const userData = data.data;
        
        // Set customer data
        setCustomer({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          isActive: userData.isActive !== undefined ? userData.isActive : true,
          type: userData.type || 'unlicensed',
          avatar: userData.avatar || '',
          address: {
            addressType: 'home',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            pincode: ''
          },
          licenseDetails: userData.licenseDetails || {
            licenseNumber: '',
            licenseDocument: ''
          }
        });
        
        // Set addresses if available
        if (userData.defaultAddress) {
          setDefaultAddressId(userData.defaultAddress._id);
          
          setCustomer(prev => ({
            ...prev,
            address: {
              addressType: userData.defaultAddress.addressType || 'home',
              addressLine1: userData.defaultAddress.addressLine1 || '',
              addressLine2: userData.defaultAddress.addressLine2 || '',
              city: userData.defaultAddress.city || '',
              state: userData.defaultAddress.state || '',
              pincode: userData.defaultAddress.pincode || ''
            }
          }));
        }
        
        setOriginalCustomer(userData);
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
    } else if (name.startsWith('licenseDetails.')) {
      const licenseField = name.split('.')[1];
      setCustomer({
        ...customer,
        licenseDetails: {
          ...customer.licenseDetails,
          [licenseField]: value
        }
      });
    } else if (name === 'status') {
      // Convert status to isActive boolean
      setCustomer({
        ...customer,
        isActive: value === 'active'
      });
    } else {
      setCustomer({
        ...customer,
        [name]: value
      });
    }
  };

  // Handle avatar image upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setFormError('Please upload a valid image file (JPEG, PNG)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setFormError('Image size should be less than 5MB');
      return;
    }
    
    setIsUploadingAvatar(true);
    setUploadProgress(0);
    setFormError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'customers/avatars');
      
      const token = getCookie('token');
      
      // Create upload progress tracker
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });
      
      // Use fetch for the actual upload
      const response = await fetch(`${env.app.apiUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }
      
      setCustomer({
        ...customer,
        avatar: data.data.url
      });
      
      toast.success('Profile image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      setFormError(`Error uploading image: ${error.message}`);
    } finally {
      setIsUploadingAvatar(false);
      setUploadProgress(0);
    }
  };

  // Handle license document upload
  const handleLicenseDocChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setFormError('Please upload a valid document file (JPEG, PNG, PDF)');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setFormError('Document size should be less than 10MB');
      return;
    }
    
    setIsUploadingLicense(true);
    setUploadProgress(0);
    setFormError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'customers/licenses');
      
      const token = getCookie('token');
      
      // Create upload progress tracker
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });
      
      // Use fetch for the actual upload
      const response = await fetch(`${env.app.apiUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload document');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to upload document');
      }
      
      setCustomer({
        ...customer,
        licenseDetails: {
          ...customer.licenseDetails,
          licenseDocument: data.data.url
        }
      });
      
      toast.success('License document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      setFormError(`Error uploading document: ${error.message}`);
    } finally {
      setIsUploadingLicense(false);
      setUploadProgress(0);
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
    
    // If customer is licensee, validate license details
    if (customer.type === 'licensee' && !customer.licenseDetails.licenseNumber) {
      setFormError('License number is required for licensed customers');
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
      const token = getCookie('token');
      
      // Prepare user data for API
      const userData = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        isActive: customer.isActive,
        type: customer.type,
        avatar: customer.avatar
      };
      
      // Add license details if customer is a licensee
      if (customer.type === 'licensee') {
        userData.licenseDetails = customer.licenseDetails;
      }
      
      // Update user
      const response = await fetch(`${env.app.apiUrl}/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update customer');
      }
      
      // Check if address needs to be updated
      const hasAddressChanged = 
        customer.address.addressLine1 !== (originalCustomer.defaultAddress?.addressLine1 || '') ||
        customer.address.addressLine2 !== (originalCustomer.defaultAddress?.addressLine2 || '') ||
        customer.address.city !== (originalCustomer.defaultAddress?.city || '') ||
        customer.address.state !== (originalCustomer.defaultAddress?.state || '') ||
        customer.address.pincode !== (originalCustomer.defaultAddress?.pincode || '') ||
        customer.address.addressType !== (originalCustomer.defaultAddress?.addressType || 'home');
      
      if (hasAddressChanged && (customer.address.addressLine1 || customer.address.city || customer.address.state || customer.address.pincode)) {
        // If we have a default address, update it
        if (defaultAddressId) {
          const addressData = {
            userId: id,
            addressType: customer.address.addressType,
            addressLine1: customer.address.addressLine1,
            addressLine2: customer.address.addressLine2,
            city: customer.address.city,
            state: customer.address.state,
            pincode: customer.address.pincode,
            isDefault: true
          };
          
          // Update address
          const addressResponse = await fetch(`${env.app.apiUrl}/admin/addresses/${defaultAddressId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(addressData),
          });
          
          if (!addressResponse.ok) {
            console.error('Failed to update address, but user was updated');
            toast.error('Customer updated, but address could not be saved');
          }
        } else {
          // Create new address
          const addressData = {
            userId: id,
            addressType: customer.address.addressType,
            addressLine1: customer.address.addressLine1,
            addressLine2: customer.address.addressLine2,
            city: customer.address.city,
            state: customer.address.state,
            pincode: customer.address.pincode,
            isDefault: true
          };
          
          // Create address
          const addressResponse = await fetch(`${env.app.apiUrl}/admin/addresses`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(addressData),
          });
          
          if (!addressResponse.ok) {
            console.error('Failed to create address, but user was updated');
            toast.error('Customer updated, but address could not be saved');
          }
        }
      }
      
      toast.success('Customer updated successfully');
      
      // Redirect to customers list
      router.push('/dashboard/customers');
    } catch (error) {
      console.error('Error updating customer:', error);
      setFormError(error.message || 'Failed to update customer. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/dashboard/customers');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!originalCustomer && !isLoading) {
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
            disabled={isSubmitting || isUploadingAvatar || isUploadingLicense}
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
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                  value={customer.isActive ? 'active' : 'inactive'}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  License Type
                </label>
                <select
                  id="type"
                  name="type"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={customer.type}
                  onChange={handleChange}
                >
                  <option value="unlicensed">Unlicensed</option>
                  <option value="licensee">Licensed</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Licensed customers can purchase prescription medicines
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {customer.avatar ? (
                      <img 
                        src={customer.avatar} 
                        alt={customer.name} 
                        className="h-16 w-16 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <FiUser className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center w-full">
                      <FiUpload className="mr-2 h-4 w-4" />
                      {isUploadingAvatar ? `Uploading... ${uploadProgress}%` : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={isUploadingAvatar}
                      />
                    </label>
                    {isUploadingAvatar && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div 
                          className="bg-green-600 h-2.5 rounded-full" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Address Information */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Address Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="addressType" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Type
                </label>
                <select
                  id="addressType"
                  name="address.addressType"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={customer.address.addressType}
                  onChange={handleChange}
                >
                  <option value="home">Home</option>
                  <option value="shop">Shop</option>
                  <option value="office">Office</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiHome className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="addressLine1"
                    name="address.addressLine1"
                    placeholder="Street address, building, etc."
                    className="pl-10 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={customer.address.addressLine1}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  id="addressLine2"
                  name="address.addressLine2"
                  placeholder="Apartment, suite, unit, etc. (optional)"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={customer.address.addressLine2}
                  onChange={handleChange}
                />
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
          
          {/* License Details (only shown for licensed customers) */}
          {customer.type === 'licensee' && (
            <div className="pt-6 border-t">
              <h2 className="text-lg font-medium text-gray-900 mb-4">License Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    License Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="licenseNumber"
                      name="licenseDetails.licenseNumber"
                      placeholder="e.g. DL-12345-20230101"
                      className="pl-10 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={customer.licenseDetails?.licenseNumber || ''}
                      onChange={handleChange}
                      required={customer.type === 'licensee'}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Document
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-grow">
                      <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center w-full">
                        <FiUpload className="mr-2 h-4 w-4" />
                        {isUploadingLicense ? `Uploading... ${uploadProgress}%` : 'Upload Document'}
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={handleLicenseDocChange}
                          disabled={isUploadingLicense}
                        />
                      </label>
                      {isUploadingLicense && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Upload license document (PDF, JPEG, PNG)
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Preview of license document if available */}
                {customer.licenseDetails?.licenseDocument && (
                  <div className="md:col-span-2 mt-2">
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FiFileText className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium">License Document</span>
                        </div>
                        <a 
                          href={customer.licenseDetails.licenseDocument} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-green-600 hover:text-green-700 flex items-center"
                        >
                          <FiExternalLink className="mr-1 h-4 w-4" />
                          View
                        </a>
                      </div>
                      <div className="mt-3">
                        {customer.licenseDetails.licenseDocument.toLowerCase().endsWith('.pdf') ? (
                          <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center border">
                            <FiFileText className="h-10 w-10 text-gray-500" />
                            <span className="ml-2 text-sm text-gray-600">PDF Document</span>
                          </div>
                        ) : (
                          <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100 border">
                            <img 
                              src={customer.licenseDetails.licenseDocument} 
                              alt="License Document" 
                              className="object-contain w-full h-full"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <FiInfo className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">About License Documents</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        License documents are required for customers who need to purchase prescription medicines.
                        Please ensure the license is valid and the document is clearly legible.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

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
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingAvatar || isUploadingLicense}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}