# Architecture: Tempus Wise

## Tech Stack
- **Framework**: Ionic React (`@ionic/react`, `@ionic/react-router`)
- **Language**: TypeScript recommended (Ionic's default scaffold) — plain JSX works too, pick one and stay consistent
- **Build tool**: Vite (Ionic CLI's default for React)
- **Routing/Tabs**: `react-router-dom` via `IonReactRouter`, with `IonTabs` for the bottom nav
- **Icons**: `ionicons` package (replaces the emoji icons from the mockup — see DESIGN_SYSTEM.md)
- **Native builds (optional)**: Capacitor, only if/when this needs to be an installable Android/iOS app rather than a browser demo
- **Persistence (prototype phase)**: `localStorage` via a `useLocalStorage` hook, or `@capacitor/preferences` if Capacitor is added — one storage module either way, screens never touch raw storage APIs directly

> Decision: confirm TypeScript vs JavaScript and whether Capacitor is needed before Phase 1.
> Default recommendation: TypeScript, skip Capacitor until the web prototype is approved.

## Folder Structure

tempus-wise/
├── ionic.config.json
├── capacitor.config.ts # only if Capacitor is added
├── vite.config.ts
├── index.html
├── package.json / package-lock.json
├── README.md / PROJECT.md / ARCHITECTURE.md / DESIGN_SYSTEM.md / PLAN.md / AGENTS.md
└── src/
├── main.tsx
├── App.tsx # IonApp, IonReactRouter, route + tab setup
├── theme/
│ └── variables.css # Ionic CSS variable overrides (see DESIGN_SYSTEM.md)
├── components/ # shared pieces beyond stock Ionic components
│ ├── TaskRow.tsx
│ ├── PriorityBadge.tsx
│ ├── RoutineChecklist.tsx
│ └── ProgressRing.tsx
├── pages/ # one IonPage per screen (Ionic convention: "pages")
│ ├── Splash.tsx / Login.tsx / Signup.tsx
│ ├── MainTabs.tsx # IonTabs shell wrapping the 5 tab pages
│ ├── Home.tsx / Schedule.tsx / AddTask.tsx
│ ├── FocusTimer.tsx / Routines.tsx / Reminders.tsx
│ └── Progress.tsx / Profile.tsx
├── data/ # models + storage layer (framework-agnostic)
│ ├── task.ts / routine.ts / reminder.ts / schedule.ts
│ └── progress.ts / user.ts / storage.ts
├── hooks/
│ ├── useLocalStorage.ts
│ └── useTimer.ts
└── utils/
└── date.ts


## Navigation Model
- `IonTabs` + `IonTabBar` gives the 5-tab bottom nav natively: **Home | Schedule | Focus | Routines | Progress** — no custom nav bar needed.
- **Profile** opens via a header `IonButton`/avatar icon (inside Home's `IonToolbar`), pushed as a normal route, not a 6th tab. This resolves the mockup inconsistency where Profile replaced the Progress tab on its own screen.
- **Reminders** opens via a header `IonButton`/bell icon (inside Home's `IonToolbar`), pushed as a normal route. It is one of the core features but accessed via the header to keep the bottom nav at 5 tabs.
- Auth flow (Splash → Login/Sign Up) uses routes outside `MainTabs`, guarded by an `isLoggedIn` check in `App.tsx`.

## Data Model (unchanged by the framework choice)
**User** — id, fullName, email, passwordHash, goals, notificationPrefs, theme
**Task** — id, title, date, startTime, endTime, priority, reminderOffset, notes, completed, category
**ScheduleEntry** — id, activity, date, startTime, endTime, linkedTaskId?
**Routine** — id, name, type (daily/weekly/custom), steps: [{ id, label, done }]
**Reminder** — id, label, date, time, repeat, notifyBefore, linkedTaskId?/linkedRoutineId?
**FocusSession** — id, taskId?, mode (25/5, 25/10, 50/10, 90/20, custom), durationMinutes, completedAt
**ProgressStats** (derived) — tasksCompleted, focusTimeTotal, streakDays, categoryBreakdown, weeklyProductivity%

## State Management
React Context + hooks per feature (`TaskContext`, `RoutineContext`, etc.), backed by the storage layer in `src/data/`. No external state library needed at prototype scale.

## Build/Run

npm install
ionic serve # or: npm run dev
ionic build # production build
ionic capacitor add android / ios # only if/when native builds are needed