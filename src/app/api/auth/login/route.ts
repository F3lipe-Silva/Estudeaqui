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

    console.log('Tentando conectar ao banco de dados...');
    const db = await getDatabase();
    console.log('Conexão com banco de dados bem-sucedida');

    const collection = db.collection('users');
    console.log('Coleção de usuários acessada');

    // Procurar usuário pelo e-mail
    console.log('Procurando usuário com email:', email);
    const user = await collection.findOne({ email });
    console.log('Usuário encontrado:', !!user);

    if (!user) {
      console.log('Nenhum usuário encontrado com este e-mail');
      return Response.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verificar a senha
    console.log('Verificando a senha...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Senha válida:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Senha incorreta');
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
    const tokenPayload = { userId: user._id.toString(), email: user.email };
    const token = await generateToken(tokenPayload);

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