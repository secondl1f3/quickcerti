import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onRedirectToAuth?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback, 
  onRedirectToAuth 
}) => {
  const { isAuthenticated, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from localStorage on component mount
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // If not authenticated and we have a redirect callback, call it
    if (!isAuthenticated && onRedirectToAuth) {
      onRedirectToAuth();
    }
  }, [isAuthenticated, onRedirectToAuth]);

  if (!isAuthenticated) {
    // If a fallback component is provided, render it
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Otherwise, render nothing (the redirect should handle navigation)
    return null;
  }

  return <>{children}</>;
};