import { DataTable } from '../ui/DataTable';
import { ORDER_COLUMNS } from '@/constants/dashboard/table-columns';

export function RecentOrders({ orders, isLoading }) {
  return (
    <DataTable
      columns={ORDER_COLUMNS}
      data={orders}
      isLoading={isLoading}
    />
  );
}