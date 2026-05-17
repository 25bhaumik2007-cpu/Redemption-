import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search as SearchIcon, 
  X, 
  Zap, 
  CheckCircle2, 
  Book, 
  Calendar as CalendarIcon,
  Timer,
  BarChart3,
  Droplets,
  ArrowRight
} from 'lucide-react';
import { AppState, View } from '../types';
import { cn } from '../lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onNavigate: (view: any) => void;
}

export function SearchModal({ isOpen, onClose, state, onNavigate }: SearchModalProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const tasks = state.tasks
      .filter(t => t.title.toLowerCase().includes(q))
      .map(t => ({ ...t, type: 'task', icon: CheckCircle2, view: 'daily' }));

    const habits = state.habits
      .filter(h => h.name.toLowerCase().includes(q))
      .map(h => ({ ...h, title: h.name, type: 'habit', icon: Zap, view: 'habits' }));

    const notes = state.notes
      .filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .map(n => ({ ...n, type: 'note', icon: Book, view: 'notes' }));

    const analytics = q.includes('analyt') || q.includes('stat') || q.includes('graph') 
      ? [{ id: 'analytics-link', title: 'Performance Analytics', type: 'system', icon: BarChart3, view: 'analytics' }] 
      : [];

    const wellness = q.includes('well') || q.includes('water') || q.includes('mood') || q.includes('sleep')
      ? [{ id: 'wellness-link', title: 'Wellness Tracker', type: 'system', icon: Droplets, view: 'wellness' }]
      : [];

    return [...tasks, ...habits, ...notes, ...analytics, ...wellness].slice(0, 10);
  }, [query, state]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-ink/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden relative z-10"
          >
            <div className="p-6 border-b border-brand-sand flex items-center space-x-4">
              <SearchIcon className="w-5 h-5 text-brand-muted" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search habits, tasks, or notes..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-lg text-brand-ink placeholder:text-brand-muted"
              />
              <button onClick={onClose} className="p-2 hover:bg-brand-sand rounded-xl transition-colors">
                <X className="w-5 h-5 text-brand-muted" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
              {results.length > 0 ? (
                results.map((result: any, i) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => {
                      onNavigate(result.view);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-brand-sand/50 transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-brand-sand flex items-center justify-center group-hover:scale-110 transition-transform">
                        <result.icon className="w-5 h-5 text-brand-peach" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-brand-ink">{result.title}</p>
                        <p className="text-[10px] uppercase tracking-widest text-brand-muted">{result.type}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))
              ) : query ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-brand-sand/30 rounded-full flex items-center justify-center mx-auto">
                    <SearchIcon className="w-8 h-8 text-brand-muted" />
                  </div>
                  <p className="text-sm text-brand-muted">No results found for "{query}"</p>
                </div>
              ) : (
                <div className="py-8 px-4">
                  <p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-4">Quick Suggestions</p>
                  <div className="flex flex-wrap gap-2">
                    {['Morning Ritual', 'Meditation', 'Work Tasks', 'Journal'].map(s => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="px-4 py-2 bg-brand-sand/30 hover:bg-brand-sand rounded-xl text-xs font-medium text-brand-ink transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-brand-sand/10 border-t border-brand-sand flex justify-between items-center text-[10px] text-brand-muted uppercase font-bold tracking-widest">
              <span>{results.length} results found</span>
              <div className="flex items-center space-x-4">
                <span>ESC to close</span>
                <span>Enter to select</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
