import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Trash2, Moon, Sun } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import useSafeAreaInsets

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudy } from '../contexts/study-context';
import { useAuth } from '../contexts/auth-context';
import { useAlert } from '../contexts/alert-context';
import { useTheme } from '../contexts/theme-context';

export default function SettingsScreen() {
  const { dispatch } = useStudy();
  const { user, signOut } = useAuth();
  const { showAlert } = useAlert();
  const { theme: currentTheme, setTheme } = useTheme();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Hook for safe area insets

  const handleResetData = () => {
    showAlert({
      title: "Tem certeza?",
      message: "Isso apagará todos os seus dados de estudo locais e sincronizados. Essa ação não pode ser desfeita.",
      variant: 'destructive',
      primaryButton: {
        text: "Sim, Resetar",
        variant: 'destructive',
        action: async () => {
          try {
             dispatch({ type: 'SET_STATE', payload: { subjects: [], studyLog: [], lastStudiedDate: null, streak: 0, studySequence: null, sequenceIndex: 0, templates: [] } });
             showAlert({
               title: "Sucesso",
               message: "Seus dados foram resetados.",
               variant: 'success',
               primaryButton: {
                 text: "OK",
                 action: () => {}
               }
             });
          } catch (error) {
             showAlert({
               title: "Erro",
               message: "Não foi possível resetar os dados.",
               variant: 'destructive',
               primaryButton: {
                 text: "OK",
                 action: () => {}
               }
             });
          }
        }
      },
      secondaryButton: {
        text: "Cancelar",
        variant: 'secondary',
        action: () => {}
      }
    });
  };

  const handleSignOut = async () => {
      try {
          await signOut();
          router.replace('/login');
      } catch (error) {
          showAlert({
            title: "Erro",
            message: "Falha ao sair.",
            variant: 'destructive',
            primaryButton: {
              text: "OK",
              action: () => {}
            }
          });
      }
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ title: 'Configurações', headerBackTitle: 'Voltar' }} />
      
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Aparência</ThemedText>
        <Card>
          <CardContent style={styles.cardContent}>
            <View style={styles.row}>
              <ThemedText>Tema</ThemedText>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setTheme('light')}
                  style={[
                    styles.themeButton,
                    currentTheme === 'light' && { backgroundColor: theme.tint + '20', borderColor: theme.tint }
                  ]}
                >
                  <Sun size={20} color={currentTheme === 'light' ? theme.tint : theme.icon} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setTheme('dark')}
                  style={[
                    styles.themeButton,
                    currentTheme === 'dark' && { backgroundColor: theme.tint + '20', borderColor: theme.tint }
                  ]}
                >
                  <Moon size={20} color={currentTheme === 'dark' ? theme.tint : theme.icon} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setTheme('system')}
                  style={[
                    styles.themeButton,
                    currentTheme === 'system' && { backgroundColor: theme.tint + '20', borderColor: theme.tint }
                  ]}
                >
                  <ThemedText style={{ fontSize: 12, color: currentTheme === 'system' ? theme.tint : theme.icon }}>Auto</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Conta</ThemedText>
        <Card>
            <CardContent style={styles.cardContent}>
                <View style={styles.row}>
                    <ThemedText>Email</ThemedText>
                    <ThemedText style={{ opacity: 0.6 }}>{user?.email}</ThemedText>
                </View>
                <View style={styles.divider} />
                <TouchableOpacity onPress={handleSignOut} style={styles.rowButton}>
                    <ThemedText style={{ color: theme.destructive }}>Sair</ThemedText>
                </TouchableOpacity>
            </CardContent>
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Zona de Perigo</ThemedText>
        <Card style={{ borderColor: theme.destructive }}>
            <CardContent style={styles.cardContent}>
                <ThemedText style={styles.dangerDescription}>
                    Apagar todos os dados de estudo e resetar o progresso.
                </ThemedText>
                <Button 
                    variant="destructive" 
                    onPress={handleResetData}
                    style={styles.resetButton}
                >
                    <Trash2 size={18} color="white" style={{ marginRight: 8 }} />
                    <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Resetar Dados</ThemedText>
                </Button>
            </CardContent>
        </Card>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardContent: {
    padding: 16,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  rowButton: {
    paddingVertical: 4,
  },
  dangerDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  }
});