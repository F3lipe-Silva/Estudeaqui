import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useKeyboardShortcutsHelp } from '@/hooks/use-keyboard-shortcuts';
import { useTheme } from '@/contexts/theme-context';

interface KeyboardShortcutsHelpProps {
  visible: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  visible,
  onClose
}) => {
  const { resolvedTheme } = useTheme();
  const { getShortcutsByCategory, formatShortcut } = useKeyboardShortcutsHelp();
  const categories = getShortcutsByCategory();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Atalhos de Teclado</ThemedText>
          <TouchableOpacity onPress={onClose}>
            <ThemedText style={styles.closeButton}>✕</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <ThemedText style={styles.description}>
            Use estes atalhos para navegar rapidamente pelo aplicativo. 
            A maioria dos atalhos requer a tecla Ctrl (ou Cmd no Mac).
          </ThemedText>

          {Object.entries(categories).map(([categoryName, categoryShortcuts]) => (
            <View key={categoryName} style={styles.category}>
              <ThemedText style={styles.categoryTitle}>
                {categoryName}
              </ThemedText>
              
              {categoryShortcuts.map((shortcut, index) => (
                <View key={index} style={styles.shortcutItem}>
                  <View style={styles.shortcutKeys}>
                    <ThemedText style={styles.shortcutKey}>
                      {formatShortcut(shortcut)}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.shortcutDescription}>
                    {shortcut.description}
                  </ThemedText>
                </View>
              ))}
            </View>
          ))}

          <View style={styles.note}>
            <ThemedText style={styles.noteText}>
              💡 Dica: Os atalhos funcionam principalmente na versão web do aplicativo.
              Na versão mobile, você pode usar gestos e botões de navegação.
            </ThemedText>
          </View>
        </View>

        <View style={styles.footer}>
          <Button onPress={onClose} style={styles.closeButton}>
            Fechar
          </Button>
        </View>
      </ThemedView>
    </Modal>
  );
};

// Floating help button component
interface KeyboardHelpButtonProps {
  onPress: () => void;
}

export const KeyboardHelpButton: React.FC<KeyboardHelpButtonProps> = ({
  onPress
}) => {
  const { resolvedTheme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.helpButton,
        {
          backgroundColor: resolvedTheme === 'dark' ? '#151a23' : '#ffffff',
          borderColor: resolvedTheme === 'dark' ? '#252d36' : '#dae6e7',
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.helpIcon}>⌨️</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: '600',
    opacity: 0.6,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    opacity: 0.8,
  },
  category: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#4db8a5',
  },
  shortcutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  shortcutKeys: {
    minWidth: 120,
    marginRight: 16,
  },
  shortcutKey: {
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(77, 184, 165, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    textAlign: 'center',
    color: '#4db8a5',
  },
  shortcutDescription: {
    fontSize: 16,
    flex: 1,
  },
  note: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(77, 184, 165, 0.1)',
    borderRadius: 8,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingTop: 16,
  },
  helpButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  helpIcon: {
    fontSize: 24,
  },
});