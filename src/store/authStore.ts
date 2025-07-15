import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, AuthResponse, SignUpRequest, SignInRequest, ApiError } from '../services/authService';

export interface User {
  username: string;
  email?: string;
  roles?: string[];
  user_profile_id: string;
}

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  signUp: (userData: SignUpRequest) => Promise<void>;
  signIn: (credentials: SignInRequest) => Promise<void>;
  signOut: () => void;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Sign up action
      signUp: async (userData: SignUpRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authService.signUp(userData);
          
          // Store auth data
          authService.storeAuthData(response);
          
          // Update state
          set({
            isAuthenticated: true,
            user: {
              username: response.username,
              email: response.email,
              roles: response.roles,
              user_profile_id: response.user_profile_id,
            },
            token: response.auth_token,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const apiError = error as ApiError;
          set({
            isLoading: false,
            error: apiError.message || 'Sign up failed',
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      // Sign in action
      signIn: async (credentials: SignInRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authService.signIn(credentials);
          
          // Store auth data
          authService.storeAuthData(response);
          
          // Update state
          set({
            isAuthenticated: true,
            user: {
              username: response.username,
              email: response.email,
              roles: response.roles,
              user_profile_id: response.user_profile_id,
            },
            token: response.auth_token,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const apiError = error as ApiError;
          set({
            isLoading: false,
            error: apiError.message || 'Sign in failed',
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      // Sign out action
      signOut: () => {
        authService.clearStoredAuth();
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          error: null,
          isLoading: false,
        });
      },

      // Clear error action
      clearError: () => {
        set({ error: null });
      },

      // Initialize auth from stored data
      initializeAuth: () => {
        const token = authService.getStoredToken();
        const userProfileId = authService.getStoredUserProfileId();
        const userData = authService.getStoredUserData();

        if (token && userProfileId && userData) {
          set({
            isAuthenticated: true,
            user: {
              ...userData,
              user_profile_id: userProfileId,
            },
            token,
            error: null,
            isLoading: false,
          });
        } else {
          // Clear any partial data
          authService.clearStoredAuth();
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            error: null,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);