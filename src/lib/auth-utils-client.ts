// src/lib/auth-utils-client.ts
// Function to decode JWT without verification - just to check if it's a valid JWT format
function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    // Add padding if needed
    const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const decoded = atob(paddedPayload);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Erro ao decodificar token JWT:', error);
    return null;
  }
}

// Função para verificar token JWT (client-side - apenas verificação, não geração)
export async function verifyToken(token: string) {
  try {
    // Decode the token without verification to check if it's a valid JWT
    const decoded = decodeJWT(token);

    if (!decoded) {
      return null;
    }

    // Check if the token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return null;
  }
}

// Função para armazenar o token no localStorage (client-side)
export function setAuthStorage(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

// Função para obter o token do localStorage (client-side)
export function getAuthStorage() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

// Função para remover o token do localStorage (client-side)
export function clearAuthStorage() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}