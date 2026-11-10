'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <p className="text-sm font-medium text-slate-400">Loading PulseDesk...</p>
      </div>
    </div>
  );
}
