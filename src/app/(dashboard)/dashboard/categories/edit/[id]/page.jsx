'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';
import { CategoryPageHeader } from '@/components/dashboard/categories/CategoryPageHeader';
import { use } from 'react';

// Replace the incomplete sample data with the full array
const sampleCategories = [
  {
    id: '1',
    name: 'Vegetables',
    slug: 'vegetables',
    description: 'Fresh vegetables sourced directly from local farms. Includes tomatoes, cucumbers, bell peppers, and more.',
    productCount: 24,
    featured: true,
    image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '2',
    name: 'Leafy Greens',
    slug: 'leafy-greens',
    description: 'Nutrient-rich leafy greens including spinach, kale, lettuce, and other salad greens.',
    productCount: 12,
    featured: false,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '3',
    name: 'Root Vegetables',
    slug: 'root-vegetables',
    description: 'Underground vegetables like carrots, potatoes, onions, and beetroot.',
    productCount: 15,
    featured: false,
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '4',
    name: 'Exotic Vegetables',
    slug: 'exotic-vegetables',
    description: 'Rare and imported vegetables from around the world, including specialty items.',
    productCount: 8,
    featured: true,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '5',
    name: 'Seasonal',
    slug: 'seasonal',
    description: 'Currently in-season vegetables that are at their peak freshness and flavor.',
    productCount: 10,
    featured: true,
    image: 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '6',
    name: 'Organic',
    slug: 'organic',
    description: 'Certified organic vegetables grown without synthetic pesticides or fertilizers.',
    productCount: 18,
    featured: false,
    image: 'https://images.unsplash.com/photo-1591086729396-3e4f99f2e0f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80'
  }
];

export default function EditCategoryPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch(`/api/categories/${id}`);
        // if (!response.ok) throw new Error('Failed to fetch category');
        // const data = await response.json();
        
        // For demo, we'll use sample data
        const foundCategory = sampleCategories.find(cat => cat.id === id);
        
        if (!foundCategory) {
          console.error(`Category with ID ${id} not found`);
          setError(`Category with ID ${id} not found`);
          setIsLoading(false);
          return;
        }
        
        setCategory(foundCategory);
        
        // Also fetch all categories for parent dropdown
        // const categoriesResponse = await fetch('/api/categories');
        // const categoriesData = await categoriesResponse.json();
        setCategories(sampleCategories);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching category:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };
    
    fetchCategory();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategory({
      ...category,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!category.name.trim()) {
      alert('Category name is required');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // In a real app, you would send this to your API
      // const response = await fetch(`/api/categories/${id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     ...category,
      //     slug: category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      //   }),
      // });
      
      // if (!response.ok) throw new Error('Failed to update category');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to categories page after successful update
      router.push('/dashboard/categories');
      router.refresh();
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category. Please try again.');
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
      // In a real app, you would send this to your API
      // const response = await fetch(`/api/categories/${id}`, {
      //   method: 'DELETE',
      // });
      
      // if (!response.ok) throw new Error('Failed to delete category');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to categories page after successful deletion
      router.push('/dashboard/categories');
      router.refresh();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    } finally {
      setIsDeleting(false);
    }
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

  if (!category) {
    return (
      <div className="space-y-6">
        <CategoryPageHeader />
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <p>Category not found</p>
          <Link href="/dashboard/categories" className="text-yellow-700 font-medium underline mt-2 inline-block">
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
          disabled={isDeleting}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
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
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  id="image"
                  name="image"
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={category.image}
                  onChange={handleChange}
                />
                {category.image && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Preview:</p>
                    <div className="h-32 w-full bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={category.image} 
                        alt="Category preview" 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x150?text=Invalid+Image+URL';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <select
                  id="parentCategory"
                  name="parentCategory"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={category.parentCategory || ''}
                  onChange={handleChange}
                >
                  <option value="">None (Top Level Category)</option>
                  {categories
                    .filter(cat => cat.id !== category.id) // Prevent selecting self as parent
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  }
                </select>
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
                  value={category.order || 0}
                  onChange={handleChange}
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
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Related Products (Optional) */}
      {category.productCount > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Products in this Category</h2>
            <Link 
              href={`/dashboard/products?category=${category.id}`}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="text-gray-500 text-sm">
            This category contains {category.productCount} products.
          </div>
        </div>
      )}
      
      {/* Danger Zone */}
      <div className="bg-red-50 rounded-xl shadow-sm p-6 border border-red-100">
        <h2 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h2>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-red-700 font-medium">Delete this category</p>
            <p className="text-sm text-red-600">
              Once deleted, this category cannot be recovered. Products in this category will not be deleted.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-white border border-red-300 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Category'}
          </button>
        </div>
      </div>
    </div>
  );
}