'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiUpload, FiX, FiImage } from 'react-icons/fi';
import Link from 'next/link';
import { CategoryPageHeader } from '@/components/dashboard/categories/CategoryPageHeader';
import { toast } from 'react-hot-toast';
import env from '@/lib/config/env';
import { getCookie } from 'cookies-next';

export default function AddCategoryPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [category, setCategory] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentCategory: '',
    order: 0,
    featured: false
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = getCookie('token');
        setIsLoading(true);
        const response = await fetch(`${env.app.apiUrl}/user/categories`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          console.error('Invalid data format:', data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setCategory(prevState => {
      const updatedState = {
        ...prevState,
        [name]: newValue
      };
      
      // Auto-generate slug when name changes and slug hasn't been manually edited
      if (name === 'name' && (!prevState.slug || prevState.slug === slugify(prevState.name))) {
        updatedState.slug = slugify(value);
      }
      
      return updatedState;
    });
  };

  const handleImageClick = () => {
    // Check if name and slug exist before allowing image upload
    if (!category.name.trim()) {
      toast.error('Please enter a category name before uploading an image');
      return;
    }
    
    // Generate slug if it doesn't exist
    if (!category.slug.trim()) {
      const generatedSlug = slugify(category.name);
      setCategory(prev => ({
        ...prev,
        slug: generatedSlug
      }));
      toast.success('Slug generated from category name');
    }
    
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Ensure name and slug exist
    if (!category.name.trim() || !category.slug.trim()) {
      toast.error('Category name and slug are required before uploading an image');
      return;
    }

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
      // Create a preview immediately using URL.createObjectURL for reliable preview
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      console.log("Preview URL created:", objectUrl);
      
      // Upload to Cloudinary via API route with progress tracking
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 90));
      }, 100);
      
      // Get file extension
      const fileExtension = file.name.split('.').pop();
      
      // Create a new filename using the slug
      const fileName = `category-${category.slug}-${Date.now()}.${fileExtension}`;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName); // Pass the custom filename to the API
      
      const response = await fetch('/api/upload', {
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
      
      if (data.success && data.url) {
        console.log('Upload successful, image URL:', data.url);
        
        // Set the category image URL
        setCategory(prev => ({
          ...prev,
          image: data.url
        }));
        
        toast.success('Image uploaded successfully');
      } else {
        throw new Error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image. Please try again.');
      
      // Clean up the preview on error
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleRemoveImage = () => {
    // Clean up the object URL if it exists
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    // Clear the image preview and category image
    setImagePreview(null);
    setCategory(prev => ({
      ...prev,
      image: ''
    }));
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast.success('Image removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!category.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare the category data
      const token = getCookie('token');
      
      // Create a copy of the category data
      const categoryData = {
        ...category,
        slug: category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      };
      
      // Remove parentCategory if it's an empty string to avoid ObjectId casting error
      if (categoryData.parentCategory === '') {
        delete categoryData.parentCategory;
      }
      
      // Send to API
      const response = await fetch(`${env.app.apiUrl}/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create category');
      }
      
      toast.success('Category created successfully');
      
      // Redirect to categories page after successful creation
      router.push('/dashboard/categories');
      router.refresh();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error.message || 'Failed to create category. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Slugify function to convert name to URL-friendly slug
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

  return (
    <div className="space-y-6">
      {/* Add the header component */}
      <CategoryPageHeader />

      {/* Action buttons */}
      <div className="flex justify-end">
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
              Create Category
            </>
          )}
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={category.name}
                  onChange={handleChange}
                  placeholder="e.g. Antibiotics, Pain Relief"
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
                    value={category.slug}
                    onChange={handleChange}
                    placeholder="antibiotics (auto-generated if empty)"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to auto-generate from name
                </p>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={category.description}
                  onChange={handleChange}
                  placeholder="Brief description of the category"
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Image
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                
                {!category.image && !imagePreview ? (
                  <div 
                    onClick={handleImageClick}
                    className={`h-48 border-2 border-dashed ${
                      !category.name.trim() ? 'border-gray-300 cursor-not-allowed' : 'border-gray-300 hover:border-green-500 cursor-pointer'
                    } rounded-lg flex flex-col items-center justify-center transition-colors`}
                  >
                    <FiImage className="h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      {!category.name.trim() 
                        ? 'Enter category name before uploading an image' 
                        : 'Click to upload an image'
                      }
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 2MB</p>
                    {!category.name.trim() && (
                      <p className="text-xs text-red-500 mt-2">
                        Category name is required for image upload
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      key={imagePreview || category.image}
                      src={imagePreview || category.image} 
                      alt="Category preview" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', e);
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x150?text=Invalid+Image';
                      }}
                      onLoad={() => console.log('Image loaded successfully:', imagePreview || category.image)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                      <div className="flex space-x-2 opacity-0 hover:opacity-100">
                        <button
                          type="button"
                          onClick={handleImageClick}
                          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                        >
                          <FiUpload className="h-5 w-5 text-gray-700" />
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                        >
                          <FiX className="h-5 w-5 text-red-500" />
                        </button>
                      </div>
                    </div>
                    
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                        <div className="text-white text-center w-4/5">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                            <div 
                              className="bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm font-medium">{uploadProgress}% Uploaded</p>
                          <svg className="animate-spin h-8 w-8 mx-auto mt-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Optional: Keep the URL input for direct URL entry */}
                <div className="mt-3">
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    Or enter image URL
                  </label>
                  <input
                    id="image"
                    name="image"
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={category.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <select
                  id="parentCategory"
                  name="parentCategory"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={category.parentCategory}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">None (Top Level Category)</option>
                  {isLoading ? (
                    <option disabled>Loading categories...</option>
                  ) : (
                    categories.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
                {isLoading && (
                  <p className="text-xs text-gray-500 mt-1">
                    Loading categories...
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  id="order"
                  name="order"
                  type="number"
                  min="0"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={category.order}
                  onChange={handleChange}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  id="featured"
                  name="featured"
                  type="checkbox"
                  className="rounded text-green-600 focus:ring-green-500 h-4 w-4"
                  checked={category.featured}
                  onChange={handleChange}
                />
                <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                  Featured Category
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Link
              href="/dashboard/categories"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isSaving ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}