'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCookie } from 'cookies-next';
import { toast } from 'react-hot-toast';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiHome, 
  FiSave, FiX, FiArrowLeft, FiInfo, FiAlertCircle,
  FiChevronRight, FiChevronLeft, FiCheck, FiCreditCard,
  FiShield, FiFileText
} from 'react-icons/fi';

export default function AddCustomerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  
  // Customer form state
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    password: '', // Default password for new customers
    isActive: true,
    role: 'customer',
    type: 'unlicensed',
    avatar: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    licenseDetails: {
      licenseNumber: '',
      expiryDate: '',
      issuingAuthority: ''
    }
  });

  // Handle image upload
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Define steps
  const steps = [
    { id: 1, name: 'Basic Information', icon: FiUser },
    { id: 2, name: 'Address', icon: FiHome },
    { id: 3, name: 'License Details', icon: FiFileText },
    { id: 4, name: 'Security & Profile', icon: FiShield }
  ];

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
    } else if (name === 'type') {
      setCustomer({
        ...customer,
        type: value
      });
    } else {
      setCustomer({
        ...customer,
        [name]: value
      });
    }
  };

  // Validate current step
  const validateStep = (step) => {
    setFormError('');
    
    switch(step) {
      case 1: // Basic Information
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
        
      case 2: // Address
        // Address is optional, so always return true
        return true;
        
      case 3: // License Details
        // If customer type is licensee, validate license details
        if (customer.type === 'licensee') {
          if (!customer.licenseDetails.licenseNumber.trim()) {
            setFormError('License number is required for licensed customers');
            return false;
          }
          
          if (!customer.licenseDetails.expiryDate) {
            setFormError('License expiry date is required');
            return false;
          }
          
          if (!customer.licenseDetails.issuingAuthority.trim()) {
            setFormError('Issuing authority is required');
            return false;
          }
        }
        
        return true;
        
      case 4: // Security & Profile
        // Password is optional, but if provided, validate it
        if (customer.password && customer.password.length < 6) {
          setFormError('Password must be at least 6 characters');
          return false;
        }
        
        return true;
        
      default:
        return true;
    }
  };

  // Move to next step
  const nextStep = () => {
    if (validateStep(currentStep)) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      
      // Move to next step
      setCurrentStep(currentStep + 1);
    }
  };

  // Move to previous step
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Jump to a specific step
  const goToStep = (step) => {
    // Only allow jumping to completed steps or the current step + 1
    if (completedSteps.includes(step) || step === currentStep || step === currentStep + 1) {
      setCurrentStep(step);
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      
      // For a real implementation, you would upload the image to a server
      // and get back a URL to store in customer.avatar
      // For now, we'll just store the file name
      setCustomer({
        ...customer,
        avatar: file.name
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate final step
    if (!validateStep(currentStep)) {
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
        password: customer.password || 'Password@123', // Use default if empty
        isActive: customer.isActive,
        role: 'customer',
        type: customer.type || 'unlicensed',
        avatar: customer.avatar || '', // Include avatar if provided
      };
      
      // Add license details if customer is a licensee
      if (customer.type === 'licensee') {
        userData.licenseDetails = customer.licenseDetails;
      }
      
      console.log('Sending user data:', userData);
      
      // Send data to API
      const response = await fetch('http://localhost:3000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create customer');
      }
      
      // If we have address data, create an address for the user
      if (customer.address.street || customer.address.city || customer.address.state || customer.address.pincode) {
        const addressData = {
          userId: data.data._id,
          street: customer.address.street,
          city: customer.address.city,
          state: customer.address.state,
          pincode: customer.address.pincode,
          isDefault: true
        };
        
        // Create address
        const addressResponse = await fetch('http://localhost:3000/api/admin/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(addressData),
        });
        
        if (!addressResponse.ok) {
          console.error('Failed to create address, but user was created');
          toast.warning('Customer created, but address could not be saved');
        }
      }
      
      toast.success('Customer created successfully');
      
      // Redirect to customers list
      router.push('/dashboard/customers');
    } catch (error) {
      console.error('Error creating customer:', error);
      setFormError(error.message || 'Failed to create customer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/dashboard/customers');
  };

  // Render step content
  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
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
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
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
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex">
                <FiInfo className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-700">
                    Address information is optional but recommended for shipping and billing purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">License Details</h2>
            
            {customer.type === 'unlicensed' ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <FiInfo className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Unlicensed Customer</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      This customer is marked as unlicensed and will not be able to purchase prescription medicines.
                      To enable prescription purchases, go back to step 1 and change the license type to "Licensed".
                    </p>
                  </div>
                </div>
              </div>
            ) : (
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
                      value={customer.licenseDetails.licenseNumber}
                      onChange={handleChange}
                      required={customer.type === 'licensee'}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="expiryDate"
                    name="licenseDetails.expiryDate"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={customer.licenseDetails.expiryDate}
                    onChange={handleChange}
                    required={customer.type === 'licensee'}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="issuingAuthority" className="block text-sm font-medium text-gray-700 mb-1">
                    Issuing Authority <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiShield className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="issuingAuthority"
                      name="licenseDetails.issuingAuthority"
                      placeholder="e.g. State Pharmacy Council"
                      className="pl-10 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={customer.licenseDetails.issuingAuthority}
                      onChange={handleChange}
                      required={customer.type === 'licensee'}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex">
                <FiInfo className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">License Information</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Licensed customers can purchase prescription medicines. License details are required for regulatory compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Security & Profile Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiShield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Leave blank to use default password"
                    className="pl-10 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={customer.password}
                    onChange={handleChange}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  If left blank, the default password "Password@123" will be used.
                </p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image (Optional)
                </label>
                <div className="flex items-center space-x-6">
                  <div className="shrink-0">
                    {avatarPreview ? (
                      <img 
                        className="h-16 w-16 object-cover rounded-full border border-gray-200" 
                        src={avatarPreview} 
                        alt="Profile preview" 
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                        <FiUser className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <label className="block">
                    <span className="sr-only">Choose profile photo</span>
                    <input 
                      type="file" 
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-medium
                        file:bg-green-50 file:text-green-700
                        hover:file:bg-green-100
                      "
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <div className="flex">
                <FiCheck className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">Ready to Create Customer</h3>
                  <p className="text-sm text-green-700 mt-1">
                    You've completed all the required information. Review the details and click "Create Customer" to save.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Add New Customer</h1>
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
          {currentStep === steps.length ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Customer'}
            </button>
          ) : (
            <button
              type="button"
              onClick={nextStep}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              Next
              <FiChevronRight className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
      </div>

      {/* Steps Progress */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1 relative">
              <div 
                className={`flex flex-col items-center cursor-pointer ${
                  completedSteps.includes(step.id) || currentStep === step.id
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
                onClick={() => goToStep(step.id)}
              >
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 
                  ${completedSteps.includes(step.id) 
                    ? 'bg-green-100 border-green-500' 
                    : currentStep === step.id 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-white border-gray-300'}
                `}>
                  {completedSteps.includes(step.id) ? (
                    <FiCheck className="w-6 h-6 text-green-600" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`mt-2 text-xs font-medium ${
                  currentStep === step.id ? 'text-green-600' : ''
                }`}>
                  {step.name}
                </span>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                  completedSteps.includes(step.id) ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
              )}
            </div>
          ))}
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
        <div className="p-6">
          {renderStepContent()}
        </div>
        
        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center ${
              currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FiChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </button>
          
          <div className="flex items-center text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </div>
          
          {currentStep === steps.length ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Customer'}
            </button>
          ) : (
            <button
              type="button"
              onClick={nextStep}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              Next
              <FiChevronRight className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
      </div>
      
      {/* Help Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <FiInfo className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Adding a New Customer</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Fill in the customer details to create a new customer profile. Fields marked with an asterisk (*) are required.
                After creating a customer, you'll be able to associate orders with them and track their purchase history.
              </p>
              <p className="mt-1">
                <strong>Note:</strong> A default password will be set for the customer. They can change it later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}