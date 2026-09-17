import {
  doc,
  collection,
  setDoc,
  getDoc,
  deleteDoc,
  deleteField,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { User, defaultUser } from '../data/user';
import { Task } from '../data/TaskContext';
import { Routine } from '../data/RoutineContext';
import { FocusSession } from '../data/FocusContext';
import { Reminder } from '../data/ReminderContext';

/**
 * Strips unsupported `undefined` values and converts them to Firestore's `deleteField()`,
 * preventing runtime fatal exceptions on setDoc with merge: true.
 */
const sanitizeForSetDoc = (data: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val === undefined) {
      result[key] = deleteField();
    } else {
      result[key] = val;
    }
  }
  return result;
};

/* ==========================================================================
   USER PROFILE
   ========================================================================== */

export const getUserProfile = async (uid: string): Promise<User | null> => {
  if (!isFirebaseConfigured || !db) return null;
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as User;
  }
  return null;
};

export const saveUserProfile = async (uid: string, user: Partial<User>): Promise<void> => {
  if (!isFirebaseConfigured || !db) return;
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, sanitizeForSetDoc(user as Record<string, unknown>), { merge: true });
};

export const subscribeUserProfile = (
  uid: string,
  callback: (user: User | null) => void
): Unsubscribe => {
  if (!isFirebaseConfigured || !db) {
    return () => {};
  }
  const userRef = doc(db, 'users', uid);
  return onSnapshot(
    userRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as User);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn('Firestore user profile listener error:', err);
    }
  );
};

/* ==========================================================================
   TASKS
   ========================================================================== */

export const subscribeTasks = (
  uid: string,
  callback: (tasks: Task[]) => void
): Unsubscribe => {
  if (!isFirebaseConfigured || !db) {
    return () => {};
  }
  const tasksRef = collection(db, 'users', uid, 'tasks');
  return onSnapshot(
    tasksRef,
    (snapshot) => {
      const items: Task[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Task);
      });
      callback(items);
    },
    (err) => {
      console.warn('Firestore tasks listener error:', err);
    }
  );
};

export const saveTaskDoc = async (uid: string, task: Task): Promise<void> => {
  if (!isFirebaseConfigured || !db) return;
  const taskRef = doc(db, 'users', uid, 'tasks', task.id);
  await setDoc(taskRef, sanitizeForSetDoc(task as unknown as Record<string, unknown>), { merge: true });
};

export const deleteTaskDoc = async (uid: string, taskId: string): Promise<void> => {
  if (!isFirebaseConfigured || !db) return;
  const taskRef = doc(db, 'users', uid, 'tasks', taskId);
  await deleteDoc(taskRef);
};

/* ==========================================================================
   ROUTINES
   ========================================================================== */

export const subscribeRoutines = (
  uid: string,
  callback: (routines: Routine[]) => void
): Unsubscribe => {
  if (!isFirebaseConfigured || !db) {
    return () => {};
  }
  const routinesRef = collection(db, 'users', uid, 'routines');
  return onSnapshot(
    routinesRef,
    (snapshot) => {
      const items: Routine[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Routine);
      });
      callback(items);
    },
    (err) => {
      console.warn('Firestore routines listener error:', err);
    }
  );
};

export const saveRoutineDoc = async (uid: string, routine: Routine): Promise<void> => {
  if (!isFirebaseConfigured || !db) return;
  const routineRef = doc(db, 'users', uid, 'routines', routine.id);
  await setDoc(routineRef, sanitizeForSetDoc(routine as unknown as Record<string, unknown>), { merge: true });
};

export const deleteRoutineDoc = async (uid: string, routineId: string): Promise<void> => {
  if (!isFirebaseConfigured || !db) return;
  const routineRef = doc(db, 'users', uid, 'routines', routineId);
  await deleteDoc(routineRef);
};

/* ==========================================================================
   FOCUS SESSIONS
   ========================================================================== */

export const subscribeFocusSessions = (
  uid: string,
  callback: (sessions: FocusSession[]) => void
): Unsubscribe => {
  if (!isFirebaseConfigured || !db) {
    return () => {};
  }
  const sessionsRef = collection(db, 'users', uid, 'focusSessions');
  return onSnapshot(
    sessionsRef,
    (snapshot) => {
      const items: FocusSession[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as FocusSession);
      });
      callback(items);
    },
    (err) => {
      console.warn('Firestore focus sessions listener error:', err);
    }
  );
};

export const saveFocusSessionDoc = async (uid: string, session: FocusSession): Promise<void> => {
  if (!isFirebaseConfigured || !db) return;
  const sessionRef = doc(db, 'users', uid, 'focusSessions', session.id);
  await setDoc(sessionRef, sanitizeForSetDoc(session as unknown as Record<string, unknown>), { merge: true });
};

/* ==========================================================================
   REMINDERS
   ========================================================================== */

export const subscribeReminders = (
  uid: string,
  callback: (reminders: Reminder[]) => void
): Unsubscribe => {
  if (!isFirebaseConfigured || !db) {
    return () => {};
  }
  const remindersRef = collection(db, 'users', uid, 'reminders');
  return onSnapshot(
    remindersRef,
    (snapshot) => {
      const items: Reminder[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Reminder);
      });
      callback(items);
    },
    (err) => {
      console.warn('Firestore reminders listener error:', err);
    }
  );
};

export const saveReminderDoc = async (uid: string, reminder: Reminder): Promise<void> => {
  if (!isFirebaseConfigured || !db) return;
  const reminderRef = doc(db, 'users', uid, 'reminders', reminder.id);
  await setDoc(reminderRef, sanitizeForSetDoc(reminder as unknown as Record<string, unknown>), { merge: true });
};

export const deleteReminderDoc = async (uid: string, reminderId: string): Promise<void> => {
  if (!isFirebaseConfigured || !db) return;
  const reminderRef = doc(db, 'users', uid, 'reminders', reminderId);
  await deleteDoc(reminderRef);
};

/* ==========================================================================
   INITIAL STARTER DATA SEEDING (FOR NEW USER ACCOUNTS)
   ========================================================================== */

export const seedInitialUserData = async (
  uid: string,
  fullName: string,
  email: string
): Promise<void> => {
  if (!isFirebaseConfigured || !db) return;
  const firestore = db;
  const batch = writeBatch(firestore);

  // 1. Initial Profile
  const userProfile: User = {
    ...defaultUser,
    id: uid,
    fullName,
    email,
  };
  const userRef = doc(firestore, 'users', uid);
  batch.set(userRef, userProfile);

  // 2. Starter Tasks
  const starterTasks: Task[] = [
    { id: `t_${Date.now()}_1`, title: 'Welcome to Tempus Wise', location: 'Dashboard', time: '9:00 AM', date: '17', category: 'Personal', priority: 'high', completed: false, notes: 'Explore smart schedule and routines.' },
    { id: `t_${Date.now()}_2`, title: 'Try a 25-minute Pomodoro session', location: 'Focus Screen', time: '11:00 AM', date: '17', category: 'Study', priority: 'medium', completed: false },
    { id: `t_${Date.now()}_3`, title: 'Review Daily Habits', location: 'Routine Maker', time: '6:00 PM', date: '17', category: 'Personal', priority: 'low', completed: false },
  ];

  starterTasks.forEach((task) => {
    const taskDocRef = doc(firestore, 'users', uid, 'tasks', task.id);
    batch.set(taskDocRef, task);
  });

  // 3. Starter Routine
  const starterRoutine: Routine = {
    id: `rt_${Date.now()}`,
    name: 'Morning Momentum',
    type: 'daily',
    category: 'Morning',
    targetTime: '07:30 AM',
    streak: 1,
    lastCompletedDate: '',
    lastResetDate: new Date().toISOString().split('T')[0],
    steps: [
      { id: 's1', label: 'Drink 500ml cold water', done: false },
      { id: 's2', label: '10-minute mindful stretching', done: false },
      { id: 's3', label: "Review today's schedule & priorities", done: false },
    ],
  };
  const routineDocRef = doc(firestore, 'users', uid, 'routines', starterRoutine.id);
  batch.set(routineDocRef, starterRoutine);

  // 4. Starter Reminder
  const starterReminder: Reminder = {
    id: `rem_${Date.now()}`,
    label: 'Morning Momentum Habit Check',
    date: 'September 17, 2026',
    time: '07:30 AM',
    repeat: 'daily',
    notifyBefore: 'at-time',
    category: 'Routine',
    completed: false,
    notes: 'Welcome to your smart routines.',
  };
  const reminderDocRef = doc(firestore, 'users', uid, 'reminders', starterReminder.id);
  batch.set(reminderDocRef, starterReminder);

  // Commit all starter docs in a single atomic batch
  await batch.commit();
};
