import { create } from 'zustand';
import { 
  PointTransaction, 
  CreatePointTransactionRequest,
  createPointTransaction,
  getUserPointTransactions,
  getPointTransactionById
} from '../services/pointService';
import { getUserProfile } from '../services/userService';

interface PointState {
  // State
  transactions: PointTransaction[];
  currentTransaction: PointTransaction | null;
  userPoints: number;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  
  // Actions
  createTransaction: (transactionData: CreatePointTransactionRequest) => Promise<PointTransaction>;
  fetchUserTransactions: () => Promise<void>;
  fetchTransactionById: (transactionId: string) => Promise<void>;
  fetchUserPoints: () => Promise<void>;
  clearError: () => void;
  clearCurrentTransaction: () => void;
}

export const usePointStore = create<PointState>((set, get) => ({
  // Initial state
  transactions: [],
  currentTransaction: null,
  userPoints: 0,
  isLoading: false,
  isCreating: false,
  error: null,

  // Create a new point transaction
  createTransaction: async (transactionData: CreatePointTransactionRequest) => {
    set({ isCreating: true, error: null });
    
    try {
      const transaction = await createPointTransaction(transactionData);
      set({ 
        currentTransaction: transaction, 
        isCreating: false,
        transactions: [transaction, ...get().transactions]
      });
      return transaction;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create point transaction';
      set({ error: errorMessage, isCreating: false });
      throw error;
    }
  },

  // Fetch user's point transactions
  fetchUserTransactions: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const transactions = await getUserPointTransactions();
      set({ transactions, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch point transactions';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Fetch a specific transaction by ID
  fetchTransactionById: async (transactionId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const transaction = await getPointTransactionById(transactionId);
      set({ currentTransaction: transaction, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch point transaction';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },

  // Fetch user's current point balance
  fetchUserPoints: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const userProfile = await getUserProfile();
      set({ userPoints: userProfile.pointsBalance, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user points';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Clear current transaction
  clearCurrentTransaction: () => {
    set({ currentTransaction: null });
  },
}));