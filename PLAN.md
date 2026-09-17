# PLAN.md — Build Plan

Follows the recommended demo flow: Splash → Login/Sign Up → Home → Schedule →
Add Task → Focus Timer → Routine Maker → Reminders → Progress Tracking → Profile.
Built with Ionic React. Work in order (see AGENTS.md).

## Phase 1 — Foundation
- [x] 1.1 Scaffold project (`ionic start tempus-wise tabs --type=react`), confirm TypeScript vs JS
- [x] 1.2 Set Ionic theme variables (`src/theme/variables.css`) from DESIGN_SYSTEM.md
- [x] 1.3 Set up `MainTabs.tsx` (`IonTabs`/`IonTabBar`) for Home | Schedule | Focus | Routines | Progress
- [x] 1.4 Build shared components: `TaskRow`, `PriorityBadge`, `RoutineChecklist`, `ProgressRing`
- [x] 1.5 Set up storage layer (`src/data/storage.ts`)

## Phase 2 — Onboarding
- [x] 2.1 `Splash.tsx` (logo, tagline, auto-advance)
- [x] 2.2 `Login.tsx`
- [x] 2.3 `Signup.tsx`
- [x] 2.4 Basic local auth state (`isLoggedIn` guard in `App.tsx`)

## Phase 3 — App Shell & Dashboard
- [x] 3.1 `App.tsx` routing: auth routes vs `MainTabs` (plus non-tab routes like Profile and Reminders)
- [x] 3.2 `Home.tsx` (greeting, header buttons for Profile and Reminders, Today's Focus card, Quick Actions, Today's Progress)

## Phase 4 — Smart Schedule Maker
- [x] 4.1 `Schedule.tsx` (date selector + daily `IonList`)
- [x] 4.2 `AddTask.tsx` (`IonModal` with title, date/time via `IonDatetime`, priority, reminder, notes)
- [x] 4.3 Wire Add Task → Task model → reflected on Schedule and Home

## Phase 5 — Focus Timer
- [x] 5.1 `FocusTimer.tsx` UI (countdown ring, session label, start/pause)
- [x] 5.2 Modes: 25/5, 25/10, 50/10, 90/20, custom (`IonSegment`)
- [x] 5.3 Session-complete state (`IonToast`, Start Break / Skip)
- [x] 5.4 Log completed sessions to FocusSession data

## Phase 6 — Routine Maker
- [x] 6.1 `Routines.tsx` (`IonSegment`: Daily/Weekly/Custom, checklists via `IonItem`/`IonCheckbox`)
- [x] 6.2 Create Routine flow (`IonModal`)
- [x] 6.3 Step check/uncheck persists; daily routines reset appropriately

## Phase 7 — Reminders
- [x] 7.1 `Reminders.tsx` (`IonSegment`: All/Upcoming/Completed)
- [x] 7.2 Add Reminder `IonModal` (name, date, time, repeat, notification)
- [x] 7.3 Link reminders to tasks/routines where relevant

## Phase 8 — Progress Tracking
- [x] 8.1 `Progress.tsx` UI (`IonSegment`: Week/Month/Year, `ProgressRing`)
- [x] 8.2 Stats: tasks completed, focus time, streak
- [x] 8.3 Category breakdown (Study/Work/Personal) via `IonProgressBar`
- [x] 8.4 Recent activity list
- [x] 8.5 Aggregation logic from Task/FocusSession/Routine data

## Phase 9 — Profile & Settings
- [x] 9.1 `Profile.tsx` (avatar, name, email)
- [x] 9.2 My Goals, Notifications, Appearance, Settings, Help & Support (`IonList`)
- [x] 9.3 Log Out flow

## Phase 10 — Integration & Polish
- [x] 10.1 Confirm data flows connect (completing a task updates Home + Progress)
- [x] 10.2 Full click-through test of the demo flow (Splash → ... → Profile)
- [x] 10.3 Visual QA against DESIGN_SYSTEM.md on every page
- [x] 10.4 Resolve open decisions from AGENTS.md (TypeScript confirmed, Ionic React, Dark Palette added without modifying green sage)
- [x] 10.5 Pre-fill sample data for the presentation/demo

## Phase 11 — Firebase Cloud Integration
- [x] 11.1 Install Firebase SDK (`npm install firebase`) & configure environment (`src/services/firebase.ts`, `.env.example`)
- [x] 11.2 Implement Firebase Authentication service (`src/services/authService.ts`) & wire `Login.tsx` / `Signup.tsx` / `UserContext.tsx`
- [x] 11.3 Implement Firestore service layer (`src/services/firestoreService.ts`) with subcollections: `tasks`, `routines`, `focusSessions`, `reminders`
- [x] 11.4 Wire Contexts with real-time Firestore listeners (`onSnapshot`) + offline cache persistence (`TaskContext`, `RoutineContext`, `FocusContext`, `ReminderContext`)
- [x] 11.5 Hybrid Fallback & Data Migration (allow offline/demo mode without credentials, auto-seed or migrate local data on sign up)
- [x] 11.6 Add Firebase Security Rules (`firestore.rules`) & update tests/build verification

## Phase 12 — Production Deployment & Git
- [x] 12.1 Protect sensitive `.env` credentials in `.gitignore`
- [x] 12.2 Configure Vercel client-side routing rewrites (`vercel.json`)
- [x] 12.3 Clean production build validation (`npm run build`)
- [x] 12.4 Add GitHub remote and push repository (`https://github.com/mikeymike25-lab/Tempo-Wise.git`)
- [x] 12.5 Prepare Vercel configuration (`vercel.json`) and deployment steps