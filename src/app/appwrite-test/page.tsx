'use client';

import React from 'react';
import { useAppwrite } from '@/contexts/appwrite-context';
import { AppwriteAuth } from '@/components/auth/appwrite-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AppwriteTestPage() {
  const { user, logout } = useAppwrite();

  if (!user) {
    return <AppwriteAuth />;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Bem-vindo ao EstudeAqui!</CardTitle>
          <CardDescription>Você está autenticado com Appwrite</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Informações do Usuário:</h3>
            <p><strong>ID:</strong> {user.$id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Nome:</strong> {user.name}</p>
          </div>
          
          <div className="pt-4">
            <h3 className="font-semibold mb-2">Próximos passos:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Configure o banco de dados executando: node scripts/setup-appwrite.js</li>
              <li>Crie cursos e lições usando o painel do Appwrite</li>
              <li>Implemente as funcionalidades de CRUD nos componentes</li>
              <li>Adicione autenticação social se necessário</li>
            </ul>
          </div>

          <Button onClick={logout} variant="outline" className="mt-4">
            Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
