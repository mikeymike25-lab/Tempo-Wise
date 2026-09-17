import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FocusTimer from './FocusTimer';
import { UserProvider } from '../data/UserContext';
import { TaskProvider } from '../data/TaskContext';
import { FocusProvider } from '../data/FocusContext';

describe('FocusTimer component', () => {
  const renderFocusTimer = () =>
    render(
      <BrowserRouter>
        <UserProvider>
          <TaskProvider>
            <FocusProvider>
              <FocusTimer />
            </FocusProvider>
          </TaskProvider>
        </UserProvider>
      </BrowserRouter>
    );

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders timer display and mode buttons', () => {
    renderFocusTimer();

    expect(screen.getByText('Pomodoro Timer')).toBeDefined();
    expect(screen.getByText('Focus Time')).toBeDefined();
    expect(screen.getByText('Pomodoro')).toBeDefined();
    expect(screen.getByText('Short Break')).toBeDefined();
    expect(screen.getByText('Long Break')).toBeDefined();
  });

  it('displays a warning modal when switching mode tab during an in-progress timer', () => {
    renderFocusTimer();

    // Start the timer
    const playBtn = screen.getByLabelText('Start Timer');
    fireEvent.click(playBtn);

    // Switch to Short Break while running
    const shortBreakPill = screen.getByText('Short Break');
    fireEvent.click(shortBreakPill);

    // Assert that the warning modal subHeader text appears
    const alert = document.querySelector('ion-alert');
    expect(alert).not.toBeNull();
    expect(alert?.getAttribute('sub-header')).toBe('Changing the timer will restart the current timer.');
  });
});
