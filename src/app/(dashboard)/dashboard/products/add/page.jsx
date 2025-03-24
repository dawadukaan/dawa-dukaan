'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiPlus, FiX, FiInfo, FiUpload, FiCamera, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import env from '@/lib/config/env';
import { getCookie } from 'cookies-next';

export default function AddProductPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState({
    name: '',
    slug: '',
    baseQuantity: '',
    quantityUnit: 'tab',
    price: {
      licensedPrice: '',
      unlicensedPrice: ''
    },
    salePrice: {
      licensedPrice: '',
      unlicensedPrice: ''
    },
    sku: '',
    stock: '0',
    stockUnit: 'tab',
    stockStatus: 'in stock',
    categories: [],
    primaryCategory: '',
    description: '',
    shortDescription: '',
    onSale: false,
    images: [],
    prescriptionRequired: false,
    featured: false,
    publishStatus: 'draft',
    additionalInfo: new Map(),
    medicineDetails: {
      manufacturer: '',
      compositions: []
    }
  });

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch real categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const token = getCookie('token');
        
        console.log('Fetching categories from:', `${env.app.apiUrl}/user/categories`);
        
        const response = await fetch(`${env.app.apiUrl}/user/categories`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          // Add cache: 'no-store' to prevent caching issues
          cache: 'no-store'
        });
        
        if (!response.ok) {
          console.error('API error:', response.status, response.statusText);
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          // Transform the data to match the expected format
          const formattedCategories = data.data.map(category => ({
            id: category._id, // Use _id as id
            name: category.name,
            slug: category.slug
          }));
          setCategories(formattedCategories);
        } else {
          console.error('Invalid data format:', data);
          // Fallback to empty categories
          setCategories([]);
          toast.warning('No categories found. You can add them later.');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        
        // Create some dummy categories as fallback
        const dummyCategories = [
          { id: 'dummy-id-1', name: 'Medicine', slug: 'medicine' },
          { id: 'dummy-id-2', name: 'Supplements', slug: 'supplements' },
          { id: 'dummy-id-3', name: 'Personal Care', slug: 'personal-care' }
        ];
        
        setCategories(dummyCategories);
        toast.warning('Using default categories. Some features may be limited.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProduct(prevState => ({
        ...prevState,
        [parent]: {
          ...prevState[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      // Update the product state with the new value
      setProduct(prevState => {
        const updatedState = {
          ...prevState,
          [name]: type === 'checkbox' ? checked : value
        };
        
        // Auto-generate slug when name changes and slug hasn't been manually edited
        if (name === 'name' && (!prevState.slug || prevState.slug === slugify(prevState.name))) {
          updatedState.slug = slugify(value);
        }
        
        return updatedState;
      });
    }
  };

  const handleMedicineDetailsChange = (e) => {
    const { name, value } = e.target;
    setProduct(prevState => ({
      ...prevState,
      medicineDetails: {
        ...prevState.medicineDetails,
        [name]: value
      }
    }));
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setProduct({
      ...product,
      categories: selectedOptions
    });
  };

  const handleImageAdd = () => {
    setProduct({
      ...product,
      images: [...product.images, '']
    });
  };

  const handleImageChange = (index, value) => {
    const updatedImages = [...product.images];
    updatedImages[index] = value;
    setProduct({
      ...product,
      images: updatedImages
    });
  };

  const handleImageRemove = (index) => {
    const updatedImages = [...product.images];
    updatedImages.splice(index, 1);
    setProduct({
      ...product,
      images: updatedImages
    });
  };

  const handleAdditionalInfoAdd = () => {
    const updatedInfo = new Map(product.additionalInfo);
    updatedInfo.set('', '');
    setProduct({
      ...product,
      additionalInfo: updatedInfo
    });
  };

  const handleAdditionalInfoChange = (oldKey, newKey, value) => {
    const updatedInfo = new Map(product.additionalInfo);
    
    // Only delete the old key if it's actually different from the new key
    // This prevents creating new entries for each character typed
    if (oldKey !== newKey) {
      updatedInfo.delete(oldKey);
    }
    
    // Set the value for the key
    updatedInfo.set(newKey, value);
    
    setProduct({
      ...product,
      additionalInfo: updatedInfo
    });
  };

  const handleAdditionalInfoRemove = (key) => {
    const updatedInfo = new Map(product.additionalInfo);
    updatedInfo.delete(key);
    setProduct({
      ...product,
      additionalInfo: updatedInfo
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = [
      { field: 'name', label: 'Product Name' },
      { field: 'baseQuantity', label: 'Base Quantity' },
      { field: 'price.licensedPrice', label: 'Licensed Price' },
      { field: 'price.unlicensedPrice', label: 'Unlicensed Price' },
      { field: 'sku', label: 'SKU' },
      { field: 'primaryCategory', label: 'Primary Category' },
      { field: 'description', label: 'Description' }
    ];

    // Validate images
    if (product.images.length === 0) {
      setActiveTab('images');
      toast.error('Please add at least one product image');
      return;
    }
    
    // Check required fields
    for (const { field, label } of requiredFields) {
      const value = field.includes('.') 
        ? field.split('.').reduce((obj, key) => obj && obj[key], product)
        : product[field];
        
      if (!value || (typeof value === 'string' && !value.trim())) {
        toast.error(`${label} is required`);
        
        // Set the appropriate tab based on the missing field
        if (field.startsWith('price.')) {
          setActiveTab('pricing');
        } else {
          setActiveTab('basic');
        }
        return;
      }
    }

    // Validate Additional Info
    if (product.additionalInfo.size === 0) {
      toast.error('Please add at least one additional information item');
      setActiveTab('additional');
      return;
    }
    
    // Validate medicine details if prescription is required
    if (product.prescriptionRequired) {
      // Check manufacturer (string field)
      if (!product.medicineDetails.manufacturer || !product.medicineDetails.manufacturer.trim()) {
        toast.error('Manufacturer is required for prescription medicines');
        setActiveTab('medicine');
        return;
      }
      
      // Check compositions (array field)
      if (!product.medicineDetails.compositions || 
          product.medicineDetails.compositions.length === 0 || 
          product.medicineDetails.compositions.some(comp => !comp || !comp.trim())) {
        toast.error('At least one valid composition is required for prescription medicines');
        setActiveTab('medicine');
        return;
      }
    }
    
    setIsSaving(true);
    
    try {
      // Convert Map to object for API submission
      const additionalInfoObj = {};
      product.additionalInfo.forEach((value, key) => {
        if (key.trim()) { // Only include entries with non-empty keys
          additionalInfoObj[key] = value;
        }
      });
      
      // Prepare the product data with default inventory values if not provided
      const productData = {
        ...product,
        additionalInfo: additionalInfoObj,
        slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        // Set default inventory values if not provided
        stock: product.stock || '0',
        stockUnit: product.stockUnit || 'tab',
        stockStatus: product.stockStatus || 'in stock'
      };
      
      // Format expiry date if provided
      if (productData.medicineDetails.expiryDate) {
        productData.medicineDetails.expiryDate = new Date(productData.medicineDetails.expiryDate).toISOString();
      }
      
      // Send to API
      const token = getCookie('token');
      const response = await fetch(`${env.app.apiUrl}/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }
      
      const data = await response.json();
      
      toast.success('Product created successfully');
      
      // Redirect to products page after successful creation
      router.push('/dashboard/products');
      router.refresh();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error.message || 'Failed to create product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const generateSKU = (productName, primaryCategory) => {
    if (!productName) {
      toast.error('Product name is required to generate SKU');
      return '';
    }

    // Get category prefix - use 'UNC' if no category selected
    const categoryPrefix = primaryCategory?.name 
      ? primaryCategory.name.substring(0, 3).toUpperCase()
      : 'UNC';

    // Clean up product name (remove special characters, spaces)
    const cleanProductName = productName
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 5)
      .toUpperCase();

    // Generate random number
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    // Combine all parts
    return `${categoryPrefix}-${cleanProductName}-${randomNum}`;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    try {
      // Upload to Cloudinary via API route with progress tracking
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 90));
      }, 100);
      
      // Get file extension
      const fileExtension = file.name.split('.').pop();
      
      // Create a new filename using product name or random string if name not available
      const productIdentifier = product.name 
        ? slugify(product.name) 
        : Math.random().toString(36).substring(2, 10);
      
      const fileName = `product-${productIdentifier}-${Date.now()}.${fileExtension}`;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName);
      formData.append('folder', 'product-images'); // Store in a different folder
      
      const response = await fetch(`${env.app.apiUrl}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      setUploadProgress(100);
      
      const data = await response.json();
      console.log('Upload response:', data);
      
      if (data.success && data.data.url) {
        console.log('Upload successful, image URL:', data.data.url);
        
        // Add the image URL to the product images array
        const updatedImages = [...product.images, data.data.url];
        setProduct({
          ...product,
          images: updatedImages
        });
        
        toast.success('Image uploaded successfully');
      } else {
        console.log('Upload failed:', data);
        throw new Error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/&/g, '-and-')      // Replace & with 'and'
      .replace(/[^\w\-]+/g, '')    // Remove all non-word characters
      .replace(/\-\-+/g, '-')      // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start of text
      .replace(/-+$/, '');         // Trim - from end of text
  };

  // Calculate discount percentage for display
  const calculateDiscount = (regular, sale) => {
    if (!regular || !sale) return 0;
    const regularPrice = parseFloat(regular);
    const salePrice = parseFloat(sale);
    if (regularPrice <= 0 || salePrice <= 0 || salePrice >= regularPrice) return 0;
    return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
  };

  const navigateToNextTab = () => {
    const tabs = ['basic', 'pricing', 'images', 'inventory', 'medicine', 'additional'];
    const currentIndex = tabs.indexOf(activeTab);
    
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const navigateToPreviousTab = () => {
    const tabs = ['basic', 'pricing', 'images', 'inventory', 'medicine', 'additional'];
    const currentIndex = tabs.indexOf(activeTab);
    
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Add New Medicine</h1>
        <div className="flex gap-2">
          <Link 
            href="/dashboard/products" 
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
                Create Product
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-3 flex items-center border-b-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'basic' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Basic Information
          </button>
          
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-3 flex items-center border-b-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'pricing' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pricing
          </button>
          
          <button
            onClick={() => setActiveTab('images')}
            className={`px-4 py-3 flex items-center border-b-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'images' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Images
          </button>
          
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-3 flex items-center border-b-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'inventory' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Inventory
          </button>

          <button
            onClick={() => setActiveTab('medicine')}
            className={`px-4 py-3 flex items-center border-b-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'medicine' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Medicine Details
          </button>

          <button
            onClick={() => setActiveTab('additional')}
            className={`px-4 py-3 flex items-center border-b-2 text-sm font-medium whitespace-nowrap ${
              activeTab === 'additional' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Additional Info
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={product.name}
                    onChange={handleChange}
                    placeholder="e.g. Paracetamol 500mg"
                  />
                </div>
                
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                    Slug
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">/</span>
                    <input
                      id="slug"
                      name="slug"
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={product.slug}
                      onChange={handleChange}
                      placeholder="paracetamol-500mg (auto-generated if empty)"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-generate from name
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="baseQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Base Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="baseQuantity"
                    name="baseQuantity"
                    type="text"
                    required
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={product.baseQuantity}
                    onChange={handleChange}
                    placeholder="e.g. 10"
                  />
                </div>
                
                <div>
                  <label htmlFor="quantityUnit" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="quantityUnit"
                    name="quantityUnit"
                    required
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={product.quantityUnit}
                    onChange={handleChange}
                  >
                      <option value="tab">Tablet (tab)</option>
                        <option value="tablets">Tablets (tablets)</option>
                        <option value="cap">Capsule (cap)</option>
                        <option value="caps">Capsules (capsules)</option>
                        <option value="strip">Strips (strip)</option>
                        <option value="strips">Strips (strips)</option>
                        <option value="bottle">Bottle (bottle)</option>
                        <option value="bottles">Bottles (bottles)</option>
                        <option value="box">Box (box)</option>
                        <option value="boxes">Boxes (boxes)</option>
                        <option value="vial">Vial (vial)</option>
                        <option value="vials">Vials (vials)</option>
                        <option value="ampule">Ampule (ampule)</option>
                        <option value="ampules">Ampules (ampules)</option>
                        <option value="phile">Phile (phile)</option>
                        <option value="philes">Philes (philes)</option>
                        <option value="tube">Tube (tube)</option>
                        <option value="tubes">Tubes (tubes)</option>
                        <option value="jar">Jar (jar)</option>
                        <option value="jars">Jars (jars)</option>
                        <option value="packet">Packet (packet)</option>
                        <option value="packets">Packets (packets)</option>
                        <option value="pcs">Pieces (pcs)</option>
                        <option value="pc">Piece (pc)</option>
                        <option value="drop">Drop (drop)</option>
                        <option value="drops">Drops (drops)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="sku"
                      name="sku"
                      type="text"
                      required
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={product.sku}
                      onChange={handleChange}
                      placeholder="e.g. MED-PARA-1234"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const sku = generateSKU(product.name, product.primaryCategory || null);
                        setProduct(prev => ({
                          ...prev,
                          sku
                        }));
                        toast.success('SKU generated successfully');
                      }}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Unique identifier for inventory management
                  </p>
                </div>
              </div>
              
              <div>
                <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">
                  Categories
                </label>
                <select
                  id="categories"
                  name="categories"
                  multiple
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 h-32"
                  value={product.categories}
                  onChange={handleCategoryChange}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <option disabled>Loading categories...</option>
                  ) : categories.length > 0 ? (
                    categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No categories available</option>
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {isLoading ? 'Loading categories...' : 'Hold Ctrl (or Cmd) to select multiple categories'}
                </p>
              </div>
              
              <div>
                <label htmlFor="primaryCategory" className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="primaryCategory"
                  name="primaryCategory"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={product.primaryCategory}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Select a primary category</option>
                  {isLoading ? (
                    <option disabled>Loading categories...</option>
                  ) : categories.length > 0 ? (
                    categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No categories available</option>
                  )}
                </select>
                {isLoading && (
                  <p className="text-xs text-gray-500 mt-1">
                    Loading categories...
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={product.description}
                  onChange={handleChange}
                  placeholder="Detailed description of the medicine"
                />
              </div>
              
              <div>
                <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  rows="2"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={product.shortDescription}
                  onChange={handleChange}
                  placeholder="Brief summary for product listings"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center">
                  <input
                    id="prescriptionRequired"
                    name="prescriptionRequired"
                    type="checkbox"
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    checked={product.prescriptionRequired}
                    onChange={handleChange}
                  />
                  <label htmlFor="prescriptionRequired" className="ml-2 text-sm text-gray-700">
                    Prescription Required
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="featured"
                    name="featured"
                    type="checkbox"
                    className="rounded text-green-600 focus:ring-green-500 h-4 w-4"
                    checked={product.featured}
                    onChange={handleChange}
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                    Featured Product
                  </label>
                </div>
              </div>
              
              <div>
                <label htmlFor="publishStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Publish Status
                </label>
                <select
                  id="publishStatus"
                  name="publishStatus"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={product.publishStatus}
                  onChange={handleChange}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* Navigation buttons */}
              <div className="pt-6 border-t flex justify-between">
                <div></div> {/* Empty div to maintain spacing */}
                <button
                  type="button"
                  onClick={navigateToNextTab}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  Next: Pricing
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-start">
                  <FiInfo className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-blue-700 text-sm">
                    Set different prices for licensed and unlicensed users. Licensed users (medical professionals) will see the licensed price, while regular customers will see the unlicensed price.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Licensed User Pricing */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="text-lg font-medium text-blue-800 mb-4">Licensed User Pricing</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="price.licensedPrice" className="block text-sm font-medium text-gray-700 mb-1">
                        Regular Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="price.licensedPrice"
                        name="price.licensedPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={product.price.licensedPrice}
                        onChange={handleChange}
                        placeholder="e.g. 40.00"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="salePrice.licensedPrice" className="block text-sm font-medium text-gray-700 mb-1">
                        Sale Price (₹)
                      </label>
                      <input
                        id="salePrice.licensedPrice"
                        name="salePrice.licensedPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={product.salePrice.licensedPrice}
                        onChange={handleChange}
                        placeholder="e.g. 35.00"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty if not on sale
                      </p>
                    </div>
                    
                    {product.price.licensedPrice && product.salePrice.licensedPrice && (
                      <div className="bg-white p-3 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          Discount: <span className="font-semibold">{calculateDiscount(product.price.licensedPrice, product.salePrice.licensedPrice)}%</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Unlicensed User Pricing */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Unlicensed User Pricing</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="price.unlicensedPrice" className="block text-sm font-medium text-gray-700 mb-1">
                        Regular Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="price.unlicensedPrice"
                        name="price.unlicensedPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={product.price.unlicensedPrice}
                        onChange={handleChange}
                        placeholder="e.g. 50.00"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="salePrice.unlicensedPrice" className="block text-sm font-medium text-gray-700 mb-1">
                        Sale Price (₹)
                      </label>
                      <input
                        id="salePrice.unlicensedPrice"
                        name="salePrice.unlicensedPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={product.salePrice.unlicensedPrice}
                        onChange={handleChange}
                        placeholder="e.g. 45.00"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty if not on sale
                      </p>
                    </div>
                    
                    {product.price.unlicensedPrice && product.salePrice.unlicensedPrice && (
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-800">
                          Discount: <span className="font-semibold">{calculateDiscount(product.price.unlicensedPrice, product.salePrice.unlicensedPrice)}%</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center mt-4">
                <input
                  id="onSale"
                  name="onSale"
                  type="checkbox"
                  className="rounded text-green-600 focus:ring-green-500 h-4 w-4"
                  checked={product.onSale}
                  onChange={handleChange}
                />
                <label htmlFor="onSale" className="ml-2 text-sm text-gray-700">
                  Mark as On Sale
                </label>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg mt-4">
                <div className="flex items-start">
                  <FiAlertCircle className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-yellow-700 text-sm">
                    Typically, licensed users (medical professionals) receive lower prices than regular customers. Ensure your pricing strategy reflects this difference.
                  </p>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="pt-6 border-t flex justify-between">
                <button
                  type="button"
                  onClick={navigateToPreviousTab}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Previous: Basic
                </button>
                <button
                  type="button"
                  onClick={navigateToNextTab}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  Next: Images
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg flex items-center hover:bg-blue-100"
                  >
                    <FiUpload className="w-5 h-5 mr-2" />
                    Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={handleImageAdd}
                    className="bg-green-50 text-green-600 px-3 py-2 rounded-lg flex items-center hover:bg-green-100"
                  >
                    <FiPlus className="w-5 h-5 mr-2" />
                    Add URL
                  </button>
                </div>
              </div>
              
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              
              {/* Upload progress indicator */}
              {isUploading && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-blue-700 font-medium">{uploadProgress}% Uploading image...</p>
                </div>
              )}
              
              <div className="space-y-4">
                {product.images.length === 0 ? (
                  <div 
                    onClick={handleUploadClick}
                    className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <FiCamera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No images added yet. Click to upload product images.</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 2MB</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {product.images.map((image, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <div className="relative h-48 bg-gray-100">
                          {image ? (
                            <img 
                              src={image} 
                              alt={`Product image ${index + 1}`} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/300x200?text=Invalid+URL';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No image
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex space-x-1">
                            {index === 0 && (
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-md">
                                Primary
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleImageRemove(index)}
                              className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="p-3">
                          <input
                            type="text"
                            value={image}
                            onChange={(e) => handleImageChange(index, e.target.value)}
                            placeholder="Image URL"
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <div className="flex justify-between mt-2 text-xs">
                            <span className="text-gray-500">Image {index + 1}</span>
                            {index !== 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  // Make this image the primary image by moving it to the front
                                  const updatedImages = [...product.images];
                                  const [movedImage] = updatedImages.splice(index, 1);
                                  updatedImages.unshift(movedImage);
                                  setProduct({
                                    ...product,
                                    images: updatedImages
                                  });
                                  toast.success('Set as primary image');
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Set as primary
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Tips:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Use high-quality images with good lighting</li>
                  <li>Include images of the medicine packaging</li>
                  <li>Add images showing dosage information when applicable</li>
                  <li>The first image will be used as the product thumbnail</li>
                </ul>
              </div>

              {/* Navigation buttons */}
              <div className="pt-6 border-t flex justify-between">
                <button
                  type="button"
                  onClick={navigateToPreviousTab}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Previous: Pricing
                </button>
                <button
                  type="button"
                  onClick={navigateToNextTab}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  Next: Inventory
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={product.stock}
                    onChange={handleChange}
                    placeholder="e.g. 100 (defaults to 0)"
                  />
                </div>
                
                <div>
                  <label htmlFor="stockUnit" className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Unit
                  </label>
                  <select
                    id="stockUnit"
                    name="stockUnit"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={product.stockUnit}
                    onChange={handleChange}
                  >
                        <option value="tab">Tablet (tab)</option>
                        <option value="tablets">Tablets (tablets)</option>
                        <option value="cap">Capsule (cap)</option>
                        <option value="caps">Capsules (capsules)</option>
                        <option value="strip">Strips (strip)</option>
                        <option value="strips">Strips (strips)</option>
                        <option value="bottle">Bottle (bottle)</option>
                        <option value="bottles">Bottles (bottles)</option>
                        <option value="box">Box (box)</option>
                        <option value="boxes">Boxes (boxes)</option>
                        <option value="vial">Vial (vial)</option>
                        <option value="vials">Vials (vials)</option>
                        <option value="ampule">Ampule (ampule)</option>
                        <option value="ampules">Ampules (ampules)</option>
                        <option value="phile">Phile (phile)</option>
                        <option value="philes">Philes (philes)</option>
                        <option value="tube">Tube (tube)</option>
                        <option value="tubes">Tubes (tubes)</option>
                        <option value="jar">Jar (jar)</option>
                        <option value="jars">Jars (jars)</option>
                        <option value="packet">Packet (packet)</option>
                        <option value="packets">Packets (packets)</option>
                        <option value="pcs">Pieces (pcs)</option>
                        <option value="pc">Piece (pc)</option>
                        <option value="drop">Drop (drop)</option>
                        <option value="drops">Drops (drops)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="stockStatus" className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Status
                  </label>
                  <select
                    id="stockStatus"
                    name="stockStatus"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={product.stockStatus}
                    onChange={handleChange}
                  >
                    <option value="in stock">In Stock</option>
                    <option value="low stock">Low Stock</option>
                    <option value="out of stock">Out of Stock</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">Stock Management Tips</h3>
                <ul className="text-sm text-yellow-700 list-disc pl-5">
                  <li>If not specified, stock will default to 0</li>
                  <li>Update stock levels regularly to maintain accuracy</li>
                  <li>Consider setting a minimum stock threshold for reordering</li>
                  <li>For prescription medicines, ensure proper inventory tracking</li>
                </ul>
              </div>

              {/* Navigation buttons */}
              <div className="pt-6 border-t flex justify-between">
                <button
                  type="button"
                  onClick={navigateToPreviousTab}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Previous: Images
                </button>
                <button
                  type="button"
                  onClick={navigateToNextTab}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  Next: Medicine Details
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Medicine Details Tab */}
          {activeTab === 'medicine' && (
            <div className="space-y-6">
              {product.prescriptionRequired && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="flex items-start">
                    <FiInfo className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-blue-700 text-sm">
                      This product requires a prescription. Please fill in all medicine details carefully as they are required for prescription medicines.
                    </p>
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-1">
                  Manufacturer {product.prescriptionRequired && <span className="text-red-500">*</span>}
                </label>
                <input
                  id="manufacturer"
                  name="manufacturer"
                  type="text"
                  required={product.prescriptionRequired}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={product.medicineDetails.manufacturer}
                  onChange={handleMedicineDetailsChange}
                  placeholder="e.g. ABC Pharmaceuticals"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Compositions {product.prescriptionRequired && <span className="text-red-500">*</span>}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedMedicineDetails = {
                        ...product.medicineDetails,
                        compositions: [...(product.medicineDetails.compositions || []), '']
                      };
                      setProduct({
                        ...product,
                        medicineDetails: updatedMedicineDetails
                      });
                    }}
                    className="bg-green-50 text-green-600 px-3 py-1 rounded-lg flex items-center hover:bg-green-100 text-sm"
                  >
                    <FiPlus className="w-4 h-4 mr-1" />
                    Add Composition
                  </button>
                </div>
                
                {(!product.medicineDetails.compositions || product.medicineDetails.compositions.length === 0) ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">No compositions added yet. Click "Add Composition" to add ingredients.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {product.medicineDetails.compositions.map((composition, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={composition}
                          onChange={(e) => {
                            const newCompositions = [...(product.medicineDetails.compositions || [])];
                            newCompositions[index] = e.target.value;
                            setProduct({
                              ...product,
                              medicineDetails: {
                                ...product.medicineDetails,
                                compositions: newCompositions
                              }
                            });
                          }}
                          placeholder="e.g. Paracetamol 500mg"
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          required={product.prescriptionRequired}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newCompositions = [...(product.medicineDetails.compositions || [])];
                            newCompositions.splice(index, 1);
                            setProduct({
                              ...product,
                              medicineDetails: {
                                ...product.medicineDetails,
                                compositions: newCompositions
                              }
                            });
                          }}
                          className="text-red-600 hover:text-red-800 p-2"
                          aria-label="Remove composition"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Add each active ingredient with its quantity
                </p>
              </div>

              {/* Navigation buttons */}
              <div className="pt-6 border-t flex justify-between">
                <button
                  type="button"
                  onClick={navigateToPreviousTab}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Previous: Inventory
                </button>
                <button
                  type="button"
                  onClick={navigateToNextTab}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  Next: Additional Info
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Additional Info Tab */}
          {activeTab === 'additional' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 pb-2 border-b">Additional Information</h2>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-blue-700 text-sm">
                  Add extra details about your product to help customers make informed decisions.
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Product Specifications</h3>
                <button
                  type="button"
                  onClick={handleAdditionalInfoAdd}
                  className="bg-green-50 text-green-600 px-3 py-2 rounded-lg flex items-center hover:bg-green-100"
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  Add Field
                </button>
              </div>
              
              <div className="space-y-4">
                {product.additionalInfo.size === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <FiInfo className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No additional information added yet.</p>
                    <p className="text-gray-500 text-sm">Click "Add Field" to add product specifications, storage info, etc.</p>
                  </div>
                ) : (
                  Array.from(product.additionalInfo.entries()).map(([key, value], index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Field Name</label>
                          <input
                            type="text"
                            value={key}
                            onChange={(e) => handleAdditionalInfoChange(key, e.target.value, value)}
                            placeholder="e.g. Storage, Warnings, Benefits"
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Field Value</label>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleAdditionalInfoChange(key, key, e.target.value)}
                            placeholder="e.g. Store below 30°C, Not for children under 12"
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAdditionalInfoRemove(key)}
                        className="text-red-600 hover:text-red-800 p-2"
                        aria-label="Remove field"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Suggested Information Fields</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="text-sm text-blue-700 list-disc pl-5">
                    <li>Storage Conditions</li>
                    <li>Warnings</li>
                    <li>Contraindications</li>
                    <li>Drug Interactions</li>
                    <li>Pregnancy Category</li>
                  </ul>
                  <ul className="text-sm text-blue-700 list-disc pl-5">
                    <li>Benefits</li>
                    <li>When to Use</li>
                    <li>When Not to Use</li>
                    <li>Packaging</li>
                    <li>Country of Origin</li>
                  </ul>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="pt-6 border-t flex justify-between">
                <button
                  type="button"
                  onClick={navigateToPreviousTab}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Previous: Medicine Details
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
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
                      Create Product
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}