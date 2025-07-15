// Authentication service for handling API calls

const API_BASE_URL = 'http://localhost:8080';

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  role: string[];
}

export interface SignInRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  auth_token: string;
  user_profile_id: string;
  username: string;
  email?: string;
  roles?: string[];
}

export interface ApiError {
  message: string;
  status: number;
}

class AuthService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'An error occurred',
        }));
        throw {
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        } as ApiError;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw {
          message: 'Network error. Please check your connection.',
          status: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  async signUp(userData: SignUpRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Helper method to get stored token
  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Helper method to get stored user profile ID
  getStoredUserProfileId(): string | null {
    return localStorage.getItem('user_profile_id');
  }

  // Helper method to clear stored auth data
  clearStoredAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_profile_id');
    localStorage.removeItem('user_data');
  }

  // Helper method to store auth data
  storeAuthData(authResponse: AuthResponse): void {
    localStorage.setItem('auth_token', authResponse.auth_token);
    localStorage.setItem('user_profile_id', authResponse.user_profile_id);
    localStorage.setItem('user_data', JSON.stringify({
      username: authResponse.username,
      email: authResponse.email,
      roles: authResponse.roles,
    }));
  }

  // Helper method to get stored user data
  getStoredUserData(): any | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const userProfileId = this.getStoredUserProfileId();
    return !!(token && userProfileId);
  }
}

export const authService = new AuthService();