import { ChartContainer } from '../ui/ChartContainer';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import { useState } from 'react';

export function RevenueChart({ data = [], isLoading }) {
  const [activeType, setActiveType] = useState('all');
  
  // If no data is provided, use sample data
  const chartData = data.length > 0 ? data : [
    { name: 'Jan', revenue: 4000, orders: 24, profit: 2400 },
    { name: 'Feb', revenue: 3000, orders: 18, profit: 1800 },
    { name: 'Mar', revenue: 5000, orders: 30, profit: 3000 },
    { name: 'Apr', revenue: 2780, orders: 16, profit: 1500 },
    { name: 'May', revenue: 1890, orders: 11, profit: 1000 },
    { name: 'Jun', revenue: 2390, orders: 14, profit: 1300 },
    { name: 'Jul', revenue: 3490, orders: 21, profit: 2000 },
  ];

  if (isLoading) {
    return (
      <ChartContainer title="Revenue Overview">
        <div className="w-full h-64 bg-gray-50 animate-pulse rounded"></div>
      </ChartContainer>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <ChartContainer title="Revenue Overview">
      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => setActiveType('all')}
          className={`px-3 py-1 text-sm rounded-full ${
            activeType === 'all' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveType('revenue')}
          className={`px-3 py-1 text-sm rounded-full ${
            activeType === 'revenue' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Revenue
        </button>
        <button
          onClick={() => setActiveType('profit')}
          className={`px-3 py-1 text-sm rounded-full ${
            activeType === 'profit' 
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Profit
        </button>
        <button
          onClick={() => setActiveType('orders')}
          className={`px-3 py-1 text-sm rounded-full ${
            activeType === 'orders' 
              ? 'bg-orange-100 text-orange-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Orders
        </button>
      </div>
      
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => {
                if (activeType === 'orders') return value;
                return formatCurrency(value);
              }}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'orders') return [value, 'Orders'];
                return [formatCurrency(value), name === 'revenue' ? 'Revenue' : 'Profit'];
              }}
            />
            <Legend />
            {(activeType === 'all' || activeType === 'revenue') && (
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
            )}
            {(activeType === 'all' || activeType === 'profit') && (
              <Area
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#8B5CF6"
                fillOpacity={1}
                fill="url(#colorProfit)"
                strokeWidth={2}
              />
            )}
            {(activeType === 'all' || activeType === 'orders') && (
              <Area
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#F59E0B"
                fillOpacity={1}
                fill="url(#colorOrders)"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}