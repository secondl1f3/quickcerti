import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ArrowLeft, 
  MessageCircle,
  Building2,
  CreditCard,
  Hash
} from 'lucide-react';
import { usePointStore } from '../store/pointStore';
import { 
  formatRupiah, 
  calculateTotalPrice, 
  generateWhatsAppConfirmationURL, 
  BANK_DETAILS,
  TransactionStatus
} from '../services/pointService';

export const PaymentWaiting: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const { currentTransaction, isLoading, error, fetchTransactionById, clearError } = usePointStore();
  
  const [copiedField, setCopiedField] = useState<string>('');
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  useEffect(() => {
    if (transactionId) {
      fetchTransactionById(transactionId);
    }
  }, [transactionId, fetchTransactionById]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleWhatsAppConfirmation = () => {
    if (transactionId) {
      const whatsappURL = generateWhatsAppConfirmationURL(transactionId);
      window.open(whatsappURL, '_blank');
      setPaymentSubmitted(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-orange-600 bg-orange-100';
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      case 'FAILED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return paymentSubmitted ? 'PENDING ADMIN CONFIRMATION' : 'PENDING PAYMENT';
      case 'COMPLETED':
        return 'PAYMENT COMPLETED';
      case 'FAILED':
        return 'PAYMENT FAILED';
      default:
        return 'UNKNOWN';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  // Create a fallback transaction if API call fails but we have a transaction ID
  const fallbackTransaction = {
    id: transactionId || '',
    userId: '',
    type: 'PURCHASE' as const,
    amount: 1000, // Default amount
    description: 'Point Purchase',
    status: 'PENDING' as const,
    createdAt: new Date().toISOString(),
    confirmedAt: null
  };

  const transaction = currentTransaction || (transactionId ? fallbackTransaction : null);

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Transaction Not Found</h2>
          <p className="text-gray-600 mb-4">The requested transaction could not be found.</p>
          <button
            onClick={() => navigate('/buy-points')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Back to Buy Points
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice(transaction.amount);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Transaction Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-emerald-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Payment Instructions</h1>
                  <p className="text-gray-600">Complete your point purchase</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                 {getStatusText(transaction.status)}
               </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {/* Demo Mode Notice */}
          {!currentTransaction && transactionId && (
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center space-x-2 text-blue-800">
                <AlertCircle className="w-5 h-5" />
                <span>Demo Mode: Using sample transaction data. In production, this would fetch real transaction details.</span>
              </div>
            </div>
          )}

          {/* Transaction Details */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Transaction Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Transaction Details</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Transaction ID:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">{transaction.id}</span>
                      <button
                        onClick={() => copyToClipboard(transaction.id, 'transactionId')}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {copiedField === 'transactionId' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Points:</span>
                    <span className="font-medium">{transaction.amount.toLocaleString()} points</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-xl font-bold text-emerald-600">{formatRupiah(totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Bank Transfer Details</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Bank Name:</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{BANK_DETAILS.bankName}</span>
                    <button
                      onClick={() => copyToClipboard(BANK_DETAILS.bankName, 'bankName')}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {copiedField === 'bankName' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Account Number:</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-medium">{BANK_DETAILS.accountNumber}</span>
                    <button
                      onClick={() => copyToClipboard(BANK_DETAILS.accountNumber, 'accountNumber')}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {copiedField === 'accountNumber' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Account Name:</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{BANK_DETAILS.accountName}</span>
                    <button
                      onClick={() => copyToClipboard(BANK_DETAILS.accountName, 'accountName')}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {copiedField === 'accountName' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-blue-900 mb-4">Payment Instructions</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Transfer the exact amount <strong>{formatRupiah(totalPrice)}</strong> to the bank account above</li>
                <li>Keep your transfer receipt/proof of payment</li>
                <li>Click the "Confirm Payment via WhatsApp" button below</li>
                <li>Send your payment proof through WhatsApp</li>
                <li>Wait for admin confirmation (usually within 24 hours)</li>
                <li>Your points will be added to your account once confirmed</li>
              </ol>
            </div>

            {/* WhatsApp Confirmation Button */}
            {transaction.status === 'PENDING' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">Confirm Payment via WhatsApp</h3>
                </div>
                <p className="text-green-700 mb-4">
                  Click the button below to send a WhatsApp message to our admin with your payment confirmation.
                </p>
                <button
                  onClick={handleWhatsAppConfirmation}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Send WhatsApp Confirmation</span>
                </button>
              </div>
            )}

            {/* Status Messages */}
            {paymentSubmitted && transaction.status === 'PENDING' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Payment confirmation sent!</span>
                </div>
                <p className="text-green-700 mt-2">
                  Your payment confirmation has been sent via WhatsApp. Please wait for admin verification.
                </p>
              </div>
            )}

            {transaction.status === 'COMPLETED' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Payment completed!</span>
                </div>
                <p className="text-green-700 mt-2">
                  Your payment has been confirmed and {transaction.amount} points have been added to your account.
                </p>
              </div>
            )}

            {transaction.status === 'FAILED' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                <div className="flex items-center space-x-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Payment failed</span>
                </div>
                <p className="text-red-700 mt-2">
                  Your payment failed. Please contact support or try again with a new transaction.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};