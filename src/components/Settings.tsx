import React, { useState, useRef } from 'react';
import { 
  Moon, 
  Sun, 
  Bell, 
  Type, 
  Shield, 
  Database, 
  LogOut,
  Coffee,
  Palette,
  Zap,
  RotateCcw,
  Monitor,
  User,
  Download,
  Trash2,
  Check,
  Instagram,
  Heart,
  ExternalLink,
  MessageSquare,
  Bug,
  Star,
  BarChart3,
  Terminal,
  RefreshCcw,
  CalendarDays,
  Timer,
  Book,
  CheckCircle2,
  ShieldAlert,
  Camera,
  Upload,
  UserCircle,
  Mail,
  Briefcase,
  Target,
  Dna,
  ListFilter
} from 'lucide-react';
import { AppState, UserProfile } from '../types';
import { cn } from '../lib/utils';
import { INITIAL_STATE } from '../constants';
import { calculateStats } from '../lib/stats';

interface SettingsProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

export function Settings({ state, updateState }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'app'>('profile');
  const [isResetConfirming, setIsResetConfirming] = useState(false);
  const [isExported, setIsExported] = useState(false);
  const [devClicks, setDevClicks] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSetting = (key: keyof AppState['settings']) => {
    updateState(prev => ({
      ...prev,
      settings: { ...prev.settings, [key]: !prev.settings[key] }
    }));
  };

  const updateSetting = (key: keyof AppState['settings'], value: any) => {
    updateState(prev => ({
      ...prev,
      settings: { ...prev.settings, [key]: value }
    }));
  };

  const updateProfile = (field: keyof UserProfile, value: string | number) => {
    updateState(prev => ({
      ...prev,
      user: { ...prev.user, [field]: value }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile('avatar', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDevClick = () => {
    setDevClicks(prev => {
      const next = prev + 1;
      if (next >= 5) {
        updateSetting('devMode', !state.settings.devMode);
        return 0;
      }
      return next;
    });
  };

  const resetSection = (key: keyof AppState) => {
    updateState(prev => ({
      ...prev,
      [key]: INITIAL_STATE[key]
    }));
  };

  const exportCSV = () => {
    const stats = calculateStats(state);
    const headers = ['Metric', 'Value'];
    const data = [
      ['Date', new Date().toLocaleDateString()],
      ['Tasks Completed', stats.completedTasksToday],
      ['Total Tasks', stats.totalTasksToday],
      ['Habits Completed', stats.completedHabitsToday],
      ['Total Habits', stats.totalHabits],
      ['Focus Minutes', stats.focusMinutesToday],
      ['Current Streak', stats.streak],
      ['Efficiency', `${stats.consistencyScore}%`],
      ['Productivity Score', stats.dailyProductivityScore]
    ];

    const csvContent = [headers.join(','), ...data.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `redemption_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `redemption_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExported(true);
    setTimeout(() => setIsExported(false), 3000);
  };

  const resetData = () => {
    updateState(() => INITIAL_STATE);
    setIsResetConfirming(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-12 mb-20">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div onClick={handleDevClick} className="cursor-pointer select-none">
          <h2 className="text-3xl font-display font-medium text-brand-ink">Personalization</h2>
          <p className="text-sm text-brand-muted">Craft your digital sanctuary.</p>
        </div>
        <div className="flex bg-brand-sand/30 p-1.5 rounded-2xl border border-brand-sand">
          <button 
            onClick={() => setActiveTab('profile')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              activeTab === 'profile' ? "bg-white text-brand-ink shadow-sm" : "text-brand-muted hover:text-brand-ink"
            )}
          >
            Profile
          </button>
          <button 
            onClick={() => setActiveTab('app')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              activeTab === 'app' ? "bg-white text-brand-ink shadow-sm" : "text-brand-muted hover:text-brand-ink"
            )}
          >
            App
          </button>
        </div>
      </div>

      {activeTab === 'profile' ? (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Avatar Section */}
          <section className="glass-card p-10 flex flex-col md:flex-row items-center gap-10 bg-white">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[40px] bg-brand-sand/50 overflow-hidden ring-4 ring-white shadow-xl transition-all group-hover:scale-[1.02]">
                {state.user.avatar ? (
                  <img src={state.user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-sand text-brand-muted">
                    <UserCircle className="w-16 h-16" />
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-3 bg-brand-peach text-white rounded-2xl shadow-lg border-4 border-white hover:scale-110 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
              <h3 className="text-2xl font-display text-brand-ink">{state.user.name || 'Anonymous'}</h3>
              <p className="text-sm text-brand-muted max-w-md">{state.user.bio || 'Crafting a life of purpose and peace.'}</p>
              {state.user.avatar && (
                <button 
                  onClick={() => updateProfile('avatar', '')}
                  className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </section>

          {/* Profile Fields */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <ProfileField 
                label="Display Name" 
                value={state.user.name} 
                onChange={val => updateProfile('name', val)}
                icon={User}
              />
              <ProfileField 
                label="Username" 
                value={state.user.username || ''} 
                onChange={val => updateProfile('username', val)}
                icon={Zap}
              />
              <ProfileField 
                label="Bio" 
                value={state.user.bio || ''} 
                onChange={val => updateProfile('bio', val)}
                icon={Book}
                multiline
              />
              <div className="grid grid-cols-2 gap-4">
                <ProfileField 
                  label="Gender" 
                  value={state.user.gender || ''} 
                  onChange={val => updateProfile('gender', val)}
                  icon={Dna}
                />
                <ProfileField 
                  label="Date of Birth" 
                  value={state.user.dob || ''} 
                  onChange={val => updateProfile('dob', val)}
                  icon={CalendarDays}
                  type="date"
                />
              </div>
            </div>
            
            <div className="space-y-6">
               <ProfileField 
                label="Long-term Goals" 
                value={state.user.goals || ''} 
                onChange={val => updateProfile('goals', val)}
                icon={Target}
                multiline
              />
              <ProfileField 
                label="Occupation / Study" 
                value={state.user.occupation || ''} 
                onChange={val => updateProfile('occupation', val)}
                icon={Briefcase}
              />
              <div className="grid grid-cols-2 gap-4">
                <ProfileField 
                  label="Daily Tasks Goal" 
                  value={state.user.dailyTarget || 5} 
                  onChange={val => updateProfile('dailyTarget', parseInt(val as string) || 0)}
                  icon={CheckCircle2}
                  type="number"
                />
                <ProfileField 
                  label="Daily Focus (min)" 
                  value={state.user.focusGoal || 60} 
                  onChange={val => updateProfile('focusGoal', parseInt(val as string) || 0)}
                  icon={Timer}
                  type="number"
                />
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Interface options */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-brand-muted">
              <Monitor className="w-4 h-4" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Interface</h3>
            </div>

            <div className="glass-card divide-y divide-brand-sand">
              {[
                { id: 'notificationsEnabled', label: 'Notifications', icon: Bell },
                { id: 'showHabits', label: 'Habits', icon: Zap },
                { id: 'showTasks', label: 'Tasks', icon: CheckCircle2 },
                { id: 'showCalendar', label: 'Calendar', icon: CalendarDays },
                { id: 'showFocus', label: 'Focus', icon: Timer },
                { id: 'showNotes', label: 'Notes', icon: Book },
                { id: 'showAnalytics', label: 'Analytics', icon: BarChart3 },
              ].map((item: any) => (
                <div key={item.id} className="p-4 flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-brand-sand/30 rounded-lg group-hover:bg-brand-sand transition-colors">
                      <item.icon className="w-4 h-4 text-brand-ink" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <button 
                    onClick={() => toggleSetting(item.id)}
                    className={cn(
                      "w-10 h-5 rounded-full transition-colors relative",
                      state.settings[item.id as keyof AppState['settings']] ? "bg-brand-peach" : "bg-brand-sand"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
                      state.settings[item.id as keyof AppState['settings']] ? "left-6" : "left-1"
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* About Creator */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-brand-muted">
              <Heart className="w-4 h-4" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Developer</h3>
            </div>
            <div className="glass-card p-10 flex flex-col md:flex-row items-center gap-10 bg-brand-sand/10">
               <div className="relative">
                 <div className="w-24 h-24 rounded-full bg-brand-sand overflow-hidden ring-4 ring-white shadow-xl">
                   <img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200&h=200" alt="Bhaumik" className="w-full h-full object-cover" />
                 </div>
                 <div className="absolute -top-1 -right-1 w-8 h-8 bg-brand-peach text-white rounded-full flex items-center justify-center shadow-lg">
                   <Star className="w-4 h-4 fill-current" />
                 </div>
               </div>
               <div className="flex-1 text-center md:text-left space-y-3">
                 <h4 className="text-2xl font-display text-brand-ink">Bhaumik Pratap Singh</h4>
                 <p className="text-sm text-brand-muted leading-relaxed">
                   Building tools for deep work and intentional living. Redemption is a project born from the need for a distraction-free productivity space.
                 </p>
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                   <a 
                     href="https://www.instagram.com/bhaumik.nahhh/" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-bold text-brand-ink hover:bg-brand-sand transition-all border border-brand-sand"
                   >
                     <Instagram className="w-4 h-4" />
                     @bhaumik.nahhh
                   </a>
                   <div 
                    onClick={() => navigator.clipboard.writeText('bhaumik.nahhh')}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-bold text-brand-muted cursor-pointer hover:text-brand-ink transition-all border border-brand-sand"
                   >
                     <Mail className="w-4 h-4" />
                     Feedback
                   </div>
                 </div>
               </div>
            </div>
          </section>

          {/* Data Management */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-brand-muted">
              <Database className="w-4 h-4" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Data Management</h3>
            </div>
            <div className="glass-card overflow-hidden">
               <div className="p-6 flex items-center justify-between border-b border-brand-sand">
                  <span className="text-sm font-medium">Workspace Management</span>
                  <div className="flex space-x-2">
                      <button onClick={exportCSV} className="px-4 py-2 border border-brand-sand rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-brand-sand/30">CSV</button>
                      <button onClick={exportData} className="px-4 py-2 bg-brand-ink text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-brand-ink/90">Backup</button>
                   </div>
               </div>
               
               <div className="p-6 bg-rose-50/20 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-rose-500">Reset Everything</h4>
                    <p className="text-[9px] text-rose-400 uppercase font-bold tracking-widest">Permanent Action</p>
                  </div>
                  {!isResetConfirming ? (
                    <button onClick={() => setIsResetConfirming(true)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setIsResetConfirming(false)} className="text-[9px] font-bold uppercase text-brand-muted px-2">Cancel</button>
                      <button onClick={resetData} className="px-4 py-2 bg-rose-500 text-white rounded-xl text-[10px] font-bold uppercase">Confirm</button>
                    </div>
                  )}
               </div>
            </div>
          </section>
        </div>
      )}

      {/* Developer Options Pinball */}
      {state.settings.devMode && (
        <section className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center space-x-2 text-brand-peach">
            <Terminal className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Dev Terminal</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: 'Habits', key: 'habits', icon: RotateCcw },
              { label: 'Tasks', key: 'tasks', icon: ListFilter },
              { label: 'Notes', key: 'notes', icon: Book },
              { label: 'Analytics', key: 'focusHistory', icon: BarChart3 },
              { label: 'Refresh', key: 'refresh', icon: RefreshCcw, action: () => window.location.reload() },
            ].map(ctrl => (
              <button 
                key={ctrl.label}
                onClick={ctrl.action || (() => resetSection(ctrl.key as any))}
                className="flex flex-col items-center justify-center space-y-2 p-4 bg-brand-peach/5 border border-brand-peach/20 rounded-2xl hover:bg-brand-peach/10 transition-all text-center"
              >
                <ctrl.icon className="w-4 h-4 text-brand-peach" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{ctrl.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="flex justify-center pt-8 border-t border-brand-sand">
        <p className="text-[8px] uppercase font-bold text-brand-muted tracking-[0.6em]">Redemption Stable Build v1.2</p>
      </div>
    </div>
  );
}

function ProfileField({ label, value, onChange, icon: Icon, type = 'text', multiline = false }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
        <Icon className="w-3 h-3" />
        {label}
      </label>
      {multiline ? (
        <textarea 
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-6 py-4 bg-brand-sand/20 border border-brand-sand rounded-[24px] focus:outline-none focus:border-brand-peach transition-all font-medium text-sm text-brand-ink resize-none"
          rows={3}
        />
      ) : (
        <input 
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-6 py-4 bg-brand-sand/20 border border-brand-sand rounded-[24px] focus:outline-none focus:border-brand-peach transition-all font-medium text-sm text-brand-ink"
        />
      )}
    </div>
  );
}
