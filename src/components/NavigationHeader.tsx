import React, { useState } from 'react';
import { ArrowLeft, Home, LogOut, User, Coins, History, Bug, Shield } from 'lucide-react';
import { AuthTest } from './AuthTest';
import { useAuthStore } from '../store/authStore';

interface NavigationHeaderProps {
  onBack?: () => void;
  onHome?: () => void;
  onProfile?: () => void;
  onBuyPoints?: () => void;
  onTransactionHistory?: () => void;
  onAdmin?: () => void;
  onSignOut?: () => void;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  onBack,
  onHome,
  onProfile,
  onBuyPoints,
  onTransactionHistory,
  onAdmin,
  onSignOut,
  showBackButton = true,
  showHomeButton = true,
}) => {
  const [showAuthTest, setShowAuthTest] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user } = useAuthStore();

  const isDevelopment = import.meta.env.DEV;
  const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('ADMIN');

  const handleProfileClick = (action?: () => void) => {
    if (action) action();
    setProfileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-md hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            )}
            {showHomeButton && onHome && (
              <button
                onClick={onHome}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                title="Home"
              >
                <Home className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {onBuyPoints && (
              <button
                onClick={onBuyPoints}
                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
              >
                <Coins className="w-5 h-5" />
                <span>Buy Points</span>
              </button>
            )}

            {isAdmin && onAdmin && (
              <button
                onClick={onAdmin}
                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-white bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
              >
                <Shield className="w-5 h-5" />
                <span>Admin</span>
              </button>
            )}

            {isDevelopment && (
              <button
                onClick={() => setShowAuthTest(true)}
                className="p-2 text-orange-600 hover:text-orange-900 hover:bg-orange-100 rounded-full transition-colors"
                title="Test API Authentication"
              >
                <Bug className="w-6 h-6" />
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <User className="w-6 h-6" />
              </button>

              {isProfileMenuOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="menu-button"
                >
                  <div className="py-1" role="none">
                    {onProfile && (
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleProfileClick(onProfile); }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                      >
                        <User className="w-5 h-5" />
                        <span>Profile</span>
                      </a>
                    )}
                    {onTransactionHistory && (
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleProfileClick(onTransactionHistory); }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                      >
                        <History className="w-5 h-5" />
                        <span>Transaction History</span>
                      </a>
                    )}
                    {onSignOut && (
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleProfileClick(onSignOut); }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                        role="menuitem"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAuthTest && <AuthTest onClose={() => setShowAuthTest(false)} />}
    </header>
  );
};