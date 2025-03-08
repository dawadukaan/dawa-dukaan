'use client';

import { useState, useEffect } from 'react';

export function useDashboardData(dateRange = 'today') {
  const [data, setData] = useState({
    stats: [],
    recentOrders: [],
    revenueData: [],
    productsData: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setData(prev => ({ ...prev, loading: true }));
      
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch(`/api/dashboard/stats?range=${dateRange}`);
        // const result = await response.json();
        
        // For now, we'll use mock data
        setTimeout(() => {
          setData({
            stats: [
              { title: 'Total Revenue', value: '₹12,426', trend: 8.2 },
              { title: 'Total Orders', value: '156', trend: 12.5 },
              { title: 'Products Sold', value: '892', trend: -2.4 },
              { title: 'Active Customers', value: '2,456', trend: 4.3 }
            ],
            recentOrders: [
              {
                id: '1234',
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                customerImage: '/customer-1.jpg',
                products: 'Organic Tomatoes, Fresh Spinach',
                total: 24.99,
                status: 'Completed'
              },
              {
                id: '1235',
                customerName: 'Jane Smith',
                customerEmail: 'jane@example.com',
                customerImage: '/customer-2.jpg',
                products: 'Carrots, Potatoes, Onions',
                total: 32.50,
                status: 'Processing'
              }
            ],
            revenueData: [/* Chart data */],
            productsData: [/* Chart data */],
            loading: false,
            error: null
          });
        }, 500);
      } catch (error) {
        setData(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to load dashboard data' 
        }));
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  return data;
}