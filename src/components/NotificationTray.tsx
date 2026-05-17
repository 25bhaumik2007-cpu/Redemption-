import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  Timer, 
  Zap, 
  Info,
  Trash2
} from 'lucide-react';
import { AppState, AppNotification } from '../types';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NotificationTrayProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

export function NotificationTray({ isOpen, onClose, state, updateState }: NotificationTrayProps) {
  const notifications = state.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    updateState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
    }));
  };

  const clearAll = () => {
    updateState(prev => ({
      ...prev,
      notifications: []
    }));
  };

  const removeNotification = (id: string) => {
    updateState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'task': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'habit': return <Zap className="w-4 h-4 text-brand-peach" />;
      case 'focus': return <Timer className="w-4 h-4 text-blue-500" />;
      case 'medicine': return <PlusIcon className="w-4 h-4 text-rose-500" />;
      default: return <Info className="w-4 h-4 text-brand-muted" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-brand-ink/10 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="fixed top-24 right-10 z-[101] w-96 bg-white rounded-[32px] shadow-2xl border border-brand-sand overflow-hidden"
          >
            <div className="p-6 border-b border-brand-sand flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display text-brand-ink">Notifications</h3>
                <p className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">
                  {unreadCount} UNREAD MESSAGES
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={clearAll}
                  className="p-2 hover:bg-rose-50 text-rose-400 rounded-xl transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={onClose} className="p-2 hover:bg-brand-sand rounded-xl transition-colors">
                  <X className="w-4 h-4 text-brand-muted" />
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-4 space-y-3">
              {notifications.length > 0 ? (
                [...notifications].reverse().map((notif) => (
                  <div 
                    key={notif.id}
                    className={cn(
                      "p-4 rounded-2xl border transition-all relative group",
                      notif.read ? "bg-white border-brand-sand/50" : "bg-brand-peach/5 border-brand-peach/20"
                    )}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-brand-sand flex items-center justify-center shrink-0">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-brand-ink">{notif.title}</p>
                          <span className="text-[9px] text-brand-muted uppercase">
                            {formatDistanceToNow(new Date(notif.time), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-brand-muted pr-6">{notif.message}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeNotification(notif.id)}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1 hover:bg-brand-sand rounded-lg transition-all"
                    >
                      <X className="w-3 h-3 text-brand-muted" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-brand-sand/30 rounded-full flex items-center justify-center mx-auto">
                    <Bell className="w-8 h-8 text-brand-muted opacity-20" />
                  </div>
                  <p className="text-sm text-brand-muted italic">Focus time. No distractions.</p>
                </div>
              )}
            </div>

            {unreadCount > 0 && (
              <div className="p-4 bg-brand-sand/30 border-t border-brand-sand">
                <button 
                  onClick={markAllAsRead}
                  className="w-full py-3 bg-brand-ink text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import { Plus as PlusIcon } from 'lucide-react';
