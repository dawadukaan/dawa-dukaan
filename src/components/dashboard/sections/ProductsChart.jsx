import { ChartContainer } from '../ui/ChartContainer';

export function ProductsChart({ data, isLoading }) {
  if (isLoading) {
    return <ChartContainer title="Top Selling Products" />;
  }

  return (
    <ChartContainer title="Top Selling Products">
      {/* In a real app, you would use a chart library like Recharts */}
      <div className="w-full h-full bg-gray-50 rounded flex items-center justify-center">
        Products Chart (Add your chart library here)
      </div>
    </ChartContainer>
  );
}