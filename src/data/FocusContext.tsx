import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStorageItem, setStorageItem } from './storage';
import { useUser } from './UserContext';
import { subscribeFocusSessions, saveFocusSessionDoc } from '../services/firestoreService';

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  mode: '25/5' | '25/10' | '50/10' | '90/20' | 'custom' | string;
  durationMinutes: number;
  completedAt: string; // ISO date-time string
}

export interface FocusTimerSettings {
  preset: '25/5' | '25/10' | '50/10' | '90/20' | 'custom';
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  autoStartBreaks: boolean;
  soundEnabled: boolean;
}

const defaultSettings: FocusTimerSettings = {
  preset: '25/5',
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  autoStartBreaks: false,
  soundEnabled: true,
};

const defaultSessions: FocusSession[] = [
  {
    id: 'fs-1',
    taskId: '8',
    taskTitle: 'Study for Mathematics',
    mode: '25/5',
    durationMinutes: 25,
    completedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'fs-2',
    taskId: '8',
    taskTitle: 'Study for Mathematics',
    mode: '25/5',
    durationMinutes: 25,
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

interface FocusContextType {
  sessions: FocusSession[];
  settings: FocusTimerSettings;
  logFocusSession: (sessionData: {
    taskId?: string;
    taskTitle?: string;
    mode: string;
    durationMinutes: number;
  }) => void;
  updateSettings: (newSettings: Partial<FocusTimerSettings>) => void;
  todayFocusMinutes: number;
  totalFocusMinutes: number;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const FocusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, firebaseUid, updatePreferences } = useUser();
  const [sessions, setSessions] = useState<FocusSession[]>(() =>
    getStorageItem<FocusSession[]>('tempus-focus-sessions', defaultSessions)
  );
  const [settings, setSettings] = useState<FocusTimerSettings>(() =>
    getStorageItem<FocusTimerSettings>('tempus-focus-settings', defaultSettings)
  );

  // Synchronize timer settings with Profile user.preferences
  useEffect(() => {
    if (user?.preferences) {
      setSettings((prev) => {
        const prefFocus = user.preferences.defaultFocusDuration || prev.focusMinutes;
        const prefBreak = user.preferences.defaultBreakDuration || prev.shortBreakMinutes;
        const prefAuto =
          user.preferences.autoStartBreaks !== undefined
            ? user.preferences.autoStartBreaks
            : prev.autoStartBreaks;

        if (
          prev.focusMinutes !== prefFocus ||
          prev.shortBreakMinutes !== prefBreak ||
          prev.autoStartBreaks !== prefAuto
        ) {
          const updated = {
            ...prev,
            focusMinutes: prefFocus,
            shortBreakMinutes: prefBreak,
            autoStartBreaks: prefAuto,
          };
          setStorageItem('tempus-focus-settings', updated);
          return updated;
        }
        return prev;
      });
    }
  }, [user.preferences]);

  // Sync with Firestore when authenticated
  useEffect(() => {
    if (!firebaseUid) {
      const storedSessions = getStorageItem<FocusSession[]>('tempus-focus-sessions', defaultSessions);
      setSessions(storedSessions);
      return;
    }

    const unsubscribe = subscribeFocusSessions(firebaseUid, (cloudSessions) => {
      if (cloudSessions && cloudSessions.length > 0) {
        setSessions(cloudSessions);
        setStorageItem('tempus-focus-sessions', cloudSessions);
      } else {
        // First cloud sync: push existing sessions to Firestore
        const localSessions = getStorageItem<FocusSession[]>('tempus-focus-sessions', defaultSessions);
        if (localSessions.length > 0) {
          localSessions.forEach((s) => saveFocusSessionDoc(firebaseUid, s));
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [firebaseUid]);

  // Reset focus data upon logout event
  useEffect(() => {
    const handleLogoutReset = () => {
      setSessions(defaultSessions);
      setSettings(defaultSettings);
    };
    window.addEventListener('tempus-logout', handleLogoutReset);
    return () => {
      window.removeEventListener('tempus-logout', handleLogoutReset);
    };
  }, []);

  const logFocusSession = (sessionData: {
    taskId?: string;
    taskTitle?: string;
    mode: string;
    durationMinutes: number;
  }) => {
    const newSession: FocusSession = {
      id: `fs-${Date.now()}`,
      taskId: sessionData.taskId,
      taskTitle: sessionData.taskTitle,
      mode: sessionData.mode,
      durationMinutes: sessionData.durationMinutes,
      completedAt: new Date().toISOString(),
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    setStorageItem('tempus-focus-sessions', updated);

    if (firebaseUid) {
      saveFocusSessionDoc(firebaseUid, newSession);
    }
  };

  const updateSettings = (newSettings: Partial<FocusTimerSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    setStorageItem('tempus-focus-settings', updated);

    if (
      newSettings.focusMinutes !== undefined ||
      newSettings.shortBreakMinutes !== undefined ||
      newSettings.autoStartBreaks !== undefined
    ) {
      updatePreferences({
        defaultFocusDuration: updated.focusMinutes,
        defaultBreakDuration: updated.shortBreakMinutes,
        autoStartBreaks: updated.autoStartBreaks,
      });
    }
  };

  // Derived metrics
  const today = new Date().toISOString().split('T')[0];
  const todayFocusMinutes = sessions
    .filter((s) => s.completedAt.startsWith(today))
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const totalFocusMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <FocusContext.Provider
      value={{
        sessions,
        settings,
        logFocusSession,
        updateSettings,
        todayFocusMinutes,
        totalFocusMinutes,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};
