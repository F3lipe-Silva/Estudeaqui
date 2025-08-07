"use client";

import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useStudy } from '@/contexts/study-context';
import OverviewTab from '@/components/overview-tab';
import PomodoroTab from '@/components/pomodoro-tab';
import StudyCycleTab from '@/components/study-cycle-tab';
import StudySequencePlanningTab from '@/components/study-sequence-planning-tab';
import PomodoroWidget from '@/components/pomodoro-widget';
import RevisionTab from '@/components/revision-tab';
import HistoryTab from '@/components/history-tab';
import Sidebar from './sidebar';
import ChatTab from './chat-tab';


export default function MainContent() {
    const { activeTab, setActiveTab } = useStudy();
    
    return (
        <div className="flex flex-1 pt-16">
            <div className="flex flex-col flex-1">
                <header className="fixed top-16 left-0 right-0 z-40 md:relative md:top-auto md:left-auto md:right-auto">
                    <PomodoroWidget />
                </header>
                <main className="flex-grow overflow-y-auto">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
                        <div className="flex-grow">
                            <TabsContent value="overview" className="p-4 md:p-6 mt-0">
                                <OverviewTab />
                            </TabsContent>
                             <TabsContent value="planning" className="p-4 md:p-6 mt-0">
                                <StudySequencePlanningTab />
                            </TabsContent>
                            <TabsContent value="chat" className="p-4 md:p-6 mt-0 h-full">
                                <ChatTab />
                            </TabsContent>
                            <TabsContent value="pomodoro" className="p-4 md:p-6 mt-0">
                                <PomodoroTab />
                            </TabsContent>
                            <TabsContent value="cycle" className="p-4 md:p-6 mt-0">
                                <StudyCycleTab />
                            </TabsContent>
                            <TabsContent value="revision" className="p-4 md:p-6 mt-0">
                                <RevisionTab />
                            </TabsContent>
                            <TabsContent value="history" className="p-4 md:p-6 mt-0">
                                <HistoryTab />
                            </TabsContent>
                        </div>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}
