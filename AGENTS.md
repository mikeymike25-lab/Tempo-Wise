# AGENTS.md — Instructions for the Coding Agent

Read this together with PROJECT.md, ARCHITECTURE.md, DESIGN_SYSTEM.md, and PLAN.md
before making changes.

## Project Context
Tempus Wise is a time-management prototype (Smart Schedule, Focus Timer, Routine
Maker, Reminders, Progress Tracking) for students/workers, built with **Ionic React**.
Full context: PROJECT.md. Screen-by-screen spec: PLAN.md + the approved mockup.

## How to Work in This Repo
1. Check PLAN.md first. Work through phases **in order** unless explicitly told to jump ahead.
2. Before building a page, re-read its PLAN.md section and the matching mockup screen.
3. After finishing a sub-phase, check it off in PLAN.md and summarize what changed.
4. Keep changes scoped to the current phase — don't refactor unrelated pages or add
   new dependencies without flagging it first.

## Do
- Use Ionic React components (`IonButton`, `IonCard`, `IonList`, `IonTabs`, etc.) instead
  of hand-rolled HTML/CSS equivalents.
- Set colors/spacing through `src/theme/variables.css` (Ionic CSS variables) per
  DESIGN_SYSTEM.md — never hardcode a hex color that duplicates a variable.
- Follow the folder layout in ARCHITECTURE.md — one `IonPage` per screen under
  `src/pages/`, shared non-stock components in `src/components/`.
- Use `IonTabs`/`IonTabBar` for the 5-tab bottom nav (Home | Schedule | Focus | Routines | Progress).
- Use `ionicons` when needed to make the content easy to understand (see DESIGN_SYSTEM.md mapping). Do NOT use emojis.
- Use the data models in ARCHITECTURE.md (Task, Routine, Reminder, ScheduleEntry, FocusSession).
- Write small, clearly named components/functions; comment non-obvious logic (streaks, productivity %).
- Manually verify each page before marking a PLAN.md phase complete.

## Don't
- Don't bring in a second UI/component library (Material UI, Bootstrap, Tailwind
  components) alongside Ionic — Ionic is the one system.
- Don't change colors/typography/component mappings without updating DESIGN_SYSTEM.md first.
- Don't add backend/API calls unless asked — this is a localStorage/Preferences-backed
  prototype for now.
- Don't add Capacitor/native tooling unless the phase explicitly calls for it.
- Don't rename/restructure files without updating ARCHITECTURE.md to match.
- Don't build Progress Tracking or Profile logic before Task/Routine/Reminder data exists to track.

## Verification Checklist (per page)
- [ ] Matches the approved mockup layout and copy
- [ ] Uses Ionic components + theme variables, not hardcoded styles
- [ ] Reads/writes the correct model in `src/data/`
- [ ] `IonTabBar` present, correct tab highlighted
- [ ] Data persists after a page refresh
- [ ] PLAN.md checkbox updated

## Open Decisions (flag to the user, don't assume silently)
- TypeScript vs JavaScript
- Whether/when to add Capacitor for native Android/iOS builds
- Exact font family (`--ion-font-family`)
- When/if a real backend replaces localStorage/Preferences