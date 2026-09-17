import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStorageItem, setStorageItem } from './storage';
import { useUser } from './UserContext';
import { subscribeRoutines, saveRoutineDoc, deleteRoutineDoc } from '../services/firestoreService';

export interface RoutineStep {
  id: string;
  label: string;
  done: boolean;
}

export interface Routine {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'custom';
  category: 'Morning' | 'Evening' | 'Study' | 'Fitness' | 'Work' | 'Wellness' | string;
  targetTime?: string;
  steps: RoutineStep[];
  streak: number;
  lastCompletedDate?: string; // YYYY-MM-DD
  lastResetDate?: string;     // YYYY-MM-DD
}

interface RoutineContextType {
  routines: Routine[];
  addRoutine: (routine: Omit<Routine, 'id' | 'streak'>) => void;
  updateRoutine: (routine: Routine) => void;
  deleteRoutine: (id: string) => void;
  toggleStep: (routineId: string, stepId: string) => void;
  resetRoutine: (routineId: string) => void;
  markAllStepsDone: (routineId: string) => void;
  completedTodayCount: number;
  totalActiveCount: number;
  bestStreak: number;
}

const defaultRoutines: Routine[] = [
  {
    id: 'rt-1',
    name: 'Morning Momentum',
    type: 'daily',
    category: 'Morning',
    targetTime: '07:30 AM',
    streak: 4,
    lastCompletedDate: '2026-09-16',
    lastResetDate: '2026-09-17',
    steps: [
      { id: 's1', label: 'Drink 500ml cold water', done: true },
      { id: 's2', label: '10-minute mindful stretching', done: true },
      { id: 's3', label: "Review today's schedule & priorities", done: false },
      { id: 's4', label: 'Healthy breakfast & fresh coffee', done: false },
    ],
  },
  {
    id: 'rt-2',
    name: 'Evening Wind-down',
    type: 'daily',
    category: 'Evening',
    targetTime: '09:45 PM',
    streak: 3,
    lastCompletedDate: '2026-09-16',
    lastResetDate: '2026-09-17',
    steps: [
      { id: 's5', label: 'Review completed tasks for the day', done: false },
      { id: 's6', label: 'Prepare tomorrow bag and study desk', done: false },
      { id: 's7', label: 'Screen-free relaxation reading (15m)', done: false },
      { id: 's8', label: 'Lights out by 10:30 PM', done: false },
    ],
  },
  {
    id: 'rt-3',
    name: 'Weekly Academic Planning',
    type: 'weekly',
    category: 'Study',
    targetTime: 'Sunday 04:00 PM',
    streak: 2,
    lastCompletedDate: '2026-09-13',
    lastResetDate: '2026-W38',
    steps: [
      { id: 's9', label: 'Download updated lecture syllabus', done: true },
      { id: 's10', label: 'Block study hours in Smart Schedule', done: true },
      { id: 's11', label: 'Group project milestones check-in', done: true },
      { id: 's12', label: 'Sync reminders with upcoming exam dates', done: false },
    ],
  },
  {
    id: 'rt-4',
    name: 'Deep Focus Protocol',
    type: 'custom',
    category: 'Work',
    targetTime: 'Before Study',
    streak: 5,
    lastResetDate: '2026-09-17',
    steps: [
      { id: 's13', label: 'Phone on Do Not Disturb mode', done: true },
      { id: 's14', label: 'Water bottle and scratchpad ready', done: true },
      { id: 's15', label: 'Set 25-minute Pomodoro session target', done: true },
      { id: 's16', label: 'Close all non-study browser tabs', done: true },
    ],
  },
];

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getWeekIdentifier = (d = new Date()) => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${date.getFullYear()}-W${weekNum}`;
};

const calculateNewStreak = (routine: Routine, todayStr: string, yesterdayStr: string): number => {
  if (routine.lastCompletedDate === todayStr) {
    return routine.streak || 1;
  }
  if (routine.lastCompletedDate === yesterdayStr) {
    return (routine.streak || 0) + 1;
  }
  return 1;
};

export const RoutineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { firebaseUid } = useUser();
  const [routines, setRoutines] = useState<Routine[]>(() => getStorageItem<Routine[]>('tempus-routines', defaultRoutines));

  const saveRoutines = (updated: Routine[]) => {
    setRoutines(updated);
    setStorageItem('tempus-routines', updated);
  };

  // Automatic daily & weekly routine reset (Plan Item 6.3)
  useEffect(() => {
    const todayStr = getLocalDateString();
    const yesterdayStr = getLocalDateString(new Date(Date.now() - 86400000));
    const currentWeekStr = getWeekIdentifier();

    let hasChanges = false;
    const updated = routines.map((r) => {
      let resetNeeded = false;
      let newResetDate = r.lastResetDate;
      let currentStreak = r.streak || 0;

      if (r.type === 'daily' && r.lastResetDate !== todayStr) {
        resetNeeded = true;
        newResetDate = todayStr;
        if (r.lastCompletedDate && r.lastCompletedDate !== yesterdayStr && r.lastCompletedDate !== todayStr) {
          currentStreak = 0;
        }
      } else if (r.type === 'weekly' && r.lastResetDate !== currentWeekStr) {
        resetNeeded = true;
        newResetDate = currentWeekStr;
      }

      if (resetNeeded) {
        hasChanges = true;
        return {
          ...r,
          steps: r.steps.map((s) => ({ ...s, done: false })),
          lastResetDate: newResetDate,
          streak: currentStreak,
        };
      }
      return r;
    });

    if (hasChanges) {
      saveRoutines(updated);
      if (firebaseUid) {
        updated.forEach((r) => saveRoutineDoc(firebaseUid, r));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync with Firestore when logged in
  useEffect(() => {
    if (!firebaseUid) {
      const rawRoutines = getStorageItem<Routine[]>('tempus-routines', defaultRoutines);
      setRoutines(rawRoutines);
      return;
    }

    const unsubscribe = subscribeRoutines(firebaseUid, (cloudRoutines) => {
      if (cloudRoutines && cloudRoutines.length > 0) {
        setRoutines(cloudRoutines);
        setStorageItem('tempus-routines', cloudRoutines);
      } else {
        // First cloud sync: upload existing local routines
        const localRoutines = getStorageItem<Routine[]>('tempus-routines', defaultRoutines);
        if (localRoutines.length > 0) {
          localRoutines.forEach((r) => saveRoutineDoc(firebaseUid, r));
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [firebaseUid]);

  // Reset to default starter routines upon logout
  useEffect(() => {
    const handleLogoutReset = () => {
      setRoutines(defaultRoutines);
    };
    window.addEventListener('tempus-logout', handleLogoutReset);
    return () => {
      window.removeEventListener('tempus-logout', handleLogoutReset);
    };
  }, []);

  const addRoutine = (routineData: Omit<Routine, 'id' | 'streak'>) => {
    const newRoutine: Routine = {
      ...routineData,
      id: `rt-${Date.now()}`,
      streak: 0,
      lastResetDate: getLocalDateString(),
    };
    const updated = [newRoutine, ...routines];
    saveRoutines(updated);
    if (firebaseUid) {
      saveRoutineDoc(firebaseUid, newRoutine);
    }
  };

  const updateRoutine = (updatedRoutine: Routine) => {
    const updated = routines.map((r) => (r.id === updatedRoutine.id ? updatedRoutine : r));
    saveRoutines(updated);
    if (firebaseUid) {
      saveRoutineDoc(firebaseUid, updatedRoutine);
    }
  };

  const deleteRoutine = (id: string) => {
    const updated = routines.filter((r) => r.id !== id);
    saveRoutines(updated);
    if (firebaseUid) {
      deleteRoutineDoc(firebaseUid, id);
    }
  };

  const toggleStep = (routineId: string, stepId: string) => {
    const todayStr = getLocalDateString();
    const yesterdayStr = getLocalDateString(new Date(Date.now() - 86400000));
    let updatedRoutineDoc: Routine | null = null;

    const updated = routines.map((routine) => {
      if (routine.id !== routineId) return routine;

      const updatedSteps = routine.steps.map((step) =>
        step.id === stepId ? { ...step, done: !step.done } : step
      );

      const allDone = updatedSteps.length > 0 && updatedSteps.every((s) => s.done);
      let newStreak = routine.streak;
      let newLastCompleted = routine.lastCompletedDate;

      if (allDone) {
        newStreak = calculateNewStreak(routine, todayStr, yesterdayStr);
        newLastCompleted = todayStr;
      }

      const res: Routine = {
        ...routine,
        steps: updatedSteps,
        streak: newStreak,
        lastCompletedDate: newLastCompleted,
      };
      updatedRoutineDoc = res;
      return res;
    });

    saveRoutines(updated);
    if (firebaseUid && updatedRoutineDoc) {
      saveRoutineDoc(firebaseUid, updatedRoutineDoc);
    }
  };

  const resetRoutine = (routineId: string) => {
    let updatedRoutineDoc: Routine | null = null;
    const updated = routines.map((routine) => {
      if (routine.id !== routineId) return routine;
      const res: Routine = {
        ...routine,
        steps: routine.steps.map((s) => ({ ...s, done: false })),
      };
      updatedRoutineDoc = res;
      return res;
    });
    saveRoutines(updated);
    if (firebaseUid && updatedRoutineDoc) {
      saveRoutineDoc(firebaseUid, updatedRoutineDoc);
    }
  };

  const markAllStepsDone = (routineId: string) => {
    const todayStr = getLocalDateString();
    const yesterdayStr = getLocalDateString(new Date(Date.now() - 86400000));
    let updatedRoutineDoc: Routine | null = null;
    const updated = routines.map((routine) => {
      if (routine.id !== routineId) return routine;
      const allDone = routine.steps.map((s) => ({ ...s, done: true }));
      const newStreak = calculateNewStreak(routine, todayStr, yesterdayStr);
      const res: Routine = {
        ...routine,
        steps: allDone,
        streak: newStreak,
        lastCompletedDate: todayStr,
      };
      updatedRoutineDoc = res;
      return res;
    });
    saveRoutines(updated);
    if (firebaseUid && updatedRoutineDoc) {
      saveRoutineDoc(firebaseUid, updatedRoutineDoc);
    }
  };

  const completedTodayCount = routines.filter(
    (r) => r.steps.length > 0 && r.steps.every((s) => s.done)
  ).length;

  const totalActiveCount = routines.length;
  const bestStreak = routines.reduce((max, r) => Math.max(max, r.streak || 0), 0);

  return (
    <RoutineContext.Provider
      value={{
        routines,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        toggleStep,
        resetRoutine,
        markAllStepsDone,
        completedTodayCount,
        totalActiveCount,
        bestStreak,
      }}
    >
      {children}
    </RoutineContext.Provider>
  );
};

export const useRoutines = () => {
  const context = useContext(RoutineContext);
  if (context === undefined) {
    throw new Error('useRoutines must be used within a RoutineProvider');
  }
  return context;
};
