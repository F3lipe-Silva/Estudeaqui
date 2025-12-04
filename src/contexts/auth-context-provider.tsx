// src/contexts/auth-context-provider.tsx
'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { User } from '@/models/User';
import { AuthService } from '@/services/auth-service';
import {
  verifyToken,
  getAuthStorage,
  setAuthStorage,
  clearAuthStorage
} from '@/lib/auth-utils-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ user: User | null; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para obter os dados do usuário autenticado
  const fetchUserDetails = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { user } = await response.json();
        return user as User;
      } else {
        // Se o token for inválido ou o usuário não existir, o token é inválido
        clearAuthStorage();
        return null;
      }
    } catch (error) {
      console.error('Erro ao obter detalhes do usuário:', error);
      return null;
    }
  };

  // Verificar autenticação ao carregar o provedor
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = getAuthStorage();
        if (token) {
          try {
            // Try to verify the token first (in case it was generated with the same secret)
            const tokenPayload = await verifyToken(token);
            if (tokenPayload) {
              // Token verification succeeded, proceed to fetch user
              const userData = await fetchUserDetails(token);
              if (userData) {
                setUser(userData);
              } else {
                // Token is valid but user not found on server
                clearAuthStorage();
              }
            } else {
              // Token verification failed, but we still have a token so try to fetch user
              // This is a fallback in case the token was created with a different secret
              const userData = await fetchUserDetails(token);
              if (userData) {
                setUser(userData);
              } else {
                // User not found on server, clear auth
                clearAuthStorage();
              }
            }
          } catch (verificationError) {
            // Token verification failed, try to fetch user directly using the token
            console.warn('Token verification failed, attempting direct user fetch:', verificationError);
            const userData = await fetchUserDetails(token);
            if (userData) {
              setUser(userData);
            } else {
              // User not found on server, clear auth
              clearAuthStorage();
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status de autenticação:', error);
        clearAuthStorage();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const signUp = async (email: string, password: string, name: string): Promise<{ user: User | null; error?: string }> => {
    try {
      setLoading(true);
      const userData = await AuthService.register({ email, password, name });
      if (userData) {
        // O token já foi armazenado em AuthService.register
        setUser(userData);
        return { user: userData, error: undefined };
      } else {
        return { user: null, error: 'Erro ao registrar usuário' };
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      return { user: null, error: error.message || 'Erro ao registrar usuário' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ user: User | null; error?: string }> => {
    try {
      setLoading(true);
      const userData = await AuthService.login({ email, password });
      if (userData) {
        // O token já foi armazenado em AuthService.login
        setUser(userData);
        return { user: userData, error: undefined };
      } else {
        return { user: null, error: 'Credenciais inválidas' };
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { user: null, error: error.message || 'Erro ao fazer login' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    clearAuthStorage();
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    // Implementação futura para redefinição de senha
    console.warn('Função de redefinição de senha ainda não implementada para autenticação MongoDB');
    return { success: false, error: 'Função de redefinição de senha ainda não implementada' };
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}