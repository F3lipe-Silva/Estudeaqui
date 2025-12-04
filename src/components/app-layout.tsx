
"use client";

import AppHeader from './app-header';
import BottomNavigationBar from './bottom-navigation-bar';
import Sidebar from './sidebar';
import { useAuth } from '@/contexts/auth-context';
import { StudyProvider } from '@/contexts/study-context';
import MainContent from './main-content';
import { SidebarProvider } from '@/contexts/sidebar-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

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
        <div className="flex min-h-screen w-full bg-background font-body overflow-x-hidden">
          {/* Desktop Sidebar - Fixed on desktop, hidden on mobile */}
          <div className="hidden md:flex md:w-64 md:flex-shrink-0 md:fixed md:h-screen md:z-40">
            <Sidebar />
          </div>

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col min-w-0 md:ml-64">
            <AppHeader />
            <div className="flex flex-1 w-full overflow-x-hidden pb-[5rem] md:pb-0 pt-16">
              <MainContent />
            </div>
            <BottomNavigationBar />
          </div>
        </div>
      </SidebarProvider>
    </StudyProvider>
  );
}
