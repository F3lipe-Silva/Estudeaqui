
'use client';

import { ThemeProvider } from '@/contexts/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { AppwriteProvider } from '@/contexts/appwrite-context';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <AppwriteProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AppwriteProvider>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
