import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from './Profile';
import { UserProvider } from '../data/UserContext';
import { TaskProvider } from '../data/TaskContext';
import { FocusProvider } from '../data/FocusContext';

describe('Profile component', () => {
  it('renders Profile and Settings with user details and options', () => {
    render(
      <BrowserRouter>
        <UserProvider>
          <TaskProvider>
            <FocusProvider>
              <Profile />
            </FocusProvider>
          </TaskProvider>
        </UserProvider>
      </BrowserRouter>
    );

    // Header & User Identity
    expect(screen.getByText('Profile & Settings')).toBeDefined();
    expect(screen.getByText('Raven Rose')).toBeDefined();
    expect(screen.getByText('raven.rose@student.edu')).toBeDefined();

    // Section Items
    expect(screen.getByText('My Goals')).toBeDefined();
    expect(screen.getByText('Notifications')).toBeDefined();
    expect(screen.getByText('Appearance')).toBeDefined();
    expect(screen.getByText('Settings')).toBeDefined();
    expect(screen.getByText('Help & Support')).toBeDefined();
    expect(screen.getByText('Log Out')).toBeDefined();
  });
});
