/**
 * Centralized Navigation Configuration
 * Shared between sidebar, bottom navigation, and other nav components
 */

import { Home, Timer, BookCopy, Workflow, History, BookCheck } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  href?: string;
}

export const navItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Visão Geral',
    icon: Home,
  },
  {
    id: 'planning',
    label: 'Planejamento',
    icon: Workflow,
  },
  {
    id: 'cycle',
    label: 'Matéria',
    icon: BookCopy,
  },
  {
    id: 'revision',
    label: 'Revisão',
    icon: BookCheck,
  },
  {
    id: 'pomodoro',
    label: 'Pomodoro',
    icon: Timer,
  },
  {
    id: 'history',
    label: 'Histórico',
    icon: History,
  },
];

// Mobile navigation (subset for bottom nav)
export const mobileNavItems: NavItem[] = navItems.filter(item =>
  ['overview', 'planning', 'revision', 'history', 'pomodoro'].includes(item.id)
);

// Utility functions
export const getNavItemById = (id: string): NavItem | undefined => {
  return navItems.find(item => item.id === id);
};

export const getNextNavItem = (currentId: string): NavItem | undefined => {
  const currentIndex = navItems.findIndex(item => item.id === currentId);
  if (currentIndex === -1 || currentIndex === navItems.length - 1) return undefined;
  return navItems[currentIndex + 1];
};

export const getPrevNavItem = (currentId: string): NavItem | undefined => {
  const currentIndex = navItems.findIndex(item => item.id === currentId);
  if (currentIndex <= 0) return undefined;
  return navItems[currentIndex - 1];
};