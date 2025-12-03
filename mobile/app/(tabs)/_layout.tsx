import React from 'react';
import { Tabs } from 'expo-router';
import { Home, RotateCw, BookCopy, FileClock, Calendar } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';

function TabBarIcon(props: {
  icon: any;
  color: string;
  focused: boolean;
}) {
  const Icon = props.icon;
  return <Icon size={24} color={props.color} />;
}

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const activeTintColor = '#2563eb'; // primary blue
  const inactiveTintColor = '#94a3b8'; // slate-400

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTintColor,
        tabBarInactiveTintColor: inactiveTintColor,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#ffffff', // slate-950 or white
          borderTopColor: colorScheme === 'dark' ? '#1e293b' : '#e2e8f0',
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginBottom: 5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={Home} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="subjects"
        options={{
          title: 'Matéria',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={BookCopy} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="planning"
        options={{
          title: 'Plano',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={Calendar} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="revision"
        options={{
          title: 'Revisão',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={RotateCw} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={FileClock} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
