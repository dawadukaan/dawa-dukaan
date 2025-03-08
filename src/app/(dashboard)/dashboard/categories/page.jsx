// src/app/(dashboard)/dashboard/categories/page.jsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiChevronDown,
  FiChevronUp,
  FiGrid,
  FiList,
  FiArrowLeft,
  FiSave,
  FiAlertCircle
} from 'react-icons/fi';
import { StatusBadge } from '@/components/dashboard/ui/StatusBadge';
import { useRouter } from 'next/navigation';
import { CategoryPageHeader } from '@/components/dashboard/categories/CategoryPageHeader';
import { toast } from 'react-hot-toast';
import env from '@/lib/config/env';
import { getCookie } from 'cookies-next';

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    featured: false,
    image: '',
    parentCategory: '',
    order: 0,
    slug: ''
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = getCookie('token');
        setIsLoading(true);
        const response = await fetch(`${env.app.apiUrl}/admin/categories`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          // Add productCount property (will be updated with real data in a production environment)
          const categoriesWithProductCount = data.data.map(category => ({
            ...category,
            id: category._id, // Map _id to id for compatibility with existing code
            productCount: 0 // Placeholder, would be fetched from API in production
          }));
          
          setCategories(categoriesWithProductCount);
        } else {
          console.error('Invalid data format:', data);
          toast.error('Failed to load categories data');
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

  // Filter and sort categories
  const filteredCategories = categories
    .filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'products') {
        return sortOrder === 'asc' 
          ? a.productCount - b.productCount 
          : b.productCount - a.productCount;
      }
      return 0;
    });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const toggleCategorySelection = (id) => {
    setSelectedCategories(prev => 
      prev.includes(id) 
        ? prev.filter(categoryId => categoryId !== id)
        : [...prev, id]
    );
  };

  const toggleAllCategories = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filteredCategories.map(c => c.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (confirm(`Are you sure you want to delete ${selectedCategories.length} categories?`)) {
      setIsLoading(true);
      
      try {
        // In a real implementation, you would call your API to delete the categories
        // For now, we'll just filter them out from the state
        setCategories(prev => prev.filter(category => !selectedCategories.includes(category.id)));
        setSelectedCategories([]);
        toast.success(`${selectedCategories.length} categories deleted successfully`);
      } catch (error) {
        console.error('Error deleting categories:', error);
        toast.error('Failed to delete categories');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteCategory = async (id) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setIsLoading(true);
      
      try {
        // In a real implementation, you would call your API to delete the category
        // For now, we'll just filter it out from the state
        setCategories(prev => prev.filter(category => category.id !== id));
        toast.success('Category deleted successfully');
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditClick = (categoryId) => {
    router.push(`/dashboard/categories/edit/${categoryId}`);
  };

  return (
    <div className="space-y-6">
      <CategoryPageHeader />

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-1/3">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center w-full md:w-2/3 justify-end">
            <div className="flex border rounded-lg overflow-hidden">
              <button
                className={`px-3 py-2 flex items-center ${viewMode === 'grid' ? 'bg-green-50 text-green-600' : 'bg-white text-gray-600'}`}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                className={`px-3 py-2 flex items-center ${viewMode === 'list' ? 'bg-green-50 text-green-600' : 'bg-white text-gray-600'}`}
                onClick={() => setViewMode('list')}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
            
            <button 
              className="bg-green-50 text-green-600 px-3 py-2 rounded-lg flex items-center hover:bg-green-100"
              onClick={() => toggleSort('name')}
            >
              Name
              {sortBy === 'name' && (
                <FiChevronDown className={`ml-1 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              )}
            </button>
            
            <button 
              className="bg-green-50 text-green-600 px-3 py-2 rounded-lg flex items-center hover:bg-green-100"
              onClick={() => toggleSort('products')}
            >
              Products
              {sortBy === 'products' && (
                <FiChevronDown className={`ml-1 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              )}
            </button>
            
            <select
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              <option value="featured">Featured Only</option>
              <option value="nonFeatured">Non-Featured Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCategories.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center">
          <span className="text-blue-700 font-medium">{selectedCategories.length} categories selected</span>
          <div className="flex gap-2">
            <button 
              className="bg-white text-gray-700 border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
              onClick={() => setSelectedCategories([])}
            >
              Cancel
            </button>
            <button 
              className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
              onClick={handleDeleteSelected}
            >
              <FiTrash2 className="inline mr-1" /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading categories...</p>
        </div>
      )}

      {/* Grid View */}
      {!isLoading && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.length > 0 ? (
            filteredCategories.map(category => (
              <div key={category.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="relative h-40 bg-gray-200">
                  {category.image ? (
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x150?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <FiAlertCircle className="w-8 h-8" />
                      <span className="ml-2">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <input 
                      type="checkbox" 
                      className="rounded text-green-600 focus:ring-green-500 h-4 w-4"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => toggleCategorySelection(category.id)}
                    />
                  </div>
                  {category.featured && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-yellow-400 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                        Featured
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{category.description || 'No description available'}</p>
                  
                  {category.parentCategory && (
                    <div className="mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Parent: {category.parentCategory.name}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">Order: {category.order || 0}</span>
                    <div className="flex gap-2">
                      <Link 
                        href={`/dashboard/categories/edit/${category.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </Link>
                      <button 
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-xl shadow-sm p-8 text-center">
              <FiAlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No categories found</h3>
              <p className="text-gray-500">Try adjusting your search or create a new category.</p>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {!isLoading && viewMode === 'list' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input 
                    type="checkbox" 
                    className="rounded text-green-600 focus:ring-green-500 h-4 w-4"
                    checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                    onChange={toggleAllCategories}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.length > 0 ? (
                filteredCategories.map(category => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        className="rounded text-green-600 focus:ring-green-500 h-4 w-4"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategorySelection(category.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-md bg-gray-200 overflow-hidden">
                          {category.image ? (
                            <img 
                              src={category.image} 
                              alt={category.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/40?text=NA';
                              }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                              <FiAlertCircle className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          <div className="text-sm text-gray-500">/{category.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2 max-w-xs">
                        {category.description || 'No description available'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.parentCategory ? (
                        <div className="text-sm text-gray-900">{category.parentCategory.name}</div>
                      ) : (
                        <span className="text-xs text-gray-500">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{category.order || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.featured ? (
                        <StatusBadge status="Featured" />
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/categories/${category.slug}`} className="text-gray-600 hover:text-gray-900">
                          <FiEye className="w-5 h-5" />
                        </Link>
                        <Link 
                          href={`/dashboard/categories/edit/${category.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEdit2 className="w-5 h-5" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                    No categories found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredCategories.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <FiAlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No categories found</h3>
          <p className="text-gray-500">Try adjusting your search or create a new category.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Add Category
          </button>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && filteredCategories.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-xl">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredCategories.length}</span> of{' '}
                <span className="font-medium">{filteredCategories.length}</span> results
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




