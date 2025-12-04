
'use client';

import { ThemeProvider } from '@/contexts/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"  // Forçar tema claro como padrão para resolver o problema de texto em branco
      enableSystem={true}
      disableTransitionOnChange
    >
      <TooltipProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
