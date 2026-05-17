import { AppState, Category } from './types';

export const CATEGORIES: Category[] = ['Health', 'Work', 'Personal', 'Focus', 'Leisure', 'Other'];

export const DEFAULT_SETTINGS: AppState['settings'] = {
  dailyResetTime: '00:00',
  notificationsEnabled: true,
  carryForwardTasks: true,
  compactMode: false,
  showFocus: true,
  showHabits: true,
  showTasks: true,
  showNotes: true,
  showAnalytics: true,
  showCalendar: true,
  devMode: false
};

export const INITIAL_STATE: AppState = {
  habits: [
    {
      id: 'h1',
      name: 'Morning Meditation',
      category: 'Focus',
      frequency: 'daily',
      completedDates: [],
      streak: 5,
      totalCompletions: 12,
      createdAt: new Date().toISOString()
    },
    {
      id: 'h2',
      name: 'Read 20 Pages',
      category: 'Personal',
      frequency: 'daily',
      completedDates: [],
      streak: 3,
      totalCompletions: 8,
      createdAt: new Date().toISOString()
    }
  ],
  tasks: [
    {
      id: 't1',
      title: 'Design high-fidelity mockups',
      category: 'Work',
      priority: 'high',
      completed: false,
      date: new Date().toISOString().split('T')[0]
    }
  ],
  events: [],
  notes: [
    {
      id: 'n1',
      title: 'Growth Mindset',
      content: 'Today I realized that persistence is more important than perfection. The small daily rituals are what build the foundation of a meaningful life.',
      date: new Date().toISOString(),
      category: 'Reflection'
    }
  ],
  notifications: [
    {
      id: 'notif1',
      title: 'Welcome to Redemption',
      message: 'Start your journey by adding your first ritual.',
      time: new Date().toISOString(),
      read: false,
      type: 'system'
    }
  ],
  user: {
    name: 'Serene User',
    username: 'serene',
    joinedDate: new Date().toISOString(),
    bio: 'Productivity and peace in balance.'
  },
  settings: DEFAULT_SETTINGS,
  focusPresets: [
    { id: 'p1', name: 'Pomodoro', duration: 25 },
    { id: 'p2', name: 'Short Break', duration: 5 },
    { id: 'p3', name: 'Long Break', duration: 15 },
    { id: 'p4', name: 'Deep Work', duration: 50, category: 'Work' }
  ],
  focusHistory: [
    { id: 'fh1', date: new Date().toISOString().split('T')[0], duration: 50, type: 'Deep Work' },
    { id: 'fh2', date: new Date().toISOString().split('T')[0], duration: 25, type: 'Pomodoro' }
  ],
  activeTimer: undefined,
  screenTime: 204,
  focusTimeToday: 45,
  lastResetDate: new Date().toISOString().split('T')[0]
};
