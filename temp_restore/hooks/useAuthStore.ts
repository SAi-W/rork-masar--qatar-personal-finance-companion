import { useState, useEffect } from 'react';
import { secureStorage, storage } from '@/lib/storage';
import createContextHook from '@nkzw/create-context-hook';

interface User {
  id: string;
  full_name: string;
  email: string;
  lang: string;
  salary: number;
  salaryDate: number;
  autoAddSalary: boolean;
  salaryAccountId?: string;
  side_income: number;
  onboarding_completed: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasSeenIntro: boolean;
}

interface AuthActions {
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  markIntroSeen: () => Promise<void>;
}

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';
const INTRO_SEEN_KEY = 'intro_seen';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    hasSeenIntro: false,
  });

  const login = async (user: User, token: string) => {
    try {
      // Store sensitive data in secure storage
      await secureStorage.setItem(AUTH_TOKEN_KEY, token);
      await secureStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      
      setState(prev => ({
        ...prev,
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      }));
      
      console.log('User logged in successfully');
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  const logout = async () => {
    try {
      // Clear sensitive data from secure storage
      await secureStorage.removeItem(AUTH_TOKEN_KEY);
      await secureStorage.removeItem(USER_DATA_KEY);
      
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        hasSeenIntro: true, // Keep intro seen after logout
      });
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!state.user) return;
    
    try {
      const updatedUser = { ...state.user, ...userData };
      // Update user data in secure storage
      await secureStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
      }));
      
      console.log('User data updated successfully');
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      // Check for auth token and user data in secure storage
      const [token, userData] = await Promise.all([
        secureStorage.getItem(AUTH_TOKEN_KEY),
        secureStorage.getItem(USER_DATA_KEY),
      ]);

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setState(prev => ({
            ...prev,
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
          }));
          console.log('User authenticated from storage');
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          await logout();
        }
      } else {
        // Check for intro seen in regular storage
        const introSeen = await storage.getItem(INTRO_SEEN_KEY);
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasSeenIntro: !!introSeen,
        }));
        console.log('No auth data found, intro seen:', !!introSeen);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const markIntroSeen = async () => {
    try {
      // Store intro seen in regular storage (non-sensitive)
      await storage.setItem(INTRO_SEEN_KEY, 'true');
      setState(prev => ({ ...prev, hasSeenIntro: true }));
      console.log('Intro marked as seen');
    } catch (error) {
      console.error('Error marking intro as seen:', error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return {
    ...state,
    login,
    logout,
    updateUser,
    checkAuthStatus,
    markIntroSeen,
  };
});