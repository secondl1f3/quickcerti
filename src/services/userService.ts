import { authService } from './authService';

const BASE_URL = 'http://localhost:8080';

export interface UserProfile {
  id: string;
  phone?: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  pointsBalance: number;
  totalPointsPurchased: number;
  totalPointsUsed: number;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserProfileRequest {
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  pointsBalance?: number;
  totalPointsPurchased?: number;
  totalPointsUsed?: number;
}

// Helper function to create headers with authorization
const createHeaders = (contentType = 'application/json') => {
  const token = authService.getStoredToken();
  const headers: Record<string, string> = {};
  
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Get user profile by ID
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await fetch(`${BASE_URL}/api/user-profiles/me`, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch user profile: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string, 
  profileData: UpdateUserProfileRequest
): Promise<UserProfile> => {
  try {
    const response = await fetch(`${BASE_URL}/api/user-profiles/${userId}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update user profile: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};



export const uploadAvatar = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    // Create headers without Content-Type for FormData uploads
    const token = authService.getStoredToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${BASE_URL}/api/upload/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to upload avatar: ${response.status}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};