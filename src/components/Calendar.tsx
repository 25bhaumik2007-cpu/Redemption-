import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  addWeeks,
  subWeeks,
  isToday,
  addDays,
  subDays,
  parseISO
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Check, 
  CheckCircle2, 
  Zap, 
  Calendar as CalendarIcon, 
  Clock, 
  Tag, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  MoreHorizontal,
  Bell,
  Repeat
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AppState, CalendarEvent, Task, Habit } from '../types';
import { EventModal } from './EventModal';

interface CalendarProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

export function Calendar({ state, updateState }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const next = () => {
    switch(view) {
      case 'month': setCurrentDate(addMonths(currentDate, 1)); break;
      case 'week': setCurrentDate(addWeeks(currentDate, 1)); break;
      case 'day':
      case 'agenda': setCurrentDate(addDays(currentDate, 1)); break;
    }
  };

  const prev = () => {
    switch(view) {
      case 'month': setCurrentDate(subMonths(currentDate, 1)); break;
      case 'week': setCurrentDate(subWeeks(currentDate, 1)); break;
      case 'day':
      case 'agenda': setCurrentDate(subDays(currentDate, 1)); break;
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: view === 'month' ? calendarStart : (view === 'week' ? startOfWeek(currentDate) : currentDate),
    end: view === 'month' ? calendarEnd : (view === 'week' ? endOfWeek(currentDate) : currentDate)
  });

  const getEventsForDay = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const tasks = state.tasks.filter(t => t.date === formattedDate);
    const completedHabits = state.habits.filter(h => h.completedDates.includes(formattedDate));
    const events = (state.events || []).filter(e => e.date === formattedDate);
    return { tasks, completedHabits, events };
  };

  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    updateState(prev => {
      const newEvent: CalendarEvent = {
        id: editingEvent?.id || Math.random().toString(36).substr(2, 9),
        title: eventData.title || 'Untitled Plan',
        description: eventData.description || '',
        date: eventData.date || format(currentDate, 'yyyy-MM-dd'),
        startTime: eventData.startTime || '09:00',
        endTime: eventData.endTime || '10:00',
        priority: eventData.priority || 'medium',
        category: eventData.category || 'Personal',
        color: eventData.color || '#FF9F6D',
        isRecurring: eventData.isRecurring || false,
        recurrenceRule: eventData.recurrenceRule || 'daily',
        remindMe: eventData.remindMe || false,
        reminderTime: eventData.reminderTime || '15:00',
        completed: eventData.completed || false,
        type: eventData.type || 'event'
      };

      if (editingEvent) {
        return {
          ...prev,
          events: prev.events.map(e => e.id === editingEvent.id ? newEvent : e)
        };
      }
      return {
        ...prev,
        events: [...(prev.events || []), newEvent]
      };
    });
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    updateState(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== id)
    }));
  };

  const toggleTaskCompletion = (taskId: string) => {
    updateState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));
  };

  const getHeatmapColor = (date: Date) => {
    const { tasks, completedHabits, events } = getEventsForDay(date);
    const count = tasks.filter(t => t.completed).length + completedHabits.length + events.filter(e => e.completed).length;
    if (count === 0) return '';
    if (count < 2) return 'bg-brand-peach/5';
    if (count < 4) return 'bg-brand-peach/10';
    return 'bg-brand-peach/20';
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 mb-20 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-display text-brand-ink">
            {view === 'day' || view === 'agenda' ? format(currentDate, 'MMMM do, yyyy') : format(currentDate, 'MMMM yyyy')}
          </h2>
          <p className="text-sm text-brand-muted">Your time, beautifully organized.</p>
        </div>
        
        <div className="grid grid-cols-4 gap-1 flex-1 max-w-md bg-brand-sand/30 p-1 rounded-2xl border border-brand-sand">
          {(['month', 'week', 'day', 'agenda'] as const).map((v) => (
            <button 
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-2 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all",
                view === v ? "bg-white text-brand-ink shadow-sm" : "text-brand-muted hover:text-brand-ink"
              )}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={() => { setEditingEvent(null); setIsModalOpen(true); }} className="px-5 py-2 bg-brand-ink text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-brand-ink/20 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Idea
          </button>
          <div className="h-4 w-px bg-brand-sand mx-2" />
          <button onClick={prev} className="p-3 hover:bg-brand-sand rounded-2xl transition-colors shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-5 py-2 bg-white border border-brand-sand text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors shrink-0">
            Today
          </button>
          <button onClick={next} className="p-3 hover:bg-brand-sand rounded-2xl transition-colors shrink-0">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {(view === 'month' || view === 'week') ? (
        <div className="glass-card shadow-2xl shadow-brand-sand/10 overflow-hidden bg-white/30 backdrop-blur-sm">
          <div className="grid grid-cols-7 border-b border-brand-sand">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-4 text-center text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const { tasks, completedHabits, events } = getEventsForDay(day);
              const isSelected = isSameDay(day, currentDate);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isTodayDate = isToday(day);

              return (
                <div 
                  key={day.toString()}
                  className={cn(
                    "min-h-[140px] p-3 border-r border-b border-brand-sand transition-colors cursor-pointer hover:bg-white/40 group relative overflow-hidden",
                    !isCurrentMonth && view === 'month' && "bg-brand-sand/5 opacity-40",
                    isSelected && "bg-brand-peach/5",
                    isSelected && "ring-2 ring-inset ring-brand-peach/30",
                    getHeatmapColor(day)
                  )}
                  onClick={() => {
                    setCurrentDate(day);
                  }}
                  onDoubleClick={() => setIsModalOpen(true)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "w-7 h-7 flex items-center justify-center text-xs font-bold rounded-xl transition-all",
                      isTodayDate ? "bg-brand-ink text-white shadow-lg" : "text-brand-ink",
                      !isCurrentMonth && view === 'month' && "text-brand-muted"
                    )}>
                      {format(day, 'd')}
                    </span>
                    {tasks.length + events.length > 0 && (
                      <div className="flex -space-x-1">
                        {tasks.slice(0, 2).map((_, idx) => (
                           <div key={idx} className="w-1.5 h-1.5 rounded-full bg-brand-sand" />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    {completedHabits.slice(0, 2).map((habit) => (
                      <div key={habit.id} className="flex items-center space-x-1 p-1 bg-brand-peach/10 rounded-lg">
                        <Zap className="w-2.5 h-2.5 text-brand-peach" />
                        <span className="text-[8px] font-bold text-brand-peach truncate uppercase tracking-tighter">{habit.name}</span>
                      </div>
                    ))}
                    {events.slice(0, 3).map((event) => (
                      <div 
                        key={event.id} 
                        className="p-1 rounded-lg truncate flex items-center space-x-1"
                        style={{ backgroundColor: `${event.color}15`, borderLeft: `2px solid ${event.color}` }}
                        onClick={(e) => { e.stopPropagation(); setEditingEvent(event); setIsModalOpen(true); }}
                      >
                        <span className="text-[8px] font-bold truncate tracking-tight" style={{ color: event.color }}>{event.title}</span>
                      </div>
                    ))}
                    {tasks.slice(0, 2).map((task) => (
                      <div key={task.id} className="p-1 bg-white border border-brand-sand rounded-lg truncate">
                        <span className={cn("text-[8px] font-medium block truncate", task.completed ? "line-through text-brand-muted" : "text-brand-ink")}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-display text-brand-ink">Agenda</h3>
              <div className="flex items-center space-x-4">
                 <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                   <div className="w-2 h-2 rounded-full bg-brand-peach" />
                   <span>Rituals</span>
                 </div>
                 <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                   <div className="w-2 h-2 rounded-full bg-brand-ink" />
                   <span>Tasks</span>
                 </div>
              </div>
            </div>

            <div className="space-y-6">
              {(() => {
                const { tasks, completedHabits, events } = getEventsForDay(currentDate);
                const allItems = [
                  ...completedHabits.map(h => ({ ...h, itemType: 'habit' })),
                  ...events.map(e => ({ ...e, itemType: 'event' })),
                  ...tasks.map(t => ({ ...t, itemType: 'task' }))
                ].sort((a: any, b: any) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

                if (allItems.length === 0) {
                  return (
                    <div className="p-20 text-center space-y-6 bg-brand-sand/10 rounded-[40px] border border-dashed border-brand-sand">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <CalendarIcon className="w-8 h-8 text-brand-muted" />
                      </div>
                      <div className="max-w-xs mx-auto">
                        <p className="text-brand-ink font-semibold">Peaceful Void</p>
                        <p className="text-sm text-brand-muted">No scheduled activities for this date. A perfect time for reflection or deep work.</p>
                      </div>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-3 bg-white border border-brand-sand rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-sand/50 transition-all"
                      >
                        Create Entry
                      </button>
                    </div>
                  );
                }

                return allItems.map((item: any) => (
                  <div key={item.id} className="group relative">
                    <div className="absolute left-[-1.5rem] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">
                       <MoreVertical className="w-4 h-4 text-brand-muted" />
                    </div>
                    <div className={cn(
                      "glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all group-hover:bg-white group-hover:shadow-xl",
                      item.completed && "opacity-60"
                    )}>
                      <div className="flex items-center space-x-6">
                        <div className={cn(
                          "w-16 h-16 rounded-[24px] flex flex-col items-center justify-center shrink-0 border border-brand-sand",
                          item.itemType === 'habit' ? "bg-brand-peach/10 text-brand-peach" : 
                          item.itemType === 'event' ? "bg-indigo-50 text-indigo-500" : "bg-brand-sand/30 text-brand-muted"
                        )} style={item.itemType === 'event' ? { backgroundColor: `${item.color}15`, color: item.color, borderColor: `${item.color}30` } : {}}>
                          {item.itemType === 'habit' ? <Zap className="w-6 h-6" /> : 
                           item.itemType === 'event' ? <Clock className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                          <span className="text-[8px] font-bold uppercase tracking-tighter mt-1">{item.startTime || (item.itemType === 'habit' ? 'Done' : 'All Day')}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-3">
                            <h4 className={cn("text-xl font-display text-brand-ink", item.completed && "line-through")}>{item.title || item.name}</h4>
                            {item.isRecurring && <Repeat className="w-3 h-3 text-brand-muted" />}
                            {item.remindMe && <Bell className="w-3 h-3 text-brand-peach" />}
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{item.category}</span>
                            <span className="w-1 h-1 rounded-full bg-brand-sand" />
                            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{item.priority || 'Low'} Priority</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end md:self-auto">
                        {item.itemType === 'event' && (
                          <>
                            <button 
                              onClick={() => { setEditingEvent(item); setIsModalOpen(true); }}
                              className="p-3 hover:bg-brand-sand rounded-xl transition-colors text-brand-muted hover:text-brand-ink"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteEvent(item.id)}
                              className="p-3 hover:bg-rose-50 rounded-xl transition-colors text-brand-muted hover:text-rose-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {item.itemType === 'task' && !item.completed && (
                          <button 
                            onClick={() => toggleTaskCompletion(item.id)}
                            className="px-6 py-3 bg-brand-ink text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all"
                          >
                            Mark Done
                          </button>
                        )}
                        {item.itemType === 'event' && (
                          <button 
                            onClick={() => updateState(prev => ({
                              ...prev,
                              events: prev.events.map(e => e.id === item.id ? { ...e, completed: !e.completed } : e)
                            }))}
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all border",
                              item.completed ? "bg-brand-peach text-white border-brand-peach" : "border-brand-sand text-brand-muted hover:border-brand-peach hover:text-brand-peach"
                            )}
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
          
          <div className="space-y-10">
            <div className="glass-card p-10 bg-brand-ink text-white space-y-6">
               <div className="flex items-center space-x-3">
                 <CalendarIcon className="w-5 h-5 text-brand-peach" />
                 <h3 className="text-2xl font-display">Notes</h3>
               </div>
               <p className="text-sm text-brand-muted leading-relaxed font-medium">
                 Ideas captured on {format(currentDate, 'MMMM do')}. These notes belong to the context of this specific date.
               </p>
               <div className="space-y-4">
                  {state.notes.filter(n => n.date?.split('T')[0] === format(currentDate, 'yyyy-MM-dd')).map(note => (
                    <div key={note.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors pointer-events-auto cursor-pointer">
                      <h5 className="font-bold text-sm mb-1">{note.title}</h5>
                      <p className="text-xs text-brand-muted line-clamp-2">{note.content}</p>
                    </div>
                  ))}
                  <button className="w-full py-5 bg-brand-peach text-brand-ink rounded-[24px] font-bold hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest">
                    Capture Thought
                  </button>
               </div>
            </div>

            <div className="glass-card p-8 bg-brand-sand/20 border-brand-sand space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">Calendar Tips</h4>
              <ul className="space-y-4">
                <li className="flex gap-3 text-xs font-medium text-brand-ink leading-relaxed">
                   <div className="w-5 h-5 rounded-full bg-brand-peach/20 flex items-center justify-center shrink-0 text-brand-peach text-[10px]">1</div>
                   Double click any date to quickly add a new ritual.
                </li>
                <li className="flex gap-3 text-xs font-medium text-brand-ink leading-relaxed">
                   <div className="w-5 h-5 rounded-full bg-brand-peach/20 flex items-center justify-center shrink-0 text-brand-peach text-[10px]">2</div>
                   The heatmap intensity shows your productivity distribution.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <EventModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingEvent(null); }}
        onSave={handleSaveEvent}
        initialEvent={editingEvent}
        selectedDate={currentDate}
      />
    </div>
  );
}
