'use client';

import { useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthContext from '@/contexts/AuthContext';
import type { AuthContextType, LoginCredentials, User } from '@/types/Auth';

/**
 * Custom hook to access authentication context
 * Provides type safety and ensures the hook is used within AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * Custom hook for login functionality with navigation
 */
export function useLogin() {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const loginWithRedirect = useCallback(
    async (credentials: LoginCredentials, redirectTo: string = '/') => {
      const result = await login(credentials);

      if (result.success) {
        router.push(redirectTo);
      }

      return result;
    },
    [login, router]
  );

  return {
    login: loginWithRedirect,
    isLoading,
  };
}

/**
 * Custom hook for logout functionality with navigation
 */
export function useLogout() {
  const { logout } = useAuth();
  const router = useRouter();

  const logoutWithRedirect = useCallback(
    (redirectTo: string = '/login') => {
      logout();
      router.push(redirectTo);
    },
    [logout, router]
  );

  return logoutWithRedirect;
}

/**
 * Custom hook to check if user has specific role
 */
export function useRole() {
  const { user, isAuthenticated } = useAuth();

  const hasRole = useCallback(
    (role: string): boolean => {
      return isAuthenticated && user?.role === role;
    },
    [isAuthenticated, user]
  );

  const isAdmin = useCallback((): boolean => {
    return hasRole('admin');
  }, [hasRole]);

  const isUser = useCallback((): boolean => {
    return hasRole('user');
  }, [hasRole]);

  return {
    hasRole,
    isAdmin,
    isUser,
    currentRole: user?.role,
  };
}

/**
 * Custom hook for authentication status checks
 */
export function useAuthStatus() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    isReady: !isLoading,
    user,
  };
}

/**
 * Custom hook for protected route logic
 */
export function useProtectedRoute(redirectTo: string = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const checkAuth = useCallback(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
      return false;
    }
    return isAuthenticated;
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return {
    isAuthenticated,
    isLoading,
    checkAuth,
  };
}

/**
 * Custom hook for user profile management
 */
export function useUserProfile() {
  const { user, refreshAuth } = useAuth();

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      // This would typically make an API call to update user profile
      // For now, we'll just refresh the auth state
      console.log('Profile update requested:', updates);
      await refreshAuth();
    },
    [refreshAuth]
  );

  return {
    user,
    updateProfile,
    refreshProfile: refreshAuth,
  };
}

/**
 * Custom hook for authentication error handling
 */
export function useAuthError() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleAuthError = useCallback(
    (error: any, redirectToLogin: boolean = true) => {
      console.error('Authentication error:', error);

      // Check if error is related to authentication
      if (
        error?.response?.status === 401 ||
        error?.response?.status === 403 ||
        error?.message?.includes('token') ||
        error?.message?.includes('auth')
      ) {
        logout();

        if (redirectToLogin) {
          router.push('/login');
        }

        return true; // Indicates auth error was handled
      }

      return false; // Not an auth error
    },
    [logout, router]
  );

  return handleAuthError;
}

/**
 * Custom hook for token management
 */
export function useTokenManager() {
  const { token, refreshAuth } = useAuth();

  const isTokenExpiring = useCallback((): boolean => {
    if (!token) return false;

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

      return exp - now < fiveMinutes;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Assume expiring if we can't parse
    }
  }, [token]);

  const refreshToken = useCallback(async () => {
    try {
      await refreshAuth();
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, [refreshAuth]);

  return {
    token,
    isTokenExpiring,
    refreshToken,
  };
}
