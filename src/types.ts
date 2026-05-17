export type Category = 'Health' | 'Work' | 'Personal' | 'Focus' | 'Leisure' | 'Other';

export interface Habit {
  id: string;
  name: string;
  category: Category;
  frequency: 'daily' | 'weekly' | 'custom';
  notes?: string;
  reminderTime?: string; // HH:mm
  completedDates: string[]; // ISO Date strings (YYYY-MM-DD)
  streak: number;
  totalCompletions: number;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  category: Category;
  time?: string; // HH:mm
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  date: string; // ISO Date string (YYYY-MM-DD)
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  priority: 'low' | 'medium' | 'high';
  category: Category;
  color?: string;
  isRecurring: boolean;
  recurrenceRule?: 'daily' | 'weekly' | 'monthly';
  reminderTime?: string;
  remindMe?: boolean;
  completed: boolean;
  isPinned?: boolean;
  type: 'event' | 'reminder' | 'note';
}

export interface FocusPreset {
  id: string;
  name: string;
  duration: number; // minutes
  category?: Category;
}

export interface Settings {
  dailyResetTime: string; // HH:mm
  notificationsEnabled: boolean;
  carryForwardTasks: boolean;
  compactMode: boolean;
  showFocus: boolean;
  showHabits: boolean;
  showTasks: boolean;
  showNotes: boolean;
  showAnalytics: boolean;
  showCalendar: boolean;
  devMode: boolean;
}

export interface FocusSession {
  id: string;
  date: string;
  duration: number; // minutes
  type: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string; // ISO String
  read: boolean;
  type: 'habit' | 'task' | 'focus' | 'system' | 'medicine';
}

export interface UserProfile {
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
  gender?: string;
  dob?: string;
  goals?: string;
  occupation?: string;
  dailyTarget?: number;
  focusGoal?: number;
  joinedDate: string;
}

export type View = 'dashboard' | 'habits' | 'calendar' | 'daily' | 'focus' | 'analytics' | 'notes' | 'settings';

export interface ActiveTimer {
  duration: number; // seconds
  timeLeft: number; // seconds
  isRunning: boolean;
  presetId: string;
  presetName: string;
  lastUpdated: string; // ISO string
}

export interface AppState {
  habits: Habit[];
  tasks: Task[];
  events: CalendarEvent[];
  notes: Note[];
  notifications: AppNotification[];
  user: UserProfile;
  settings: Settings;
  focusPresets: FocusPreset[];
  focusHistory: FocusSession[];
  activeTimer?: ActiveTimer;
  screenTime: number; // minutes
  focusTimeToday: number; // minutes
  lastResetDate: string; // ISO Date
}
