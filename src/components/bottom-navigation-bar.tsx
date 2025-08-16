'use client';

import { useStudy } from '@/contexts/study-context';
import { Button } from '@/components/ui/button';
import { Home, Timer, BookCopy, Workflow, History, BookCheck, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: Home },
    { id: 'planning', label: 'Planejamento', icon: Workflow },
    { id: 'coach-ai', label: 'Coach AI', icon: BrainCircuit },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
    { id: 'cycle', label: 'Ciclo', icon: BookCopy },
    { id: 'revision', label: 'Revisão', icon: BookCheck },
    { id: 'history', label: 'Histórico', icon: History },
];

export default function BottomNavigationBar() {
    const { activeTab, setActiveTab } = useStudy();

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-background border-t shadow-lg sm:hidden">
            <nav className="flex h-16 items-center justify-around">
                {navItems.map((item) => (
                    <Button
                        key={item.id}
                        variant={activeTab === item.id ? 'secondary' : 'ghost'}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                            'flex flex-col h-full w-auto p-0 rounded-none',
                            activeTab === item.id ? 'text-primary' : 'text-muted-foreground'
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-[0.65rem] font-medium mt-1">{item.label}</span>
                    </Button>
                ))}
            </nav>
        </div>
    );
}