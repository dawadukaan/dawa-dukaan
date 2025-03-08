import { StatusBadge } from './StatusBadge';

export function DataTable({ columns, data, isLoading }) {
    if (isLoading) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      );
    }
  
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th 
                    key={column.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => (
                    <td key={`${rowIndex}-${column.id}`} className="px-6 py-4 whitespace-nowrap">
                      {column.id === 'actions' ? (
                        <button className="text-indigo-600 hover:text-indigo-900">
                          View details
                        </button>
                      ) : column.id === 'status' ? (
                        <StatusBadge status={row[column.accessorKey]} />
                      ) : column.id === 'customer' ? (
                        <div className="flex items-center">
                          <img 
                            className="h-8 w-8 rounded-full" 
                            src={row.customerImage || '/placeholder.png'} 
                            alt="" 
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{row.customerName}</div>
                            <div className="text-sm text-gray-500">{row.customerEmail}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900">
                          {column.id === 'total' ? '₹' : ''}{row[column.accessorKey]}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }