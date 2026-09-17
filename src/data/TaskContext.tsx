import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStorageItem, setStorageItem } from './storage';
import { useUser } from './UserContext';
import { subscribeTasks, saveTaskDoc, deleteTaskDoc } from '../services/firestoreService';

export interface Task {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  priority?: 'low' | 'medium' | 'high';
  reminder?: string;
  notes?: string;
  completed?: boolean;
  category?: 'Study' | 'Work' | 'Personal' | string;
  completedAt?: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  getTasksByDate: (date: string, fullDateString?: string) => Task[];
}

const defaultTasks: Task[] = [
  { id: '1', title: 'Mathematics', location: 'Room 101', time: '8:00 AM', date: '15', category: 'Study', completed: true, completedAt: '2026-09-15T09:00:00.000Z' },
  { id: '2', title: 'IT Project', location: 'Room 203', time: '10:00 AM', date: '15', category: 'Work', completed: true, completedAt: '2026-09-15T11:00:00.000Z' },
  { id: '3', title: 'Lunch Break', location: 'Cafeteria', time: '1:00 PM', date: '15', category: 'Personal', completed: true, completedAt: '2026-09-15T13:30:00.000Z' },
  { id: '4', title: 'Study Session', location: 'Library', time: '2:00 PM', date: '15', category: 'Study', completed: true, completedAt: '2026-09-15T15:00:00.000Z' },
  { id: '5', title: 'Exercise', location: 'Gym', time: '5:00 PM', date: '15', category: 'Personal', completed: false },
  { id: '6', title: 'Team Meeting', location: 'Conference Hall', time: '9:00 AM', date: '16', category: 'Work', completed: true, completedAt: '2026-09-16T10:00:00.000Z' },
  { id: '7', title: 'Project Review', location: 'Room 302', time: '11:30 AM', date: '16', category: 'Work', completed: true, completedAt: '2026-09-16T12:15:00.000Z' },
  { id: '8', title: 'Study for Mathematics', location: 'Library', time: '9:00 AM', date: '17', priority: 'high', category: 'Study', completed: true, completedAt: '2026-09-17T10:30:00.000Z' },
  { id: '9', title: 'IT Project Milestone', location: 'Lab 4', time: '1:30 PM', date: '17', priority: 'medium', category: 'Work', completed: false },
];

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { firebaseUid } = useUser();
  const [tasks, setTasks] = useState<Task[]>(() => getStorageItem<Task[]>('tempus-tasks', defaultTasks));

  // Sync with Firestore when logged in
  useEffect(() => {
    if (!firebaseUid) {
      // Fallback to local storage tasks
      const savedTasks = getStorageItem<Task[]>('tempus-tasks', defaultTasks);
      setTasks(savedTasks);
      return;
    }

    const unsubscribe = subscribeTasks(firebaseUid, (cloudTasks) => {
      if (cloudTasks && cloudTasks.length > 0) {
        setTasks(cloudTasks);
        setStorageItem('tempus-tasks', cloudTasks);
      } else {
        // First cloud sync: upload existing local tasks to Firestore
        const localTasks = getStorageItem<Task[]>('tempus-tasks', defaultTasks);
        if (localTasks.length > 0) {
          localTasks.forEach((t) => saveTaskDoc(firebaseUid, t));
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [firebaseUid]);

  // Reset to default starter tasks upon logout event
  useEffect(() => {
    const handleLogoutReset = () => {
      setTasks(defaultTasks);
    };
    window.addEventListener('tempus-logout', handleLogoutReset);
    return () => {
      window.removeEventListener('tempus-logout', handleLogoutReset);
    };
  }, []);

  const addTask = (task: Task) => {
    const newTasks = [...tasks, task];
    setTasks(newTasks);
    setStorageItem('tempus-tasks', newTasks);
    if (firebaseUid) {
      saveTaskDoc(firebaseUid, task);
    }
  };

  const updateTask = (updatedTask: Task) => {
    const taskWithTimestamp: Task = {
      ...updatedTask,
      completedAt: updatedTask.completed
        ? updatedTask.completedAt || new Date().toISOString()
        : undefined,
    };
    const newTasks = tasks.map((t) => (t.id === updatedTask.id ? taskWithTimestamp : t));
    setTasks(newTasks);
    setStorageItem('tempus-tasks', newTasks);
    if (firebaseUid) {
      saveTaskDoc(firebaseUid, taskWithTimestamp);
    }
  };

  const deleteTask = (id: string) => {
    const newTasks = tasks.filter((t) => t.id !== id);
    setTasks(newTasks);
    setStorageItem('tempus-tasks', newTasks);
    if (firebaseUid) {
      deleteTaskDoc(firebaseUid, id);
    }
  };

  const normalizeDateStr = (str: string): string => {
    return str
      .replace(/^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday),\s*/i, '')
      .replace(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat),\s*/i, '')
      .trim()
      .toLowerCase();
  };

  const getTasksByDate = (dateString: string, fullDateString?: string) => {
    return tasks.filter((t) => {
      if (t.date === dateString) return true;
      if (fullDateString && t.date === fullDateString) return true;

      if (fullDateString) {
        const normTask = normalizeDateStr(t.date);
        const normFull = normalizeDateStr(fullDateString);
        if (normTask === normFull) return true;

        if (normFull.includes(normTask) || normTask.includes(normFull)) return true;

        if (t.date === dateString) {
          return normFull.includes(` ${dateString},`) || normFull.endsWith(` ${dateString}`);
        }
      }

      if (t.date.includes(` ${dateString},`)) return true;
      if (dateString.includes(` ${t.date},`)) return true;
      return false;
    });
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, getTasksByDate }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
