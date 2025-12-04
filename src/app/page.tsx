
"use client";
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/app-layout';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
       <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="text-lg font-semibold">Carregando...</div>
      </div>
    );
  }

  return (
    <AppLayout />
  );
}
