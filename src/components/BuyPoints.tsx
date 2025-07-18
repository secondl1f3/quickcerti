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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Error Message */}
          {(error || validationError) && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span>{error || validationError}</span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-6">
            {/* Point Packages */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Packages</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {pointPackages.map((pkg) => (
                  <button
                    key={pkg.points}
                    onClick={() => handlePackageSelect(pkg.points)}
                    className={`relative p-4 border-2 rounded-lg transition-all hover:border-emerald-300 ${
                      pointAmount === pkg.points
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                          Popular
                        </span>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{pkg.points}</div>
                      <div className="text-xs text-gray-600">points</div>
                      <div className="text-sm font-medium text-emerald-600 mt-1">
                        {formatRupiah(calculateTotalPrice(pkg.points))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Amount</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="pointAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Points
                  </label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      id="pointAmount"
                      value={pointAmount}
                      onChange={(e) => handlePointAmountChange(parseInt(e.target.value) || 0)}
                      min="1"
                      max="10000"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                        validationError ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter number of points"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Minimum: 1 point • Maximum: 10,000 points
                  </p>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Points to purchase:</span>
                  <span className="font-medium">{pointAmount.toLocaleString()} points</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price per point:</span>
                  <span className="font-medium">{formatRupiah(1000)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-emerald-600">{formatRupiah(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Payment Method</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    Payment is processed via manual bank transfer. After confirming your purchase, 
                    you'll receive bank account details and can submit payment proof via WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmPurchase}
              disabled={isCreating || !!validationError || pointAmount < 1}
              className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg transition-colors font-medium"
            >
              {isCreating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Confirm Purchase</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By confirming this purchase, you agree to our terms and conditions. 
              Points will be added to your account after payment verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};