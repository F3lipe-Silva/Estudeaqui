"use client";

import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useStudy } from '@/contexts/study-context';
import OverviewTab from '@/components/overview-tab';
import StudyCycleTab from '@/components/study-cycle-tab';
import StudySequencePlanningTab from '@/components/study-sequence-planning-tab';
import PomodoroWidget from '@/components/pomodoro-widget';
import RevisionTab from '@/components/revision-tab';
import HistoryTab from '@/components/history-tab';
import Sidebar from './sidebar';
import { Breadcrumbs } from './breadcrumbs';
import PomodoroTab from '@/components/pomodoro-tab';


export default function MainContent() {
    const { activeTab, setActiveTab } = useStudy();

    return (
        <div className="flex flex-1">
            <div className="flex flex-col flex-1">
                <header className="fixed top-16 left-0 right-0 z-40 md:hidden">
                    <PomodoroWidget />
                </header>
                <main className="flex-grow overflow-y-auto overflow-x-hidden pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
                    <div className="md:hidden">
                        <PomodoroWidget />
                    </div>
                    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
                        <div className="hidden md:block mb-6">
                            <PomodoroWidget />
                        </div>
                        <Breadcrumbs />
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
                            <div className="flex-grow">
                                <TabsContent value="overview" className="mt-0 p-0">
                                    <OverviewTab />
                                </TabsContent>

                                <TabsContent value="planning" className="mt-0 p-0">
                                    <StudySequencePlanningTab />
                                </TabsContent>
                                <TabsContent value="cycle" className="mt-0 p-0">
                                    <StudyCycleTab />
                                </TabsContent>
                                <TabsContent value="revision" className="mt-0 p-0">
                                    <RevisionTab />
                                </TabsContent>
                                <TabsContent value="pomodoro" className="mt-0 p-0">
                                    <PomodoroTab />
                                </TabsContent>
                                <TabsContent value="history" className="mt-0 p-0">
                                    <HistoryTab />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    );
}
