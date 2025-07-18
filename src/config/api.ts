// API Configuration
export const API_CONFIG = {
  // Base URL for the API - change this to your actual API endpoint
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  
  // R2 Configuration
  R2_CONFIG: {
    // Your R2 public domain for accessing uploaded files
    PUBLIC_DOMAIN: import.meta.env.VITE_R2_PUBLIC_DOMAIN || 'https://pub-3724d52ae2fc4ec1a79522de68127fa3.r2.dev',
  },
  

};

// Helper function to get the full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get authentication headers
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper function to check if user is authenticated
export const isUserAuthenticated = (): boolean => {
  const token = localStorage.getItem('auth_token');
  const userId = localStorage.getItem('user_id');
  return !!(token && userId);
};

// Helper function to get current user ID
export const getCurrentUserId = (): string | null => {
  return localStorage.getItem('user_id');
};

// Helper function to make authenticated API requests
export const makeAuthenticatedRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  if (!isUserAuthenticated()) {
    throw new Error('User not authenticated');
  }
  
  const url = getApiUrl(endpoint);
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
};