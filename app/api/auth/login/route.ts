// src/app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { LoginCredentials } from '@/models/User';
import bcrypt from 'bcrypt';
import { generateToken } from '@/lib/auth-utils-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: 'E-mail e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection('users');

    // Procurar usuário pelo e-mail
    const user = await collection.findOne({ email });
    if (!user) {
      return Response.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verificar a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return Response.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Atualizar última data de login
    await collection.updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date(), updatedAt: new Date() } }
    );

    // Gerar token JWT
    const token = await generateToken({ userId: user._id.toString(), email: user.email });

    // Remover informações sensíveis antes de retornar
    const { password: _, ...userWithoutPassword } = user;

    return Response.json({
      message: 'Login bem-sucedido',
      user: userWithoutPassword,
      token,
      success: true
    });
  } catch (error: any) {
    console.error('Erro na rota de login:', error);
    return Response.json(
      { error: error.message || 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}