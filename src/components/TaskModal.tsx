import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, Tag, Flag, AlignLeft } from 'lucide-react';
import { Task, Category } from '../types';
import { CATEGORIES } from '../constants';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  initialTask?: Task | null;
}

export function TaskModal({ isOpen, onClose, onSave, initialTask }: TaskModalProps) {
  const [taskData, setTaskData] = useState<Partial<Task>>({
    title: '',
    category: 'Work',
    priority: 'medium',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
    notes: '',
    completed: false
  });

  useEffect(() => {
    if (initialTask) {
      setTaskData(initialTask);
    } else {
      setTaskData({
        title: '',
        category: 'Work',
        priority: 'medium',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '',
        notes: '',
        completed: false
      });
    }
  }, [initialTask, isOpen]);

  const handleSave = () => {
    if (!taskData.title?.trim()) return;
    onSave(taskData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-ink/40 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-[40px] shadow-2xl z-[110] overflow-hidden"
          >
            <div className="p-8 md:p-10 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-display text-brand-ink">
                  {initialTask ? 'Edit Task' : 'New Task'}
                </h3>
                <button 
                  onClick={onClose}
                  className="p-3 hover:bg-brand-sand rounded-2xl transition-colors"
                >
                  <X className="w-5 h-5 text-brand-muted" />
                </button>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2">Title</label>
                  <input
                    autoFocus
                    type="text"
                    value={taskData.title}
                    onChange={e => setTaskData({ ...taskData, title: e.target.value })}
                    placeholder="Enter task name..."
                    className="w-full px-6 py-4 bg-brand-sand/30 border border-brand-sand rounded-[24px] focus:outline-none focus:border-brand-peach transition-all font-medium text-brand-ink"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> Date
                    </label>
                    <input
                      type="date"
                      value={taskData.date}
                      onChange={e => setTaskData({ ...taskData, date: e.target.value })}
                      className="w-full px-6 py-4 bg-brand-sand/30 border border-brand-sand rounded-[24px] focus:outline-none focus:border-brand-peach transition-all text-sm font-medium"
                    />
                  </div>
                  {/* Time */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Time
                    </label>
                    <input
                      type="time"
                      value={taskData.time}
                      onChange={e => setTaskData({ ...taskData, time: e.target.value })}
                      className="w-full px-6 py-4 bg-brand-sand/30 border border-brand-sand rounded-[24px] focus:outline-none focus:border-brand-peach transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-1.5">
                      <Tag className="w-3 h-3" /> Category
                    </label>
                    <select
                      value={taskData.category}
                      onChange={e => setTaskData({ ...taskData, category: e.target.value as Category })}
                      className="w-full px-6 py-4 bg-brand-sand/30 border border-brand-sand rounded-[24px] focus:outline-none focus:border-brand-peach transition-all text-sm font-medium appearance-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  {/* Priority */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-1.5">
                      <Flag className="w-3 h-3" /> Priority
                    </label>
                    <div className="flex bg-brand-sand/30 p-1 rounded-[24px] border border-brand-sand">
                      {(['low', 'medium', 'high'] as const).map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setTaskData({ ...taskData, priority: p })}
                          className={cn(
                            "flex-1 py-3 rounded-[20px] text-[10px] font-bold uppercase tracking-wider transition-all",
                            taskData.priority === p 
                              ? "bg-brand-ink text-white shadow-md" 
                              : "text-brand-muted hover:bg-brand-sand"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-1.5">
                    <AlignLeft className="w-3 h-3" /> Notes
                  </label>
                  <textarea
                    value={taskData.notes}
                    onChange={e => setTaskData({ ...taskData, notes: e.target.value })}
                    placeholder="Add details..."
                    rows={3}
                    className="w-full px-6 py-4 bg-brand-sand/30 border border-brand-sand rounded-[24px] focus:outline-none focus:border-brand-peach transition-all font-medium text-brand-ink resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={!taskData.title?.trim()}
                className="w-full py-5 bg-brand-ink text-white rounded-[24px] font-bold text-lg hover:bg-brand-ink/90 transition-all shadow-xl shadow-brand-ink/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {initialTask ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
