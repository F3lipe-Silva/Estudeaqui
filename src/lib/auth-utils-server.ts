// src/lib/auth-utils-server.ts
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development';

// Função para gerar token JWT
export async function generateToken(payload: any): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  return token;
}

// Função para verificar token JWT
export async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const verified = await jwtVerify(token, secret);
    return verified.payload;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return null;
  }
}

// Função para obter o usuário autenticado a partir do cookie (server-side)
export async function getAuthUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  return payload;
}

// Função para definir o cookie de autenticação (server-side)
export function setAuthCookie(token: string) {
  cookies().set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 semana
    path: '/',
    sameSite: 'strict',
  });
}

// Função para remover o cookie de autenticação (server-side)
export function clearAuthCookie() {
  cookies().delete('auth_token');
}