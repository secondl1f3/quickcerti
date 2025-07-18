import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, UpdateUserProfileRequest, getUserProfile, updateUserProfile } from '../services/userService';

interface UserState {
  // State
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
  
  // Actions
  fetchUserProfile: () => Promise<void>;
  updateProfile: (userId: string, profileData: UpdateUserProfileRequest) => Promise<void>;
  clearError: () => void;
  clearProfile: () => void;
  setProfile: (profile: UserProfile) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: null,
      isLoading: false,
      error: null,
      isUpdating: false,

      // Fetch user profile
      fetchUserProfile: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const profile = await getUserProfile();
          set({ profile, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user profile';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Update user profile
      updateProfile: async (userId: string, profileData: UpdateUserProfileRequest) => {
        set({ isUpdating: true, error: null });
        
        try {
          const updatedProfile = await updateUserProfile(userId, profileData);
          set({ profile: updatedProfile, isUpdating: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update user profile';
          set({ error: errorMessage, isUpdating: false });
          throw error;
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Clear profile (for logout)
      clearProfile: () => {
        set({ profile: null, error: null, isLoading: false, isUpdating: false });
      },

      // Set profile directly (for initial data)
      setProfile: (profile: UserProfile) => {
        set({ profile });
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);