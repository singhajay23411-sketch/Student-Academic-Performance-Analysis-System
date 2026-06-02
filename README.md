# SAPAS - Student Academic Performance Analytics System

SAPAS is a student-focused academic performance analytics dashboard built to help learners track subjects, attendance, study plans, exams, reminders, goals, and progress insights from one organized interface.

The project is designed as a college submission, GitHub portfolio project, and resume showcase. The current frontend uses local browser persistence for demo-ready functionality, while the backend provides a planned FastAPI foundation for future database-backed deployment.

## Project Overview

Students often manage academic performance across disconnected notes, reminders, spreadsheets, and manual calculations. SAPAS brings these workflows into a single web application with academic analytics, planning tools, performance indicators, and progress tracking.

The application currently includes a React frontend with Zustand state management and localStorage persistence. A FastAPI backend scaffold is included for future API, authentication, and database integration.

## Problem Statement

Students need a simple way to monitor academic performance, identify weak subjects, plan study sessions, track exam preparation, and maintain consistency. Manual tracking is time-consuming and often does not provide timely insights. SAPAS solves this by presenting academic data through a structured dashboard and actionable planning tools.

## Features

- Landing page for project introduction
- Login and signup demo flow
- Protected dashboard routes
- Subject management with scores, attendance, priority, and status
- Academic goal and CGPA target tracking
- Reminder management
- Performance analysis charts
- Study planner with tasks, exams, weekly schedule, smart schedule generation, and focus statistics
- Progress tracking with milestones, streaks, badges, study log, and exportable report
- Settings page for profile, theme, and export information
- Zustand localStorage persistence
- FastAPI backend scaffold for planned API and database support

## Screenshots

Add screenshots in this section after deployment or final UI capture.

Suggested screenshots:

- Landing Page
- Login Page
- Dashboard
- Performance Analysis
- Study Planner
- Progress Tracking
- Settings

Current static asset:

```text
public/assets/screen.png
```

## Technology Stack

Frontend:

- React 18
- Vite
- React Router DOM
- Zustand
- Tailwind CSS
- Framer Motion
- Recharts

Backend scaffold:

- FastAPI
- Uvicorn
- SQLAlchemy
- Alembic
- Pydantic
- PostgreSQL-ready configuration
- JWT authentication foundation

Tools:

- Git and GitHub
- VS Code
- Vercel-ready frontend deployment

## Installation Guide

### Prerequisites

- Node.js 18 or newer
- npm
- Python 3.11 or newer, only for backend work
- Git

### Frontend Setup

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

### Production Build

```bash
npm run build
npm run preview
```

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env` using `backend/.env.example` as a reference.

Run the backend:

```bash
uvicorn app.main:app --reload
```

Backend health check:

```text
http://localhost:8000/health
```

## Usage Guide

1. Start the frontend with `npm run dev`.
2. Open the app in the browser.
3. Use the demo email on the login page or create a demo account.
4. Add or edit subjects from the dashboard.
5. Set academic targets and reminders.
6. Use Performance Analysis to review progress and attendance.
7. Use Study Planner to manage tasks, exams, schedules, rest days, and focus sessions.
8. Use Progress Tracking to review streaks, milestones, badges, and reports.
9. Use Settings to update profile details and export local demo data.

## Project Structure

```text
SAPAS/
  backend/
    app/
      auth/
      config/
      database/
      models/
      routes/
      schemas/
      services/
    alembic/
    requirements.txt
  docs/
    api-documentation-planned.md
    architecture-overview.md
    database-documentation-planned.md
    technical-documentation.md
    user-flow-documentation.md
  public/
    assets/
  src/
    components/
    data/
    layouts/
    pages/
    store/
  package.json
  vite.config.js
  vercel.json
```

## Deployment

The frontend is ready for Vercel deployment.

Vercel settings:

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

The included `vercel.json` supports client-side routing by rewriting all routes to `index.html`.

## Future Scope

- Connect frontend authentication to the FastAPI backend
- Persist all user data in PostgreSQL
- Add role-based access for students, faculty, and administrators
- Add real AI-powered recommendations
- Add notification delivery through email or push notifications
- Add import/export for academic records
- Add automated tests and CI pipeline
- Improve bundle splitting for faster production loading

## Author Information

Author: Ajay Singh  
GitHub: `singhajay23411-sketch`  
Project: SAPAS - Student Academic Performance Analytics System

## Project Status

Frontend: Mostly complete and build-ready  
Backend: Scaffolded and planned for future database/API integration  
Persistence: Browser localStorage for current demo phase  
Deployment: Frontend ready for Vercel
