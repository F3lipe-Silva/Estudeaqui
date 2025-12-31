'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, name);
        if (error) throw error;
        toast({
          title: 'Conta Criada!',
          description: 'Verifique seu e-mail para confirmar o cadastro.',
        });
        setIsSignUp(false);
      } else {
        const { error, data } = await signIn(email, password);
        if (error) throw error;
        if (data?.user) {
          // Redirecionar após login bem-sucedido
          router.push('/');
        }
      }
    } catch (error: any) {
      toast({
        title: isSignUp ? 'Erro no Cadastro' : 'Erro de Login',
        description: error.error_description || error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error, data } = await signInWithGoogle();
      if (error) throw error;
      if (data?.user) {
        // Redirecionar após login bem-sucedido
        router.push('/');
      }
    } catch (error: any) {
      toast({
        title: 'Erro de Login',
        description: error.error_description || error.message || 'Ocorreu um erro ao tentar fazer login com o Google.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{isSignUp ? 'Criar Conta' : 'Login'}</CardTitle>
        <CardDescription>
          {isSignUp
            ? 'Digite seu nome, e-mail e senha para se cadastrar.'
            : 'Digite seu e-mail e senha para acessar sua conta.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleAuth}>
        <CardContent className="grid gap-4">
          {isSignUp && (
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                required={isSignUp}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="h-12 text-base"
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="h-12 text-base" // Aumentar altura e tamanho da fonte
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="h-12 text-base" // Aumentar altura e tamanho da fonte
            />
          </div>
          <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? 'Cadastrar' : 'Entrar'}
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-12 text-base" 
            onClick={handleGoogleSignIn} 
            type="button" 
            disabled={isLoading}
          >
            Entrar com Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center"> {/* Centralizar o conteúdo do footer */}
          <p className="text-center text-sm text-muted-foreground w-full">
            {isSignUp ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
            <button
              type="button"
              className="underline text-primary hover:text-primary/80"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Faça login' : 'Cadastre-se'}
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}