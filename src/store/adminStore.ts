import { create } from 'zustand';
import {
  AdminStats,
  PendingPayment,
  UserManagement,
  getAdminStats,
  getPendingPayments,
  approvePayment,
  rejectPayment,
  getAllUsers,
  updateUserStatus,
  updateUserRoles,
} from '../services/adminService';

interface AdminState {
  // State
  stats: AdminStats | null;
  pendingPayments: PendingPayment[];
  users: UserManagement[];
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  selectedTab: 'dashboard' | 'payments' | 'users';

  // Actions
  setSelectedTab: (tab: 'dashboard' | 'payments' | 'users') => void;
  fetchStats: () => Promise<void>;
  fetchPendingPayments: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  handleApprovePayment: (paymentId: string) => Promise<void>;
  handleRejectPayment: (paymentId: string, reason?: string) => Promise<void>;
  handleUpdateUserStatus: (userId: string, isActive: boolean) => Promise<void>;
  handleUpdateUserRoles: (userId: string, roles: string[]) => Promise<void>;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  // Initial state
  stats: null,
  pendingPayments: [],
  users: [],
  isLoading: false,
  isProcessing: false,
  error: null,
  selectedTab: 'dashboard',

  // Set selected tab
  setSelectedTab: (tab) => {
    set({ selectedTab: tab });
  },

  // Fetch admin statistics
  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await getAdminStats();
      set({ stats, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch admin stats';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Fetch pending payments
  fetchPendingPayments: async () => {
    set({ isLoading: true, error: null });
    try {
      const pendingPayments = await getPendingPayments();
      set({ pendingPayments, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pending payments';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Fetch all users
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await getAllUsers();
      set({ users, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Approve payment
  handleApprovePayment: async (paymentId: string) => {
    set({ isProcessing: true, error: null });
    try {
      await approvePayment(paymentId);
      
      // Update the payment status in local state
      const { pendingPayments } = get();
      const updatedPayments = pendingPayments.map(payment => 
        payment.id === paymentId 
          ? { ...payment, status: 'APPROVED' as const }
          : payment
      );
      
      set({ 
        pendingPayments: updatedPayments.filter(p => p.status === 'PENDING'),
        isProcessing: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve payment';
      set({ error: errorMessage, isProcessing: false });
      throw error;
    }
  },

  // Reject payment
  handleRejectPayment: async (paymentId: string, reason?: string) => {
    set({ isProcessing: true, error: null });
    try {
      await rejectPayment(paymentId, reason);
      
      // Update the payment status in local state
      const { pendingPayments } = get();
      const updatedPayments = pendingPayments.map(payment => 
        payment.id === paymentId 
          ? { ...payment, status: 'REJECTED' as const }
          : payment
      );
      
      set({ 
        pendingPayments: updatedPayments.filter(p => p.status === 'PENDING'),
        isProcessing: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject payment';
      set({ error: errorMessage, isProcessing: false });
      throw error;
    }
  },

  // Update user status
  handleUpdateUserStatus: async (userId: string, isActive: boolean) => {
    set({ isProcessing: true, error: null });
    try {
      await updateUserStatus(userId, isActive);
      
      // Update the user status in local state
      const { users } = get();
      const updatedUsers = users.map(user => 
        user.id === userId 
          ? { ...user, isActive }
          : user
      );
      
      set({ users: updatedUsers, isProcessing: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user status';
      set({ error: errorMessage, isProcessing: false });
      throw error;
    }
  },

  // Update user roles
  handleUpdateUserRoles: async (userId: string, roles: string[]) => {
    set({ isProcessing: true, error: null });
    try {
      await updateUserRoles(userId, roles);
      
      // Update the user roles in local state
      const { users } = get();
      const updatedUsers = users.map(user => 
        user.id === userId 
          ? { ...user, roles }
          : user
      );
      
      set({ users: updatedUsers, isProcessing: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user roles';
      set({ error: errorMessage, isProcessing: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));