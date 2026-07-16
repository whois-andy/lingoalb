'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

/**
 * Wrap any page with this to protect it.
 * Waits for Zustand to hydrate from localStorage before checking auth.
 * Never flashes to login while data is loading.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return; // Wait for localStorage to load
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [_hasHydrated, isAuthenticated]);

  // Show blank screen while hydrating — prevents flash of login page
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — show nothing while redirect happens
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
