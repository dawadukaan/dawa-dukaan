'use client';

import { useState, useEffect } from 'react';
import { getCookie } from 'cookies-next';
import env from '@/lib/config/env';

export function useDashboardData(dateRange = 'today') {
  const [data, setData] = useState({
    stats: [],
    recentOrders: [],
    revenueData: [],
    productsData: [],
    customerData: [],
  });
  const [loading, setLoading] = useState(true);
  const token = getCookie('token');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch dashboard stats from API
        const response = await fetch(`${env.app.apiUrl}/admin/dashboard/stats?range=${dateRange}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Format stats for display
          const formattedStats = [
            {
              id: 'revenue',
              title: 'Total Revenue',
              value: formatCurrency(result.data.totalSales || 0),
              trend: calculateTrend(result.data.salesComparison?.currentPeriod, result.data.salesComparison?.previousPeriod),
              iconBg: 'bg-green-100',
              iconColor: 'text-green-600'
            },
            {
              id: 'orders',
              title: 'Total Orders',
              value: result.data.totalOrders || 0,
              trend: calculateTrend(result.data.ordersComparison?.currentPeriod, result.data.ordersComparison?.previousPeriod),
              iconBg: 'bg-blue-100',
              iconColor: 'text-blue-600'
            },
            {
              id: 'products',
              title: 'Low Stock Products',
              value: result.data.lowStockProducts || 0,
              trend: 0, // No trend for low stock products
              iconBg: 'bg-yellow-100',
              iconColor: 'text-yellow-600'
            },
            {
              id: 'customers',
              title: 'Total Customers',
              value: result.data.totalUsers || 0,
              trend: calculateTrend(result.data.usersComparison?.currentPeriod, result.data.usersComparison?.previousPeriod),
              iconBg: 'bg-purple-100',
              iconColor: 'text-purple-600'
            }
          ];
          
          // Format revenue chart data
          const revenueData = formatRevenueData(result.data.salesByDate || []);
          
          // Format products chart data
          const productsData = formatProductsData(result.data.topProducts || []);
          
          // Format customer growth data
          const customerData = formatCustomerData(result.data.customerGrowth || []);
          
          setData({
            stats: formattedStats,
            recentOrders: result.data.recentOrders || [],
            revenueData,
            productsData,
            customerData
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [dateRange, token]);
  
  return { ...data, loading };
}

// Helper functions
function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

function calculateTrend(current, previous) {
  if (!current || !previous || previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

function formatRevenueData(salesData) {
  // Transform API data to chart format
  return salesData.map(item => ({
    name: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: item.sales || 0,
    orders: item.count || 0,
    profit: Math.round((item.sales || 0) * 0.3) // Assuming 30% profit margin
  }));
}

function formatProductsData(productsData) {
  // Transform API data to chart format
  const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'];
  
  return productsData.map((product, index) => ({
    name: product.name,
    sales: product.totalSold || 0,
    color: colors[index % colors.length]
  }));
}

function formatCustomerData(customerData) {
  // Transform API data to chart format
  return customerData.map(item => ({
    month: new Date(item._id).toLocaleDateString('en-US', { month: 'short' }),
    newCustomers: item.new || 0,
    activeCustomers: item.active || 0,
    target: item.target || Math.round((item.new || 0) * 1.2) // Target is 20% higher than actual if not provided
  }));
}