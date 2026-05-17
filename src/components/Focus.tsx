import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw,
  Zap,
  Coffee,
  Moon,
  Timer,
  Settings as SettingsIcon,
  X,
  Brain,
  TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AppState } from '../types';
import { format } from 'date-fns';

interface TimerPreset {
  id: string;
  name: string;
  duration: number; // in seconds
  icon: any;
}

const DEFAULT_PRESETS: TimerPreset[] = [
  { id: 'pomodoro', name: 'Pomodoro', duration: 25 * 60, icon: Timer },
  { id: 'short_break', name: 'Short Break', duration: 5 * 60, icon: Coffee },
  { id: 'long_break', name: 'Long Break', duration: 15 * 60, icon: Moon },
  { id: 'deep_work', name: 'Deep Work', duration: 50 * 60, icon: Zap },
];

export function Focus({ state, updateState }: { state: AppState, updateState: (updater: (prev: AppState) => AppState) => void }) {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [customTime, setCustomTime] = useState(25);

  const activeTimer = state.activeTimer;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startPreset = (preset: TimerPreset) => {
    updateState(prev => ({
      ...prev,
      activeTimer: {
        presetId: preset.id,
        presetName: preset.name,
        duration: preset.duration,
        timeLeft: preset.duration,
        isRunning: true,
        lastUpdated: new Date().toISOString()
      }
    }));
  };

  const toggleTimer = () => {
    if (!activeTimer) {
      startPreset(DEFAULT_PRESETS[0]);
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

  const resetTimer = () => {
    if (!activeTimer) return;
    updateState(prev => ({
      ...prev,
      activeTimer: prev.activeTimer ? {
        ...prev.activeTimer,
        timeLeft: prev.activeTimer.duration,
        isRunning: false,
        lastUpdated: new Date().toISOString()
      } : undefined
    }));
  };

  const setManualTime = () => {
    const seconds = customTime * 60;
    updateState(prev => ({
      ...prev,
      activeTimer: {
        presetId: 'custom',
        presetName: 'Custom',
        duration: seconds,
        timeLeft: seconds,
        isRunning: true,
        lastUpdated: new Date().toISOString()
      }
    }));
    setIsConfiguring(false);
  };

  const activePreset = activeTimer 
    ? [...DEFAULT_PRESETS, { id: 'custom', name: 'Custom', duration: activeTimer.duration, icon: SettingsIcon }].find(p => p.id === activeTimer?.presetId) || DEFAULT_PRESETS[0]
    : DEFAULT_PRESETS[0];

  const timeLeft = activeTimer?.timeLeft ?? activePreset.duration;
  const isRunning = activeTimer?.isRunning ?? false;

  const today = format(new Date(), 'yyyy-MM-dd');
  const sessionsToday = (state.focusHistory || []).filter(s => s.date === today);
  const totalFocusMinutes = sessionsToday.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-12 mb-20 md:mb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-display text-brand-ink">Focus</h2>
          <p className="text-sm text-brand-muted">Disconnect from the noise.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-4 bg-brand-sand/50 rounded-2xl hover:bg-white transition-all text-xs font-bold uppercase tracking-widest text-brand-muted">
            Stats
          </button>
          <button 
            onClick={() => setIsConfiguring(true)}
            className="p-4 bg-brand-ink text-white rounded-2xl hover:scale-105 transition-all shadow-lg"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 glass-card p-12 flex flex-col items-center justify-center space-y-10 bg-brand-ink text-white relative overflow-hidden h-[600px] shadow-2xl rounded-[48px]">
          <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-12">
            <activePreset.icon className="w-64 h-64" />
          </div>
          
          <div className="text-center space-y-4 relative z-10">
            <motion.div
              key={activePreset.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center space-x-2"
            >
              <activePreset.icon className="w-4 h-4 text-brand-peach" />
              <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-brand-peach">{activePreset.name}</h3>
            </motion.div>
            <div className="text-[120px] md:text-[160px] font-display leading-none tracking-tighter tabular-nums text-white">
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="flex items-center space-x-8 relative z-10">
            <button 
              onClick={resetTimer}
              className="p-6 rounded-[32px] bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group active:scale-90"
            >
              <RotateCcw className="w-6 h-6 text-gray-400 group-hover:text-white" />
            </button>
            <button 
              onClick={toggleTimer}
              className="w-28 h-28 rounded-[48px] bg-brand-peach text-brand-ink flex items-center justify-center shadow-[0_0_50px_rgba(255,159,109,0.3)] hover:scale-105 active:scale-95 transition-all"
            >
              {isRunning ? <Pause className="w-12 h-12" /> : <Play className="w-12 h-12 ml-2" />}
            </button>
            <div className="w-16" /> {/* Balance */}
          </div>

          <div className="flex flex-wrap justify-center gap-4 relative z-10 w-full max-w-sm">
            {DEFAULT_PRESETS.map(preset => (
              <button 
                key={preset.id}
                onClick={() => startPreset(preset)}
                className={cn(
                  "flex-1 px-4 py-4 rounded-3xl text-[9px] font-bold uppercase tracking-widest transition-all border",
                  activeTimer?.presetId === preset.id 
                    ? "bg-white text-brand-ink border-white shadow-lg" 
                    : "bg-white/5 hover:bg-white/10 text-gray-400 border-white/10"
                )}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card p-8 space-y-6">
            <h3 className="text-lg font-display text-brand-ink">Session History</h3>
            <div className="space-y-4">
              {sessionsToday.length > 0 ? (
                sessionsToday.slice(0, 5).map(session => (
                  <div key={session.id} className="flex items-center justify-between p-4 rounded-2xl bg-brand-sand/30 border border-transparent">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-white border border-brand-sand flex items-center justify-center">
                        <Zap className="w-4 h-4 text-brand-peach" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{session.type}</p>
                        <p className="text-[10px] text-brand-muted uppercase tracking-widest">Completed</p>
                      </div>
                    </div>
                    <span className="text-sm font-display font-medium text-brand-ink">{session.duration}m</span>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center space-y-2">
                  <Moon className="w-8 h-8 text-brand-sand mx-auto" />
                  <p className="text-xs text-brand-muted italic">No sessions yet today.</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-8 space-y-4 bg-brand-peach/5 border-brand-peach/20">
             <div className="flex items-center justify-between">
               <h3 className="text-xs font-bold uppercase tracking-widest text-brand-peach">Focus Score</h3>
               <TrendingUp className="w-4 h-4 text-brand-peach" />
             </div>
             <div className="flex items-baseline space-x-2">
               <span className="text-5xl font-display text-brand-ink">{totalFocusMinutes}</span>
               <span className="text-xl text-brand-muted">minutes</span>
             </div>
             <div className="pt-4 border-t border-brand-peach/10">
                <p className="text-[10px] font-medium text-brand-muted leading-relaxed">
                  You're at <span className="font-bold text-brand-ink">82%</span> of your daily deep work goal. 
                </p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8 flex items-center space-x-6">
          <div className="p-4 bg-brand-peach/10 rounded-2xl">
            <Zap className="w-6 h-6 text-brand-peach" />
          </div>
          <div>
            <h4 className="text-lg font-display text-brand-ink leading-tight">Focus Score</h4>
            <p className="text-xs text-brand-muted mt-1">Based on deep work sessions today.</p>
          </div>
          <div className="ml-auto text-2xl font-display text-brand-peach">78</div>
        </div>
        <div className="glass-card p-8 flex items-center space-x-6">
          <div className="p-4 bg-brand-sand rounded-2xl">
            <Brain className="w-6 h-6 text-brand-ink" />
          </div>
          <div>
            <h4 className="text-lg font-display text-brand-ink leading-tight">Flow State</h4>
            <p className="text-xs text-brand-muted mt-1">Maintain focus for 12 more minutes.</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isConfiguring && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfiguring(false)}
              className="fixed inset-0 bg-brand-ink/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-[20%] md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-white rounded-[40px] shadow-2xl z-[60] overflow-hidden"
            >
              <div className="p-10 space-y-8 text-center">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-display text-brand-ink">Custom</h3>
                  <button onClick={() => setIsConfiguring(false)} className="p-2 hover:bg-brand-sand rounded-xl">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                   <div className="text-7xl font-display text-brand-ink tabular-nums">{customTime}</div>
                   <div className="text-sm font-bold uppercase tracking-widest text-brand-muted">Minutes</div>
                </div>

                <div className="flex items-center space-x-4">
                  <button onClick={() => setCustomTime(t => Math.max(1, t - 5))} className="flex-1 py-4 bg-brand-sand rounded-2xl hover:bg-brand-sand/50 transition-colors font-bold text-lg">-5</button>
                  <button onClick={() => setCustomTime(t => Math.min(180, t + 5))} className="flex-1 py-4 bg-brand-sand rounded-2xl hover:bg-brand-sand/50 transition-colors font-bold text-lg">+5</button>
                </div>

                <button 
                  onClick={setManualTime}
                  className="w-full py-5 bg-brand-ink text-white rounded-[24px] font-bold text-lg hover:bg-brand-ink/90 transition-all shadow-xl"
                >
                  Start
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
