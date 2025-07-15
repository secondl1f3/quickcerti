import React, { useState, useEffect } from 'react';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';
import { useAuthStore } from '../store/authStore';

type AuthView = 'signin' | 'signup';

interface AuthWrapperProps {
  onAuthSuccess: () => void;
  initialView?: AuthView;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ 
  onAuthSuccess, 
  initialView = 'signin' 
}) => {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const { isAuthenticated, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state when component mounts
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // If user becomes authenticated, call success callback
    if (isAuthenticated) {
      onAuthSuccess();
    }
  }, [isAuthenticated, onAuthSuccess]);

  const handleSwitchToSignUp = () => {
    setCurrentView('signup');
  };

  const handleSwitchToSignIn = () => {
    setCurrentView('signin');
  };

  const handleAuthSuccess = () => {
    // This will be called when sign in/up is successful
    // The useEffect above will handle the actual navigation
    // since isAuthenticated will become true
  };

  if (currentView === 'signup') {
    return (
      <SignUp 
        onSignInClick={handleSwitchToSignIn}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <SignIn 
      onSignUpClick={handleSwitchToSignUp}
      onSuccess={handleAuthSuccess}
    />
  );
};