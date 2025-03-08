export function StatusBadge({ status }) {
    const getStatusColor = (status) => {
      switch (status) {
        case 'Completed':
          return 'bg-green-100 text-green-800';
        case 'Processing':
          return 'bg-yellow-100 text-yellow-800';
        case 'Pending':
          return 'bg-blue-100 text-blue-800';
        case 'Cancelled':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };
  
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)}`}>
        {status}
      </span>
    );
  }