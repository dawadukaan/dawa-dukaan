export const ORDER_COLUMNS = [
    { id: 'id', header: 'Order ID', accessorKey: 'id' },
    { id: 'customer', header: 'Customer', accessorKey: 'customerName' },
    { id: 'products', header: 'Products', accessorKey: 'products' },
    { id: 'total', header: 'Total', accessorKey: 'total' },
    { id: 'status', header: 'Status', accessorKey: 'status' },
    { id: 'actions', header: 'Actions' }
  ];
  
  export const PRODUCT_COLUMNS = [
    { id: 'name', header: 'Product Name', accessorKey: 'name' },
    { id: 'category', header: 'Category', accessorKey: 'category' },
    { id: 'price', header: 'Price', accessorKey: 'price' },
    { id: 'stock', header: 'Stock', accessorKey: 'stock' },
    { id: 'actions', header: 'Actions' }
  ];
  
  export const CUSTOMER_COLUMNS = [
    { id: 'name', header: 'Name', accessorKey: 'name' },
    { id: 'email', header: 'Email', accessorKey: 'email' },
    { id: 'orders', header: 'Orders', accessorKey: 'orderCount' },
    { id: 'spent', header: 'Total Spent', accessorKey: 'totalSpent' },
    { id: 'actions', header: 'Actions' }
  ];