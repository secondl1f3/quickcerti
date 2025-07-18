import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, AuthResponse, SignUpRequest, SignInRequest, ApiError } from '../services/authService';
import { useUserStore } from './userStore';

export interface User {
  id: string;
  username: string;
  email?: string;
  roles?: string[];
  userProfileId: string;
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

      // Sign up action with automatic profile creation
      signUp: async (userData: SignUpRequest) => {
        set({ isLoading: true, error: null });
        try {
          // Sign up the user (backend automatically creates profile)
          const response: AuthResponse = await authService.signUp(userData);
          
          // Store auth data
          authService.storeAuthData(response);
          
          // Update state
          set({
            isAuthenticated: true,
            user: {
              id: response.id,
              username: response.username,
              email: response.email,
              roles: response.roles,
              userProfileId: response.user_profile_id,
            },
            token: response.accessToken || response.auth_token,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const apiError = error as ApiError;
          let errorMessage = 'Registration failed';
          
          // Provide specific error messages based on the error
          if (apiError.message?.includes('username')) {
            errorMessage = 'Username already taken. Please choose a different username.';
          } else if (apiError.message?.includes('email')) {
            errorMessage = 'Email already registered. Please use a different email or try signing in.';
          } else if (apiError.message) {
            errorMessage = apiError.message;
          }
          
          set({
            isLoading: false,
            error: errorMessage,
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
              id: response.id,
              username: response.username,
              email: response.email,
              roles: response.roles,
              userProfileId: response.user_profile_id,
            },
            token: response.accessToken || response.auth_token,
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
        
        // Clear user profile from userStore
        const { clearProfile } = useUserStore.getState();
        clearProfile();
        
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
        const userId = authService.getStoredUserId();
        const userProfileId = authService.getStoredUserProfileId();
        const userData = authService.getStoredUserData();

        if (token && userId && userProfileId && userData) {
          set({
            isAuthenticated: true,
            user: {
              ...userData,
              id: userId,
              userProfileId: userProfileId,
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