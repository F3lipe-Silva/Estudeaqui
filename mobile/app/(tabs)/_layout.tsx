import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { StudyProvider } from '@/contexts/study-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <StudyProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Início',
            tabBarIcon: ({ color }) => <Ionicons size={28} name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="subjects"
          options={{
            title: 'Matérias',
            tabBarIcon: ({ color }) => <Ionicons size={28} name="book" color={color} />,
          }}
        />
        <Tabs.Screen
          name="plan"
          options={{
            title: 'Plano',
            tabBarIcon: ({ color }) => <Ionicons size={28} name="calendar" color={color} />,
          }}
        />
        <Tabs.Screen
          name="review"
          options={{
            title: 'Revisão',
            tabBarIcon: ({ color }) => <Ionicons size={28} name="repeat" color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'Histórico',
            tabBarIcon: ({ color }) => <Ionicons size={28} name="stats-chart" color={color} />,
          }}
        />
      </Tabs>
    </StudyProvider>
  );
}
