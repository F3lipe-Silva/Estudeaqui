'use client';

import { useStudy } from '@/contexts/study-context';
import { Home, BookCopy, Workflow, History, BookCheck, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { id: 'overview', label: 'Início', icon: Home },
    { id: 'schedule', label: 'Cronograma', icon: CalendarClock },
    { id: 'planning', label: 'Plano', icon: Workflow },
    { id: 'cycle', label: 'Matéria', icon: BookCopy },
    { id: 'revision', label: 'Revisão', icon: BookCheck },
    { id: 'history', label: 'Histórico', icon: History },
];

export default function BottomNavigationBar() {
    const { activeTab, setActiveTab } = useStudy();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
            <nav className="flex h-16 items-center justify-around px-2">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                                isActive 
                                    ? "text-primary" 
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
