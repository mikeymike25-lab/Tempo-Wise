import { describe, it, expect } from 'vitest';
import {
  calculateProgress,
  inferCategory,
  formatDuration,
  ProgressStats,
} from './progress';
import { Task } from './TaskContext';
import { FocusSession } from './FocusContext';
import { Routine } from './RoutineContext';

describe('progress data aggregation', () => {
  it('correctly infers categories from title and location', () => {
    expect(inferCategory('Study for Mathematics', 'Library')).toBe('Study');
    expect(inferCategory('IT Project Milestone', 'Lab 4')).toBe('Work');
    expect(inferCategory('Team Meeting', 'Conference Room')).toBe('Work');
    expect(inferCategory('Morning Stretch', 'Gym')).toBe('Personal');
    expect(inferCategory('Lunch Break', 'Cafeteria')).toBe('Personal');
  });

  it('correctly formats durations', () => {
    expect(formatDuration(0)).toBe('0m');
    expect(formatDuration(25)).toBe('25m');
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(90)).toBe('1h 30m');
    expect(formatDuration(135)).toBe('2h 15m');
  });

  it('calculates stats accurately from tasks, sessions, and routines', () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Math Study',
        date: '17',
        time: '9:00 AM',
        category: 'Study',
        completed: true,
        completedAt: '2026-09-17T10:00:00.000Z',
      },
      {
        id: '2',
        title: 'Project Review',
        date: '17',
        time: '11:00 AM',
        category: 'Work',
        completed: true,
        completedAt: '2026-09-17T11:30:00.000Z',
      },
      {
        id: '3',
        title: 'Gym Workout',
        date: '17',
        time: '5:00 PM',
        category: 'Personal',
        completed: false,
      },
    ];

    const mockSessions: FocusSession[] = [
      {
        id: 'fs-1',
        mode: '25/5',
        durationMinutes: 25,
        completedAt: '2026-09-17T10:00:00.000Z',
      },
      {
        id: 'fs-2',
        mode: '50/10',
        durationMinutes: 50,
        completedAt: '2026-09-17T14:00:00.000Z',
      },
    ];

    const mockRoutines: Routine[] = [
      {
        id: 'rt-1',
        name: 'Morning Momentum',
        type: 'daily',
        category: 'Morning',
        streak: 4,
        steps: [
          { id: 's1', label: 'Water', done: true },
          { id: 's2', label: 'Stretch', done: true },
        ],
      },
      {
        id: 'rt-2',
        name: 'Study Session Warm-up',
        type: 'daily',
        category: 'Study',
        streak: 3,
        steps: [
          { id: 's3', label: 'DND', done: true },
          { id: 's4', label: 'Notes', done: false },
        ],
      },
    ];

    const stats: ProgressStats = calculateProgress(
      mockTasks,
      mockSessions,
      mockRoutines,
      'week'
    );

    expect(stats.tasksCompleted).toBe(2);
    expect(stats.totalTasks).toBe(3);
    expect(stats.taskCompletionRate).toBe(67);
    expect(stats.focusMinutes).toBe(75);
    expect(stats.focusTimeFormatted).toBe('1h 15m');
    expect(stats.currentStreak).toBe(4);
    expect(stats.routinesCompleted).toBe(1);
    expect(stats.totalRoutines).toBe(2);
    expect(stats.productivityScore).toBeGreaterThan(0);
    expect(stats.productivityScore).toBeLessThanOrEqual(100);

    // Verify categories
    expect(stats.categories).toHaveLength(3);
    const studyCategory = stats.categories.find((c) => c.name === 'Study');
    expect(studyCategory).toBeDefined();
    expect(studyCategory?.total).toBeGreaterThan(0);

    // Verify recent activities
    expect(stats.recentActivities.length).toBeGreaterThan(0);
  });
});
