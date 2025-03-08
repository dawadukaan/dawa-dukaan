'use client';

import { useState, useEffect } from 'react';
import { 
  FiDollarSign,
  FiCreditCard,
  FiCalendar,
  FiUser,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiDownload,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiClock,
  FiMoreVertical,
  FiExternalLink
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function PaymentsPage() {
  // State variables
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState([]);

  // Fetch payments data
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        
        // Simulating API call with sample data
        setTimeout(() => {
          const samplePayments = [
            {
              id: 'pay-001',
              orderId: 'ORD-12345',
              customerName: 'John Smith',
              customerEmail: 'john@example.com',
              amount: 450.00,
              currency: 'INR',
              method: 'credit_card',
              cardType: 'Visa',
              last4: '4242',
              status: 'completed', // completed, pending, failed, refunded
              refundStatus: null,
              transactionId: 'txn_123456789',
              description: 'Payment for Order #12345',
              metadata: {
                gateway: 'stripe',
                gatewayFee: 13.50
              },
              createdAt: '2023-07-14T10:30:00Z',
              updatedAt: '2023-07-14T10:30:00Z'
            },
            {
              id: 'pay-002',
              orderId: 'ORD-12346',
              customerName: 'Priya Sharma',
              customerEmail: 'priya@example.com',
              amount: 320.00,
              currency: 'INR',
              method: 'upi',
              upiId: 'priya@upi',
              status: 'pending',
              refundStatus: null,
              transactionId: 'txn_123456790',
              description: 'Payment for Order #12346',
              metadata: {
                gateway: 'razorpay',
                gatewayFee: 9.60
              },
              createdAt: '2023-07-14T11:45:00Z',
              updatedAt: '2023-07-14T11:45:00Z'
            },
            {
              id: 'pay-003',
              orderId: 'ORD-12347',
              customerName: 'Rahul Verma',
              customerEmail: 'rahul@example.com',
              amount: 750.00,
              currency: 'INR',
              method: 'netbanking',
              bankName: 'HDFC Bank',
              status: 'completed',
              refundStatus: 'partial',
              refundAmount: 250.00,
              transactionId: 'txn_123456791',
              description: 'Payment for Order #12347',
              metadata: {
                gateway: 'razorpay',
                gatewayFee: 22.50
              },
              createdAt: '2023-07-13T18:20:00Z',
              updatedAt: '2023-07-13T18:20:00Z'
            },
            {
              id: 'pay-004',
              orderId: 'ORD-12348',
              customerName: 'Sarah Wilson',
              customerEmail: 'sarah@example.com',
              amount: 280.00,
              currency: 'INR',
              method: 'wallet',
              walletName: 'PayTM',
              status: 'failed',
              refundStatus: null,
              transactionId: 'txn_123456792',
              description: 'Payment for Order #12348',
              metadata: {
                gateway: 'paytm',
                gatewayFee: 8.40
              },
              createdAt: '2023-07-14T08:15:00Z',
              updatedAt: '2023-07-14T08:15:00Z'
            },
            {
              id: 'pay-005',
              orderId: 'ORD-12349',
              customerName: 'Michael Brown',
              customerEmail: 'michael@example.com',
              amount: 850.00,
              currency: 'INR',
              method: 'credit_card',
              cardType: 'Mastercard',
              last4: '8888',
              status: 'completed',
              refundStatus: 'full',
              refundAmount: 850.00,
              transactionId: 'txn_123456793',
              description: 'Payment for Order #12349',
              metadata: {
                gateway: 'stripe',
                gatewayFee: 25.50
              },
              createdAt: '2023-07-11T14:50:00Z',
              updatedAt: '2023-07-11T16:20:00Z'
            }
          ];
          
          setPayments(samplePayments);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast.error('Failed to load payments');
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'credit_card': return <FiCreditCard className="w-5 h-5" />;
      case 'upi': return <FiDollarSign className="w-5 h-5" />;
      case 'netbanking': return <FiDollarSign className="w-5 h-5" />;
      case 'wallet': return <FiDollarSign className="w-5 h-5" />;
      default: return <FiDollarSign className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatAmount = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const togglePaymentSelection = (id) => {
    setSelectedPayments(prev => 
      prev.includes(id) 
        ? prev.filter(paymentId => paymentId !== id)
        : [...prev, id]
    );
  };

  const toggleAllPayments = () => {
    if (selectedPayments.length === filteredPayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(filteredPayments.map(p => p.id));
    }
  };

  // Filter and sort payments
  const filteredPayments = payments
    .filter(payment => {
      const matchesSearch = 
        payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      
      const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
      
      const matchesDate = dateFilter === 'all' || 
        (dateFilter === 'today' && new Date(payment.createdAt).toDateString() === new Date().toDateString()) ||
        (dateFilter === 'this-week' && new Date(payment.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (dateFilter === 'this-month' && new Date(payment.createdAt).getMonth() === new Date().getMonth());
      
      const matchesAmount = 
        (!amountFilter.min || payment.amount >= parseFloat(amountFilter.min)) &&
        (!amountFilter.max || payment.amount <= parseFloat(amountFilter.max));
      
      return matchesSearch && matchesStatus && matchesMethod && matchesDate && matchesAmount;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.createdAt) - new Date(b.createdAt) 
          : new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'amount') {
        return sortOrder === 'asc' 
          ? a.amount - b.amount 
          : b.amount - a.amount;
      }
      return 0;
    });

  // Calculate totals
  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalRefunds = filteredPayments
    .filter(payment => payment.refundAmount)
    .reduce((sum, payment) => sum + payment.refundAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {/* Handle export */}}
            className="bg-white text-gray-600 px-4 py-2 rounded-lg border hover:bg-gray-50 flex items-center"
          >
            <FiDownload className="w-5 h-5 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white text-gray-600 px-4 py-2 rounded-lg border hover:bg-gray-50 flex items-center"
          >
            <FiFilter className="w-5 h-5 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Payments</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatAmount(totalAmount)}</h3>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <FiDollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Refunds</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatAmount(totalRefunds)}</h3>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <FiRefreshCw className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Payments</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'pending').length}
              </h3>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
              <FiClock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Failed Payments</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'failed').length}
              </h3>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <FiX className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
          <div className="relative w-full md:w-1/3">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center w-full md:w-2/3 justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Methods</option>
              <option value="credit_card">Credit Card</option>
              <option value="upi">UPI</option>
              <option value="netbanking">Net Banking</option>
              <option value="wallet">Wallet</option>
            </select>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
            </select>
            
            <button 
              className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg flex items-center hover:bg-blue-100"
              onClick={() => setSortBy(sortBy === 'amount' ? 'date' : 'amount')}
            >
              {sortBy === 'amount' ? 'Sort by Date' : 'Sort by Amount'}
              <FiChevronDown className={`ml-1 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={amountFilter.min}
                    onChange={(e) => setAmountFilter(prev => ({ ...prev, min: e.target.value }))}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={amountFilter.max}
                    onChange={(e) => setAmountFilter(prev => ({ ...prev, max: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setAmountFilter({ min: '', max: '' });
                  setStatusFilter('all');
                  setMethodFilter('all');
                  setDateFilter('all');
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mr-2"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payments Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading payments...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                      checked={selectedPayments.length === filteredPayments.length && filteredPayments.length > 0}
                      onChange={toggleAllPayments}
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        checked={selectedPayments.includes(payment.id)}
                        onChange={() => togglePaymentSelection(payment.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.orderId}</div>
                      <div className="text-sm text-gray-500">{payment.transactionId}</div>
                      <div className="text-xs text-gray-400">{formatDate(payment.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.customerName}</div>
                      <div className="text-sm text-gray-500">{payment.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatAmount(payment.amount)}
                      </div>
                      {payment.refundAmount && (
                        <div className="text-xs text-red-500">
                          Refunded: {formatAmount(payment.refundAmount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getMethodIcon(payment.method)}
                        <span className="ml-2 text-sm text-gray-900">
                          {payment.method === 'credit_card' 
                            ? `${payment.cardType} ****${payment.last4}`
                            : payment.method === 'upi'
                            ? payment.upiId
                            : payment.method === 'netbanking'
                            ? payment.bankName
                            : payment.walletName
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        <FiExternalLink className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm">
        <div className="flex items-center">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to{' '}
            <span className="font-medium">{Math.min(10, filteredPayments.length)}</span> of{' '}
            <span className="font-medium">{filteredPayments.length}</span> payments
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Previous
          </button>
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}