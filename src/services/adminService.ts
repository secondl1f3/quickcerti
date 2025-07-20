const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Admin-specific interfaces
export interface AdminStats {
  totalUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  pendingPayments: number;
  activeUsers: number;
  certificatesGenerated: number;
  monthlyRevenue: number[];
  userGrowth: number[];
}

export interface PendingPayment {
  id: string;
  userId: string;
  username: string;
  email: string;
  amount: number;
  points: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  paymentProof?: string;
  description: string;
}

export interface UserManagement {
  id: string;
  username: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  totalPoints: number;
  totalSpent: number;
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

// Get admin dashboard statistics
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const response = await fetch(`${BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch admin stats: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

// Get pending payments for approval
export const getPendingPayments = async (): Promise<PendingPayment[]> => {
  try {
    const response = await fetch(`${BASE_URL}/admin/payments/pending`, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch pending payments: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    throw error;
  }
};

// Approve a payment
export const approvePayment = async (paymentId: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/admin/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: createHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to approve payment: ${response.status}`);
    }
  } catch (error) {
    console.error('Error approving payment:', error);
    throw error;
  }
};

// Reject a payment
export const rejectPayment = async (paymentId: string, reason?: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/admin/payments/${paymentId}/reject`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to reject payment: ${response.status}`);
    }
  } catch (error) {
    console.error('Error rejecting payment:', error);
    throw error;
  }
};

// Get all users for management
export const getAllUsers = async (): Promise<UserManagement[]> => {
  try {
    const response = await fetch(`${BASE_URL}/admin/users`, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch users: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update user status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// Update user roles
export const updateUserRoles = async (userId: string, roles: string[]): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/admin/users/${userId}/roles`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify({ roles }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update user roles: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating user roles:', error);
    throw error;
  }
};