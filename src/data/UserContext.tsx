import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Goal, NotificationPrefs, UserPreferences, defaultUser, formatDisplayName } from './user';
import { getStorageItem, setStorageItem } from './storage';
import { onAuthChange, signOutUser } from '../services/authService';
import { subscribeUserProfile, saveUserProfile } from '../services/firestoreService';
import { isFirebaseConfigured } from '../services/firebase';

interface UserContextType {
  user: User;
  isLoggedIn: boolean;
  firebaseUid: string | null;
  updateUser: (updates: Partial<User>) => void;
  updateNotificationPrefs: (prefs: Partial<NotificationPrefs>) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  toggleGoal: (id: string) => void;
  deleteGoal: (id: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  login: (uid?: string) => void;
  logout: () => Promise<void>;
  resetUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => getStorageItem<User>('tempus-user', defaultUser));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => getStorageItem<boolean>('isLoggedIn', false));
  const [firebaseUid, setFirebaseUid] = useState<string | null>(() => getStorageItem<string | null>('tempus-uid', null));

  // Sync theme changes with DOM on mount and when user.theme changes
  useEffect(() => {
    applyTheme(user.theme);
  }, [user.theme]);

  // Listen to Firebase Auth state
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = onAuthChange((fbUser) => {
      if (fbUser) {
        setFirebaseUid(fbUser.uid);
        setIsLoggedIn(true);
        setStorageItem('isLoggedIn', true);
        setStorageItem('tempus-uid', fbUser.uid);

        const currentStorage = getStorageItem<User>('tempus-user', defaultUser);
        const resolvedFallbackName = formatDisplayName(
          fbUser.displayName || (currentStorage.fullName !== 'Raven Rose' ? currentStorage.fullName : ''),
          fbUser.email || currentStorage.email
        );

        // Subscribe to user document in Firestore
        const unsubsProfile = subscribeUserProfile(fbUser.uid, (cloudUser) => {
          if (cloudUser) {
            const finalName = formatDisplayName(cloudUser.fullName, fbUser.email || cloudUser.email);
            const updatedProfile: User = {
              ...cloudUser,
              fullName: finalName,
              email: fbUser.email || cloudUser.email,
            };
            setUser(updatedProfile);
            setStorageItem('tempus-user', updatedProfile);
            if (finalName !== cloudUser.fullName) {
              saveUserProfile(fbUser.uid, updatedProfile);
            }
          } else {
            // Document doesn't exist yet, save real user credentials
            const initialUser: User = {
              ...defaultUser,
              id: fbUser.uid,
              email: fbUser.email || '',
              fullName: resolvedFallbackName,
            };
            setUser(initialUser);
            setStorageItem('tempus-user', initialUser);
            saveUserProfile(fbUser.uid, initialUser);
          }
        });

        return () => {
          unsubsProfile();
        };
      } else {
        // Logged out
        setFirebaseUid(null);
        setStorageItem('tempus-uid', null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.classList.toggle('ion-palette-dark', isDark);
    document.body.classList.toggle('dark', isDark);
  };

  const persistUser = (updated: User) => {
    setUser(updated);
    setStorageItem('tempus-user', updated);
    if (firebaseUid) {
      saveUserProfile(firebaseUid, updated);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    const updated = { ...user, ...updates };
    persistUser(updated);
  };

  const updateNotificationPrefs = (prefs: Partial<NotificationPrefs>) => {
    const updated = {
      ...user,
      notificationPrefs: {
        ...user.notificationPrefs,
        ...prefs,
      },
    };
    persistUser(updated);
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    const updated = {
      ...user,
      preferences: {
        ...user.preferences,
        ...prefs,
      },
    };
    persistUser(updated);
  };

  const addGoal = (goalData: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `g_${Date.now()}`,
    };
    const updated = {
      ...user,
      goals: [...user.goals, newGoal],
    };
    persistUser(updated);
  };

  const toggleGoal = (id: string) => {
    const updated = {
      ...user,
      goals: user.goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)),
    };
    persistUser(updated);
  };

  const deleteGoal = (id: string) => {
    const updated = {
      ...user,
      goals: user.goals.filter((g) => g.id !== id),
    };
    persistUser(updated);
  };

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    const updated: User = {
      ...user,
      theme,
    };
    persistUser(updated);
    applyTheme(theme);
  };

  const login = (uid?: string) => {
    setIsLoggedIn(true);
    setStorageItem('isLoggedIn', true);
    if (uid) {
      setFirebaseUid(uid);
      setStorageItem('tempus-uid', uid);
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    setIsLoggedIn(false);
    setFirebaseUid(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('tempus-uid');
    localStorage.removeItem('tempus-user');
    localStorage.removeItem('tempus-tasks');
    localStorage.removeItem('tempus-routines');
    localStorage.removeItem('tempus-reminders');
    localStorage.removeItem('tempus-focus-sessions');
    localStorage.removeItem('tempus-focus-settings');
    localStorage.removeItem('tempus-active-timer');
    setUser(defaultUser);
    window.dispatchEvent(new Event('tempus-logout'));
  };

  const resetUserData = () => {
    persistUser(defaultUser);
    applyTheme(defaultUser.theme);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn,
        firebaseUid,
        updateUser,
        updateNotificationPrefs,
        updatePreferences,
        addGoal,
        toggleGoal,
        deleteGoal,
        setTheme,
        login,
        logout,
        resetUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
