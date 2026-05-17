import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { AppState } from '../types';
import { TrendingUp, Award, Zap, BarChart3, Target, CalendarDays } from 'lucide-react';
import { cn } from '../lib/utils';
import { calculateStats } from '../lib/stats';
import { subDays, format, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

interface AnalyticsProps {
  state: AppState;
}

export function Analytics({ state }: AnalyticsProps) {
  const stats = useMemo(() => calculateStats(state), [state]);
  
  const dailyData = useMemo(() => stats.weeklyTaskCompletionData.map(d => ({
    name: d.displayDate,
    tasks: d.completed,
    habits: state.habits.filter(h => h.completedDates.includes(d.date)).length
  })), [stats.weeklyTaskCompletionData, state.habits]);

  // Heatmap data (last 12 weeks)
  const heatmapData = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 84); // 12 weeks
    const days = eachDayOfInterval({ start: startDate, end: today });
    
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const tasksOnDate = state.tasks.filter(t => t.date === dateStr);
      const habitsOnDate = state.habits.filter(h => h.completedDates.includes(dateStr));
      const total = tasksOnDate.length + state.habits.length;
      let intensity = 0;
      if (total > 0) {
        const completed = tasksOnDate.filter(t => t.completed).length + habitsOnDate.length;
        intensity = completed / total;
      }
      return { date: dateStr, intensity };
    });
  }, [state.tasks, state.habits]);

  const insights = useMemo(() => {
    const list = [];
    if (stats.consistencyScore > 75) list.push("Consistency improved this week.");
    if (stats.focusMinutesToday > 60) list.push("Focus hours increased today.");
    if (stats.completedTasksToday > stats.totalTasksToday / 2) list.push("You completed more tasks this week.");
    if (stats.streak > 3) list.push("Ritual mastery is increasing.");
    return list.slice(0, 3);
  }, [stats]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 mb-20 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-medium text-brand-ink">Analytics</h2>
          <p className="text-sm text-brand-muted">Simple insights into your daily discipline.</p>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, i) => (
          <div key={i} className="p-4 bg-brand-peach/5 border border-brand-peach/20 rounded-2xl flex items-center space-x-3">
            <Zap className="w-4 h-4 text-brand-peach" />
            <span className="text-xs font-semibold text-brand-ink">{insight}</span>
          </div>
        ))}
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Streak', value: `${stats.streak} Days`, icon: Zap, color: 'text-brand-peach', bg: 'bg-brand-peach/10' },
          { label: 'Productivity', value: stats.dailyProductivityScore.toString(), icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Focus', value: `${stats.focusHoursToday}h`, icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Efficiency', value: `${stats.consistencyScore}%`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4 md:p-6 flex flex-col md:flex-row items-center md:items-start text-center md:text-left space-y-3 md:space-y-0 md:space-x-4 border-none shadow-sm"
          >
            <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-bold text-brand-muted uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl md:text-2xl font-display font-semibold text-brand-ink">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Weekly Progress */}
        <div className="lg:col-span-2 glass-card p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-display font-medium text-brand-ink">Weekly Report</h3>
              <p className="text-xs text-brand-muted mt-1">Tasks vs Habits completion.</p>
            </div>
            <Award className="w-5 h-5 text-brand-peach" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8E9299' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 159, 109, 0.05)' }} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} 
                />
                <Bar dataKey="tasks" fill="#FF9F6D" radius={[4, 4, 0, 0]} name="Tasks" />
                <Bar dataKey="habits" fill="#6366F1" radius={[4, 4, 0, 0]} name="Habits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="glass-card p-6 md:p-8 space-y-8">
          <h3 className="text-xl font-display font-medium text-brand-ink">Consistency</h3>
          <div className="space-y-6">
            {[
              { label: 'Habits', value: stats.habitCompletionRate, color: 'bg-brand-peach' },
              { label: 'Tasks', value: stats.completionRate, color: 'bg-emerald-400' },
              { label: 'Monthly', value: stats.monthlyCompletionRate, color: 'bg-blue-400' },
              { label: 'Focus', value: Math.round((stats.focusMinutesToday / 120) * 100), color: 'bg-purple-400' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-brand-sand rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(item.value, 100)}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={cn("h-full rounded-full", item.color)}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-6 border-t border-brand-sand">
            <div className="flex items-center space-x-3 p-4 bg-brand-peach/10 rounded-2xl">
              <Zap className="w-5 h-5 text-brand-peach" />
              <div>
                <p className="text-[10px] font-bold text-brand-peach uppercase">Mastery Tip</p>
                <p className="text-xs text-brand-ink font-medium">Keep your {stats.streak} day streak alive to maintain peak efficiency.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8 bg-white space-y-6">
           <h3 className="text-xl font-display text-brand-ink">Category Mastery</h3>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={[
                          { name: 'Work', value: state.tasks.filter(t => t.category === 'Work').length },
                          { name: 'Personal', value: state.tasks.filter(t => t.category === 'Personal').length },
                          { name: 'Health', value: state.tasks.filter(t => t.category === 'Health').length },
                          { name: 'Ritual', value: state.habits.length }
                       ]}
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                    >
                       <Cell fill="#FF9F6D" />
                       <Cell fill="#6366F1" />
                       <Cell fill="#10B981" />
                       <Cell fill="#8B5CF6" />
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="glass-card p-8 bg-brand-ink text-white space-y-6">
           <h3 className="text-xl font-display">Deep Work Trends</h3>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={dailyData}>
                    <defs>
                       <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF9F6D" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FF9F6D" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1C1C1C', border: 'none', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="tasks" stroke="#FF9F6D" fillOpacity={1} fill="url(#colorFocus)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
      </section>

      {/* Completion Heatmap */}
      <section className="glass-card p-10 md:p-12 space-y-8 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-display font-medium text-brand-ink">History</h3>
            <p className="text-xs text-brand-muted mt-1">Visual record of your dedication.</p>
          </div>
          <CalendarDays className="w-5 h-5 text-brand-muted" />
        </div>
        
        <div className="overflow-x-auto pb-2">
          <div className="flex flex-wrap gap-1.5 min-w-[700px]">
            {heatmapData.map((data, i) => {
              const intensity = data.intensity;
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.005 }}
                  className={cn(
                    "w-3.5 h-3.5 md:w-4 md:h-4 rounded-[4px] transition-all hover:scale-125 cursor-help",
                    intensity === 0 ? "bg-brand-sand" :
                    intensity < 0.3 ? "bg-brand-peach/20" :
                    intensity < 0.6 ? "bg-brand-peach/40" :
                    intensity < 0.9 ? "bg-brand-peach/70" : "bg-brand-peach"
                  )}
                  title={`${data.date}: ${Math.round(intensity * 100)}% completion`}
                />
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center justify-end space-x-2 text-[8px] md:text-[10px] text-brand-muted uppercase font-bold tracking-widest pt-2">
          <span>Less</span>
          <div className="w-3 h-3 rounded-[2px] bg-brand-sand" />
          <div className="w-3 h-3 rounded-[2px] bg-brand-peach/20" />
          <div className="w-3 h-3 rounded-[2px] bg-brand-peach/40" />
          <div className="w-3 h-3 rounded-[2px] bg-brand-peach/70" />
          <div className="w-3 h-3 rounded-[2px] bg-brand-peach" />
          <span>More</span>
        </div>
      </section>
    </div>
  );
}
