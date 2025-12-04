'use client';

import { useState } from 'react';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';
import { Home, Timer, BookCopy, Workflow, History, BookCheck, Menu, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { useStudy } from '@/contexts/study-context';
import Sidebar from './sidebar';
import { useAuth } from '@/contexts/auth-context';


const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: Home },
    { id: 'planning', label: 'Planejamento', icon: Workflow },
    { id: 'cycle', label: 'Ciclo', icon: BookCopy },
    { id: 'revision', label: 'Revisão', icon: BookCheck },
    { id: 'history', label: 'Histórico', icon: History },
];

import { SettingsDialog } from './settings-dialog';
import MongoDBStatusIndicator from './mongodb-status-indicator';

// ... (existing imports)

export default function AppHeader() {
    const { activeTab, setActiveTab } = useStudy();
    const { signOut } = useAuth();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm md:px-6 pt-[env(safe-area-inset-top)]">
            <div className="flex items-center gap-4">
                <div className="md:hidden">
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
                            <Sidebar isSheet={true} />
                        </SheetContent>
                    </Sheet>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate max-w-[200px] md:max-w-none">Estudaqui</h1>
            </div>
            <div className="flex items-center gap-1">
                <MongoDBStatusIndicator />
                <SettingsDialog />
                <ThemeToggle />
                <Button variant="ghost" size="icon" onClick={signOut}>
                    <LogOut className="h-6 w-6" />
                </Button>
            </div>
        </header>
    );
}
