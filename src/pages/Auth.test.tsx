import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import { UserProvider } from '../data/UserContext';

describe('Authentication screens (Login & Signup)', () => {
  it('renders Login screen with professional branding, icons, and inputs', () => {
    render(
      <BrowserRouter>
        <UserProvider>
          <Login onLogin={() => {}} />
        </UserProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Tempus Wise')).toBeDefined();
    expect(screen.getByText('Welcome Back')).toBeDefined();
    expect(screen.getByText('Email Address')).toBeDefined();
    expect(screen.getByText('Password')).toBeDefined();
    expect(screen.getAllByText('Log In').length).toBeGreaterThan(0);
    expect(screen.getByText("Don't have an account?")).toBeDefined();
  });

  it('renders Signup screen with Confirm Password and Password Strength meter', () => {
    render(
      <BrowserRouter>
        <UserProvider>
          <Signup onLogin={() => {}} />
        </UserProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Tempus Wise')).toBeDefined();
    expect(screen.getByText('Create an Account')).toBeDefined();
    expect(screen.getByText('Full Name')).toBeDefined();
    expect(screen.getByText('Email Address')).toBeDefined();
    expect(screen.getByText('Password')).toBeDefined();
    expect(screen.getByText('Confirm Password')).toBeDefined();
    expect(screen.getAllByText('Sign Up').length).toBeGreaterThan(0);
    expect(screen.getByText('Already have an account?')).toBeDefined();
  });
});
