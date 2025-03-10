'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MENU_ITEMS } from '@/constants/dashboard/menu-items';
import { FiChevronDown, FiChevronRight, FiList } from 'react-icons/fi';

export function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const [expandedItem, setExpandedItem] = useState(null);

  const toggleExpand = (itemPath) => {
    setExpandedItem(prevExpanded => 
      prevExpanded === itemPath ? null : itemPath
    );
  };

  return (
    <aside 
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg transition-all duration-300 z-30 flex flex-col ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="space-y-2">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedItem === item.path;
            
            return (
              <div key={item.path}>
                <div 
                  className={`flex items-center p-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-green-50 text-green-600' 
                      : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                  } ${hasSubItems ? 'cursor-pointer' : ''}`}
                  onClick={hasSubItems ? () => toggleExpand(item.path) : undefined}
                >
                  {hasSubItems ? (
                    <>
                      <Icon className="w-6 h-6 flex-shrink-0" />
                      {isOpen && (
                        <>
                          <span className="ml-3 flex-grow">{item.label}</span>
                          {isExpanded ? (
                            <FiChevronDown className="w-5 h-5" />
                          ) : (
                            <FiChevronRight className="w-5 h-5" />
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.path}
                      className="flex items-center w-full"
                    >
                      <Icon className="w-6 h-6 flex-shrink-0" />
                      {isOpen && <span className="ml-3">{item.label}</span>}
                    </Link>
                  )}
                </div>
                
                {/* Submenu */}
                {hasSubItems && isExpanded && isOpen && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.subItems.map(subItem => {
                      const SubIcon = subItem.icon || FiList;
                      const isSubActive = pathname === subItem.path;
                      
                      return (
                        <Link
                          key={subItem.path}
                          href={subItem.path}
                          className={`flex items-center p-2 rounded-md text-sm ${
                            isSubActive 
                              ? 'bg-green-50 text-green-600' 
                              : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                          }`}
                        >
                          <SubIcon className="w-4 h-4 mr-2" />
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          {isOpen ? 'Dava Dukaan Dashboard' : 'DD'}
        </div>
      </div>
    </aside>
  );
}