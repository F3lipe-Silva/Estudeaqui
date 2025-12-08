'use client';

import { useStudy } from '@/contexts/study-context';
import { cn } from '@/lib/utils';
import { mobileNavItems } from '@/constants/navigation';

export default function BottomNavigationBar() {
    const { activeTab, setActiveTab } = useStudy();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden pb-[env(safe-area-inset-bottom)]">
            <nav className="flex h-16 items-center justify-around px-2">
                {mobileNavItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 active:scale-95 focus-ring touch-target",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            aria-current={isActive ? 'page' : undefined}
                            title={item.label}
                        >
                            <div className={cn("relative p-1 rounded-xl transition-colors", isActive && "bg-primary/10")}>
                                <item.icon className={cn("h-6 w-6 transition-transform", isActive && "scale-110 fill-current")} />
                            </div>
                            <span className={cn("text-[11px] font-medium transition-all", isActive ? "font-semibold" : "font-normal")}>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
