# SAPAS Technical Documentation

## Purpose

SAPAS is a student academic performance analytics system. It combines academic tracking, planning, progress monitoring, and recommendation-style insights into one browser-based dashboard.

## Frontend Architecture

The frontend is built with React and Vite. Routing is handled with React Router DOM. App state is managed with Zustand and persisted through localStorage.

Key frontend areas:

- `src/App.jsx`: route definitions, public/protected route handling, hydration gate
- `src/store/useStore.js`: central Zustand store, CRUD actions, authentication demo state, persistence
- `src/store/computeMetrics.js`: derived academic metrics and recommendation text
- `src/pages`: main application pages
- `src/components`: layout and reusable modal components
- `src/data/mockData.js`: initial demo data

## State Management

The app uses one central Zustand store. Important persisted fields include:

- `isAuthenticated`
- `currentUserEmail`
- `usersData`
- `profile`
- `metrics`
- `subjects`
- `reminders`
- `tasks`
- `exams`
- `weeklySchedule`
- `focusStats`
- `restDays`
- `milestones`
- `studyLog`

User data is namespaced by email in `usersData`. On login, the app loads the matching email record or creates a default user record.

## Persistence Model

Current persistence is frontend-only through localStorage using the key:

```text
sapas_central_storage
```

This is suitable for a demo and college presentation, but not for production multi-device use. Production persistence should move to the backend database.

## Authentication Model

The current frontend authentication is a demo flow. Login sets `isAuthenticated` in Zustand. Signup validates password format for the UI flow but does not store credentials. The backend contains a planned JWT authentication implementation.

## Build System

Vite is used for local development and production builds.

Commands:

```bash
npm run dev
npm run build
npm run preview
```

## Known Technical Notes

- Production build succeeds.
- Bundle size is high because all pages and large libraries load in the initial bundle.
- ESLint script exists but requires ESLint dependencies/configuration.
- Backend requires environment variables and Python dependencies before startup.

## Recommended Improvements

- Add route-level lazy loading for pages.
- Add ESLint configuration and dependency.
- Add frontend tests for store actions and route protection.
- Connect frontend to backend APIs.
- Move localStorage persistence to PostgreSQL-backed backend persistence.
