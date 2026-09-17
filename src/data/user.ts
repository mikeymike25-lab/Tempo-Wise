export interface Goal {
  id: string;
  title: string;
  category: 'Focus' | 'Tasks' | 'Routines' | 'Personal';
  target: string;
  completed: boolean;
}

export interface NotificationPrefs {
  reminderAlerts: boolean;
  focusTimerAlerts: boolean;
  dailyRoutineBriefing: boolean;
  weeklyProgressSummary: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface UserPreferences {
  defaultFocusDuration: number;
  defaultBreakDuration: number;
  weekStartDay: 'Monday' | 'Sunday';
  autoStartBreaks: boolean;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  title: string;
  avatarUrl: string;
  theme: 'light' | 'dark' | 'system';
  goals: Goal[];
  notificationPrefs: NotificationPrefs;
  preferences: UserPreferences;
}

export const formatDisplayName = (fullName?: string | null, email?: string | null): string => {
  const cleanName = fullName?.trim();
  const cleanEmail = email?.trim() || '';

  // If a valid custom name is provided and is not the demo default (unless email is explicitly the demo email)
  if (cleanName && cleanName.length > 0) {
    if (cleanName !== 'Raven Rose' || cleanEmail.toLowerCase().includes('raven.rose')) {
      return cleanName;
    }
  }

  // If an email is available, derive clean capitalized name from username portion
  if (cleanEmail && cleanEmail.includes('@')) {
    const prefix = cleanEmail.split('@')[0];
    const words = prefix.split(/[._\-\d]+/).filter(Boolean);
    if (words.length > 0) {
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }

  return cleanName || 'User';
};

export const defaultUser: User = {
  id: 'u_raven_rose',
  fullName: 'Raven Rose',
  email: 'raven.rose@student.edu',
  title: 'Student / Working Professional',
  avatarUrl: 'https://ionicframework.com/docs/img/demos/avatar.svg',
  theme: 'light',
  goals: [
    {
      id: 'g_1',
      title: 'Complete 5 daily tasks on schedule',
      category: 'Tasks',
      target: '5 tasks/day',
      completed: true,
    },
    {
      id: 'g_2',
      title: 'Log 2 hours of focused Pomodoro work',
      category: 'Focus',
      target: '120 mins/day',
      completed: true,
    },
    {
      id: 'g_3',
      title: 'Maintain morning study routine streak',
      category: 'Routines',
      target: '7-day streak',
      completed: false,
    },
    {
      id: 'g_4',
      title: 'Review weekly progress every Friday',
      category: 'Personal',
      target: 'Weekly',
      completed: false,
    },
  ],
  notificationPrefs: {
    reminderAlerts: true,
    focusTimerAlerts: true,
    dailyRoutineBriefing: true,
    weeklyProgressSummary: false,
    soundEnabled: true,
    vibrationEnabled: true,
  },
  preferences: {
    defaultFocusDuration: 25,
    defaultBreakDuration: 5,
    weekStartDay: 'Monday',
    autoStartBreaks: false,
  },
};
