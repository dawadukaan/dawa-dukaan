'use client';

import { FiX, FiMenu, FiBell, FiSearch, FiUser } from 'react-icons/fi';
import { HiX, HiMenu, HiBell, HiSearch, HiUserCircle } from 'react-icons/hi';
import { Sidebar } from './Sidebar';

export function MobileSidebar({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20"
        onClick={onClose}
      ></div>
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 flex z-30 max-w-xs w-full">
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              onClick={onClose}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <FiX className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-16 pb-4 overflow-y-auto">
            <Sidebar isOpen={true} onClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}