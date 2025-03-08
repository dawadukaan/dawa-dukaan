import { ChartContainer } from '../ui/ChartContainer';

export function RevenueChart({ data, isLoading }) {
  if (isLoading) {
    return <ChartContainer title="Revenue Overview" />;
  }

  return (
    <ChartContainer title="Revenue Overview">
      {/* In a real app, you would use a chart library like Recharts */}
      <div className="w-full h-full bg-gray-50 rounded flex items-center justify-center">
        Revenue Chart (Add your chart library here)
      </div>
    </ChartContainer>
  );
}