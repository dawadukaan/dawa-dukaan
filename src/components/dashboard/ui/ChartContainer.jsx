export function ChartContainer({ title, children }) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className="h-80">
          {children || (
            <div className="w-full h-full bg-gray-50 rounded flex items-center justify-center">
              Chart Placeholder
            </div>
          )}
        </div>
      </div>
    );
  }