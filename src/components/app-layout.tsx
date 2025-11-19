
"use client";

import AppHeader from './app-header';
import BottomNavigationBar from './bottom-navigation-bar';
import { useAuth } from '@/contexts/auth-context';
import { StudyProvider } from '@/contexts/study-context';
import MainContent from './main-content';
import { SidebarProvider } from '@/contexts/sidebar-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AppLayout() {
 const { user, loading } = useAuth();
 const router = useRouter();
 
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

 if (loading || !user) {
    // This can show a loader while auth state is being determined
    return (
       <div className="flex h-screen items-center justify-center">
         <div className="text-lg font-semibold">Verificando autenticação...</div>
       </div>
    );
 }

  return (
    <StudyProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full flex-col bg-background font-body">
          <AppHeader />
          <div className="flex flex-1 w-full">{<MainContent />}</div>
          <BottomNavigationBar />
        </div>
      </SidebarProvider>
    </StudyProvider>
  );
}
