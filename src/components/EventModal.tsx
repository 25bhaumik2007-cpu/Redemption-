import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar as CalendarIcon, Clock, Tag, Flag, Bell, Repeat, Type, AlignLeft } from 'lucide-react';
import { CalendarEvent, Category, Task } from '../types';
import { CATEGORIES } from '../constants';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<CalendarEvent>) => void;
  initialEvent?: CalendarEvent | null;
  selectedDate?: Date;
}

export function EventModal({ isOpen, onClose, onSave, initialEvent, selectedDate }: EventModalProps) {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    date: format(selectedDate || new Date(), 'yyyy-MM-dd'),
    startTime: '10:00',
    endTime: '11:00',
    priority: 'medium',
    category: 'Personal',
    type: 'event',
    isRecurring: false,
    recurrenceRule: 'daily',
    remindMe: false,
    reminderTime: '15:00',
    color: '#FF9F6D',
    completed: false
  });

  useEffect(() => {
    if (initialEvent) {
      setFormData(initialEvent);
    } else if (selectedDate) {
      setFormData(prev => ({ ...prev, date: format(selectedDate, 'yyyy-MM-dd') }));
    }
  }, [initialEvent, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    onSave(formData);
    onClose();
  };

  const colors = [
    { name: 'Peach', value: '#FF9F6D' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Rose', value: '#F43F5E' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Sky', value: '#0EA5E9' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-ink/40 backdrop-blur-lg z-[100] flex items-center justify-center p-4"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[5%] bottom-[5%] md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white rounded-[40px] shadow-2xl z-[110] overflow-hidden flex flex-col"
          >
            <div className="p-8 border-b border-brand-sand flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-brand-peach/10 rounded-2xl">
                  <CalendarIcon className="w-5 h-5 text-brand-peach" />
                </div>
                <div>
                  <h3 className="text-2xl font-display text-brand-ink">
                    {initialEvent ? 'Edit Ritual' : 'New Plan'}
                  </h3>
                  <p className="text-[10px] text-brand-muted uppercase font-bold tracking-[0.2em]">Craft your time</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-brand-sand rounded-2xl transition-colors">
                <X className="w-5 h-5 text-brand-muted" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* Type Selector */}
              <div className="flex bg-brand-sand/30 p-1 rounded-2xl border border-brand-sand">
                {(['event', 'reminder', 'note'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t })}
                    className={cn(
                      "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all",
                      formData.type === t ? "bg-white text-brand-ink shadow-sm" : "text-brand-muted hover:text-brand-ink"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <Type className="w-3 h-3" /> Title
                  </label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="What's happening?"
                    className="w-full px-6 py-4 bg-brand-sand/30 border border-brand-sand rounded-[24px] focus:outline-none focus:border-brand-peach transition-all font-medium"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                      <CalendarIcon className="w-3 h-3" /> Date
                    </label>
                    <input 
                      type="date" 
                      className="w-full px-6 py-4 bg-brand-sand/30 border border-brand-sand rounded-[24px] focus:outline-none focus:border-brand-peach transition-all font-medium"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Start
                      </label>
                      <input 
                        type="time" 
                        className="w-full px-4 py-4 bg-brand-sand/30 border border-brand-sand rounded-[24px] focus:outline-none focus:border-brand-peach transition-all font-medium text-sm"
                        value={formData.startTime}
                        onChange={e => setFormData({...formData, startTime: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> End
                      </label>
                      <input 
                        type="time" 
                        className="w-full px-4 py-4 bg-brand-sand/30 border border-brand-sand rounded-[24px] focus:outline-none focus:border-brand-peach transition-all font-medium text-sm"
                        value={formData.endTime}
                        onChange={e => setFormData({...formData, endTime: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                      <Tag className="w-3 h-3" /> Space
                    </label>
                    <select
                      className="w-full px-6 py-4 bg-brand-sand/30 border border-brand-sand rounded-[24px] focus:outline-none focus:border-brand-peach transition-all font-medium"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value as Category})}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                      <Flag className="w-3 h-3" /> Priority
                    </label>
                    <div className="flex bg-brand-sand/30 p-1 rounded-2xl border border-brand-sand">
                      {(['low', 'medium', 'high'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: p })}
                          className={cn(
                            "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all",
                            formData.priority === p ? "bg-white text-brand-ink shadow-sm" : "text-brand-muted hover:text-brand-ink"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <Repeat className="w-3 h-3" /> Recurrence
                  </label>
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-3 ml-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
                        className={cn(
                          "w-10 h-5 rounded-full transition-all relative",
                          formData.isRecurring ? "bg-brand-peach" : "bg-brand-sand"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
                          formData.isRecurring ? "left-6" : "left-1"
                        )} />
                      </button>
                      <span className="text-xs font-semibold text-brand-ink">Repeat this event</span>
                    </div>
                    {formData.isRecurring && (
                      <div className="flex bg-brand-sand/30 p-1 rounded-2xl border border-brand-sand ml-2">
                        {(['daily', 'weekly', 'monthly'] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setFormData({ ...formData, recurrenceRule: r })}
                            className={cn(
                              "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all",
                              formData.recurrenceRule === r ? "bg-white text-brand-ink shadow-sm" : "text-brand-muted hover:text-brand-ink"
                            )}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <Bell className="w-3 h-3" /> Reminders
                  </label>
                  <div className="flex items-center space-x-3 ml-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, remindMe: !formData.remindMe })}
                      className={cn(
                        "w-10 h-5 rounded-full transition-all relative",
                        formData.remindMe ? "bg-brand-peach" : "bg-brand-sand"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
                        formData.remindMe ? "left-6" : "left-1"
                      )} />
                    </button>
                    <span className="text-xs font-semibold text-brand-ink">Notify me 15m before</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2">Color Tag</label>
                  <div className="flex flex-wrap gap-4 ml-2">
                    {colors.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={cn(
                          "w-8 h-8 rounded-full border-4 transition-all",
                          formData.color === color.value ? "border-brand-ink ring-2 ring-brand-peach/30" : "border-transparent"
                        )}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <AlignLeft className="w-3 h-3" /> Description
                  </label>
                  <textarea 
                    placeholder="Add details, links, or notes..."
                    className="w-full px-6 py-4 bg-brand-sand/30 border border-brand-sand rounded-[24px] focus:outline-none focus:border-brand-peach transition-all font-medium text-sm min-h-[120px] resize-none"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </form>

            <div className="p-8 border-t border-brand-sand shrink-0">
              <button 
                type="submit"
                onClick={handleSubmit}
                className="w-full py-5 bg-brand-peach text-white rounded-[24px] font-bold text-lg hover:bg-brand-peach/90 active:scale-95 transition-all shadow-xl shadow-brand-peach/20"
              >
                {initialEvent ? 'Update Plan' : 'Add to Calendar'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
