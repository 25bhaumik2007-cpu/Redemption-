import React from 'react';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Calendar, 
  BarChart3, 
  Settings, 
  PenTool,
  Droplets,
  Timer,
  Book,
  Zap,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AppState, View } from '../types';
import { calculateStats } from '../lib/stats';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isCollapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
  state: AppState;
}

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'daily', label: 'Tasks', icon: CheckCircle2 },
      { id: 'calendar', label: 'Calendar', icon: Calendar },
    ]
  },
  {
    label: 'Focus',
    items: [
      { id: 'focus', label: 'Flow', icon: Timer },
      { id: 'habits', label: 'Habits', icon: Zap },
    ]
  },
  {
    label: 'System',
    items: [
      { id: 'notes', label: 'Notes', icon: Book },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'settings', label: 'Settings', icon: Settings },
    ]
  }
] as const;

export function Sidebar({ currentView, onViewChange, isCollapsed, onCollapseChange, state }: SidebarProps) {
  const stats = calculateStats(state);

  const filteredGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (item.id === 'dashboard' || item.id === 'settings') return true;
      if (item.id === 'daily' && !state.settings.showTasks) return false;
      if (item.id === 'habits' && !state.settings.showHabits) return false;
      if (item.id === 'focus' && !state.settings.showFocus) return false;
      if (item.id === 'calendar' && !state.settings.showCalendar) return false;
      if (item.id === 'notes' && !state.settings.showNotes) return false;
      if (item.id === 'analytics' && !state.settings.showAnalytics) return false;
      return true;
    })
  })).filter(group => group.items.length > 0);

  return (
    <aside className={cn(
      "hidden lg:flex flex-col border-r border-brand-sand bg-white/50 backdrop-blur-sm fixed left-0 top-0 h-screen transition-all duration-500 z-40",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className={cn("px-8 mb-10 mt-8", isCollapsed && "px-0 flex justify-center")}>
        {!isCollapsed ? (
          <div>
            <h1 className="text-2xl font-display font-medium tracking-tight text-brand-ink">
              Redemption<span className="text-brand-peach">.</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-brand-muted mt-1">Peaceful Productivity</p>
          </div>
        ) : (
          <div className="w-10 h-10 bg-brand-ink text-white rounded-xl flex items-center justify-center font-display text-xl leading-none">R</div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar">
        {filteredGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            {!isCollapsed && <p className="px-4 text-[9px] font-bold text-brand-muted uppercase tracking-[0.3em]">{group.label}</p>}
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id as View)}
                  className={cn(
                    "w-full flex items-center rounded-2xl transition-all duration-300 group relative",
                    isCollapsed ? "justify-center p-3" : "px-4 py-3 space-x-3",
                    currentView === item.id
                      ? "bg-white text-brand-ink shadow-sm ring-1 ring-brand-sand"
                      : "text-brand-muted hover:text-brand-ink hover:bg-white/40"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform duration-300",
                    currentView === item.id ? "text-brand-peach" : "group-hover:scale-110"
                  )} />
                  {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                  
                  {isCollapsed && currentView === item.id && (
                    <div className="absolute right-0 w-1 h-4 bg-brand-peach rounded-l-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto p-4 space-y-4">
        {!isCollapsed && (
          <div className="glass-card p-4 bg-brand-sand/30">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Mastery</p>
              <span className="text-[10px] font-bold text-brand-ink">{stats.routineScore}%</span>
            </div>
            <div className="h-1 bg-brand-ink/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-peach transition-all duration-1000 ease-out" 
                style={{ width: `${stats.routineScore}%` }} 
              />
            </div>
          </div>
        )}
        
        <button 
          onClick={() => onCollapseChange(!isCollapsed)}
          className="w-full p-3 hover:bg-brand-sand/50 rounded-xl transition-colors flex items-center justify-center text-brand-muted"
        >
          <div className={cn("transition-transform duration-500", isCollapsed && "rotate-180")}>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </aside>
  );
}
