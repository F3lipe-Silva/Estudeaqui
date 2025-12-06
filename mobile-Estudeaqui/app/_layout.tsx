import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../contexts/auth-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!session && inAuthGroup) {
      // Redirect to the login page.
      router.replace('/login');
    } else if (session && segments[0] === 'login') {
      // Redirect to the tabs page.
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 300,
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 300,
              },
            },
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="pomodoro"
          options={{
            title: 'Pomodoro',
            presentation: 'card',
            animation: 'slide_from_bottom',
            gestureDirection: 'vertical',
          }}
        />
        <Stack.Screen
          name="chat"
          options={{
            title: 'IA Tutor',
            presentation: 'card',
            animation: 'slide_from_bottom',
            gestureDirection: 'vertical',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Configurações',
            presentation: 'modal',
            animation: 'slide_from_bottom',
            gestureDirection: 'vertical',
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </NavigationThemeProvider>
  );
}

import { StudyProvider } from '../contexts/study-context';
import { AlertProvider } from '../contexts/alert-context';
import { ThemeProvider as CustomThemeProvider } from '../contexts/theme-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AlertProvider>
          <StudyProvider>
            <CustomThemeProvider>
              <RootLayoutNav />
            </CustomThemeProvider>
          </StudyProvider>
        </AlertProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
