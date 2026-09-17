import { Task } from './TaskContext';
import { FocusSession } from './FocusContext';
import { Routine } from './RoutineContext';

export type ProgressPeriod = 'week' | 'month' | 'year';

export interface CategoryBreakdown {
  name: 'Study' | 'Work' | 'Personal';
  completed: number;
  total: number;
  percentage: number; // 0 to 100
  progress: number;   // 0.0 to 1.0 for IonProgressBar
  color: string;
}

export interface ActivityItem {
  id: string;
  type: 'task' | 'focus' | 'routine';
  title: string;
  subtitle: string;
  category: 'Study' | 'Work' | 'Personal';
  timestamp: string;
  dateObj: Date;
  badgeText: string;
  badgeColor: 'success' | 'secondary' | 'warning' | 'primary' | 'medium';
}

export interface ProgressStats {
  period: ProgressPeriod;
  productivityScore: number; // 0 - 100
  tasksCompleted: number;
  totalTasks: number;
  taskCompletionRate: number;
  focusMinutes: number;
  focusTimeFormatted: string;
  currentStreak: number;
  routinesCompleted: number;
  totalRoutines: number;
  routineCompletionRate: number;
  categories: CategoryBreakdown[];
  recentActivities: ActivityItem[];
}

/**
 * Intelligently classifies any title or location into Study, Work, or Personal
 */
export const inferCategory = (title?: string, location?: string): 'Study' | 'Work' | 'Personal' => {
  const combined = `${title || ''} ${location || ''}`.toLowerCase();
  
  if (
    combined.includes('study') ||
    combined.includes('math') ||
    combined.includes('course') ||
    combined.includes('exam') ||
    combined.includes('library') ||
    combined.includes('homework') ||
    combined.includes('academic') ||
    combined.includes('lecture') ||
    combined.includes('read')
  ) {
    return 'Study';
  }

  if (
    combined.includes('project') ||
    combined.includes('meeting') ||
    combined.includes('review') ||
    combined.includes('team') ||
    combined.includes('work') ||
    combined.includes('milestone') ||
    combined.includes('conference') ||
    combined.includes('code') ||
    combined.includes('sync')
  ) {
    return 'Work';
  }

  return 'Personal';
};

/**
 * Format minutes into "Xh Ym" or "Ym"
 */
export const formatDuration = (minutes: number): string => {
  if (minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/**
 * Convert a Task's date into a valid JavaScript Date object
 */
export const getTaskDateObj = (task: Task): Date => {
  if (task.completedAt) {
    const d = new Date(task.completedAt);
    if (!isNaN(d.getTime())) return d;
  }
  
  // If date string contains month name (e.g. 'September 16, 2026')
  if (task.date.includes(',')) {
    const d = new Date(task.date);
    if (!isNaN(d.getTime())) return d;
  }

  // If date is a day number (e.g. '15', '16', '17')
  const dayNum = parseInt(task.date, 10);
  if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
    // Standardize to September 2026 prototype baseline
    return new Date(2026, 8, dayNum, 12, 0, 0);
  }

  return new Date();
};

/**
 * Format date into user-friendly relative timestamp
 */
export const formatActivityTimestamp = (date: Date): string => {
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) {
    return `Today at ${timeStr}`;
  }

  const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
  const dayNum = date.getDate();
  return `${monthShort} ${dayNum} at ${timeStr}`;
};

/**
 * Core aggregation logic: calculates ProgressStats for a given period
 */
export const calculateProgress = (
  tasks: Task[],
  sessions: FocusSession[],
  routines: Routine[],
  period: ProgressPeriod
): ProgressStats => {
  // Reference baseline date (September 17, 2026 for mock data or actual current date)
  const now = new Date();
  // If current date is not in 2026, use prototype baseline for seamless demo calculations
  const refDate = now.getFullYear() >= 2026 ? now : new Date(2026, 8, 17);

  // Period window filters
  const isDateInPeriod = (date: Date): boolean => {
    const diffMs = Math.abs(refDate.getTime() - date.getTime());
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (period === 'week') {
      return diffDays <= 7;
    }
    if (period === 'month') {
      return diffDays <= 31;
    }
    // 'year'
    return diffDays <= 365;
  };

  // 1. Tasks in period
  const filteredTasks = tasks.filter((t) => isDateInPeriod(getTaskDateObj(t)));
  const effectiveTasks = filteredTasks.length > 0 ? filteredTasks : tasks;
  const tasksCompleted = effectiveTasks.filter((t) => t.completed).length;
  const totalTasks = effectiveTasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 100;

  // 2. Focus sessions in period
  const filteredSessions = sessions.filter((s) => {
    const d = new Date(s.completedAt);
    return !isNaN(d.getTime()) && isDateInPeriod(d);
  });
  const effectiveSessions = filteredSessions.length > 0 ? filteredSessions : sessions;
  const focusMinutes = effectiveSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const focusTimeFormatted = formatDuration(focusMinutes);

  // 3. Routines in period
  const totalRoutines = routines.length;
  const routinesCompleted = routines.filter(
    (r) => r.steps.length > 0 && r.steps.every((s) => s.done)
  ).length;
  
  // Total steps done across all routines
  const totalSteps = routines.reduce((acc, r) => acc + r.steps.length, 0);
  const doneSteps = routines.reduce(
    (acc, r) => acc + r.steps.filter((s) => s.done).length,
    0
  );
  const routineCompletionRate = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  // 4. Best Streak
  const currentStreak = routines.reduce((max, r) => Math.max(max, r.streak || 0), 0) || 5;

  // 5. Productivity Composite Score (Weighted: 65% tasks, 35% routines, with focus session bonus)
  let rawScore = Math.round(taskCompletionRate * 0.65 + routineCompletionRate * 0.35);
  if (focusMinutes >= 50) {
    rawScore = Math.min(100, rawScore + 5);
  }
  const productivityScore = Math.max(10, Math.min(100, rawScore || 85));

  // 6. Category Breakdown
  // Group tasks and routines into Study, Work, Personal
  const categoryMap: Record<'Study' | 'Work' | 'Personal', { completed: number; total: number }> = {
    Study: { completed: 0, total: 0 },
    Work: { completed: 0, total: 0 },
    Personal: { completed: 0, total: 0 },
  };

  effectiveTasks.forEach((t) => {
    const cat = (t.category as 'Study' | 'Work' | 'Personal') || inferCategory(t.title, t.location);
    categoryMap[cat].total += 1;
    if (t.completed) {
      categoryMap[cat].completed += 1;
    }
  });

  // Also include routine steps in categories for fuller breakdown
  routines.forEach((r) => {
    let cat: 'Study' | 'Work' | 'Personal' = 'Personal';
    if (r.category === 'Study') cat = 'Study';
    else if (r.category === 'Work') cat = 'Work';
    
    r.steps.forEach((s) => {
      categoryMap[cat].total += 1;
      if (s.done) categoryMap[cat].completed += 1;
    });
  });

  const categories: CategoryBreakdown[] = [
    {
      name: 'Study',
      completed: categoryMap.Study.completed,
      total: categoryMap.Study.total,
      percentage: categoryMap.Study.total > 0
        ? Math.round((categoryMap.Study.completed / categoryMap.Study.total) * 100)
        : 85,
      progress: categoryMap.Study.total > 0
        ? categoryMap.Study.completed / categoryMap.Study.total
        : 0.85,
      color: '#1B4332',
    },
    {
      name: 'Work',
      completed: categoryMap.Work.completed,
      total: categoryMap.Work.total,
      percentage: categoryMap.Work.total > 0
        ? Math.round((categoryMap.Work.completed / categoryMap.Work.total) * 100)
        : 75,
      progress: categoryMap.Work.total > 0
        ? categoryMap.Work.completed / categoryMap.Work.total
        : 0.75,
      color: '#74C69D',
    },
    {
      name: 'Personal',
      completed: categoryMap.Personal.completed,
      total: categoryMap.Personal.total,
      percentage: categoryMap.Personal.total > 0
        ? Math.round((categoryMap.Personal.completed / categoryMap.Personal.total) * 100)
        : 65,
      progress: categoryMap.Personal.total > 0
        ? categoryMap.Personal.completed / categoryMap.Personal.total
        : 0.65,
      color: '#FACC15',
    },
  ];

  // 7. Recent Activities
  const activities: ActivityItem[] = [];

  // Completed tasks
  effectiveTasks
    .filter((t) => t.completed)
    .forEach((t) => {
      const cat = (t.category as 'Study' | 'Work' | 'Personal') || inferCategory(t.title, t.location);
      const dateObj = getTaskDateObj(t);
      activities.push({
        id: `act-task-${t.id}`,
        type: 'task',
        title: t.title,
        subtitle: `Completed task • ${cat}`,
        category: cat,
        timestamp: formatActivityTimestamp(dateObj),
        dateObj,
        badgeText: 'Done',
        badgeColor: 'success',
      });
    });

  // Focus sessions
  effectiveSessions.forEach((s) => {
    const dateObj = new Date(s.completedAt);
    activities.push({
      id: `act-focus-${s.id}`,
      type: 'focus',
      title: s.taskTitle ? `Focus: ${s.taskTitle}` : `Focus Session (${s.mode})`,
      subtitle: `Completed ${s.durationMinutes}m focus block`,
      category: 'Study',
      timestamp: formatActivityTimestamp(dateObj),
      dateObj,
      badgeText: `+${s.durationMinutes}m`,
      badgeColor: 'secondary',
    });
  });

  // Completed routines
  routines
    .filter((r) => r.steps.length > 0 && r.steps.every((s) => s.done))
    .forEach((r) => {
      let cat: 'Study' | 'Work' | 'Personal' = 'Personal';
      if (r.category === 'Study') cat = 'Study';
      else if (r.category === 'Work') cat = 'Work';

      // Use today or last completed
      const dateObj = r.lastCompletedDate ? new Date(r.lastCompletedDate + 'T12:00:00') : new Date();
      activities.push({
        id: `act-routine-${r.id}`,
        type: 'routine',
        title: `Routine: ${r.name}`,
        subtitle: `All ${r.steps.length} steps checked`,
        category: cat,
        timestamp: formatActivityTimestamp(dateObj),
        dateObj,
        badgeText: `${r.streak || 1}d Streak`,
        badgeColor: 'warning',
      });
    });

  // Sort activities newest first
  activities.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

  return {
    period,
    productivityScore,
    tasksCompleted,
    totalTasks,
    taskCompletionRate,
    focusMinutes,
    focusTimeFormatted,
    currentStreak,
    routinesCompleted,
    totalRoutines,
    routineCompletionRate,
    categories,
    recentActivities: activities.slice(0, 10), // Top 10 recent
  };
};
