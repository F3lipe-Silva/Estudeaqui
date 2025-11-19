'use client';

import { useStudy } from '@/contexts/study-context';
import { Button } from '@/components/ui/button';
import { Home, Timer, BookCopy, Workflow, History, BookCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SheetClose } from './ui/sheet';

const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: Home },
    { id: 'planning', label: 'Planejamento', icon: Workflow },
    { id: 'cycle', label: 'Ciclo', icon: BookCopy },
    { id: 'revision', label: 'Revisão', icon: BookCheck },
    { id: 'history', label: 'Histórico', icon: History },
];

export default function Sidebar({ isSheet = false }: { isSheet?: boolean }) {
    const { activeTab, setActiveTab } = useStudy();

    const NavButton = isSheet ? SheetClose : Button;

    return (
        <aside className={cn('flex flex-col border-r bg-background transition-all w-full')}>
        {isSheet && (
             <div className="flex items-center justify-between p-4 border-b">
                 <h2 className="text-lg font-semibold">Estudaqui</h2>
             </div>
        )}
        <div className="flex-1 overflow-y-auto">
            <nav className="flex flex-col gap-2 p-4 pt-6">
                {navItems.map((item) => (
                <NavButton
                    key={item.id}
                    // @ts-ignore
                    variant={activeTab === item.id ? 'secondary' : 'ghost'}
                    onClick={() => setActiveTab(item.id)}
                    className={cn('justify-start h-10 w-full')}
                    title={item.label}
                >
                    <item.icon className={cn('h-5 w-5 mr-3')} />
                    <span className="text-sm font-medium">{item.label}</span>
                </NavButton>
                ))}
            </nav>
        </div>
        </aside>
    );
}
