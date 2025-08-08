
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { logIn } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await logIn(email, password);
      // The redirect is handled by the AuthProvider now
    } catch (error: any) {
      toast({
        title: 'Erro de Login',
        description: error.message || 'Ocorreu um erro ao tentar fazer login.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
    const handleGoogleSignIn = async () => {
    // Implement Google sign-in with Firebase here
    // For now, we'll just log an error as this is out of scope for current task
    setIsLoading(true);
    try {
      throw new Error('Google Sign-in not implemented yet.');
    } catch (error: any) {
       toast({
        title: 'Erro de Login',
        description: error.message || 'Ocorreu um erro ao tentar fazer login com o Google.',
        variant: 'destructive',
      });
    } finally {
        setIsLoading(false);
    }
  }


  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Digite seu e-mail e senha para acessar sua conta.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="grid gap-4">
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
            />
          </div>
           <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
           <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} type="button" disabled={isLoading}>
            Entrar com Google
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            Não tem uma conta?{' '}
            <a href="#" className="underline">
              Cadastre-se
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
