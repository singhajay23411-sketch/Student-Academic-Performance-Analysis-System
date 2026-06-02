# SAPAS Architecture Overview

## High-Level Architecture

SAPAS currently follows a frontend-first architecture with a planned backend API layer.

```text
User Browser
  -> React/Vite Frontend
  -> Zustand Store
  -> localStorage Persistence

Planned:
User Browser
  -> React/Vite Frontend
  -> FastAPI Backend
  -> PostgreSQL Database
```

## Current Runtime Flow

1. User opens the Vite React app.
2. Zustand persist middleware hydrates saved localStorage data.
3. Public and protected routes wait for hydration.
4. Login sets `isAuthenticated` and active user email.
5. Dashboard and app pages read data from the Zustand store.
6. Store actions update active state and the email-specific `usersData` namespace.
7. Zustand persists the state back to localStorage.

## Main Frontend Modules

### Routing

`src/App.jsx` defines:

- Public routes: landing and login
- Protected routes: dashboard, analytics, planner, progress, settings
- Hydration loader
- Route protection

### Layout

`src/layouts/MainLayout.jsx` renders shared app layout with sidebar, header, and nested route outlet.

### Store

`src/store/useStore.js` manages:

- Authentication demo state
- User profile
- Subjects
- Reminders
- Tasks
- Exams
- Planner schedule
- Focus stats
- Milestones
- Study log
- Theme state

### Metrics Engine

`src/store/computeMetrics.js` derives:

- Subject progress
- Status labels
- Predicted CGPA
- Exam countdowns
- Dashboard insights
- Page-specific insight text

## Planned Backend Modules

FastAPI backend modules are organized by responsibility:

- `auth`: password hashing and JWT creation
- `config`: application settings
- `database`: engine, sessions, dependencies
- `models`: SQLAlchemy database models
- `routes`: API routers
- `schemas`: Pydantic request/response models
- `services`: business logic
- `analytics`: dashboard calculations
- `ai_engine`: rule-based insights

## Deployment Architecture

Recommended current deployment:

```text
Vercel -> Vite frontend -> localStorage demo persistence
```

Recommended future deployment:

```text
Vercel frontend -> Render/Railway/Fly.io backend -> PostgreSQL database
```

## Stability Notes

- Route hydration should happen before rendering protected pages.
- All user data is currently browser-local.
- Backend requires environment configuration before production use.
- Frontend and backend are not yet connected.
