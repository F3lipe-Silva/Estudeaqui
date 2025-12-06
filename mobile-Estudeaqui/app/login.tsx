import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/auth-context';
import { useAlert } from '../contexts/alert-context';
import { Stack, useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password) {
        showAlert({
          title: 'Erro',
          message: 'Preencha todos os campos.',
          variant: 'destructive',
          primaryButton: {
            text: 'OK',
            action: () => {}
          }
        });
        return;
    }
    setLoading(true);
    try {
        if (isSignUp) {
            const { error } = await signUp(email, password);
            if (error) throw error;
            showAlert({
              title: 'Conta Criada!',
              message: 'Verifique seu e-mail para confirmar o cadastro.',
              variant: 'success',
              primaryButton: {
                text: 'OK',
                action: () => {
                    setIsSignUp(false);
                }
              }
            });
        } else {
            const { error, data } = await signIn(email, password);
            if (error) throw error;
            // Redirect is handled by _layout
        }
    } catch (error: any) {
        showAlert({
          title: 'Erro',
          message: error.message || 'Ocorreu um erro inesperado.',
          variant: 'destructive',
          primaryButton: {
            text: 'OK',
            action: () => {}
          }
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={styles.contentContainer}>
            <Card>
                <CardHeader>
                    <CardTitle>{isSignUp ? 'Criar Conta' : 'Login'}</CardTitle>
                    <CardDescription>
                        {isSignUp ? 'Digite seu e-mail e senha para se cadastrar.' : 'Digite seu e-mail e senha para acessar sua conta.'}
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    <Input 
                        label="Email"
                        placeholder="seu@email.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <Input 
                        label="Senha"
                        placeholder="********"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    
                    <Button onPress={handleAuth} isLoading={loading} style={styles.submitButton}>
                        {isSignUp ? 'Cadastrar' : 'Entrar'}
                    </Button>

                    <Button variant="outline" onPress={() => showAlert({
                      title: 'Info',
                      message: 'Login social não configurado nesta demo mobile.',
                      variant: 'default',
                      primaryButton: {
                        text: 'OK',
                        action: () => {}
                      }
                    })}>
                        Entrar com Google
                    </Button>
                </CardContent>

                <CardFooter style={{ justifyContent: 'center' }}>
                    <ThemedText style={{ fontSize: 14 }}>
                        {isSignUp ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
                    </ThemedText>
                    <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                        <ThemedText type="link">
                            {isSignUp ? 'Faça login' : 'Cadastre-se'}
                        </ThemedText>
                    </TouchableOpacity>
                </CardFooter>
            </Card>
        </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    contentContainer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    submitButton: {
        marginBottom: 12,
    },
});
