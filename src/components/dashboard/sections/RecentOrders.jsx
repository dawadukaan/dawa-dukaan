import { ChartContainer } from '../ui/ChartContainer';
import { FiPackage, FiClock, FiUser, FiDollarSign } from 'react-icons/fi';
import Link from 'next/link';

export function RecentOrders({ orders = [], isLoading }) {
  if (isLoading) {
    return (
      <ChartContainer title="Recent Orders">
        <div className="animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b border-gray-100 py-3">
              <div className="flex justify-between">
                <div className="w-1/4 h-5 bg-gray-200 rounded"></div>
                <div className="w-1/5 h-5 bg-gray-200 rounded"></div>
                <div className="w-1/5 h-5 bg-gray-200 rounded"></div>
                <div className="w-1/6 h-5 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </ChartContainer>
    );
  }

  // If no orders, show empty state
  if (!orders || orders.length === 0) {
    return (
      <ChartContainer title="Recent Orders">
        <div className="flex flex-col items-center justify-center h-64">
          <FiPackage className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500">No recent orders found</p>
        </div>
      </ChartContainer>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ChartContainer title="Recent Orders">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {order.orderNumber}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  <div className="flex items-center">
                    <FiUser className="mr-2 text-gray-400" />
                    {order.user?.name || 'Unknown'}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  <div className="flex items-center">
                    <FiClock className="mr-2 text-gray-400" />
                    {formatDate(order.createdAt)}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  <div className="flex items-center">
                    <FiDollarSign className="mr-1 text-gray-400" />
                    {formatCurrency(order.totalPrice)}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <Link 
                    href={`/dashboard/orders/edit/${order._id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-4 text-right">
          <Link 
            href="/dashboard/orders"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all orders →
          </Link>
        </div>
      </div>
    </ChartContainer>
  );
}