const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Point transaction types
export type TransactionType = 'PURCHASE' | 'USAGE';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface PointTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: TransactionStatus;
  createdAt: string;
  confirmedAt?: string | null;
}

export interface CreatePointTransactionRequest {
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
}

// Helper function to create headers with auth token
const createHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Get token from localStorage if not provided
  const authToken = token || localStorage.getItem('auth_token');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return headers;
};

// Create a new point transaction
export const createPointTransaction = async (transactionData: CreatePointTransactionRequest): Promise<PointTransaction> => {
  try {
    const response = await fetch(`${BASE_URL}/point-transactions`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create point transaction: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating point transaction:', error);
    throw error;
  }
};

// Get user's point transactions
export const getUserPointTransactions = async (): Promise<PointTransaction[]> => {
  try {
    const response = await fetch(`${BASE_URL}/point-transactions`, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch point transactions: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching point transactions:', error);
    throw error;
  }
};

// Get a specific point transaction by ID
export const getPointTransactionById = async (transactionId: string): Promise<PointTransaction> => {
  try {
    const response = await fetch(`${BASE_URL}/point-transactions/${transactionId}`, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch point transaction: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching point transaction:', error);
    throw error;
  }
};

// Helper function to generate WhatsApp URL for payment confirmation
export const generateWhatsAppConfirmationURL = (transactionId: string): string => {
  const phoneNumber = '6281291535163';
  const message = `Hello, I would like to confirm payment for transaction ID: ${transactionId}.`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

// Helper function to format currency in Rupiah
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper function to calculate total price (assuming 1 point = 1000 IDR)
export const calculateTotalPrice = (points: number, p0: number): number => {
  const POINT_PRICE = 100; // 1 point = 100 IDR
  return points * POINT_PRICE;
};

// Bank account details for manual transfer
export const BANK_DETAILS = {
  bankName: 'Bank Central Asia (BCA)',
  accountNumber: '1234567890',
  accountName: 'PT Sakan Labs Innovations',
};