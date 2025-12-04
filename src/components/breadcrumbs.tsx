'use client';

import { useStudy } from '@/contexts/study-context';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function Breadcrumbs() {
  const { activeTab } = useStudy();

  const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
    overview: [
      { label: 'Início', icon: Home },
      { label: 'Visão Geral' }
    ],
    planning: [
      { label: 'Início', icon: Home },
      { label: 'Planejamento' }
    ],
    cycle: [
      { label: 'Início', icon: Home },
      { label: 'Matérias' }
    ],
    revision: [
      { label: 'Início', icon: Home },
      { label: 'Revisão' }
    ],
    pomodoro: [
      { label: 'Início', icon: Home },
      { label: 'Pomodoro' }
    ],
    history: [
      { label: 'Início', icon: Home },
      { label: 'Histórico' }
    ]
  };

  const breadcrumbs = breadcrumbMap[activeTab] || [];

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6 px-1">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
          )}
          <div
            className={cn(
              "flex items-center gap-1 transition-colors",
              index === breadcrumbs.length - 1
                ? "text-foreground font-medium"
                : "hover:text-foreground cursor-pointer"
            )}
            onClick={() => {
              if (index === 0) {
                // Navegar para overview será tratado no componente pai
              }
            }}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            <span>{item.label}</span>
          </div>
        </div>
      ))}
    </nav>
  );
}