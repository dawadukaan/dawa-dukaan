import { ChartContainer } from '../ui/ChartContainer';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

export function ProductsChart({ data = [], isLoading }) {
  // If no data is provided, use sample data
  const chartData = data.length > 0 ? data : [
    { name: 'Product A', sales: 120, color: '#10B981' },
    { name: 'Product B', sales: 98, color: '#3B82F6' },
    { name: 'Product C', sales: 86, color: '#8B5CF6' },
    { name: 'Product D', sales: 72, color: '#EC4899' },
    { name: 'Product E', sales: 65, color: '#F59E0B' },
  ].sort((a, b) => b.sales - a.sales);

  if (isLoading) {
    return (
      <ChartContainer title="Top Selling Products">
        <div className="w-full h-64 bg-gray-50 animate-pulse rounded"></div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Top Selling Products">
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
            <XAxis 
              type="number" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              width={100}
            />
            <Tooltip 
              formatter={(value) => [`${value} units`, 'Sales']}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />
            <Bar 
              dataKey="sales" 
              radius={[0, 4, 4, 0]}
              barSize={20}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 45}, 70%, 60%)`} />
              ))}
              <LabelList dataKey="sales" position="right" fill="#6B7280" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}