// src/app/api/auth/me/route.ts
import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-utils-server';
import { AuthService } from '@/services/auth-service';

export async function GET(request: NextRequest) {
  try {
    // Obter o token do cabeçalho de autorização ou de onde for apropriado
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return Response.json(
        { error: 'Token de autenticação ausente' },
        { status: 401 }
      );
    }

    // Verificar o token
    const tokenPayload: any = await verifyToken(token);
    if (!tokenPayload) {
      return Response.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    // Obter o ID do usuário do token
    const userId = tokenPayload.userId;
    if (!userId) {
      return Response.json(
        { error: 'ID do usuário ausente no token' },
        { status: 401 }
      );
    }

    // Usar o AuthService para obter os detalhes do usuário (isso irá usar o servidor)
    // Mas, para evitar o uso do MongoDB no cliente, vamos implementar isso diretamente
    // com o getDatabase já que esta é uma rota server-side
    const { getDatabase } = await import('@/lib/db');
    const { ObjectId } = await import('mongodb');
    
    const db = await getDatabase();
    const collection = db.collection('users');
    
    const user = await collection.findOne({ 
      _id: new ObjectId(userId),
      isActive: true 
    });

    if (!user) {
      return Response.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    // Remover a senha do objeto retornado
    const { password, ...userWithoutPassword } = user;
    
    return Response.json({
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Erro na rota de usuário autenticado:', error);
    return Response.json(
      { error: error.message || 'Erro ao obter informações do usuário' },
      { status: 500 }
    );
  }
}