# SAPAS API Documentation Planned

The backend API is scaffolded with FastAPI. This document describes the planned API surface for future integration.

Base URL:

```text
/api/v1
```

## Authentication

Planned endpoints:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
POST /api/v1/auth/logout
```

Purpose:

- Register a user
- Authenticate with email and password
- Return JWT access token
- Return authenticated user profile

## Profile

Planned endpoints:

```text
GET  /api/v1/profile/me
PUT  /api/v1/profile/me
PUT  /api/v1/profile/avatar
```

Purpose:

- Read and update student profile details
- Update avatar URL

## Subjects

Planned endpoints:

```text
POST   /api/v1/subjects
GET    /api/v1/subjects
GET    /api/v1/subjects/{id}
PUT    /api/v1/subjects/{id}
DELETE /api/v1/subjects/{id}
```

Purpose:

- Manage academic subjects
- Track marks, attendance, credits, grade, and semester

## Dashboard

Planned endpoints:

```text
GET /api/v1/dashboard/overview
GET /api/v1/dashboard/gpa
GET /api/v1/dashboard/attendance
GET /api/v1/dashboard/subjects-summary
GET /api/v1/dashboard/insights
```

Purpose:

- Return summarized metrics for dashboard cards and insight panels

## Planner

Planned endpoints:

```text
POST   /api/v1/planner/sessions
GET    /api/v1/planner/sessions
PUT    /api/v1/planner/sessions/{id}
DELETE /api/v1/planner/sessions/{id}
POST   /api/v1/planner/exams
GET    /api/v1/planner/exams
PUT    /api/v1/planner/exams/{id}
DELETE /api/v1/planner/exams/{id}
GET    /api/v1/planner/productivity
GET    /api/v1/planner/streaks
```

Purpose:

- Manage study sessions, exams, productivity statistics, and streak data

## Settings

Planned endpoints:

```text
GET /api/v1/settings
PUT /api/v1/settings/theme
PUT /api/v1/settings/preferences
PUT /api/v1/settings/notifications
```

Purpose:

- Store user preferences, theme, and notification settings

## AI Insights

Planned endpoints:

```text
POST /api/v1/ai/generate
GET  /api/v1/ai/insights
GET  /api/v1/ai/recommendations
GET  /api/v1/ai/warnings
```

Purpose:

- Generate rule-based or AI-assisted recommendations
- Return warnings and improvement suggestions
