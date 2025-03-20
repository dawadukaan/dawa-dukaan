'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiTrash2, FiUpload, FiX, FiImage } from 'react-icons/fi';
import Link from 'next/link';
import { CategoryPageHeader } from '@/components/dashboard/categories/CategoryPageHeader';
import { toast } from 'react-hot-toast';
import env from '@/lib/config/env';
import { getCookie } from 'cookies-next';
import { use } from 'react';

export default function EditCategoryPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const fileInputRef = useRef(null);
  
  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [category, setCategory] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parent: '',
    order: 0,
    featured: false,
    isActive: true
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [productStats, setProductStats] = useState({
    productCount: 0,
    featuredProducts: []
  });

  // Fetch category data and all categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = getCookie('token');
        
        // Fetch the specific category
        const categoryResponse = await fetch(`${env.app.apiUrl}/admin/categories/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        
        if (!categoryResponse.ok) {
          throw new Error(`Failed to fetch category: ${categoryResponse.status}`);
        }
        
        const categoryData = await categoryResponse.json();
        
        if (categoryData.success && categoryData.data) {
          setCategory(categoryData.data);
          setProductStats({
            productCount: categoryData.data.productCount || 0,
            featuredProducts: categoryData.data.featuredProducts || []
          });
          
          // Set image preview if image exists
          if (categoryData.data.image) {
            setImagePreview(categoryData.data.image);
          }
        } else {
          throw new Error('Invalid category data format');
        }
        
        // Fetch all categories for parent dropdown
        const categoriesResponse = await fetch(`${env.app.apiUrl}/user/categories`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const categoriesData = await categoriesResponse.json();
        
        if (categoriesData.success && Array.isArray(categoriesData.data)) {
          setCategories(categoriesData.data);
        } else {
          console.error('Invalid categories data format:', categoriesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load category data');
        toast.error('Failed to load category data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
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
      // Create a preview immediately using URL.createObjectURL
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      
      // Upload to API with progress tracking
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 90));
      }, 100);
      
      // Get file extension
      const fileExtension = file.name.split('.').pop();
      
      // Create a new filename using the slug or category ID
      const fileName = `category-${category.slug || id}-${Date.now()}.${fileExtension}`;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName);
      formData.append('folder', 'category-images');
      
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
      
      if (data.success && data.data.url) {
        console.log('Upload successful, image URL:', data.data.url);
        
        // Set the category image URL
        setCategory(prev => ({
          ...prev,
          image: data.data.url
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
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    // Clean up the object URL if it exists
    if (imagePreview && imagePreview !== category.image) {
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
      const token = getCookie('token');
      
      // Create a copy of the category data
      const categoryData = {
        ...category,
        slug: category.slug || slugify(category.name)
      };
      
      // Remove parent if it's an empty string
      if (categoryData.parent === '') {
        delete categoryData.parent;
      }
      
      // Send to API
      const response = await fetch(`${env.app.apiUrl}/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update category');
      }
      
      const data = await response.json();
      
      toast.success('Category updated successfully');
      
      // Redirect to categories page after successful update
      router.push('/dashboard/categories');
      router.refresh();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(error.message || 'Failed to update category. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const token = getCookie('token');
      
      const response = await fetch(`${env.app.apiUrl}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle specific error conditions
        if (errorData.error && errorData.error.includes('child categories')) {
          throw new Error('This category has subcategories. Please delete or reassign them first.');
        } else if (errorData.error && (errorData.error.includes('associated products') || errorData.error.includes('products first'))) {
          throw new Error(`Cannot delete this category because it contains ${productStats.productCount} products. Please reassign them first.`);
        } else {
          throw new Error(errorData.error || 'Failed to delete category');
        }
      }
      
      toast.success('Category deleted successfully');
      
      // Redirect to categories page after successful deletion
      router.push('/dashboard/categories');
      router.refresh();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Failed to delete category. Please try again.');
    } finally {
      setIsDeleting(false);
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CategoryPageHeader />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <CategoryPageHeader />
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <Link href="/dashboard/categories" className="text-red-700 font-medium underline mt-2 inline-block">
            Return to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add the CategoryPageHeader component with the category name */}
      <CategoryPageHeader categoryName={category.name} />

      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting || productStats.productCount > 0}
          className={`${
            productStats.productCount > 0 
              ? 'bg-red-300 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700'
          } text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50`}
          title={productStats.productCount > 0 ? "Cannot delete category with products" : "Delete category"}
        >
          {isDeleting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deleting...
            </>
          ) : (
            <>
              <FiTrash2 className="w-5 h-5 mr-2" />
              Delete
            </>
          )}
        </button>
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
                  URL-friendly version of the name
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
              
              <div className="flex items-center space-x-4">
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
                
                <div className="flex items-center">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    className="rounded text-green-600 focus:ring-green-500 h-4 w-4"
                    checked={category.isActive}
                    onChange={handleChange}
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>
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
                    className="h-48 border-2 border-dashed border-gray-300 hover:border-green-500 cursor-pointer rounded-lg flex flex-col items-center justify-center transition-colors"
                  >
                    <FiImage className="h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Click to upload an image
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 2MB</p>
                  </div>
                ) : (
                  <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={imagePreview || category.image} 
                      alt={`${category.name} preview`} 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x150?text=Invalid+Image';
                      }}
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
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
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
                <label htmlFor="parent" className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <select
                  id="parent"
                  name="parent"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={category.parent || ''}
                  onChange={handleChange}
                >
                  <option value="">None (Top Level Category)</option>
                  {categories
                    .filter(cat => cat._id !== id) // Prevent selecting self as parent
                    .map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))
                  }
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select a parent category if this is a subcategory
                </p>
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
                  Lower numbers appear first in navigation
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t flex justify-end space-x-3">
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
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Related Products */}
      {productStats.productCount > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Products in this Category</h2>
            <Link 
              href={`/dashboard/products?category=${id}`}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              View All Products
            </Link>
          </div>
          <div className="text-gray-500 text-sm mb-4">
            This category contains {productStats.productCount} products.
          </div>
          
          {/* Featured products showcase */}
          {productStats.featuredProducts && productStats.featuredProducts.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-medium text-gray-700 mb-3">Featured Products</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {productStats.featuredProducts.map(product => (
                  <div key={product._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-32 bg-gray-100">
                      {product.images && product.images.length > 0 && product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <FiImage className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-gray-800 truncate">{product.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {product.price && product.price.unlicensedPrice ? (
                          <>₹{parseFloat(product.price.unlicensedPrice).toFixed(2)}</>
                        ) : (
                          <span className="text-gray-400">No price</span>
                        )}
                      </p>
                      <div className="mt-2">
                        <Link 
                          href={`/dashboard/products/edit/${product._id}`}
                          className="text-xs text-green-600 hover:text-green-700 font-medium"
                        >
                          Edit Product
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Danger Zone */}
      <div className="bg-red-50 rounded-xl shadow-sm p-6 border border-red-100">
        <h2 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h2>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-red-700 font-medium">Delete this category</p>
            <p className="text-sm text-red-600">
              Once deleted, this category cannot be recovered.
            </p>
            {productStats.productCount > 0 && (
              <p className="text-sm font-medium text-red-800 mt-1">
                Cannot delete: This category has {productStats.productCount} products. 
                Reassign products to another category first.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || productStats.productCount > 0}
            className={`${
              productStats.productCount > 0 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-white border border-red-300 text-red-700 hover:bg-red-50'
            } px-4 py-2 rounded-lg disabled:opacity-50`}
          >
            {isDeleting ? 'Deleting...' : 'Delete Category'}
          </button>
        </div>
      </div>
    </div>
  );
}