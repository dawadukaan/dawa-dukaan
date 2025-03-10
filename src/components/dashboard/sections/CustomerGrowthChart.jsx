import { ChartContainer } from '../ui/ChartContainer';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';

export function CustomerGrowthChart({ data = [], isLoading }) {
  // If no data is provided, use sample data
  const chartData = data.length > 0 ? data : [
    { month: 'Jan', newCustomers: 45, activeCustomers: 200, target: 40 },
    { month: 'Feb', newCustomers: 52, activeCustomers: 230, target: 45 },
    { month: 'Mar', newCustomers: 48, activeCustomers: 260, target: 50 },
    { month: 'Apr', newCustomers: 61, activeCustomers: 290, target: 55 },
    { month: 'May', newCustomers: 64, activeCustomers: 330, target: 60 },
    { month: 'Jun', newCustomers: 72, activeCustomers: 380, target: 65 },
    { month: 'Jul', newCustomers: 85, activeCustomers: 440, target: 70 },
  ];

  if (isLoading) {
    return (
      <ChartContainer title="Customer Growth">
        <div className="w-full h-64 bg-gray-50 animate-pulse rounded"></div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Customer Growth">
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <Tooltip />
            <Legend />
            <ReferenceLine 
              yAxisId="left"
              y={60} 
              label="Target" 
              stroke="#EF4444" 
              strokeDasharray="3 3" 
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="newCustomers"
              name="New Customers"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="activeCustomers"
              name="Active Customers"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="target"
              name="Monthly Target"
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
} 