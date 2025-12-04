// src/app/api/auth/register/route.ts
import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { generateToken } from '@/lib/auth-utils-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return Response.json(
        { error: 'E-mail, senha e nome são obrigatórios' },
        { status: 400 }
      );
    }

    // Validação básica de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'E-mail inválido' },
        { status: 400 }
      );
    }

    // Validação de senha (mínimo de 6 caracteres)
    if (password.length < 6) {
      return Response.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection('users');

    // Verificar se o usuário já existe
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return Response.json(
        { error: 'Usuário com este e-mail já existe' },
        { status: 409 } // Conflict
      );
    }

    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser: User = {
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: false,
      isActive: true
    };

    const result = await collection.insertOne(newUser);
    const insertedUser = await collection.findOne({ _id: result.insertedId });

    if (!insertedUser) {
      return Response.json(
        { error: 'Erro ao registrar usuário' },
        { status: 500 }
      );
    }

    // Gerar token JWT
    const tokenPayload = { userId: insertedUser._id.toString(), email: insertedUser.email };
    const token = await generateToken(tokenPayload);

    // Remover informações sensíveis antes de retornar
    const { password: _, ...userWithoutPassword } = insertedUser;

    return Response.json({
      message: 'Registro bem-sucedido',
      user: userWithoutPassword,
      token,
      success: true
    });
  } catch (error: any) {
    console.error('Erro na rota de registro:', error);
    return Response.json(
      { error: error.message || 'Erro ao registrar usuário' },
      { status: 500 }
    );
  }
}