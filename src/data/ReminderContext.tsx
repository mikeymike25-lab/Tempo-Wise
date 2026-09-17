import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { getStorageItem, setStorageItem } from './storage';
import { useUser } from './UserContext';
import { subscribeReminders, saveReminderDoc, deleteReminderDoc } from '../services/firestoreService';
import { playSessionCompletionSound } from '../utils/audio';

export type ReminderRepeat = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';
export type ReminderNotifyBefore =
  | 'at-time'
  | '5-min'
  | '10-min'
  | '15-min'
  | '30-min'
  | '1-hour'
  | '1-day';

export interface Reminder {
  id: string;
  label: string;
  date: string; // e.g. "2026-09-17" or "September 17, 2026"
  time: string; // e.g. "08:00 AM"
  repeat: ReminderRepeat;
  notifyBefore: ReminderNotifyBefore;
  linkedTaskId?: string;
  linkedRoutineId?: string;
  category?: 'Academic' | 'Routine' | 'Task' | 'Personal' | 'Health' | string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

interface ReminderContextType {
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id' | 'completed'>) => void;
  updateReminder: (reminder: Reminder) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;
  snoozeReminder: (id: string, minutes: number) => void;
  upcomingCount: number;
  completedCount: number;
  todayCount: number;
  activeAlert: Reminder | null;
  dismissAlert: () => void;
}

const defaultReminders: Reminder[] = [
  {
    id: 'rem-1',
    label: 'Mathematics Lecture in Room 101',
    date: 'September 17, 2026',
    time: '08:00 AM',
    repeat: 'weekdays',
    notifyBefore: '15-min',
    linkedTaskId: '1',
    category: 'Academic',
    completed: true,
    completedAt: '2026-09-17T07:45:00',
    notes: 'Bring calculus notebook and scientific calculator.',
  },
  {
    id: 'rem-2',
    label: 'Morning Momentum Habit Check',
    date: 'September 17, 2026',
    time: '07:30 AM',
    repeat: 'daily',
    notifyBefore: 'at-time',
    linkedRoutineId: 'rt-1',
    category: 'Routine',
    completed: true,
    completedAt: '2026-09-17T07:30:00',
  },
  {
    id: 'rem-3',
    label: 'IT Project Milestone Presentation',
    date: 'September 17, 2026',
    time: '01:30 PM',
    repeat: 'none',
    notifyBefore: '30-min',
    linkedTaskId: '9',
    category: 'Academic',
    completed: false,
    notes: 'Present demo prototype and submit sprint report in Lab 4.',
  },
  {
    id: 'rem-4',
    label: 'Submit Midterm Internship Application',
    date: 'September 18, 2026',
    time: '05:00 PM',
    repeat: 'none',
    notifyBefore: '1-day',
    category: 'Personal',
    completed: false,
    notes: 'Attach updated resume and transcript PDF before portal closes.',
  },
  {
    id: 'rem-5',
    label: 'Evening Wind-down & Screen Off',
    date: 'September 17, 2026',
    time: '09:45 PM',
    repeat: 'daily',
    notifyBefore: '10-min',
    linkedRoutineId: 'rt-2',
    category: 'Routine',
    completed: false,
  },
];

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

const getLeadTimeMinutes = (notifyBefore: ReminderNotifyBefore): number => {
  switch (notifyBefore) {
    case '5-min': return 5;
    case '10-min': return 10;
    case '15-min': return 15;
    case '30-min': return 30;
    case '1-hour': return 60;
    case '1-day': return 1440;
    case 'at-time':
    default: return 0;
  }
};

const parseReminderDateTime = (dateStr: string, timeStr: string): Date | null => {
  try {
    const [hoursStr, minutesStr] = timeStr.trim().split(':');
    let hours = parseInt(hoursStr, 10);
    const isPM = timeStr.toUpperCase().includes('PM');
    const isAM = timeStr.toUpperCase().includes('AM');
    const minutes = parseInt(minutesStr.replace(/\D/g, ''), 10) || 0;
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    const targetDate = new Date(dateStr);
    if (!isNaN(targetDate.getTime())) {
      targetDate.setHours(hours, minutes, 0, 0);
      return targetDate;
    }
    const fallback = new Date();
    fallback.setHours(hours, minutes, 0, 0);
    return fallback;
  } catch {
    return null;
  }
};

export const ReminderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { firebaseUid } = useUser();
  const [reminders, setReminders] = useState<Reminder[]>(() =>
    getStorageItem<Reminder[]>('tempus-reminders', defaultReminders)
  );
  const [activeAlert, setActiveAlert] = useState<Reminder | null>(null);
  const triggeredIds = useRef<Set<string>>(new Set());

  const dismissAlert = () => {
    setActiveAlert(null);
  };

  // Sync with Firestore when authenticated
  useEffect(() => {
    if (!firebaseUid) {
      const saved = getStorageItem<Reminder[]>('tempus-reminders', defaultReminders);
      setReminders(saved);
      return;
    }

    const unsubscribe = subscribeReminders(firebaseUid, (cloudReminders) => {
      if (cloudReminders && cloudReminders.length > 0) {
        setReminders(cloudReminders);
        setStorageItem('tempus-reminders', cloudReminders);
      } else {
        // First cloud sync: push initial reminders to Firestore
        const localReminders = getStorageItem<Reminder[]>('tempus-reminders', defaultReminders);
        if (localReminders.length > 0) {
          localReminders.forEach((r) => saveReminderDoc(firebaseUid, r));
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [firebaseUid]);

  // Lead-time alert scheduler engine (evaluates notifyBefore)
  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      reminders.forEach((r) => {
        if (r.completed || triggeredIds.current.has(r.id)) return;

        const target = parseReminderDateTime(r.date, r.time);
        if (!target) return;

        const leadMs = getLeadTimeMinutes(r.notifyBefore) * 60 * 1000;
        const triggerTime = target.getTime() - leadMs;

        if (now >= triggerTime && now <= triggerTime + 10 * 60 * 1000) {
          triggeredIds.current.add(r.id);
          playSessionCompletionSound();
          setActiveAlert(r);

          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try {
              new Notification(`Tempus Wise: ${r.label}`, {
                body: `Scheduled for ${r.time} (${r.notifyBefore === 'at-time' ? 'Now' : r.notifyBefore} notice)`,
              });
            } catch (err) {
              console.warn('Web notification error:', err);
            }
          }
        }
      });
    };

    checkReminders();
    const timer = setInterval(checkReminders, 25000);
    return () => clearInterval(timer);
  }, [reminders]);

  // Request browser Notification permission if supported
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Reset reminders upon logout
  useEffect(() => {
    const handleLogoutReset = () => {
      setReminders(defaultReminders);
      setActiveAlert(null);
    };
    window.addEventListener('tempus-logout', handleLogoutReset);
    return () => {
      window.removeEventListener('tempus-logout', handleLogoutReset);
    };
  }, []);

  const saveReminders = (updated: Reminder[]) => {
    setReminders(updated);
    setStorageItem('tempus-reminders', updated);
  };

  const addReminder = (data: Omit<Reminder, 'id' | 'completed'>) => {
    const newReminder: Reminder = {
      ...data,
      id: `rem-${Date.now()}`,
      completed: false,
    };
    const updated = [newReminder, ...reminders];
    saveReminders(updated);
    if (firebaseUid) {
      saveReminderDoc(firebaseUid, newReminder);
    }
  };

  const updateReminder = (updatedReminder: Reminder) => {
    const updated = reminders.map((r) => (r.id === updatedReminder.id ? updatedReminder : r));
    saveReminders(updated);
    if (firebaseUid) {
      saveReminderDoc(firebaseUid, updatedReminder);
    }
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    saveReminders(updated);
    if (firebaseUid) {
      deleteReminderDoc(firebaseUid, id);
    }
  };

  const toggleReminder = (id: string) => {
    let changedItem: Reminder | undefined;
    const updated = reminders.map((r) => {
      if (r.id !== id) return r;
      const isNowCompleted = !r.completed;
      changedItem = {
        ...r,
        completed: isNowCompleted,
        completedAt: isNowCompleted ? new Date().toISOString() : undefined,
      };
      return changedItem;
    });
    saveReminders(updated);
    if (firebaseUid && changedItem) {
      saveReminderDoc(firebaseUid, changedItem);
    }
  };

  const snoozeReminder = (id: string, minutes: number) => {
    let changedItem: Reminder | undefined;
    const updated = reminders.map((r) => {
      if (r.id !== id) return r;

      // Calculate new time string forward by X minutes
      const now = new Date();
      now.setMinutes(now.getMinutes() + minutes);
      const hours = now.getHours();
      const mins = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMins = mins.toString().padStart(2, '0');
      const newTime = `${formattedHours}:${formattedMins} ${ampm}`;

      changedItem = {
        ...r,
        time: newTime,
        completed: false,
      };
      return changedItem;
    });
    saveReminders(updated);
    if (firebaseUid && changedItem) {
      saveReminderDoc(firebaseUid, changedItem);
    }
  };

  // Helper date check for Today
  const todayDate = new Date();
  const todayDay = todayDate.getDate().toString();
  const todayMonthName = todayDate.toLocaleDateString('en-US', { month: 'long' });

  const isTodayReminder = (r: Reminder) => {
    if (r.repeat === 'daily') return true;
    if (r.repeat === 'weekdays' && todayDate.getDay() >= 1 && todayDate.getDay() <= 5) return true;
    if (r.date.includes(todayMonthName) && r.date.includes(` ${todayDay},`)) return true;
    if (r.date.includes(`-${todayDay.padStart(2, '0')}`)) return true;
    return false;
  };

  const upcomingCount = reminders.filter((r) => !r.completed).length;
  const completedCount = reminders.filter((r) => r.completed).length;
  const todayCount = reminders.filter((r) => !r.completed && isTodayReminder(r)).length;

  return (
    <ReminderContext.Provider
      value={{
        reminders,
        addReminder,
        updateReminder,
        deleteReminder,
        toggleReminder,
        snoozeReminder,
        upcomingCount,
        completedCount,
        todayCount,
        activeAlert,
        dismissAlert,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
};
