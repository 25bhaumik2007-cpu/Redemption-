import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Tag, AlignLeft, BarChart } from 'lucide-react';
import { Habit, Category } from '../types';
import { CATEGORIES } from '../constants';
import { cn } from '../lib/utils';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Partial<Habit>) => void;
  initialHabit?: Habit | null;
}

export function HabitModal({ isOpen, onClose, onSave, initialHabit }: HabitModalProps) {
  const [habitData, setHabitData] = useState<Partial<Habit>>({
    name: '',
    category: 'Health',
    frequency: 'daily',
    notes: '',
    reminderTime: ''
  });

  useEffect(() => {
    if (initialHabit) {
      setHabitData(initialHabit);
    } else {
      setHabitData({
        name: '',
        category: 'Health',
        frequency: 'daily',
        notes: '',
        reminderTime: ''
      });
    }
  }, [initialHabit, isOpen]);

  const handleSave = () => {
    if (!habitData.name?.trim()) return;
    onSave(habitData);
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
                  {initialHabit ? 'Edit Habit' : 'New Habit'}
                </h3>
                <button 
                  onClick={onClose}
                  className="p-3 hover:bg-brand-sand rounded-2xl transition-colors"
                >
                  <X className="w-5 h-5 text-brand-muted" />
                </button>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2">Name</label>
                  <input
                    autoFocus
                    type="text"
                    value={habitData.name}
                    onChange={e => setHabitData({ ...habitData, name: e.target.value })}
                    placeholder="e.g. Daily Meditation"
                    className="w-full px-6 py-4 bg-brand-sand/30 border border-brand-sand rounded-[24px] focus:outline-none focus:border-brand-peach transition-all font-medium text-brand-ink"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-1.5">
                      <Tag className="w-3 h-3" /> Category
                    </label>
                    <select
                      value={habitData.category}
                      onChange={e => setHabitData({ ...habitData, category: e.target.value as Category })}
                      className="w-full px-6 py-4 bg-brand-sand/30 border border-brand-sand rounded-[24px] focus:outline-none focus:border-brand-peach transition-all text-sm font-medium appearance-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  {/* Frequency */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-1.5">
                      <BarChart className="w-3 h-3" /> Frequency
                    </label>
                    <select
                      value={habitData.frequency}
                      onChange={e => setHabitData({ ...habitData, frequency: e.target.value as any })}
                      className="w-full px-6 py-4 bg-brand-sand/30 border border-brand-sand rounded-[24px] focus:outline-none focus:border-brand-peach transition-all text-sm font-medium appearance-none"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>

                {/* Reminder Time */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Reminder Time
                  </label>
                  <input
                    type="time"
                    value={habitData.reminderTime}
                    onChange={e => setHabitData({ ...habitData, reminderTime: e.target.value })}
                    className="w-full px-6 py-4 bg-brand-sand/30 border border-brand-sand rounded-[24px] focus:outline-none focus:border-brand-peach transition-all text-sm font-medium"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-1.5">
                    <AlignLeft className="w-3 h-3" /> Notes
                  </label>
                  <textarea
                    value={habitData.notes}
                    onChange={e => setHabitData({ ...habitData, notes: e.target.value })}
                    placeholder="Why is this habit important?"
                    rows={3}
                    className="w-full px-6 py-4 bg-brand-sand/30 border border-brand-sand rounded-[24px] focus:outline-none focus:border-brand-peach transition-all font-medium text-brand-ink resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={!habitData.name?.trim()}
                className="w-full py-5 bg-brand-peach text-brand-ink rounded-[24px] font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-peach/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {initialHabit ? 'Save Changes' : 'Add Habit'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
