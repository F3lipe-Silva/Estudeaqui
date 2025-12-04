// src/services/auth-service.ts
import { User, LoginCredentials, RegisterCredentials } from '@/models/User';
import { setAuthStorage } from '@/lib/auth-utils-client';

export class AuthService {
  // Método para registrar um novo usuário (chama a API)
  static async register(userData: RegisterCredentials): Promise<User | null> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          name: userData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao registrar usuário');
      }

      // Armazenar o token recebido da resposta da API
      if (data.token) {
        setAuthStorage(data.token);
      }

      return data.user as User;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
    }
  }

  // Método para autenticar um usuário (chama a API)
  static async login(credentials: LoginCredentials): Promise<User | null> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Credenciais inválidas');
      }

      // Armazenar o token recebido da resposta da API
      if (data.token) {
        setAuthStorage(data.token);
      }

      return data.user as User;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }
}