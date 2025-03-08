'use client';

import { useState } from 'react';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { StatsSummary } from '@/components/dashboard/sections/StatsSummary';
import { RevenueChart } from '@/components/dashboard/sections/RevenueChart';
import { ProductsChart } from '@/components/dashboard/sections/ProductsChart';
import { RecentOrders } from '@/components/dashboard/sections/RecentOrders';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState('today');
  const { stats, recentOrders, revenueData, productsData, loading } = useDashboardData(dateRange);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-white border rounded-lg px-4 py-2"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <StatsSummary stats={stats} isLoading={loading} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueData} isLoading={loading} />
        <ProductsChart data={productsData} isLoading={loading} />
      </div>

      {/* Recent Orders */}
      <RecentOrders orders={recentOrders} isLoading={loading} />
    </div>
  );
}