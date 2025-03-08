'use client';

import { DashboardLayout } from '@/components/dashboard/layout/DashboardLayout';

export default function AdminLayout({ children }) {
  return (
    
      <DashboardLayout>{children}</DashboardLayout>

  );
}