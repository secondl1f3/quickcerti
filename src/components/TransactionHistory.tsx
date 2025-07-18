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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading transaction history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          {/* Error Message */}
          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | 'ALL')}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Type:</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'ALL')}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="ALL">All Types</option>
                  <option value="PURCHASE">Purchase</option>
                  <option value="USAGE">Usage</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Transaction List */}
          <div className="px-6 py-6">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600">
                  {transactions.length === 0 
                    ? "You haven't made any transactions yet." 
                    : "No transactions match your current filters."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(transaction)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                {transaction.type === 'PURCHASE' ? 'Point Purchase' : 'Point Usage'}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                                {transaction.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{transaction.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {transaction.type === 'PURCHASE' ? '+' : '-'}{transaction.amount.toLocaleString()} points
                            </span>
                            {transaction.type === 'PURCHASE' && (
                              <span className="text-sm text-gray-600">
                                ({formatRupiah(calculateTotalPrice(transaction.amount))})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatDate(transaction.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction)}`}>
                            {getStatusText(transaction)}
                          </span>
                          
                          {transaction.type === 'PURCHASE' && (
                            <button
                              onClick={() => handleViewTransaction(transaction.id)}
                              className="flex items-center space-x-1 px-3 py-1 text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">View</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};