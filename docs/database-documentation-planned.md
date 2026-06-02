# SAPAS Database Documentation Planned

The backend is prepared for SQLAlchemy and PostgreSQL. This document describes the planned database model.

## Database Engine

Recommended production database:

```text
PostgreSQL
```

Development alternatives:

```text
SQLite for local prototypes
PostgreSQL for realistic testing
```

## Planned Tables

### users

Stores student account and profile information.

Important fields:

- `id`
- `first_name`
- `last_name`
- `full_name`
- `email`
- `password_hash`
- `avatar`
- `bio`
- `role`
- `is_active`
- `created_at`
- `updated_at`

### subjects

Stores user-specific subject records.

Important fields:

- `id`
- `user_id`
- `subject_name`
- `subject_code`
- `credits`
- `attendance_percentage`
- `current_marks`
- `total_marks`
- `grade`
- `semester`
- `status`
- `created_at`
- `updated_at`

### planner_sessions

Stores study sessions and task-style planner entries.

Important fields:

- `id`
- `user_id`
- `subject_id`
- `session_title`
- `session_description`
- `start_time`
- `end_time`
- `duration`
- `priority`
- `status`
- `completed`
- `created_at`
- `updated_at`

### upcoming_exams

Stores upcoming exams and reminders.

Important fields:

- `id`
- `user_id`
- `subject_id`
- `exam_title`
- `exam_date`
- `exam_type`
- `reminder_enabled`
- `created_at`

### user_settings

Stores user preferences.

Important fields:

- `user_id`
- `dark_mode`
- `compact_mode`
- `notifications_enabled`
- `ai_recommendations_enabled`
- `reminder_preferences`
- `theme_preference`
- `updated_at`

### ai_insights

Stores generated insights and warnings.

Important fields:

- `id`
- `user_id`
- `insight_type`
- `title`
- `description`
- `priority`
- `resolved`
- `generated_at`

## Relationships

- One user has many subjects.
- One user has many planner sessions.
- One user has many upcoming exams.
- One user has one settings record.
- One user has many AI insights.
- Planner sessions and exams can reference subjects.

## Migration Strategy

Alembic is included for schema migrations. Recommended workflow:

```bash
cd backend
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

## Current Status

The frontend currently persists data in localStorage. Backend database persistence is planned and scaffolded but not fully integrated with the frontend.
