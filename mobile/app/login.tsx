import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/auth-context';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { logIn, signUp, loading } = useAuth();
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      if (isRegistering) {
        await signUp({ email, password });
      } else {
        await logIn({ email, password });
      }
      // Navigation is handled by AuthContext/Layout
    } catch (error: any) {
      Alert.alert('Erro de Autenticação', error.message || 'Ocorreu um erro.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center p-6">
      <View className="w-full max-w-sm space-y-8">
        <View className="items-center">
          <Text className="text-3xl font-bold text-primary">EstudeAqui</Text>
          <Text className="text-muted-foreground mt-2 text-center">
            {isRegistering ? 'Crie sua conta para começar' : 'Bem-vindo de volta!'}
          </Text>
        </View>

        <View className="space-y-4 w-full mt-8">
          <View>
            <Text className="text-sm font-medium mb-2 text-foreground">Email</Text>
            <TextInput
              className="w-full bg-secondary p-3 rounded-md text-foreground"
              placeholder="seu@email.com"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          
          <View>
            <Text className="text-sm font-medium mb-2 text-foreground">Senha</Text>
            <TextInput
              className="w-full bg-secondary p-3 rounded-md text-foreground"
              placeholder="******"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            className="w-full bg-blue-600 p-4 rounded-md flex-row justify-center items-center"
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-center">
                {isRegistering ? 'Criar Conta' : 'Entrar'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setIsRegistering(!isRegistering)}
            className="mt-4"
          >
            <Text className="text-blue-500 text-center">
              {isRegistering ? 'Já tem uma conta? Entre aqui' : 'Não tem uma conta? Cadastre-se'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
