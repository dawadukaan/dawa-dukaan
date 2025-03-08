import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiList, FiPlus, FiEdit } from 'react-icons/fi';

export function CategoryPageHeader({ categoryName }) {
  const pathname = usePathname();
  
  const isListPage = pathname === '/dashboard/categories';
  const isAddPage = pathname === '/dashboard/categories/add';
  const isEditPage = pathname.includes('/dashboard/categories/edit/');
  
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {isListPage ? 'Categories' : 
           isAddPage ? 'Add New Category' : 
           isEditPage ? `Edit Category: ${categoryName || ''}` : 'Categories'}
        </h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap border-b">
          <Link
            href="/dashboard/categories"
            className={`px-4 py-3 flex items-center border-b-2 text-sm font-medium ${
              isListPage 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiList className="mr-2 h-4 w-4" />
            All Categories
          </Link>
          
          <Link
            href="/dashboard/categories/add"
            className={`px-4 py-3 flex items-center border-b-2 text-sm font-medium ${
              isAddPage 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
          
          {isEditPage && (
            <div className="px-4 py-3 flex items-center border-b-2 border-green-500 text-green-600 text-sm font-medium">
              <FiEdit className="mr-2 h-4 w-4" />
              Edit: {categoryName || 'Category'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 