'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Se o usuário não estiver autenticado e tentar acessar uma rota protegida
    if (!user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, router, pathname]);

  // Se o usuário estiver autenticado, mostra o conteúdo
  if (user) {
    return <>{children}</>;
  }

  // Se o usuário não estiver autenticado e estiver na página de login, mostra o conteúdo
  if (!user && pathname === '/login') {
    return <>{children}</>;
  }

  // Enquanto estiver verificando o estado de autenticação
  return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
}