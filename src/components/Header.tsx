import React, { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { format } from 'date-fns';
import { AppState } from '../types';
import { NotificationTray } from './NotificationTray';
import { SearchModal } from './SearchModal';

interface HeaderProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onNavigate: (view: any) => void;
}

export function Header({ state, updateState, onNavigate }: HeaderProps) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const unreadCount = (state.notifications || []).filter(n => !n.read).length;

  return (
    <header className="h-20 flex items-center justify-between px-6 md:px-10 border-b border-brand-sand bg-white/30 backdrop-blur-md sticky top-0 z-20">
      <div>
        <h2 className="text-sm font-medium text-brand-ink">
          {format(new Date(), 'EEEE, MMMM do')}
        </h2>
        <p className="text-[10px] md:text-xs text-brand-muted">Welcome back to your peaceful space, {state.user.name.split(' ')[0]}.</p>
      </div>

      <div className="flex items-center space-x-4 md:space-x-6">
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="p-2 hover:bg-white/50 rounded-xl transition-all group"
        >
          <Search className="w-4 h-4 text-brand-muted group-hover:text-brand-ink transition-colors" />
        </button>
        
        <button 
          onClick={() => setIsNotifOpen(true)}
          className="relative p-2 hover:bg-white/50 rounded-xl transition-all group"
        >
          <Bell className="w-4 h-4 text-brand-muted group-hover:text-brand-ink transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-peach rounded-full ring-2 ring-brand-cream animate-pulse" />
          )}
        </button>

        <button 
          onClick={() => onNavigate('settings')}
          className="w-8 h-8 rounded-xl bg-brand-sand border-2 border-white overflow-hidden hover:scale-110 active:scale-95 transition-all shadow-sm"
        >
          <img 
            src={state.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${state.user.name}`} 
            alt="User" 
          />
        </button>
      </div>

      <NotificationTray 
        isOpen={isNotifOpen} 
        onClose={() => setIsNotifOpen(false)} 
        state={state} 
        updateState={updateState} 
      />

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        state={state} 
        onNavigate={onNavigate} 
      />
    </header>
  );
}
