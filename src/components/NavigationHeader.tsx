import React from 'react';
import { ArrowLeft, Home, FileText, Edit3 } from 'lucide-react';
import { UserProfile } from './UserProfile';

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
  onViewProfile?: () => void;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentStep,
  steps,
  onBack,
  onHome,
  onViewProfile,
  showBackButton = true,
  showHomeButton = true,
}) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

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

      {/* Right side - Home button and User Profile */}
      <div className="flex items-center space-x-3">
        {showHomeButton && onHome && (
          <button
            onClick={onHome}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm font-medium">Beranda</span>
          </button>
        )}
        
        <div className="w-px h-6 bg-gray-300" />
        
        <UserProfile onViewProfile={onViewProfile} />
      </div>
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