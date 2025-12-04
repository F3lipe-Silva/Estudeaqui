// src/models/User.ts
import { ObjectId } from 'mongodb';

// Interface para o usuário no sistema
export interface User {
  _id?: ObjectId;  // ID do MongoDB (para quando o usuário é armazenado no MongoDB)
  uid?: string;    // ID do Firebase Auth (para compatibilidade com o sistema antigo)
  email: string;
  password?: string; // hashed (opcional, dependendo da implementação)
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
  emailVerified?: boolean;
  lastLoginAt?: Date;
  isActive?: boolean;
}

// Interface para operações de login
export interface LoginCredentials {
  email: string;
  password: string;
}

// Interface para registro de novo usuário
export interface RegisterCredentials extends LoginCredentials {
  name: string;
}