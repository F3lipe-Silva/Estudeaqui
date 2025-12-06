import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/theme-context';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/contexts/auth-context';

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
  disabled?: boolean;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  sections?: SidebarSection[];
  showProfile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  sections,
  showProfile = true
}) => {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { user } = useAuthContext();

  const defaultSections: SidebarSection[] = [
    {
      title: 'Principal',
      items: [
        { id: 'overview', label: 'Visão Geral', icon: '📊', href: '/(tabs)/' },
        { id: 'subjects', label: 'Matérias', icon: '📚', href: '/(tabs)/subjects' },
        { id: 'pomodoro', label: 'Pomodoro', icon: '🍅', href: '/(tabs)/pomodoro' },
        { id: 'history', label: 'Histórico', icon: '📈', href: '/(tabs)/history' },
      ]
    },
    {
      title: 'Planejamento',
      items: [
        { id: 'planning', label: 'Planejamento', icon: '📅', href: '/(tabs)/planning' },
        { id: 'templates', label: 'Templates', icon: '📋', href: '/(tabs)/templates' },
        { id: 'schedule', label: 'Agenda', icon: '📆', href: '/(tabs)/schedule' },
      ]
    },
    {
      title: 'Ferramentas',
      items: [
        { id: 'revision', label: 'Revisão', icon: '🔄', href: '/(tabs)/revision' },
        { id: 'cycle', label: 'Ciclo de Estudo', icon: '🔁', href: '/(tabs)/cycle' },
        { id: 'chat', label: 'Chat IA', icon: '💬', href: '/chat' },
      ]
    },
    {
      title: 'Configurações',
      items: [
        { id: 'settings', label: 'Configurações', icon: '⚙️', href: '/settings' },
      ]
    }
  ];

  const sidebarSections = sections || defaultSections;

  const handleItemPress = (item: SidebarItem) => {
    if (item.disabled) return;
    
    router.push(item.href);
    onClose();
  };

  const sidebarStyle = {
    backgroundColor: resolvedTheme === 'dark' ? '#151a23' : '#ffffff',
    borderRightColor: resolvedTheme === 'dark' ? '#252d36' : '#dae6e7',
  };

  const itemStyle = {
    backgroundColor: 'transparent',
  };

  const itemPressedStyle = {
    backgroundColor: resolvedTheme === 'dark' ? '#1f262e' : '#f8fafc',
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      />
      
      {/* Sidebar */}
      <ThemedView style={[styles.sidebar, sidebarStyle]}>
        {/* Profile Section */}
        {showProfile && user && (
          <View style={[styles.profileSection, { borderBottomColor: resolvedTheme === 'dark' ? '#252d36' : '#dae6e7' }]}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </ThemedText>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileName}>{user.name}</ThemedText>
              <ThemedText style={styles.profileEmail}>{user.email}</ThemedText>
            </View>
          </View>
        )}

        {/* Navigation Sections */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {sidebarSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                {section.title}
              </ThemedText>
              
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.sidebarItem,
                    itemStyle,
                    item.disabled && styles.disabledItem
                  ]}
                  onPress={() => handleItemPress(item)}
                  disabled={item.disabled}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.itemIcon, { opacity: item.disabled ? 0.5 : 1 }]}>
                    {item.icon}
                  </Text>
                  <ThemedText
                    style={[
                      styles.itemLabel,
                      { opacity: item.disabled ? 0.5 : 1 }
                    ]}
                  >
                    {item.label}
                  </ThemedText>
                  {item.badge && item.badge > 0 && (
                    <View style={styles.badge}>
                      <ThemedText style={styles.badgeText}>
                        {item.badge > 99 ? '99+' : item.badge}
                      </ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: resolvedTheme === 'dark' ? '#252d36' : '#dae6e7' }]}>
          <TouchableOpacity style={styles.footerItem}>
            <Text style={styles.footerIcon}>❓</Text>
            <ThemedText style={styles.footerLabel}>Ajuda</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerItem}>
            <Text style={styles.footerIcon}>📖</Text>
            <ThemedText style={styles.footerLabel}>Sobre</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </>
  );
};

// Hook for managing sidebar state
export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return {
    isOpen,
    open,
    close,
    toggle
  };
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    borderRightWidth: 1,
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  profileSection: {
    padding: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4db8a5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.6,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  disabledItem: {
    opacity: 0.5,
  },
  itemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 16,
    flex: 1,
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingVertical: 12,
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  footerLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
});