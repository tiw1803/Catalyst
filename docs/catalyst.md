# Catalyst

## Project Identity
- **Name:** Catalyst
- **Tagline:** The Catalyst for your Growth
- **Type:** Student AI productivity, learning, planning, and growth platform
- **Current stage:** Frontend-first product prototype
- **Current stack:** HTML, CSS, Vanilla JavaScript
- **Planned backend:** FastAPI + PostgreSQL
- **Design:** Premium, modern, dark-first productivity SaaS with light-theme support

## 1. Product Vision
Catalyst is a personal growth system for students. It should help a student decide what to learn, turn goals into roadmaps, plan daily work, focus, measure progress, and continuously improve.

Core loop:

```text
Plan → Focus → Learn → Track → Improve
```

Catalyst should feel motivating and polished, not childish or excessively gamified.

## 2. Product Goals
### Primary
1. Organize academic and personal growth.
2. Make learning progress measurable.
3. Turn large goals into manageable roadmaps.
4. Connect planning directly to execution.
5. Provide meaningful analytics.
6. Eventually provide AI-powered mentorship and personalization.
7. Build a daily growth loop.

### Secondary
- Make studying structured.
- Make progress visually satisfying.
- Encourage consistency through XP and streaks.
- Give users a clear sense of level and progress.
- Make the product feel like a real startup-quality platform.

## 3. Current Architecture
```text
Catalyst
├── HTML
│   ├── Landing page
│   ├── Authentication
│   ├── Dashboard
│   ├── Terms
│   └── Privacy Policy
├── CSS
│   ├── variables.css
│   ├── reset.css
│   ├── base.css
│   ├── layout.css
│   ├── utilities.css
│   ├── animations.css
│   ├── components.css
│   └── page-specific CSS
└── JavaScript
    ├── app.js
    ├── theme.js
    ├── auth.js
    └── data.js
```

The exact file structure can evolve, but separation of concerns should remain.

## 4. Technology
### Current
- HTML for structure
- CSS for design, layout, themes, responsiveness, and animation
- Vanilla JavaScript for interactions and application state

### Planned
```text
Frontend
HTML + CSS + Vanilla JS
        ↓
REST API
        ↓
FastAPI
        ↓
PostgreSQL
```

## 5. Landing Page
The landing page introduces Catalyst and converts visitors into users.

### Navbar
Contains Catalyst branding, navigation, authentication CTA, and theme toggle.

### Hero
Visual hierarchy:
1. Eyebrow
2. Main headline
3. Supporting description
4. Primary CTA
5. Optional secondary CTA
6. Product/dashboard visual

### Trusted By
Credibility section after the hero.

### Why Catalyst?
Three core differentiators:
- **AI Roadmaps:** turn goals into structured learning plans.
- **Smart Analytics:** measure useful productivity and learning signals.
- **Personalized Learning:** adapt recommendations to the student.

### Everything You Need
Major capabilities:
- Study Planner
- Daily Goals
- Progress Tracking
- Mock Tests
- Focus Timer
- AI Mentor

### How It Works
Timeline-based flow:
```text
Set your goal
     ↓
Build your roadmap
     ↓
Plan your work
     ↓
Focus and execute
     ↓
Track your progress
     ↓
Improve
```

### Student Voices
Current design:
- Six unique testimonial cards
- Horizontal draggable row
- Direct left-click dragging on desktop
- Native touch/swipe on mobile
- No scroll-snap
- No forced smooth-scroll animation
- CSS hover transitions

### Final CTA
Reinforces the main growth message and directs users toward starting Catalyst.

### Footer
Contains product/resource/connect/legal links and a gradient top line. Legal pages include Terms and Privacy Policy.

## 6. Authentication
Authentication is a single-page sign-in/sign-up experience.

### Sign In
Includes email, password, submit action, and sign-up switch.

### Sign Up
Includes user information, email, password, password-strength feedback, registration action, and sign-in switch.

### UX
- Dynamic template swapping using JavaScript
- No full page reload
- Transition animation between states
- Password strength checker

### Production
Authentication must eventually move to FastAPI. Raw passwords must never be stored in frontend state.

## 7. Theme System
Catalyst supports dark and light themes using CSS variables.

Flow:
```text
Theme toggle
   ↓
theme.js
   ↓
data-theme
   ↓
CSS variables
   ↓
UI updates
```

Theme selection should persist through `localStorage`. The SVG icon changes with the selected theme. Legal pages should use the same theme system.

## 8. CSS Architecture
### variables.css
Design tokens: colors, typography, spacing, radii, shadows, transitions, and theme values.

### reset.css
Browser normalization.

### base.css
Global typography and element defaults.

### layout.css
Containers, grids, flex layouts, and reusable page structure.

### utilities.css
Reusable helper classes.

### animations.css
Reusable motion and animation rules.

### components.css
Shared component styles.

### Page-specific CSS
Unique page styles such as `css/pages/legal.css`.

**Project preference:** HTML and CSS code should not contain comments.

## 9. JavaScript Architecture
### app.js
General application and landing-page interactions, including testimonial dragging where applicable.

### theme.js
Theme initialization, switching, persistence, and SVG icon updates.

### auth.js
Sign-in/sign-up templates, state switching, transitions, password strength, and form behavior.

### data.js
Central source for dashboard data instead of hardcoding values across dashboard HTML.

Example concept:
```js
const stats = {
    dailyProgress: 50,
    focusTime: 120,
    xp: 1250,
    streak: 7,
    level: 5
};
```

These values are representative and should eventually come from real user activity/backend data.

## 10. Dashboard
The dashboard is the main authenticated product interface.

Core areas:
- Sidebar navigation
- Header/welcome area
- Progress overview
- Daily Progress
- XP
- Level
- Streak
- Focus Time
- Daily Goals
- Tasks
- Roadmap
- Analytics
- Focus Timer

## 11. Dashboard Sidebar
Known elements:
```text
#dashboard-sidebar
#dashboard-menu-toggle
```

Desktop should support collapse. Mobile should behave as a navigation drawer.

A previously reported issue was that the sidebar toggle did not respond. When fixing it, inspect the current HTML/CSS/JS first, check for duplicate listeners, verify the class being added, and verify CSS actually reacts to that class. Do not blindly rewrite working dashboard code.

## 12. Progress System
Progress is one of Catalyst's most important systems.

There must be one source of truth for progress. The same value should drive:
- Percentage text
- Progress bars
- Progress rings
- Dashboard cards
- Analytics
- Daily progress

Architecture:
```text
data.js
   ↓
update function
   ├── percentage text
   ├── progress bar
   └── SVG progress ring
```

Never hardcode the same percentage independently in multiple UI elements.

## 13. Daily Progress
Daily Progress represents completion of planned work for the day.

Conceptual calculation:
```text
completed tasks / total planned tasks × 100
```

Clamp to 0–100%.

## 14. Progress Ring
A known recent issue: changing `stats.dailyProgress` changed the percentage text but the SVG ring could become completely filled.

Correct approach:
```text
circumference = 2 × π × radius
dashoffset = circumference × (1 - progress / 100)
```

The actual SVG radius must be read from the existing dashboard SVG rather than guessed.

Test at:
- 0%
- 25%
- 50%
- 75%
- 100%

Also check CSS overrides on SVG stroke properties.

## 15. Progress Bars
Expected behavior:
```text
0%   → empty
25%  → quarter
50%  → half
75%  → three quarters
100% → full
```

Text, bars, and rings must all update from the same data value.

## 16. XP System
XP is the primary gamification metric.

Potential XP sources:
- Completing tasks
- Completing goals
- Focus sessions
- Roadmap milestones
- Mock tests
- Consistency

XP values should be centralized rather than duplicated across files.

## 17. Level System
Concept:
```text
XP
 ↓
Level calculation
 ↓
Current level
 ↓
XP needed for next level
 ↓
Level progress
```

Dashboard should show current level, current XP, next-level requirement, and level progress.

The exact level curve should be defined once.

## 18. Streak System
A streak measures consecutive days of meaningful activity, not merely opening the app.

Valid activity could include completing a task, meaningful focus session, or daily goal. Production streak calculations belong on the backend.

## 19. Focus Time
Focus Time measures time spent in focused study/work sessions.

Future records should include:
- Start time
- End time
- Duration
- Date
- Associated goal/task
- Completion state

It may contribute to progress, XP, analytics, and streaks according to final rules.

## 20. Focus Timer
Future functionality:
- Start
- Pause
- Resume
- Reset
- Completion
- Duration tracking

It should integrate with Catalyst's data rather than remain an isolated stopwatch.

## 21. Daily Goals
Daily Goals are the short-term execution layer.

They should show:
- Today's planned work
- Completed work
- Remaining work
- Progress toward today's target

They should connect to progress, XP, streaks, and analytics.

## 22. Study Planner
The Study Planner organizes activities around subjects, topics, goals, deadlines, available time, and priority.

AI can eventually help create realistic schedules.

## 23. AI Roadmaps
A core differentiator.

Example:
```text
Goal
├── Phase 1
│   ├── Topic
│   ├── Topic
│   └── Topic
├── Phase 2
│   ├── Topic
│   └── Topic
└── Phase 3
    ├── Project
    └── Assessment
```

Roadmaps should contain milestones, topics, tasks, completion state, estimated effort, and progress.

## 24. Personalized Learning
Potential personalization inputs:
- Current level
- Previous performance
- Available study time
- Completed topics
- Weak areas
- Strong areas
- Deadlines
- Study consistency
- Focus history

The system should adapt recommendations based on these inputs.

## 25. Mock Tests
Potential functionality:
- Subject/topic selection
- Difficulty
- Timer
- Questions
- Score
- Accuracy
- Time per question
- Weak-topic analysis

Results should feed analytics and personalization.

## 26. Analytics
Analytics should answer actionable questions:
- How much did I study?
- Am I improving?
- Which subjects are weak?
- When am I most productive?
- How consistent am I?
- How much focus time did I complete?
- How many goals did I finish?
- What is my current progress?

## 27. AI Mentor
Long-term responsibilities:
- Explain concepts
- Create plans
- Adjust schedules
- Suggest what to study next
- Analyze progress
- Identify weak areas
- Encourage consistency
- Answer learning questions

It should eventually use user context rather than behave like a generic chatbot.

## 28. Community
Longer-term possibilities:
- Student profiles
- Shared progress
- Discussions
- Study groups
- Challenges
- Leaderboards
- Peer motivation

Privacy must remain a priority.

## 29. Profiles
Potential profile data:
- Name
- Avatar
- Learning goals
- Subjects
- Interests
- Level
- XP
- Streak
- Progress

## 30. Legal Pages
Current pages:
```text
terms.html
privacy-policy.html
```

Shared legal styling can live in:
```text
css/pages/legal.css
```

## 31. Design System
Catalyst should feel:
- Premium
- Modern
- Focused
- Technical
- Motivating
- Clean
- Student-friendly

Avoid excessive gradients, childish gamification, random animation, UI noise, inconsistent spacing, and unnecessary hardcoded theme colors.

## 32. Motion
Use animation for:
- Theme toggle
- Auth transitions
- Hover states
- CTA interactions
- Dashboard micro-interactions
- Progress changes
- Appropriate page transitions

Motion should never slow the user down.

## 33. Responsive Design
Support:
- Desktop
- Laptop
- Tablet
- Mobile

Important responsive areas:
- Navbar
- Hero
- Timeline
- Testimonials
- Footer
- Auth card
- Dashboard sidebar
- Dashboard cards
- Progress visuals
- Lists/tables
- Focus timer

Mobile should be intentionally designed rather than treated as a shrunken desktop.

## 34. Accessibility
Future implementation should include:
- Semantic HTML
- Keyboard navigation
- Visible focus states
- Proper button labels
- Form labels
- Sufficient contrast
- Reduced-motion support
- Accessible theme toggle
- Accessible sidebar toggle
- Appropriate ARIA attributes

## 35. Future Data Model
Conceptual PostgreSQL tables:
```text
users
profiles
goals
daily_goals
tasks
subjects
topics
roadmaps
roadmap_milestones
study_sessions
focus_sessions
mock_tests
mock_test_results
xp_events
streaks
analytics
ai_conversations
community_posts
```

The model should be user-centric and relational.

## 36. Single Source of Truth Rule
Important values must not be duplicated.

Bad:
```text
50% text
50% bar
50% ring
```

Good:
```text
stats.dailyProgress
        ↓
UI update function
        ├── text
        ├── bar
        └── ring
```

## 37. Known Issues From Latest Development
### Daily Progress ring
- Data value changes correctly.
- Percentage text changes correctly.
- Ring can become fully filled incorrectly.
- Inspect SVG radius/circumference and stroke calculations.

### Dashboard sidebar
- Toggle was reported as not responding.
- Inspect actual current implementation before changing it.

### General rule
Do not replace working code simply because one visual/data synchronization issue exists.

## 38. Development Rules
### HTML
- Semantic structure
- Reusable classes
- IDs only where useful for unique JS targeting
- Keep dynamic elements easy to target

### CSS
- Use variables
- Preserve theme support
- Organize responsive rules
- Avoid duplicate component styles
- No comments in HTML/CSS

### JavaScript
- Keep data separate from UI logic
- Avoid duplicate listeners
- Avoid hardcoded dynamic values
- Use reusable update functions
- Keep scripts focused

### General
- Inspect current code before modifying it.
- Preserve working functionality.
- Make targeted changes.
- Keep the design system consistent.
- Test visual and logical synchronization together.

## 39. Product Flow
```text
Landing Page
      ↓
Start Your Journey
      ↓
Authentication
      ↓
Dashboard
      ↓
Set Goal
      ↓
Create / Receive Roadmap
      ↓
Create Daily Plan
      ↓
Complete Tasks
      ↓
Focus Sessions
      ↓
Earn XP
      ↓
Increase Level
      ↓
Maintain Streak
      ↓
Review Analytics
      ↓
Improve Plan
      ↓
Repeat
```

## 40. Architecture by Layer
```text
PRESENTATION
├── Landing
├── Auth
├── Dashboard
├── Legal pages
└── Responsive UI

INTERACTION
├── Theme
├── Forms
├── Dragging
├── Sidebar
├── Timer
└── Dashboard controls

STATE
├── User
├── Goals
├── Tasks
├── Progress
├── XP
├── Level
├── Streak
└── Focus time

INTELLIGENCE
├── AI Roadmaps
├── AI Mentor
├── Personalization
└── Recommendations

BACKEND
├── FastAPI
├── PostgreSQL
└── Authentication/API

FUTURE
├── Community
├── Profiles
├── Mock Tests
└── Advanced Analytics
```

## 41. Recommended Build Order
### Phase 1 — Frontend Foundation
- Finalize landing page
- Finalize responsive behavior
- Finalize theme system
- Finalize authentication UI
- Finalize legal pages

### Phase 2 — Dashboard
- Fix sidebar
- Finalize dashboard layout
- Connect data.js
- Synchronize progress components
- Add XP/level
- Add streak
- Add focus time
- Add daily goals
- Add tasks

### Phase 3 — Functional Productivity
- Focus Timer
- Study Planner
- Goal management
- Roadmaps
- Progress calculations
- Prototype persistence

### Phase 4 — Backend
- FastAPI
- PostgreSQL
- User accounts
- Authentication
- Persistent data
- APIs

### Phase 5 — Intelligence
- AI Roadmap generation
- AI Mentor
- Personalization
- Intelligent analytics

### Phase 6 — Community
- Profiles
- Groups
- Posts
- Challenges
- Social features

## 42. Testing Strategy
Progress should be tested at:
```text
0%, 1%, 25%, 50%, 75%, 99%, 100%
```

Timer should test start, pause, resume, reset, and completion.

Streak should test zero, one, multiple consecutive days, and missed days.

XP should test zero, normal values, and level boundaries.

Theme should test dark, light, refresh persistence, and page navigation.

Responsive behavior should be tested on desktop, tablet, and mobile.

## 43. Definition of Done
A feature is finished only when:
- UI exists
- Desktop works
- Mobile works
- Theme works
- JavaScript works
- Data is connected
- Edge cases are handled
- No duplicate listeners exist
- No console errors exist
- Existing features remain functional

## 44. Long-Term Vision
Catalyst should feel like a personal operating system for student growth.

A mature experience should let a student say:
```text
Here is what I want to achieve.
```

Catalyst should respond:
```text
Here is the roadmap.
Here is what you should do today.
Here is how long it should take.
Here is your focus session.
Here is your progress.
Here is where you are weak.
Here is what you should do next.
```

The system continuously learns from execution.

Long-term loop:
```text
GOAL
 ↓
PLAN
 ↓
EXECUTE
 ↓
MEASURE
 ↓
ANALYZE
 ↓
ADAPT
 ↓
GROW
```

## 45. Current Status — 19 August 2026
### Established
- Catalyst branding and product concept
- Landing page structure
- Navbar
- Hero
- Trusted By
- Why Catalyst?
- Everything You Need
- How It Works timeline
- Student Voices
- Final CTA
- Footer
- Dark/light theme system
- Authentication page
- Sign-in/sign-up switching
- Legal pages
- Dashboard foundation
- Dashboard data concept
- Progress synchronization work

### Current focus
- Dashboard progress synchronization
- Daily Progress SVG ring
- Progress bars
- Dynamic dashboard data
- Dashboard sidebar behavior
- XP / streak / focus / level / daily progress integration

### Planned
- Functional productivity modules
- Persistent user data
- FastAPI backend
- PostgreSQL
- AI Roadmaps
- AI Mentor
- Analytics
- Mock Tests
- Community
- Profiles
- Personalization

## 46. Catalyst North Star
Catalyst should always answer three questions:

### What am I trying to achieve?
**Goals + Roadmaps**

### What should I do right now?
**Daily Goals + Planner + Focus Timer**

### Am I actually improving?
**Progress + XP + Streak + Analytics**

If a product decision strengthens these three answers, it is aligned with Catalyst.

## 47. One-Line Product Definition
**Catalyst is a student growth platform that turns goals into personalized plans, plans into focused action, and action into measurable progress.**
