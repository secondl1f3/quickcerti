import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onRedirectToAuth?: () => void;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children, 
  fallback, 
  onRedirectToAuth 
}) => {
  const { isAuthenticated, user, initializeAuth } = useAuthStore();

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

  // Check if user is authenticated
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return null;
  }
  console.log(user);

  // Check if user has admin role
  const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('ROLE_ADMIN');
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this admin area.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};