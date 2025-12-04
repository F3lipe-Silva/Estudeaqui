'use client';

import { useEffect } from 'react';
import { useStudy } from '@/contexts/study-context';
import { useAuth } from '@/contexts/auth-context';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const { setActiveTab } = useStudy();
  const { signOut } = useAuth();

  const shortcuts: KeyboardShortcut[] = [
    { key: '1', ctrlKey: true, action: () => setActiveTab('overview'), description: 'Ir para Visão Geral' },
    { key: '2', ctrlKey: true, action: () => setActiveTab('planning'), description: 'Ir para Planejamento' },
    { key: '3', ctrlKey: true, action: () => setActiveTab('cycle'), description: 'Ir para Matérias' },
    { key: '4', ctrlKey: true, action: () => setActiveTab('revision'), description: 'Ir para Revisão' },
    { key: '5', ctrlKey: true, action: () => setActiveTab('history'), description: 'Ir para Histórico' },

    { key: 'n', ctrlKey: true, shiftKey: true, action: () => window.dispatchEvent(new CustomEvent('open-new-subject')), description: 'Nova Matéria' },
    { key: 's', ctrlKey: true, shiftKey: true, action: () => window.dispatchEvent(new CustomEvent('save-template')), description: 'Salvar Template' },
    { key: 'l', ctrlKey: true, shiftKey: true, action: () => window.dispatchEvent(new CustomEvent('load-template')), description: 'Carregar Template' },

    { key: 'd', ctrlKey: true, shiftKey: true, action: () => window.dispatchEvent(new CustomEvent('toggle-theme')), description: 'Alternar Tema' },
    { key: 'q', ctrlKey: true, shiftKey: true, action: () => signOut(), description: 'Sair' }
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      const shortcut = shortcuts.find(s => 
        s.key.toLowerCase() === event.key.toLowerCase() &&
        !!s.ctrlKey === event.ctrlKey &&
        !!s.shiftKey === event.shiftKey &&
        !!s.altKey === event.altKey
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab, signOut]);

  return { shortcuts };
}

// Componente de ajuda desabilitado temporariamente
// export function KeyboardShortcutsHelp() { ... }