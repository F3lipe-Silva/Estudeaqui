'use client';

import { useState } from 'react';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';
import { Home, Timer, BookCopy, Workflow, History, BookCheck, Menu, BrainCircuit } from 'lucide-react'; // Adicionar BrainCircuit e BookOpen
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { useStudy } from '@/contexts/study-context';
import Sidebar from './sidebar';


const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: Home },
    { id: 'planning', label: 'Planejamento', icon: Workflow },
    { id: 'coach-ai', label: 'Coach AI', icon: BrainCircuit }, // Adicionar Coach AI
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
    { id: 'cycle', label: 'Ciclo', icon: BookCopy },
    { id: 'revision', label: 'Revisão', icon: BookCheck },
    { id: 'history', label: 'Histórico', icon: History },
];

export default function AppHeader() {
    const { activeTab, setActiveTab } = useStudy();
    
    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm lg:px-6">
            <div className="flex items-center gap-4">
                 <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0">
                           <SheetHeader className="p-4 border-b sr-only">
                             <SheetTitle>Menu de Navegação</SheetTitle>
                           </SheetHeader>
                           <Sidebar isSheet={true}/>
                        </SheetContent>
                    </Sheet>
                 </div>
                <h1 className="text-xl font-bold">Estudaqui</h1>
                 <nav className="hidden lg:flex items-center gap-2">
                    {navItems.map((item) => (
                        <Button
                            key={item.id}
                            variant={activeTab === item.id ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab(item.id)}
                        >
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                        </Button>
                    ))}
                </nav>
            </div>
            <div className="flex items-center gap-2">
                <ThemeToggle />
            </div>
        </header>
    );
}
