import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState, Task, Category } from '../types';
import { 
  Plus, 
  Trash2, 
  Check, 
  Circle, 
  Clock, 
  Zap,
  CheckCircle2,
  ListFilter,
  MoreVertical,
  Edit2,
  AlertCircle,
  Search,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { format, isPast, isToday, isFuture } from 'date-fns';
import { CATEGORIES } from '../constants';
import { cn } from '../lib/utils';
import { TaskModal } from './TaskModal';

interface DailyFlowProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

export function DailyFlow({ state, updateState }: DailyFlowProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'All' | 'Today' | 'Upcoming' | 'Overdue'>('All');
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'title'>('priority');

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      updateState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } as Task : t)
      }));
    } else {
      const task: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: taskData.title || '',
        category: taskData.category || 'Work',
        priority: taskData.priority || 'medium',
        completed: false,
        date: taskData.date || todayStr,
        time: taskData.time,
        notes: taskData.notes,
      };
      updateState(prev => ({ ...prev, tasks: [task, ...prev.tasks] }));
    }
    setEditingTask(null);
  };

  const toggleTask = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    updateState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  };

  const deleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  const openEdit = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const allTasks = state.tasks || [];
  
  const filteredTasks = allTasks.filter(t => {
    const isCatMatch = activeFilter === 'All' || t.category === activeFilter;
    const isSearchMatch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (t.notes?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let isDateMatch = true;
    if (dateFilter === 'Today') isDateMatch = t.date === todayStr;
    if (dateFilter === 'Upcoming') isDateMatch = t.date > todayStr;
    if (dateFilter === 'Overdue') isDateMatch = t.date < todayStr && !t.completed;

    return isCatMatch && isSearchMatch && isDateMatch;
  });

  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      if (sortBy === 'priority') {
        const pMap = { high: 0, medium: 1, low: 2 };
        if (pMap[a.priority] !== pMap[b.priority]) return pMap[a.priority] - pMap[b.priority];
        return a.date.localeCompare(b.date);
      }
      if (sortBy === 'date') {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        const pMap = { high: 0, medium: 1, low: 2 };
        return pMap[a.priority] - pMap[b.priority];
      }
      return a.title.localeCompare(b.title);
    });
  };

  const activeTasks = sortTasks(filteredTasks.filter(t => !t.completed));
  const completedTasks = sortTasks(filteredTasks.filter(t => t.completed));

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-12 mb-24 lg:mb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-5xl font-display text-brand-ink">Inventory</h2>
          <p className="text-sm text-brand-muted">Strategic management of your daily targets.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input 
                type="text" 
                placeholder="Find a task..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-12 pr-6 py-4 bg-white border border-brand-sand rounded-2xl text-xs font-bold focus:border-brand-peach focus:ring-4 focus:ring-brand-peach/5 transition-all shadow-sm"
              />
           </div>
           <button 
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="w-14 h-14 bg-brand-ink text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-8 border-y border-brand-sand/50">
        <div className="flex flex-wrap items-center gap-2">
            <button
                onClick={() => setDateFilter('All')}
                className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                    dateFilter === 'All' ? "bg-brand-ink text-white shadow-lg" : "bg-white border border-brand-sand text-brand-muted hover:bg-brand-sand"
                )}
            >
                All
            </button>
            <button
                onClick={() => setDateFilter('Today')}
                className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                    dateFilter === 'Today' ? "bg-brand-peach text-white shadow-lg" : "bg-white border border-brand-sand text-brand-muted hover:bg-brand-sand"
                )}
            >
                Today
            </button>
            <button
                onClick={() => setDateFilter('Upcoming')}
                className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                    dateFilter === 'Upcoming' ? "bg-indigo-500 text-white shadow-lg" : "bg-white border border-brand-sand text-brand-muted hover:bg-brand-sand"
                )}
            >
                Upcoming
            </button>
            <button
                onClick={() => setDateFilter('Overdue')}
                className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                    dateFilter === 'Overdue' ? "bg-red-500 text-white shadow-lg" : "bg-white border border-brand-sand text-brand-muted hover:bg-brand-sand"
                )}
            >
                Overdue
            </button>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 text-brand-muted">
                <ArrowUpDown className="w-4 h-4" />
                <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest focus:ring-0 cursor-pointer"
                >
                    <option value="priority">Sort by Priority</option>
                    <option value="date">Sort by Date</option>
                    <option value="title">Sort by Title</option>
                </select>
            </div>
            
            <div className="h-6 w-px bg-brand-sand hidden md:block" />

            <div className="flex items-center overflow-x-auto gap-1 no-scrollbar max-w-[300px]">
                {['All', ...CATEGORIES].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveFilter(cat as any)}
                        className={cn(
                        "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                        activeFilter === cat 
                            ? "text-brand-peach" 
                            : "text-brand-muted hover:text-brand-ink"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="space-y-12">
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3 text-brand-muted">
                <Clock className="w-4 h-4" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Pending Strategy ({activeTasks.length})</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {activeTasks.map((task, idx) => {
                const isOverdue = isPast(new Date(task.date)) && !isToday(new Date(task.date));
                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "glass-card p-6 flex items-center justify-between group hover:border-brand-peach/30 transition-all cursor-pointer bg-white relative overflow-hidden",
                      isOverdue && "border-red-100 bg-red-50/10"
                    )}
                    onClick={() => setEditingTask(null)}
                  >
                    <div className="flex items-center space-x-6">
                      <button 
                        onClick={(e) => toggleTask(task.id, e)}
                        className="w-12 h-12 rounded-2xl border-2 border-brand-sand flex items-center justify-center group-hover:border-brand-peach transition-all active:scale-90"
                      >
                        <Circle className="w-6 h-6 text-transparent group-hover:text-brand-peach/20" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-brand-ink text-xl leading-snug truncate">{task.title}</h4>
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest border",
                            task.priority === 'high' ? "bg-red-50 text-red-500 border-red-100" :
                            task.priority === 'medium' ? "bg-orange-50 text-orange-500 border-orange-100" :
                            "bg-brand-sand/30 text-brand-muted border-brand-sand/50"
                          )}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-peach/80">{task.category}</span>
                          <div className={cn(
                            "flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wide",
                            isOverdue ? "text-red-400" : "text-brand-muted"
                          )}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{isToday(new Date(task.date)) ? 'Today' : task.date} {task.time && `@ ${task.time}`}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={(e) => openEdit(task, e)}
                        className="p-4 text-brand-muted hover:text-brand-ink hover:bg-brand-sand rounded-2xl transition-all"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => deleteTask(task.id, e)}
                        className="p-4 text-brand-muted hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {activeTasks.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 flex flex-col items-center justify-center text-brand-muted border-2 border-dashed border-brand-sand/50 rounded-[48px] space-y-6 bg-brand-sand/5"
              >
                <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-lg">
                  <Check className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-display text-brand-ink">Strategy Clear</p>
                  <p className="text-sm mt-1">Your inventory is optimized for now.</p>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {completedTasks.length > 0 && (
          <section className="space-y-6">
             <div className="flex items-center space-x-3 text-brand-muted px-2">
               <CheckCircle2 className="w-4 h-4" />
               <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Redeemed ({completedTasks.length})</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    className="glass-card p-5 flex items-center justify-between bg-brand-sand/5 border-transparent opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={(e) => toggleTask(task.id, e)}
                        className="w-8 h-8 bg-emerald-100 flex items-center justify-center rounded-xl"
                      >
                        <Check className="w-4 h-4 text-emerald-600 stroke-[3px]" />
                      </button>
                      <h4 className="font-semibold text-brand-muted line-through text-sm">{task.title}</h4>
                    </div>
                    <button 
                      onClick={(e) => deleteTask(task.id, e)}
                      className="p-2 text-brand-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
             </div>
          </section>
        )}
      </div>

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />
    </div>
  );
}
