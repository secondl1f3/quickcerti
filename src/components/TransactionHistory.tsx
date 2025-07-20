import React, { useEffect, useState } from 'react';
import { 
  History, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Eye, 
  RefreshCw,
  Filter,
  Calendar
} from 'lucide-react';
import { usePointStore } from '../store/pointStore';
import { formatRupiah, calculateTotalPrice, TransactionStatus, TransactionType } from '../services/pointService';
import { useNavigate } from 'react-router-dom';

interface TransactionHistoryProps {
  onClose?: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { transactions, isLoading, error, fetchUserTransactions, clearError } = usePointStore();
  
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL');

  useEffect(() => {
    fetchUserTransactions();
  }, [fetchUserTransactions]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const getStatusIcon = (transaction: any) => {
    switch (transaction.status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (transaction: any) => {
    switch (transaction.status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (transaction: any) => {
    switch (transaction.status) {
      case 'PENDING':
        return 'Pending';
      case 'COMPLETED':
        return 'Completed';
      case 'FAILED':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const getTypeColor = (type: TransactionType) => {
    switch (type) {
      case 'PURCHASE':
        return 'text-emerald-600 bg-emerald-100';
      case 'USAGE':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const statusMatch = statusFilter === 'ALL' || transaction.status === statusFilter;
    const typeMatch = typeFilter === 'ALL' || transaction.type === typeFilter;
    return statusMatch && typeMatch;
  });

  const handleViewTransaction = (transactionId: string) => {
    navigate(`/payment-waiting/${transactionId}`);
  };

  const handleRefresh = () => {
    fetchUserTransactions();
  };

  if (isLoading && transactions.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-700">Loading Transactions</h2>
          <p className="text-gray-500 mt-2">Please wait while we fetch your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Transaction History</h1>
          <p className="mt-2 text-lg text-gray-600">Review your recent purchases and usage of points.</p>
        </header>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | 'ALL')}
                  className="w-full md:w-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 transition duration-150 ease-in-out"
                >
                  <option value="ALL">All</option>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Type:</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'ALL')}
                  className="w-full md:w-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 transition duration-150 ease-in-out"
                >
                  <option value="ALL">All</option>
                  <option value="PURCHASE">Purchase</option>
                  <option value="USAGE">Usage</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-lg shadow-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-20 px-6">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">No Transactions Found</h3>
                <p className="text-gray-500 mt-2">
                  {transactions.length === 0
                    ? "It looks like you haven't made any transactions yet."
                    : "No transactions match your selected filters. Try adjusting them."}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <li
                    key={transaction.id}
                    className="p-6 hover:bg-gray-50 transition-colors duration-200 ease-in-out"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center bg-gray-100">
                          {getStatusIcon(transaction)}
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-800">
                            {transaction.type === 'PURCHASE' ? `Purchase: ${transaction.amount} Points` : `Usage: ${transaction.amount} Points`}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(transaction.createdAt)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-end md:items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                        <div className="flex items-center gap-4">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction)}`}>
                            {getStatusText(transaction)}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getTypeColor(transaction.type)}`}>
                            {transaction.type}
                          </span>
                        </div>
                        <p className="text-xl font-bold text-gray-800 w-full md:w-auto text-right">
                          {transaction.type === 'PURCHASE' ? formatRupiah(calculateTotalPrice(transaction.amount, 100)) : '-'}
                        </p>
                        {transaction.status === 'PENDING' && (
                          <button
                            onClick={() => handleViewTransaction(transaction.id)}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};