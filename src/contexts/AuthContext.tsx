'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContextType, AuthState, LoginCredentials, LoginResponse, User } from '@/types/Auth';
import AuthService from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from stored data
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = AuthService.getToken();
        const user = AuthService.getUser();

        if (token && user) {
          // Verify token is still valid
          const verification = await AuthService.verifyToken();

          if (verification.valid) {
            setAuthState({
              user: verification.user || user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token is invalid, clear everything
            AuthService.logout();
            setAuthState({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await AuthService.login(credentials);

      if (response.success && response.user && response.token) {
        setAuthState({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }

      return response;
    } catch (error) {
      console.error('Login context error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));

      return {
        success: false,
        message: 'Login failed. Please try again.',
      };
    }
  };

  const logout = () => {
    try {
      AuthService.logout();
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout context error:', error);
      // Still clear the state even if logout fails
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      const verification = await AuthService.verifyToken();

      if (verification.valid && verification.user) {
        setAuthState(prev => ({
          ...prev,
          user: verification.user!,
          isAuthenticated: true,
        }));
      } else {
        // Token is no longer valid
        logout();
      }
    } catch (error) {
      console.error('Auth refresh error:', error);
      logout();
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
