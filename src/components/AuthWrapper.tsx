'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export default function AuthWrapper({
  children,
  requireAuth = true,
  redirectTo = '/login',
  fallback
}: AuthWrapperProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) {
      return;
    }

    if (requireAuth) {
      // Route requires authentication
      if (!isAuthenticated) {
        console.log('AuthWrapper: Not authenticated, redirecting to:', redirectTo);
        router.push(redirectTo);
        return;
      }

      // User is authenticated, allow rendering
      setShouldRender(true);
    } else {
      // Route doesn't require auth (like login page)
      if (isAuthenticated) {
        // User is already authenticated, redirect away from login
        console.log('AuthWrapper: Already authenticated, redirecting to home');
        router.push('/');
        return;
      }

      // User is not authenticated, allow rendering (login page)
      setShouldRender(true);
    }
  }, [isAuthenticated, isLoading, requireAuth, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <svg
              className="animate-spin h-12 w-12 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Loading BlinkDX
              </h2>
              <p className="text-gray-500">
                Checking authentication...
              </p>
            </div>
          </div>
        </div>
      )
    );
  }

  // Don't render children if conditions are not met
  if (!shouldRender) {
    return null;
  }

  // Render children when conditions are satisfied
  return <>{children}</>;
}

// Higher-order component for easier usage
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthWrapperProps, 'children'> = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthWrapper {...options}>
        <Component {...props} />
      </AuthWrapper>
    );
  };
}

// Pre-configured wrappers for common use cases
export function ProtectedPage({ children, ...props }: Omit<AuthWrapperProps, 'requireAuth'>) {
  return (
    <AuthWrapper requireAuth={true} {...props}>
      {children}
    </AuthWrapper>
  );
}

export function PublicPage({ children, ...props }: Omit<AuthWrapperProps, 'requireAuth'>) {
  return (
    <AuthWrapper requireAuth={false} {...props}>
      {children}
    </AuthWrapper>
  );
}
