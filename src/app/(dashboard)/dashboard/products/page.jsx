// src/app/(dashboard)/dashboard/products/page.jsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiChevronDown,
  FiAlertCircle
} from 'react-icons/fi';
import { StatusBadge } from '@/components/dashboard/ui/StatusBadge';
import { toast } from 'react-hot-toast';
import env from '@/lib/config/env';
import { getCookie } from 'cookies-next';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [stockFilter, setStockFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState(['All']);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1
  });

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      const token = getCookie('token');
      try {
        setIsLoading(true);
        const response = await fetch(`${env.app.apiUrl}/admin/products`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data.products)) {
          setProducts(data.data.products);
          setPagination(data.data.pagination);
          
          // Extract unique categories
          const uniqueCategories = new Set();
          uniqueCategories.add('All');
          
          data.data.products.forEach(product => {
            if (product.categories && Array.isArray(product.categories)) {
              product.categories.forEach(category => {
                if (category.name) {
                  uniqueCategories.add(category.name);
                }
              });
            }
            if (product.primaryCategory && product.primaryCategory.name) {
              uniqueCategories.add(product.primaryCategory.name);
            }
          });
          
          setCategories(Array.from(uniqueCategories));
        } else {
          console.error('Invalid data format:', data);
          toast.error('Failed to load products data');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || 
        (product.categories && product.categories.some(cat => cat.name === selectedCategory)) ||
        (product.primaryCategory && product.primaryCategory.name === selectedCategory);
      
      const matchesStock = stockFilter === 'all' || 
                          (stockFilter === 'inStock' && product.stock > 0) ||
                          (stockFilter === 'lowStock' && product.stock > 0 && product.stock < 10) ||
                          (stockFilter === 'outOfStock' && product.stock === 0);
      
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'price') {
        return sortOrder === 'asc' 
          ? a.price - b.price 
          : b.price - a.price;
      } else if (sortBy === 'stock') {
        return sortOrder === 'asc' 
          ? a.stock - b.stock 
          : b.stock - a.stock;
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

  // Add this function to handle individual product deletion
  const handleDeleteProduct = async (productId, productName) => {
    if (confirm(`Are you sure you want to delete "${productName}"?`)) {
      const token = getCookie('token');
      setIsLoading(true);
      
      try {
        const response = await fetch(`${env.app.apiUrl}/admin/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete product');
        }
        
        // Remove the deleted product from the state
        setProducts(prev => prev.filter(product => product._id !== productId));
        toast.success(`Product "${productName}" deleted successfully`);
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error(error.message || 'Failed to delete product');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <div className="flex gap-2">
          <Link 
            href="/dashboard/products/add" 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Add Product
          </Link>
          <button 
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter className="w-5 h-5 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
          <div className="relative w-full md:w-1/3">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center w-full md:w-2/3 justify-end">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
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
              onClick={() => toggleSort('price')}
            >
              Price
              {sortBy === 'price' && (
                <FiChevronDown className={`ml-1 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              )}
            </button>
            
            <button 
              className="bg-green-50 text-green-600 px-3 py-2 rounded-lg flex items-center hover:bg-green-100"
              onClick={() => toggleSort('stock')}
            >
              Stock
              {sortBy === 'stock' && (
                <FiChevronDown className={`ml-1 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              )}
            </button>
          </div>
        </div>
        
        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All</option>
                  <option value="inStock">In Stock</option>
                  <option value="lowStock">Low Stock</option>
                  <option value="outOfStock">Out of Stock</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seasonal</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All</option>
                  <option value="seasonal">Seasonal Only</option>
                  <option value="nonSeasonal">Non-Seasonal Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2">
                Reset
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
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
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-md bg-gray-200 overflow-hidden">
                            {product.images && product.images.length > 0 && product.images[0] ? (
                              <img 
                                src={product.images[0]} 
                                alt={product.name} 
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                                }}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                                <FiAlertCircle />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.primaryCategory ? (
                          <StatusBadge status={product.primaryCategory.name} />
                        ) : (
                          <span className="text-gray-400 text-sm">No category</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {/* Unlicensed Price */}
                          <div>
                            <span className="text-xs font-medium text-gray-500">Unlicensed:</span>
                            <div className="text-sm text-gray-900">
                              {product.salePrice && product.salePrice.unlicensedPrice ? (
                                <>₹{parseFloat(product.salePrice.unlicensedPrice).toFixed(2)}</>
                              ) : (
                                <>₹{parseFloat(product.salePrice.unlicensedPrice).toFixed(2)}</>
                              )}
                              {product.price && product.price.unlicensedPrice && (
                                <>
                                  <span className="text-xs text-gray-500 line-through ml-1">
                                    ₹{parseFloat(product.price.unlicensedPrice).toFixed(2)}
                                  </span>
                                  <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded ml-1">
                                    {product.discountPercentage?.unlicensedDiscount || 
                                      Math.round(((product.price.unlicensedPrice - product.salePrice.unlicensedPrice) / 
                                        product.price.unlicensedPrice) * 100)}% off
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Licensed Price */}
                          <div className="border-t border-gray-100 pt-1">
                            <span className="text-xs font-medium text-blue-500">Licensee:</span>
                            <div className="text-sm text-blue-700">
                              {product.salePrice && product.salePrice.licensedPrice ? (
                                <>₹{parseFloat(product.salePrice.licensedPrice).toFixed(2)}</>
                              ) : (
                                <>₹{parseFloat(product.price.licensedPrice).toFixed(2)}</>
                              )}
                              {product.price && product.price.licensedPrice && (
                                <>
                                  <span className="text-xs text-gray-500 line-through ml-1">
                                    ₹{parseFloat(product.price.licensedPrice).toFixed(2)}
                                  </span>
                                  <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded ml-1">
                                    {product.discountPercentage?.licensedDiscount || 
                                      Math.round(((product.price.licensedPrice - product.salePrice.licensedPrice) / 
                                        product.price.licensedPrice) * 100)}% off
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${product.stock === 0 ? 'text-red-600' : product.stock < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {product.stock} {product.stockUnit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge 
                          status={
                            product.stock === 0 
                              ? 'Out of Stock' 
                              : product.stock < 10 
                                ? 'Low Stock' 
                                : 'In Stock'
                          } 
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/products/${product.slug}`} className="text-gray-600 hover:text-gray-900">
                            <FiEye className="w-5 h-5" />
                          </Link>
                          <Link href={`/dashboard/products/edit/${product._id}`} className="text-blue-600 hover:text-blue-900">
                            <FiEdit2 className="w-5 h-5" />
                          </Link>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteProduct(product._id, product.name)}
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                      No products found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button 
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              <button 
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                disabled={pagination.page === pagination.pages}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button 
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    disabled={pagination.page === 1}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Generate page buttons */}
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        page === pagination.page
                          ? 'bg-green-50 border-green-500 text-green-600 z-10'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      } text-sm font-medium`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button 
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    disabled={pagination.page === pagination.pages}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


