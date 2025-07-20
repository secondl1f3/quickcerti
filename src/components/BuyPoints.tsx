import React, { useState } from 'react';
import { Coins, CreditCard, AlertCircle, Loader2, ArrowRight, History } from 'lucide-react';
import { usePointStore } from '../store/pointStore';
import { useAuthStore } from '../store/authStore';
import { calculateTotalPrice, formatRupiah } from '../services/pointService';
import { useNavigate } from 'react-router-dom';

interface BuyPointsProps {
  onClose?: () => void;
}

export const BuyPoints: React.FC<BuyPointsProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createTransaction, isCreating, error, clearError } = usePointStore();
  
  const [pointAmount, setPointAmount] = useState<number>(50);
  const [validationError, setValidationError] = useState<string>('');

  // Predefined point packages
  const pointPackages = [
    { points: 50, popular: false },
    { points: 100, popular: true },
    { points: 250, popular: false },
    { points: 500, popular: false },
    { points: 1000, popular: false },
  ];

  const totalPrice = calculateTotalPrice(pointAmount);

  const validateInput = (value: number): boolean => {
    if (value < 1) {
      setValidationError('Minimum purchase is 1 point');
      return false;
    }
    if (value > 10000) {
      setValidationError('Maximum purchase is 10,000 points');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handlePointAmountChange = (value: number) => {
    setPointAmount(value);
    validateInput(value);
    if (error) clearError();
  };

  const handlePackageSelect = (points: number) => {
    setPointAmount(points);
    validateInput(points);
    if (error) clearError();
  };

  const handleConfirmPurchase = async () => {
    if (!user?.id) {
      setValidationError('User not authenticated');
      return;
    }

    if (!validateInput(pointAmount)) {
      return;
    }

    try {
      const transaction = await createTransaction({
        userId: user.id,
        type: 'PURCHASE',
        amount: pointAmount,
        description: `Pending purchase of ${pointAmount} points`,
      });

      // Navigate to payment waiting page
      navigate(`/payment-waiting/${transaction.id}`);
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Purchase Points</h1>
          <p className="text-lg text-gray-500 mt-2">Top up your balance to generate more certificates.</p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Panel: Packages and Custom Amount */}
            <div className="p-8">
              {/* Error Message */}
              {(error || validationError) && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                  <div className="flex items-center space-x-3 text-red-800">
                    <AlertCircle className="w-6 h-6" />
                    <span className="font-medium">{error || validationError}</span>
                  </div>
                </div>
              )}

              {/* Point Packages */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Choose a Package</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {pointPackages.map((pkg) => (
                    <button
                      key={pkg.points}
                      onClick={() => handlePackageSelect(pkg.points)}
                      className={`relative text-center p-4 border-2 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${
                        pointAmount === pkg.points
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                            POPULAR
                          </span>
                        </div>
                      )}
                      <p className="text-2xl font-bold text-gray-900">{pkg.points}</p>
                      <p className="text-xs text-gray-500">points</p>
                      <p className="text-sm font-semibold text-emerald-600 mt-2">
                        {formatRupiah(calculateTotalPrice(pkg.points))}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Or Enter a Custom Amount</h2>
                <div className="relative">
                  <Coins className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    id="pointAmount"
                    value={pointAmount}
                    onChange={(e) => handlePointAmountChange(parseInt(e.target.value) || 0)}
                    min="1"
                    max="10000"
                    className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 ${
                      validationError ? 'border-red-400 ring-red-200' : ''
                    }`}
                    placeholder="e.g., 150"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Minimum: 1 point • Maximum: 10,000 points
                </p>
              </div>
            </div>

            {/* Right Panel: Summary and Payment */}
            <div className="p-8 bg-gray-50 border-l border-gray-200 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
                <div className="space-y-4 text-gray-700">
                  <div className="flex justify-between items-center">
                    <span>Points to purchase</span>
                    <span className="font-semibold text-gray-900">{pointAmount.toLocaleString()} points</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Price per point</span>
                    <span className="font-semibold text-gray-900">{formatRupiah(100)}</span>
                  </div>
                  <div className="border-t border-gray-200 my-4"></div>
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span className="text-gray-800">Total Amount</span>
                    <span className="text-3xl text-emerald-600">{formatRupiah(totalPrice)}</span>
                  </div>
                </div>

                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CreditCard className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Payment Method</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        Payment is processed via manual bank transfer. You'll receive account details after confirming.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <button
                  onClick={handleConfirmPurchase}
                  disabled={isCreating || !!validationError || pointAmount < 1}
                  className="w-full inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 disabled:cursor-wait transition-all duration-300 transform hover:scale-105"
                >
                  {isCreating ? (
                    <Loader2 className="-ml-1 mr-3 h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowRight className="-ml-1 mr-3 h-5 w-5" />
                  )}
                  {isCreating ? 'Processing...' : 'Proceed to Payment'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/transaction-history')}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-sm font-bold rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300"
                >
                  <History className="-ml-1 mr-2 h-5 w-5" />
                  View Transaction History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};