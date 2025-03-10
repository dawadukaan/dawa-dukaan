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
    loading: true
  });

  const token = getCookie('token');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setData(prev => ({ ...prev, loading: true }));
      
      try {
        // In a real app, you would fetch this data from your API
        const response = await fetch(`${env.app.apiUrl}/admin/dashboard?range=${dateRange}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setData({
            stats: result.data.stats || [],
            recentOrders: result.data.recentOrders || [],
            revenueData: result.data.revenueData || [],
            productsData: result.data.productsData || [],
            customerData: result.data.customerData || [],
            loading: false
          });
        } else {
          throw new Error(result.message || 'Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // Fallback to sample data if API fails
        setData({
          stats: [
            { id: 'revenue', title: 'Total Revenue', value: '$12,345', trend: '+12%', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
            { id: 'orders', title: 'Total Orders', value: '156', trend: '+8%', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
            { id: 'products', title: 'Products', value: '432', trend: '+5%', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
            { id: 'customers', title: 'Customers', value: '2,154', trend: '+18%', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
          ],
          recentOrders: [
            { id: '1', customer: 'John Doe', date: '2023-07-10', total: '$125.00', status: 'completed' },
            { id: '2', customer: 'Jane Smith', date: '2023-07-09', total: '$85.50', status: 'processing' },
            { id: '3', customer: 'Bob Johnson', date: '2023-07-08', total: '$220.75', status: 'completed' },
            { id: '4', customer: 'Alice Brown', date: '2023-07-07', total: '$65.25', status: 'cancelled' },
            { id: '5', customer: 'Charlie Wilson', date: '2023-07-06', total: '$190.00', status: 'completed' },
          ],
          revenueData: [
            { name: 'Jan', revenue: 4000, orders: 24, profit: 2400 },
            { name: 'Feb', revenue: 3000, orders: 18, profit: 1800 },
            { name: 'Mar', revenue: 5000, orders: 30, profit: 3000 },
            { name: 'Apr', revenue: 2780, orders: 16, profit: 1500 },
            { name: 'May', revenue: 1890, orders: 11, profit: 1000 },
            { name: 'Jun', revenue: 2390, orders: 14, profit: 1300 },
            { name: 'Jul', revenue: 3490, orders: 21, profit: 2000 },
          ],
          productsData: [
            { name: 'Product A', sales: 120, color: '#10B981' },
            { name: 'Product B', sales: 98, color: '#3B82F6' },
            { name: 'Product C', sales: 86, color: '#8B5CF6' },
            { name: 'Product D', sales: 72, color: '#EC4899' },
            { name: 'Product E', sales: 65, color: '#F59E0B' },
          ],
          customerData: [
            { month: 'Jan', newCustomers: 45, activeCustomers: 200, target: 40 },
            { month: 'Feb', newCustomers: 52, activeCustomers: 230, target: 45 },
            { month: 'Mar', newCustomers: 48, activeCustomers: 260, target: 50 },
            { month: 'Apr', newCustomers: 61, activeCustomers: 290, target: 55 },
            { month: 'May', newCustomers: 64, activeCustomers: 330, target: 60 },
            { month: 'Jun', newCustomers: 72, activeCustomers: 380, target: 65 },
            { month: 'Jul', newCustomers: 85, activeCustomers: 440, target: 70 },
          ],
          loading: false
        });
      }
    };

    fetchDashboardData();
  }, [dateRange, token]);

  return data;
}