import { useState, useEffect } from 'react';
import { AppState } from '../types';
import { INITIAL_STATE } from '../constants';
import { format } from 'date-fns';

const STORAGE_KEY = 'redemption_app_state';

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return INITIAL_STATE;
    try {
      const parsed = JSON.parse(saved);
      // Robust merge: Ensure all keys from INITIAL_STATE exist in saved state
      const merged = { ...INITIAL_STATE, ...parsed };
      
      // Ensure nested objects like settings are also merged
      merged.settings = { ...INITIAL_STATE.settings, ...(parsed.settings || {}) };
      merged.user = { ...INITIAL_STATE.user, ...(parsed.user || {}) };
      
      // Ensure all top-level keys from INITIAL_STATE are present
      Object.keys(INITIAL_STATE).forEach(key => {
        if (merged[key as keyof AppState] === undefined) {
          (merged as any)[key] = INITIAL_STATE[key as keyof AppState];
        }
      });
      
      // Ensure arrays are initialized if missing or not arrays
      const arrayKeys: (keyof AppState)[] = ['events', 'tasks', 'habits', 'notes', 'notifications', 'focusHistory', 'focusPresets'];
      arrayKeys.forEach(key => {
        if (!Array.isArray(merged[key])) {
          (merged as any)[key] = Array.isArray(INITIAL_STATE[key]) ? INITIAL_STATE[key] : [];
        }
      });

      return merged;
    } catch (e) {
      console.error("Failed to load saved state:", e);
      return INITIAL_STATE;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Daily reset logic & Automation
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (state.lastResetDate !== today) {
      updateState(prev => {
        // Carry forward unfinished tasks if enabled
        const rolledOverTasks = prev.settings.carryForwardTasks 
          ? prev.tasks.map(t => t.date === prev.lastResetDate && !t.completed ? { ...t, date: today } : t)
          : prev.tasks;

        return {
          ...prev,
          lastResetDate: today,
          focusTimeToday: 0,
          tasks: rolledOverTasks,
        };
      });
    }
  }, [state.lastResetDate]);

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(prev => updater(prev));
  };

  return { state, updateState };
}
