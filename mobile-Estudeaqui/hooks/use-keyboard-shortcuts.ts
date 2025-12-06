import { useEffect, useCallback } from 'react';
import { Platform, Keyboard, KeyboardEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { useStudyContext } from '@/contexts/study-context';
import { useToast } from '@/components/ui/toast';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  enabled?: boolean;
}

interface UseKeyboardShortcutsProps {
  shortcuts?: KeyboardShortcut[];
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  shortcuts = [],
  enabled = true
}: UseKeyboardShortcutsProps = {}) => {
  const router = useRouter();
  const { dispatch, pomodoroState, pausePomodoroTimer, advancePomodoroCycle } = useStudyContext();
  const { toast } = useToast();

  // Default shortcuts
  const defaultShortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: 'n',
      ctrlKey: true,
      action: () => router.push('/(tabs)/subjects'),
      description: 'Nova matéria',
    },
    {
      key: 'p',
      ctrlKey: true,
      action: () => router.push('/(tabs)/pomodoro'),
      description: 'Iniciar Pomodoro',
    },
    {
      key: 'h',
      ctrlKey: true,
      action: () => router.push('/(tabs)/history'),
      description: 'Histórico',
    },
    {
      key: 't',
      ctrlKey: true,
      action: () => router.push('/(tabs)/templates'),
      description: 'Templates',
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => router.push('/(tabs)/planning'),
      description: 'Planejamento',
    },
    {
      key: '/',
      ctrlKey: true,
      action: () => router.push('/chat'),
      description: 'Chat IA',
    },
    
    // Pomodoro shortcuts
    {
      key: ' ',
      action: () => {
        if (pomodoroState.status === 'focus' || pomodoroState.status === 'short_break' || pomodoroState.status === 'long_break') {
          pausePomodoroTimer();
          toast({ title: 'Pomodoro pausado', description: 'Pressione Espaço novamente para continuar' });
        } else if (pomodoroState.status === 'paused') {
          // Resume logic would need to be implemented
          toast({ title: 'Pomodoro retomado' });
        }
      },
      description: 'Pausar/Retomar Pomodoro',
      enabled: pomodoroState.status !== 'idle',
    },
    {
      key: 'Enter',
      action: () => {
        if (pomodoroState.status === 'paused') {
          // Resume logic
          toast({ title: 'Pomodoro retomado' });
        } else {
          advancePomodoroCycle();
        }
      },
      description: 'Avançar ciclo/Retomar',
    },
    {
      key: 'Escape',
      action: () => {
        if (pomodoroState.status !== 'idle') {
          // Stop pomodoro logic
          toast({ title: 'Pomodoro parado' });
        }
      },
      description: 'Parar Pomodoro',
      enabled: pomodoroState.status !== 'idle',
    },
    
    // Quick actions
    {
      key: 'd',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        // Toggle dark mode
        toast({ title: 'Alternar tema', description: 'Função de alternar tema' });
      },
      description: 'Alternar tema',
    },
    {
      key: 'r',
      ctrlKey: true,
      action: () => {
        // Refresh data
        toast({ title: 'Dados atualizados', description: 'Sincronizando com o servidor...' });
      },
      description: 'Atualizar dados',
    },
    {
      key: 'f',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        // Focus search
        toast({ title: 'Busca', description: 'Função de busca' });
      },
      description: 'Focar busca',
    },
  ];

  const allShortcuts = [...defaultShortcuts, ...shortcuts];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled || Platform.OS !== 'web') return;

    const { key, ctrlKey, shiftKey, altKey, metaKey } = event;

    // Find matching shortcut
    const matchingShortcut = allShortcuts.find(shortcut => {
      if (shortcut.key.toLowerCase() !== key.toLowerCase()) return false;
      if (shortcut.ctrlKey && !(ctrlKey || metaKey)) return false;
      if (shortcut.shiftKey && !shiftKey) return false;
      if (shortcut.altKey && !altKey) return false;
      if (shortcut.enabled === false) return false;
      
      return true;
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  }, [enabled, allShortcuts]);

  useEffect(() => {
    if (Platform.OS === 'web' && enabled) {
      Keyboard.addListener('keyboardDidShow', handleKeyDown);
      
      // Also add global event listener for web
      document.addEventListener('keydown', handleKeyDown as any);
      
      return () => {
        Keyboard.removeListener('keyboardDidShow', handleKeyDown);
        document.removeEventListener('keydown', handleKeyDown as any);
      };
    }
  }, [handleKeyDown, enabled]);

  return {
    shortcuts: allShortcuts,
    enabled,
  };
};

// Hook for displaying keyboard shortcuts help
export const useKeyboardShortcutsHelp = () => {
  const { shortcuts } = useKeyboardShortcuts();
  
  const getShortcutsByCategory = () => {
    const categories = {
      'Navegação': shortcuts.filter(s => 
        ['n', 'p', 'h', 't', 's', '/'].includes(s.key.toLowerCase()) && !s.ctrlKey
      ),
      'Pomodoro': shortcuts.filter(s => 
        [' ', 'Enter', 'Escape'].includes(s.key) && !s.ctrlKey
      ),
      'Ações Rápidas': shortcuts.filter(s => 
        s.ctrlKey && (s.shiftKey || s.altKey)
      ),
    };

    return categories;
  };

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const parts = [];
    
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.altKey) parts.push('Alt');
    
    parts.push(shortcut.key.toUpperCase());
    
    return parts.join(' + ');
  };

  return {
    shortcuts,
    getShortcutsByCategory,
    formatShortcut,
  };
};