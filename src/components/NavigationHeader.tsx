import React, { useState } from 'react';
import { ArrowLeft, Home, FileText, Edit3, LogOut, User, Coins, History, Bug } from 'lucide-react';
import { AuthTest } from './AuthTest';

interface NavigationStep {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface NavigationHeaderProps {
  currentStep: string;
  steps: NavigationStep[];
  onBack?: () => void;
  onHome?: () => void;
  onProfile?: () => void;
  onBuyPoints?: () => void;
  onTransactionHistory?: () => void;
  onSignOut?: () => void;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentStep,
  steps,
  onBack,
  onHome,
  onProfile,
  onBuyPoints,
  onTransactionHistory,
  onSignOut,
  showBackButton = true,
  showHomeButton = true,
}) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const [showAuthTest, setShowAuthTest] = useState(false);
  
  // Only show debug button in development
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* Left side - Back button and breadcrumb */}
      <div className="flex items-center space-x-4">
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Kembali</span>
          </button>
        )}
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isClickable = step.onClick && index <= currentStepIndex;
            
            return (
              <React.Fragment key={step.id}>
                {index > 0 && (
                  <span className="text-gray-400">/</span>
                )}
                <button
                  onClick={isClickable ? step.onClick : undefined}
                  disabled={!isClickable}
                  className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                    isActive
                      ? 'text-emerald-600 bg-emerald-50 font-medium'
                      : isClickable
                      ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {step.icon && <span className="w-4 h-4">{step.icon}</span>}
                  <span>{step.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center space-x-2">
        {showHomeButton && onHome && (
          <button
            onClick={onHome}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Home"
          >
            <Home className="w-4 h-4" />
          </button>
        )}
        
        {/* Debug button - only in development */}
        {isDevelopment && (
          <button
            onClick={() => setShowAuthTest(true)}
            className="flex items-center space-x-2 px-3 py-2 text-orange-600 hover:text-orange-900 hover:bg-orange-100 rounded-lg transition-colors"
            title="Test API Authentication"
          >
            <Bug className="w-4 h-4" />
          </button>
        )}
        {onProfile && (
          <button
            onClick={onProfile}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">Profil</span>
          </button>
        )}
        {onBuyPoints && (
          <button
            onClick={onBuyPoints}
            className="flex items-center space-x-2 px-3 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <Coins className="w-4 h-4" />
            <span className="text-sm font-medium">Beli Poin</span>
          </button>
        )}
        {onTransactionHistory && (
          <button
            onClick={onTransactionHistory}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <History className="w-4 h-4" />
            <span className="text-sm font-medium">Riwayat Transaksi</span>
          </button>
        )}
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Keluar</span>
          </button>
        )}
      </div>
      
      {/* Auth Test Modal */}
      {showAuthTest && (
        <AuthTest onClose={() => setShowAuthTest(false)} />
      )}
    </div>
  );
};

// Predefined navigation steps for the application
export const APP_NAVIGATION_STEPS: NavigationStep[] = [
  {
    id: 'landing',
    label: 'Beranda',
    icon: <Home className="w-4 h-4" />,
  },
  {
    id: 'template-selection',
    label: 'Pilih Template',
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: 'editor',
    label: 'Editor Sertifikat',
    icon: <Edit3 className="w-4 h-4" />,
  },
];