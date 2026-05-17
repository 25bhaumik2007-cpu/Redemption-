import { AppState, Task, Habit, FocusSession } from '../types';
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

export const calculateStats = (state: AppState) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Daily Stats
  const tasksToday = state.tasks.filter(t => t.date === today);
  const completedTasksToday = tasksToday.filter(t => t.completed).length;
  const totalTasksToday = tasksToday.length;
  
  const habitsTodayCount = state.habits.length;
  const completedHabitsToday = state.habits.filter(h => h.completedDates.includes(today)).length;
  
  const focusMinutesToday = state.focusTimeToday;
  
  // Weekly Stats (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd')).reverse();
  
  const weeklyTaskCompletionData = last7Days.map(date => {
    const tasksOnDate = state.tasks.filter(t => t.date === date);
    const completedOnDate = tasksOnDate.filter(t => t.completed).length;
    return {
      date,
      displayDate: format(parseISO(date), 'EEE'),
      completed: completedOnDate,
      total: tasksOnDate.length,
      percentage: tasksOnDate.length > 0 ? (completedOnDate / tasksOnDate.length) * 100 : 0
    };
  });

  const weeklyHabitCompletionData = last7Days.map(date => {
    const completedOnDate = state.habits.filter(h => h.completedDates.includes(date)).length;
    return {
      date,
      displayDate: format(parseISO(date), 'EEE'),
      completed: completedOnDate,
      total: state.habits.length,
      percentage: state.habits.length > 0 ? (completedOnDate / state.habits.length) * 100 : 0
    };
  });

  const weeklyFocusData = last7Days.map(date => {
    const sessionsOnDate = (state.focusHistory || []).filter(s => s.date === date);
    const minutesOnDate = sessionsOnDate.reduce((acc, s) => acc + s.duration, 0);
    return {
      date,
      displayDate: format(parseISO(date), 'EEE'),
      minutes: minutesOnDate
    };
  });

  // Monthly stats (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
  const monthlyCompletionRate = last30Days.reduce((acc, date) => {
    const tasksOnDate = state.tasks.filter(t => t.date === date);
    if (tasksOnDate.length === 0) return acc;
    return acc + (tasksOnDate.filter(t => t.completed).length / tasksOnDate.length);
  }, 0) / last30Days.filter(date => state.tasks.some(t => t.date === date)).length || 0;

  // Streak Calculation (simplified)
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const tasksOnDate = state.tasks.filter(t => t.date === date);
    const habitsOnDate = state.habits.filter(h => h.completedDates.includes(date));
    
    if (tasksOnDate.length > 0 || state.habits.length > 0) {
      const isTasksDone = tasksOnDate.length > 0 ? tasksOnDate.every(t => t.completed) : true;
      const isHabitsDone = state.habits.length > 0 ? habitsOnDate.length >= Math.ceil(state.habits.length * 0.5) : true;
      
      if (isTasksDone && isHabitsDone) {
        streak++;
      } else if (i > 0) {
        break;
      }
    } else if (i > 0) {
      // Small allowance for days with no tasks/habits if it's not the first day
      // But for simplicity, we break
      break;
    }
  }

  // Productivity Score (0-100)
  const taskScore = totalTasksToday > 0 ? (completedTasksToday / totalTasksToday) * 40 : 0;
  const habitScore = habitsTodayCount > 0 ? (completedHabitsToday / habitsTodayCount) * 40 : 0;
  const focusScore = Math.min((focusMinutesToday / 120) * 20, 20); 
  
  const dailyProductivityScore = Math.round(taskScore + habitScore + focusScore);
  const avgWeeklyCompletion = weeklyTaskCompletionData.reduce((acc, d) => acc + d.percentage, 0) / 7;
  const consistencyScore = Math.round((avgWeeklyCompletion + (streak * 2)) / 1.2); // Factor in streak

  return {
    dailyProductivityScore,
    consistencyScore: Math.min(consistencyScore, 100),
    completedTasksToday,
    totalTasksToday,
    completedHabitsToday,
    totalHabits: habitsTodayCount,
    focusMinutesToday,
    focusHoursToday: (focusMinutesToday / 60).toFixed(1),
    streak,
    weeklyTaskCompletionData,
    weeklyHabitCompletionData,
    weeklyFocusData,
    monthlyCompletionRate: Math.round(monthlyCompletionRate * 100),
    completionRate: totalTasksToday > 0 ? Math.round((completedTasksToday / totalTasksToday) * 100) : 0,
    habitCompletionRate: habitsTodayCount > 0 ? Math.round((completedHabitsToday / habitsTodayCount) * 100) : 0,
    routineScore: Math.round((consistencyScore + dailyProductivityScore) / 2),
    routineConsistency: consistencyScore,
    weeklyStrength: Math.round(avgWeeklyCompletion),
    monthlyPerformance: Math.round(monthlyCompletionRate * 100),
    streakQuality: Math.min(Math.round(streak * 10), 100)
  };
};
