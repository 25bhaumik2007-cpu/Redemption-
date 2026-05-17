/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from './hooks/useAppState';
import { Sidebar } from './components/Sidebar';
import { View } from './types';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { HabitTracker } from './components/HabitTracker';
import { Calendar } from './components/Calendar';
import { Analytics } from './components/Analytics';
import { DailyFlow } from './components/DailyFlow';
import { Journal } from './components/Journal';
import { Focus } from './components/Focus';
import { Settings } from './components/Settings';
import { format, parseISO, addMinutes, isAfter, isBefore } from 'date-fns';
import { 
  AnimatePresence, 
  motion 
} from 'motion/react';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Timer, 
  Settings as SettingsIcon 
} from 'lucide-react';
import { cn } from './lib/utils';
import { AppState } from './types';

function ReminderManager({ state, updateState }: { state: AppState, updateState: any }) {
  const events = state.events || [];
  const notifications = state.notifications || [];

  // Global Timer Tick
  useEffect(() => {
    if (!state.activeTimer?.isRunning) return;

    const interval = setInterval(() => {
      updateState((prev: AppState) => {
        if (!prev.activeTimer?.isRunning) return prev;
        
        const newTimeLeft = Math.max(0, prev.activeTimer.timeLeft - 1);
        const now = new Date().toISOString();

        if (newTimeLeft === 0) {
          // Timer finished
          const minutesEarned = Math.floor(prev.activeTimer.duration / 60);
          const newSession = {
            id: Math.random().toString(36).substr(2, 9),
            date: format(new Date(), 'yyyy-MM-dd'),
            duration: minutesEarned,
            type: prev.activeTimer.presetName
          };

          return {
            ...prev,
            activeTimer: undefined,
            focusTimeToday: prev.focusTimeToday + minutesEarned,
            focusHistory: [newSession, ...(prev.focusHistory || [])],
            notifications: [
              {
                id: Math.random().toString(36).substr(2, 9),
                title: 'Focus Session Complete',
                message: `You successfully completed ${minutesEarned} minutes of ${prev.activeTimer.presetName}.`,
                time: now,
                read: false,
                type: 'focus'
              },
              ...prev.notifications
            ]
          };
        }

        return {
          ...prev,
          activeTimer: {
            ...prev.activeTimer,
            timeLeft: newTimeLeft,
            lastUpdated: now
          }
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.activeTimer?.isRunning, updateState]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const todayStr = format(now, 'yyyy-MM-dd');
      
      const upcomingEvents = events.filter(e => 
        e.date === todayStr && 
        e.remindMe && 
        !e.completed &&
        e.startTime
      );

      upcomingEvents.forEach(event => {
        const [hours, minutes] = event.startTime!.split(':').map(Number);
        const eventDate = parseISO(event.date);
        const eventTime = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), hours, minutes);
        
        // Notify 15 minutes before
        const reminderTime = addMinutes(eventTime, -15);
        
        if (isAfter(now, reminderTime) && isBefore(now, eventTime)) {
             const alreadyNotified = notifications.some(n => 
                n.title.includes(event.title) && 
                format(parseISO(n.time), 'yyyy-MM-dd') === todayStr
             );

             if (!alreadyNotified) {
                 updateState((prev: AppState) => ({
                    ...prev,
                    notifications: [
                        {
                            id: Math.random().toString(36).substr(2, 9),
                            title: `Ritual: ${event.title}`,
                            message: `Due in 15 minutes at ${event.startTime}`,
                            time: new Date().toISOString(),
                            read: false,
                            type: 'system'
                        },
                        ...prev.notifications
                    ]
                 }));
             }
        }
      });
    };

    // Check every minute
    const timerId = setInterval(checkReminders, 60000);
    return () => clearInterval(timerId);
  }, [events, notifications, updateState]);

  return null;
}

export default function App() {
  const { state, updateState } = useAppState();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard state={state} updateState={updateState} onNavigate={setCurrentView} />;
      case 'habits':
        return <HabitTracker state={state} updateState={updateState} />;
      case 'calendar':
        return <Calendar state={state} updateState={updateState} />;
      case 'daily':
        return <DailyFlow state={state} updateState={updateState} />;
      case 'focus':
        return <Focus state={state} updateState={updateState} />;
      case 'analytics':
        return <Analytics state={state} />;
      case 'notes':
        return <Journal state={state} updateState={updateState} />;
      case 'settings':
        return <Settings state={state} updateState={updateState} />;
      default:
        return <Dashboard state={state} updateState={updateState} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-cream selection:bg-brand-peach/30 transition-colors duration-500 overflow-x-hidden font-sans">
      <ReminderManager state={state} updateState={updateState} />
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isCollapsed={isSidebarCollapsed}
        onCollapseChange={setIsSidebarCollapsed}
        state={state}
      />
      
      <main className={cn(
        "flex-1 min-h-screen flex flex-col relative transition-all duration-500",
        isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}>
        <Header state={state} updateState={updateState} onNavigate={setCurrentView} />
        
        <div className="flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-brand-sand flex items-center justify-around px-4 lg:hidden z-50">
          {[
            { id: 'dashboard', icon: LayoutDashboard },
            { id: 'daily', icon: CheckCircle2 },
            { id: 'focus', icon: Timer },
            { id: 'settings', icon: SettingsIcon },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={cn(
                "p-3 rounded-2xl transition-all",
                currentView === item.id ? "bg-brand-ink text-white shadow-lg" : "text-brand-muted hover:text-brand-ink"
              )}
            >
              <item.icon className="w-6 h-6" />
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
