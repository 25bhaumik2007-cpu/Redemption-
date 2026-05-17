import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState, Habit, Category } from '../types';
import { 
  Plus, 
  Search, 
  Check, 
  Clock, 
  Trash2, 
  Calendar as CalendarIcon,
  X,
  CheckCircle2,
  Edit2,
  Zap,
  Circle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { CATEGORIES } from '../constants';
import { HabitModal } from './HabitModal';

interface HabitTrackerProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

export function HabitTracker({ state, updateState }: HabitTrackerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');

  const today = format(new Date(), 'yyyy-MM-dd');

  const toggleHabit = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    updateState(prev => ({
      ...prev,
      habits: prev.habits.map(h => {
        if (h.id !== id) return h;
        const isCompletedToday = h.completedDates.includes(today);
        const newDates = isCompletedToday 
          ? h.completedDates.filter(d => d !== today)
          : [...h.completedDates, today];
        
        return {
          ...h,
          completedDates: newDates,
          streak: isCompletedToday ? Math.max(0, h.streak - 1) : h.streak + 1,
          totalCompletions: isCompletedToday ? h.totalCompletions - 1 : h.totalCompletions + 1
        };
      })
    }));
  };

  const handleSaveHabit = (habitData: Partial<Habit>) => {
    if (editingHabit) {
      updateState(prev => ({
        ...prev,
        habits: prev.habits.map(h => h.id === editingHabit.id ? { ...h, ...habitData } as Habit : h)
      }));
    } else {
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
    }
    setEditingHabit(null);
  };

  const deleteHabit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateState(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== id)
    }));
  };

  const openEdit = (habit: Habit, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const filteredHabits = (state.habits || []).filter(h => {
    const isCategoryMatch = activeCategory === 'All' || h.category === activeCategory;
    const isSearchMatch = h.name.toLowerCase().includes(search.toLowerCase());
    return isCategoryMatch && isSearchMatch;
  });

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-12 mb-24 lg:mb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-3xl md:text-5xl font-display text-brand-ink">Rituals</h2>
          <p className="text-sm text-brand-muted mt-1">Consistency creates character. Track daily devotion.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted group-focus-within:text-brand-peach transition-colors" />
                <input 
                type="text" 
                placeholder="Search rituals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-64 pl-14 pr-6 py-4 bg-white border border-brand-sand rounded-[24px] focus:outline-none focus:ring-4 focus:ring-brand-peach/10 focus:border-brand-peach transition-all shadow-sm text-xs font-bold"
                />
            </div>
            <button 
                onClick={() => {
                    setEditingHabit(null);
                    setIsModalOpen(true);
                }}
                className="flex items-center justify-center space-x-3 px-8 py-4 bg-brand-ink text-white rounded-[24px] hover:bg-brand-ink/90 shadow-xl transition-all font-bold"
            >
                <Plus className="w-5 h-5" />
                <span>Create ritual</span>
            </button>
        </div>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
          {['All', ...CATEGORIES].map(cat => (
              <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as any)}
                  className={cn(
                      "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                      activeCategory === cat 
                        ? "bg-brand-peach text-white shadow-lg shadow-brand-peach/20" 
                        : "bg-white border border-brand-sand text-brand-muted hover:bg-brand-sand"
                  )}
              >
                  {cat}
              </button>
          ))}
      </div>

      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredHabits.map((habit) => {
            const isCompletedToday = habit.completedDates.includes(today);
            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "glass-card p-8 flex flex-col space-y-6 group relative overflow-hidden transition-all duration-500 bg-white",
                  isCompletedToday && "bg-emerald-50/10 border-emerald-100"
                )}
                onClick={() => toggleHabit(habit.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-peach">
                      {habit.category}
                    </span>
                    <h3 className={cn("font-semibold text-xl text-brand-ink transition-all", isCompletedToday && "text-emerald-600 line-through")}>{habit.name}</h3>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => openEdit(habit, e)}
                      className="p-3 text-brand-muted hover:text-brand-ink hover:bg-brand-sand rounded-xl transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => deleteHabit(habit.id, e)}
                      className="p-3 text-brand-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className={cn(
                    "flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider",
                    habit.streak > 0 ? "text-brand-peach" : "text-brand-muted"
                  )}>
                    <Zap className="w-3.5 h-3.5" />
                    <span>{habit.streak} DAY STREAK</span>
                  </div>
                  {habit.reminderTime && (
                    <div className="flex items-center space-x-2 text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{habit.reminderTime}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button 
                    onClick={(e) => toggleHabit(habit.id, e)}
                    className={cn(
                      "w-full py-5 rounded-[24px] flex items-center justify-center space-x-3 font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm",
                      isCompletedToday 
                        ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" 
                        : "bg-brand-sand/50 text-brand-ink hover:bg-brand-sand"
                    )}
                  >
                    {isCompletedToday ? <Check className="w-4 h-4 stroke-[3px]" /> : <Circle className="w-4 h-4" />}
                    <span>{isCompletedToday ? 'Strategy Redeemed' : 'Execute Ritual'}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filteredHabits.length === 0 && (
         <div className="py-32 flex flex-col items-center justify-center text-brand-muted space-y-6 bg-brand-sand/5 rounded-[48px] border-2 border-dashed border-brand-sand">
            <div className="w-24 h-24 rounded-[32px] bg-white shadow-xl flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-brand-sand" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-display text-brand-ink">No rituals found</p>
              <p className="text-sm mt-1">Refine your search or create a new discipline.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="text-brand-peach text-sm font-bold hover:underline underline-offset-8">Draft new ritual</button>
         </div>
      )}

      <HabitModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        initialHabit={editingHabit}
      />
    </div>
  );
}
