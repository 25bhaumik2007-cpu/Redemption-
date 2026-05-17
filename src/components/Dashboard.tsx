import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AppState, Task, Habit, CalendarEvent, View } from '../types';
import { cn } from '../lib/utils';
import { 
  Flame, 
  Target, 
  CheckCircle2, 
  Clock, 
  Plus,
  ArrowRight,
  TrendingUp,
  Zap,
  Calendar as CalendarIcon,
  ChevronRight,
  Timer,
  Pause,
  Play,
  Activity,
  Check
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer, 
  XAxis, 
  Tooltip 
} from 'recharts';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

import { calculateStats } from '../lib/stats';
import { TaskModal } from './TaskModal';
import { HabitModal } from './HabitModal';
import { EventModal } from './EventModal';

interface DashboardProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onNavigate: (view: View) => void;
}

export function Dashboard({ state, updateState, onNavigate }: DashboardProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  
  const stats = React.useMemo(() => calculateStats(state), [state]);
  const today = React.useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const activeTimer = state.activeTimer;

  const toggleTimer = () => {
    if (!activeTimer) {
      updateState(prev => ({
        ...prev,
        activeTimer: {
          presetId: 'pomodoro',
          presetName: 'Pomodoro',
          duration: 25 * 60,
          timeLeft: 25 * 60,
          isRunning: true,
          lastUpdated: new Date().toISOString()
        }
      }));
      return;
    }
    updateState(prev => ({
      ...prev,
      activeTimer: prev.activeTimer ? {
        ...prev.activeTimer,
        isRunning: !prev.activeTimer.isRunning,
        lastUpdated: new Date().toISOString()
      } : undefined
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: taskData.title || '',
      category: taskData.category || 'Personal',
      priority: taskData.priority || 'medium',
      completed: false,
      date: taskData.date || today,
      time: taskData.time,
      notes: taskData.notes,
    };
    updateState(prev => ({ ...prev, tasks: [task, ...prev.tasks] }));
  };

  const handleSaveHabit = (habitData: Partial<Habit>) => {
    const habit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name: habitData.name || '',
      category: habitData.category || 'Personal',
      frequency: habitData.frequency || 'daily',
      notes: habitData.notes,
      reminderTime: habitData.reminderTime,
      completedDates: [],
      streak: 0,
      totalCompletions: 0,
      createdAt: new Date().toISOString()
    };
    updateState(prev => ({ ...prev, habits: [habit, ...prev.habits] }));
  };

  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    const event: CalendarEvent = {
        id: Math.random().toString(36).substr(2, 9),
        title: eventData.title || 'Untitled',
        date: eventData.date || today,
        priority: eventData.priority || 'medium',
        category: eventData.category || 'Personal',
        completed: false,
        isRecurring: eventData.isRecurring || false,
        type: eventData.type || 'event',
        color: eventData.color || '#FF9F6D',
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        description: eventData.description
    };
    updateState(prev => ({ ...prev, events: [...(prev.events || []), event] }));
  };
  
  const weeklyCompletionData = React.useMemo(() => stats.weeklyTaskCompletionData.map(d => ({
    day: d.displayDate,
    count: d.completed
  })), [stats.weeklyTaskCompletionData]);

  const weekDays = React.useMemo(() => eachDayOfInterval({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date())
  }), []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 md:p-10 max-w-7xl mx-auto space-y-10 mb-24 lg:mb-10"
    >
      {/* Header & Quick Add */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-display text-brand-ink">
            High Performance, <span className="text-brand-peach">Minimalist</span> style.
          </h1>
          <p className="text-sm text-brand-muted">Crafting clarity from the chaos of daily life.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <button 
                onClick={() => setIsEventModalOpen(true)}
                className="px-5 py-3 bg-white border border-brand-sand text-brand-ink rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-sand transition-all shadow-sm flex items-center gap-2"
            >
                <CalendarIcon className="w-4 h-4" />
                <span>+ Event</span>
            </button>
            <button 
                onClick={() => setIsHabitModalOpen(true)}
                className="px-5 py-3 bg-brand-peach/10 text-brand-peach rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-peach hover:text-white transition-all shadow-sm flex items-center gap-2"
            >
                <Zap className="w-4 h-4" />
                <span>+ Habit</span>
            </button>
            <button 
                onClick={() => setIsTaskModalOpen(true)}
                className="px-5 py-3 bg-brand-ink text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-ink/90 transition-all shadow-lg flex items-center gap-2"
            >
                <Plus className="w-4 h-4" />
                <span>+ Task</span>
            </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Today's Progress", value: `${stats.completionRate}%`, icon: Target, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Focus Hours", value: `${stats.focusHoursToday}h`, icon: Timer, color: "text-indigo-500", bg: "bg-indigo-50" },
          { label: "Productivity", value: stats.dailyProductivityScore.toString(), icon: Zap, color: "text-brand-peach", bg: "bg-brand-peach/10" },
          { label: "Current Streak", value: `${stats.streak} Days`, icon: Flame, color: "text-orange-500", bg: "bg-orange-50" }
        ].map((item, i) => (
          <motion.div 
            key={i}
            variants={item}
            className="glass-card p-6 flex flex-col space-y-4 bg-white border-none shadow-sm shadow-brand-sand/10"
          >
             <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", item.bg, item.color)}>
                <item.icon className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{item.label}</p>
                <p className="text-2xl font-display text-brand-ink">{item.value}</p>
             </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Center Column */}
        <div className="lg:col-span-2 space-y-8">
            {/* Immediate Focus */}
            <motion.div variants={item} className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-display text-brand-ink">Immediate Focus</h3>
                    <div className="flex items-center gap-4">
                         <button onClick={() => setIsTaskModalOpen(true)} className="flex items-center gap-2 text-[10px] font-bold text-brand-muted hover:text-brand-ink transition-colors uppercase tracking-widest">
                            <Plus className="w-3.5 h-3.5" /> Task
                         </button>
                         <button onClick={() => setIsHabitModalOpen(true)} className="flex items-center gap-2 text-[10px] font-bold text-brand-muted hover:text-brand-ink transition-colors uppercase tracking-widest">
                            <Plus className="w-3.5 h-3.5" /> Habit
                         </button>
                    </div>
                </div>
                <div className="glass-card p-10 bg-brand-ink text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000">
                      <Timer className="w-64 h-64" />
                    </div>
                    <div className="space-y-4 relative z-10 text-center md:text-left">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full">
                            <div className={cn("w-2 h-2 rounded-full", activeTimer?.isRunning ? "bg-emerald-400 animate-pulse" : "bg-brand-peach")} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-sand">{activeTimer?.presetName || 'Deep Work'}</span>
                        </div>
                        <div className="text-7xl font-display tracking-tight tabular-nums">
                            {formatTime(activeTimer?.timeLeft ?? 25 * 60)}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <button 
                            onClick={toggleTimer}
                            className={cn(
                                "w-24 h-24 rounded-[32px] flex items-center justify-center transition-all shadow-xl active:scale-95",
                                activeTimer?.isRunning ? "bg-white text-brand-ink" : "bg-brand-peach text-brand-ink"
                            )}
                        >
                            {activeTimer?.isRunning ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Routine Mastery & Upcoming */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div variants={item} className="glass-card p-8 space-y-6 bg-white overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-display text-brand-ink">Routine Mastery</h3>
                        <Activity className="w-4 h-4 text-brand-peach" />
                    </div>
                    <div className="flex-1 space-y-4">
                        {state.habits.slice(0, 3).map(habit => (
                            <div key={habit.id} className="flex items-center justify-between p-4 bg-brand-sand/5 rounded-2xl border border-transparent hover:border-brand-sand/50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center",
                                        habit.completedDates.includes(today) ? "bg-emerald-100 text-emerald-600" : "bg-white border border-brand-sand"
                                    )}>
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-semibold text-brand-ink">{habit.name}</span>
                                </div>
                                <span className="text-[10px] font-bold text-brand-peach">{habit.streak}d</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => onNavigate?.('habits')} className="w-full py-4 text-[10px] font-bold uppercase tracking-widest text-brand-muted hover:text-brand-ink border-t border-brand-sand/50 mt-2">
                        Habit Tracker
                    </button>
                </motion.div>

                <motion.div variants={item} className="glass-card p-8 space-y-6 bg-white overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-display text-brand-ink">Upcoming Events</h3>
                        <CalendarIcon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="flex-1 space-y-4">
                        {state.events.filter(e => e.date >= today).slice(0, 3).map(event => (
                            <div key={event.id} className="flex items-center space-x-4 p-4 bg-brand-sand/5 rounded-2xl">
                                <div className="w-1 h-6 rounded-full" style={{ backgroundColor: event.color }} />
                                <div>
                                    <p className="text-sm font-semibold text-brand-ink">{event.title}</p>
                                    <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{format(parseISO(event.date), 'MMM d')} @ {event.startTime}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => onNavigate?.('calendar')} className="w-full py-4 text-[10px] font-bold uppercase tracking-widest text-brand-muted hover:text-brand-ink border-t border-brand-sand/50 mt-2">
                        View Schedule
                    </button>
                </motion.div>
            </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
            {/* Task Overview */}
            <motion.div variants={item} className="glass-card p-8 bg-white space-y-6 border-none shadow-sm">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-display text-brand-ink">Task Overview</h3>
                    <button onClick={() => onNavigate?.('daily')} className="text-[10px] font-bold text-brand-peach uppercase">View All</button>
                </div>
                <div className="space-y-4">
                    {[
                        { label: 'Completed', value: state.tasks.filter(t => t.completed && t.date === today).length, total: state.tasks.filter(t => t.date === today).length, color: 'bg-emerald-400' },
                        { label: 'Pending', value: state.tasks.filter(t => !t.completed && t.date === today).length, total: state.tasks.filter(t => t.date === today).length, color: 'bg-indigo-400' }
                    ].map(stat => (
                        <div key={stat.label} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                                <span>{stat.label}</span>
                                <span>{stat.value} / {stat.total}</span>
                            </div>
                            <div className="h-1.5 w-full bg-brand-sand rounded-full overflow-hidden">
                                <div className={cn("h-full", stat.color)} style={{ width: stat.total > 0 ? `${(stat.value / stat.total) * 100}%` : '0%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Weekly Progress */}
            <motion.div variants={item} className="glass-card p-8 bg-brand-ink text-white space-y-6">
                 <h3 className="text-lg font-display">Weekly Progress</h3>
                 <div className="flex items-end justify-between h-32 px-2">
                    {stats.weeklyTaskCompletionData.map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 group">
                             <div 
                                className="w-1.5 bg-brand-peach rounded-full transition-all duration-500 group-hover:bg-white" 
                                style={{ height: `${(d.completed / (state.tasks.length || 1)) * 100 + 10}%` }}
                             />
                             <span className="text-[8px] font-bold uppercase text-brand-muted group-hover:text-white transition-colors">{d.displayDate[0]}</span>
                        </div>
                    ))}
                 </div>
            </motion.div>

            {/* Quick Actions / Summary */}
            <motion.div variants={item} className="p-8 bg-brand-peach rounded-[40px] text-brand-ink space-y-4">
                <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5" />
                    <h3 className="text-lg font-display">Daily Summary</h3>
                </div>
                <p className="text-xs font-semibold leading-relaxed opacity-80">
                    You've maintained an 85% completion rate this week. Keep up the deep work sessions to maximize your productivity score.
                </p>
                <div className="pt-4 flex gap-2">
                    <button onClick={() => setIsTaskModalOpen(true)} className="flex-1 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all">
                        <Plus className="w-5 h-5 text-brand-peach" />
                    </button>
                    <button onClick={() => setIsHabitModalOpen(true)} className="flex-1 h-12 bg-brand-ink text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all">
                        <Plus className="w-5 h-5 text-brand-peach" />
                    </button>
                </div>
            </motion.div>
        </div>
      </div>
      
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSave={handleSaveTask} 
      />
      
      <HabitModal 
        isOpen={isHabitModalOpen} 
        onClose={() => setIsHabitModalOpen(false)} 
        onSave={handleSaveHabit} 
      />

      <EventModal 
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
      />
    </motion.div>
  );
}
