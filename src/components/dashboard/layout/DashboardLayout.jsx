'use client';

import { useSidebar } from '@/hooks/dashboard/useSidebar';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { MobileSidebar } from './MobileSidebar';

export function DashboardLayout({ children }) {
  const { isSidebarOpen, isMobile, toggleSidebar, setIsSidebarOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav onToggleSidebar={toggleSidebar} />
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar isOpen={isSidebarOpen} />
      </div>
      
      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isMobile && isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* Main Content */}
      <main 
        className={`pt-16 transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-20'
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}