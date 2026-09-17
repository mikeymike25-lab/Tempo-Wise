import { describe, it, expect, beforeEach } from 'vitest';
import { defaultUser } from './user';
import { getStorageItem, setStorageItem, clearStorage } from './storage';

describe('User data model and storage', () => {
  beforeEach(() => {
    clearStorage();
  });

  it('provides sensible default user values per ARCHITECTURE.md', () => {
    expect(defaultUser.fullName).toBe('Raven Rose');
    expect(defaultUser.email).toBe('raven.rose@student.edu');
    expect(defaultUser.theme).toBe('light');
    expect(defaultUser.goals.length).toBeGreaterThan(0);
    expect(defaultUser.notificationPrefs.reminderAlerts).toBe(true);
    expect(defaultUser.preferences.defaultFocusDuration).toBe(25);
  });

  it('persists updated user profile in storage', () => {
    const updatedUser = {
      ...defaultUser,
      fullName: 'Alex Vance',
      email: 'alex.vance@work.org',
    };
    setStorageItem('tempus-user', updatedUser);

    const retrieved = getStorageItem('tempus-user', defaultUser);
    expect(retrieved.fullName).toBe('Alex Vance');
    expect(retrieved.email).toBe('alex.vance@work.org');
  });

  it('persists goal completion changes', () => {
    const userWithUpdatedGoal = {
      ...defaultUser,
      goals: defaultUser.goals.map((g) => (g.id === 'g_3' ? { ...g, completed: true } : g)),
    };
    setStorageItem('tempus-user', userWithUpdatedGoal);

    const retrieved = getStorageItem('tempus-user', defaultUser);
    const goal3 = retrieved.goals.find((g) => g.id === 'g_3');
    expect(goal3?.completed).toBe(true);
  });
});
