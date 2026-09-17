# Design System: Tempus Wise

Clean, modern, student-friendly. Calming forest-green palette per the approved mockup.
Implemented via Ionic's theming system.

## Color Palette
| Token | Suggested Value | Usage |
|---|---|---|
| Primary (Dark Forest Green) | `#1B4332` | Headers, splash bg, primary buttons, bottom nav |
| Secondary (Light Green) | `#74C69D` | Progress rings/bars, highlights |
| Background | `#FFFFFF` | Main app background |
| Background (cream) | `#FAF7F0` | Auth screens / soft cards |
| Surface | `#F2F7F4` | Cards, input fields |
| Text primary | `#1B1B1B` | Body text |
| Text muted | `#6B7280` | Timestamps, helper text |
| Priority – Low | `#4ADE80` | Low priority badge |
| Priority – Medium | `#FACC15` | Medium priority badge |
| Priority – High | `#EF4444` | High priority badge |

> Starting values matched to the mockup's mood — replace with exact hex codes from the
> Tempus Wise logo once available.

## Ionic Theme Mapping
Set these in `src/theme/variables.css` so every stock Ionic component (buttons, badges, tab bar) automatically picks up the brand colors:

| Design Token | Ionic Variable | Value |
|---|---|---|
| Primary | `--ion-color-primary` | `#1B4332` |
| Secondary | `--ion-color-secondary` | `#74C69D` |
| Success (Low priority / completed) | `--ion-color-success` | `#4ADE80` |
| Warning (Medium priority) | `--ion-color-warning` | `#FACC15` |
| Danger (High priority) | `--ion-color-danger` | `#EF4444` |
| App background | `--ion-background-color` | `#FFFFFF` |
| Body text | `--ion-text-color` | `#1B1B1B` |
| Font family | `--ion-font-family` | set once the font choice is finalized |

> Use Ionic's color generator (ionicframework.com/docs/theming/color-generator) to auto-produce shade/tint/contrast variants instead of hand-picking them.

## Typography
- Font: clean rounded sans-serif (Inter / Poppins / Nunito — pick one, set via `--ion-font-family`)
- Display/logo: 28–32px bold · Screen title: 20–22px semibold · Body: 14–16px regular · Caption: 12–13px muted

## Spacing & Layout
- Base unit: 4px (use 4/8/12/16/24/32)
- Card radius: 16–20px (override Ionic's default via `--border-radius` on `ion-card`)
- Button: `shape="round"` on `IonButton` for the pill look in the mockup

## Component Mapping
| Design Element | Ionic Component |
|---|---|
| Card (Today's Focus, Routine group, Reminder item) | `IonCard` / `IonCardHeader` / `IonCardContent` |
| Primary Button | `IonButton` (`expand="block"`, `shape="round"`) |
| Priority Pill | `IonBadge` (`color="success"/"warning"/"danger"`) |
| Progress Bar | `IonProgressBar` |
| Progress Ring (circular %) | custom SVG component — Ionic has no built-in ring, build `ProgressRing.tsx` |
| Bottom Nav | `IonTabBar` + `IonTabButton` inside `IonTabs` |
| Task/Reminder list | `IonList` + `IonItem` |
| Checklist item (Routines) | `IonItem` + `IonCheckbox` |
| Date/time pickers (Add Task, Add Reminder) | `IonDatetime` inside `IonModal` |
| Sub-tabs (Daily/Weekly/Custom, Week/Month/Year) | `IonSegment` + `IonSegmentButton` |
| Add Task / Add Reminder forms | `IonModal` with `IonInput` / `IonItem` |
| Session-complete message | `IonToast` |

## Iconography (resolved)
Use `ionicons` instead of emoji:
- 📅 Schedule → `calendar-outline`
- 🍅 Focus Timer → `timer-outline`
- 🔄 Routines → `repeat-outline`
- 🔔 Reminders → `notifications-outline`
- 📊 Progress → `stats-chart-outline`
- 🔴🟡🟢 Priority → color-coded `IonBadge`, no icon needed

## Voice & Tone
Warm and encouraging — short greetings ("Good morning, Raven! 👋"), celebratory micro-copy on completion, never guilt-tripping about missed tasks.