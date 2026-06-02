# SAPAS: Technical Requirements Document (TRD)
**Version:** 1.0 | **Status:** Final | **Last Updated:** May 2026

---

## 1. TECHNICAL OVERVIEW

### 1.1 Architecture
SAPAS follows a **Three-Tier Architecture:**
```
┌─────────────────┐
│  Frontend       │  React.js + Tailwind CSS
│  (React SPA)    │  Mobile-responsive PWA
├─────────────────┤
│  Backend API    │  FastAPI/Flask (Python)
│  (REST + WS)    │  JWT Authentication
├─────────────────┤
│  Data Layer     │  PostgreSQL, Redis Cache
│  (Persistence)  │  Object-Relational Mapping
└─────────────────┘
```

### 1.2 Technology Stack Breakdown

#### Frontend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| UI Framework | React.js | 18.2+ | Component-based UI |
| CSS Framework | Tailwind CSS | 3.0+ | Utility-first styling |
| State Management | Redux Toolkit | 1.9+ | Global state |
| HTTP Client | Axios | 1.4+ | API communication |
| Form Handling | React Hook Form | 7.0+ | Form validation |
| Routing | React Router | 6.0+ | Page navigation |
| Charting | Recharts | 2.5+ | Data visualization |
| Notifications | React Toastify | 9.0+ | Toast alerts |
| Date Picker | React Datepicker | 4.0+ | Date selection |
| Task Automation | Node-cron | Mock timer | Focus session timer |

#### Backend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | FastAPI | 0.95+ | API server, async support |
| ASGI Server | Uvicorn | 0.21+ | Production server |
| ORM | SQLAlchemy | 2.0+ | Database abstraction |
| Database | PostgreSQL | 14+ | Relational data store |
| Cache | Redis | 7.0+ | Session, cache layer |
| Auth | PyJWT | 2.6+ | Token generation |
| Password Hash | Bcrypt | 4.0+ | Secure hashing |
| Validation | Pydantic | 1.10+ | Data validation |
| CORS | fastapi-cors | Built-in | Cross-origin support |
| Testing | Pytest | 7.0+ | Unit & integration tests |

#### Machine Learning / Data Science
| Component | Technology | Purpose |
|-----------|-----------|---------|
| ML Framework | Scikit-learn | Predictive models, rule engine |
| Data Processing | Pandas | Data manipulation, aggregation |
| Numerical Computing | NumPy | Array operations |
| Visualization (Server) | Matplotlib/Seaborn | Report generation |
| Job Queue | Celery | Async background tasks |
| Task Broker | Redis / RabbitMQ | Message broker for Celery |

---

## 2. DETAILED API SPECIFICATIONS

### 2.1 Authentication Endpoints

#### POST /api/auth/register
**Purpose:** Register new student account  
**Request Body:**
```json
{
  "email": "student@college.edu",
  "password": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe",
  "semester": 3,
  "department": "Computer Science",
  "year": 2025
}
```
**Response (201 Created):**
```json
{
  "user_id": "uuid",
  "email": "student@college.edu",
  "message": "Registration successful. Please verify your email.",
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```
**Validations:**
- Email must be unique
- Password minimum 8 characters, 1 uppercase, 1 number
- Email must match college domain (configurable)

---

#### POST /api/auth/login
**Purpose:** Authenticate and receive tokens  
**Request Body:**
```json
{
  "email": "student@college.edu",
  "password": "SecurePass123"
}
```
**Response (200 OK):**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "user_id": "uuid",
    "email": "student@college.edu",
    "first_name": "John",
    "semester": 3
  }
}
```

---

#### POST /api/auth/refresh-token
**Purpose:** Refresh expired access token  
**Request Body:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```
**Response (200 OK):**
```json
{
  "access_token": "newToken...",
  "expires_in": 86400
}
```

---

#### POST /api/auth/logout
**Purpose:** Invalidate tokens (optional—tokens are stateless)  
**Headers:** Authorization: Bearer {access_token}  
**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 2.2 Subject Management Endpoints

#### GET /api/subjects
**Purpose:** Fetch all user subjects  
**Headers:** Authorization: Bearer {token}  
**Query Parameters:** None  
**Response (200 OK):**
```json
{
  "subjects": [
    {
      "subject_id": "uuid",
      "name": "Data Structures",
      "code": "CS201",
      "current_marks": 85,
      "total_marks": 100,
      "attendance_percentage": 92,
      "assignment_scores": [45, 48, 50],
      "goal_grade": "A",
      "risk_status": "On Track",
      "created_at": "2025-01-15",
      "updated_at": "2025-05-10"
    },
    ...
  ],
  "count": 4,
  "max_subjects": 6
}
```

---

#### POST /api/subjects
**Purpose:** Add new subject  
**Headers:** Authorization: Bearer {token}  
**Request Body:**
```json
{
  "name": "Algorithms",
  "code": "CS202",
  "goal_grade": "A",
  "scheduled_days": ["Monday", "Wednesday", "Friday"],
  "scheduled_time": "10:00 AM"
}
```
**Response (201 Created):**
```json
{
  "subject_id": "uuid",
  "name": "Algorithms",
  "code": "CS202",
  "goal_grade": "A",
  "risk_status": "Not Started",
  "message": "Subject added successfully"
}
```
**Validations:**
- Max 6 subjects per user
- Subject code must be unique per semester
- Goal grade must be valid (A+, A, A-, B+, B, etc.)

---

#### PUT /api/subjects/{subject_id}
**Purpose:** Update subject details  
**Headers:** Authorization: Bearer {token}  
**Request Body:**
```json
{
  "name": "Algorithms",
  "current_marks": 88,
  "total_marks": 100,
  "attendance_percentage": 94,
  "goal_grade": "A+",
  "assignment_scores": [48, 49, 50]
}
```
**Response (200 OK):**
```json
{
  "subject_id": "uuid",
  "updated_fields": ["current_marks", "attendance_percentage"],
  "message": "Subject updated successfully"
}
```

---

#### DELETE /api/subjects/{subject_id}
**Purpose:** Remove subject from dashboard  
**Headers:** Authorization: Bearer {token}  
**Response (200 OK):**
```json
{
  "message": "Subject deleted successfully",
  "remaining_subjects": 3
}
```

---

### 2.3 Dashboard Endpoints

#### GET /api/dashboard
**Purpose:** Fetch complete dashboard data  
**Headers:** Authorization: Bearer {token}  
**Response (200 OK):**
```json
{
  "user": {
    "name": "John Doe",
    "semester": 3,
    "target_gpa": 3.7
  },
  "subjects": [ ... ], // Array of subject cards
  "goal_completion": {
    "percentage": 72,
    "predicted_gpa": 3.65,
    "message": "You're on track to achieve your GPA goal!"
  },
  "goal_tracker": {
    "subjects": ["Data Structures", "Algorithms"],
    "performance_percentages": [87, 85],
    "goal_percentages": [90, 90]
  },
  "ai_recommendations": [
    {
      "recommendation_id": "uuid",
      "type": "weak_subject",
      "subject": "Algorithms",
      "message": "Spend more time on Algorithms quiz preparation.",
      "priority": "high",
      "action_link": "/study-planner"
    },
    ...
  ],
  "reminders": [
    {
      "reminder_id": "uuid",
      "type": "assignment",
      "subject": "Data Structures",
      "title": "Assignment 3 Due",
      "due_date": "2025-05-15",
      "priority": "high"
    },
    ...
  ],
  "recent_notifications": [
    {
      "notification_id": "uuid",
      "type": "gpa_alert",
      "message": "Your GPA trajectory shows improvement!",
      "timestamp": "2025-05-10T14:30:00Z"
    },
    ...
  ]
}
```

---

#### GET /api/dashboard/recommendations
**Purpose:** Get AI-generated recommendations (detailed)  
**Headers:** Authorization: Bearer {token}  
**Query Parameters:** 
- `subject_id` (optional): Filter by subject
- `priority` (optional): high, medium, low

**Response (200 OK):**
```json
{
  "recommendations": [
    {
      "recommendation_id": "uuid",
      "rule_triggered": "attendance_low",
      "subject": "Data Structures",
      "message": "Your attendance in Data Structures is below the safe threshold (72% < 75%).",
      "severity": "warning",
      "suggested_action": "Attend next 3 classes",
      "impact": "Could affect final grade by 5-10%"
    },
    ...
  ],
  "timestamp": "2025-05-10T15:00:00Z"
}
```

---

### 2.4 Reminders Endpoints

#### GET /api/reminders
**Purpose:** Fetch all user reminders  
**Headers:** Authorization: Bearer {token}  
**Query Parameters:**
- `type` (optional): assignment, midterm, quiz, study_session
- `sort` (optional): due_date, priority

**Response (200 OK):**
```json
{
  "reminders": [
    {
      "reminder_id": "uuid",
      "type": "assignment",
      "subject": "Algorithms",
      "title": "Lab Assignment 2",
      "description": "Submit Algorithm implementation",
      "due_date": "2025-05-15",
      "due_time": "23:59",
      "priority": "high",
      "status": "pending",
      "created_at": "2025-05-05"
    },
    ...
  ],
  "count": 12
}
```

---

#### POST /api/reminders
**Purpose:** Create new reminder  
**Headers:** Authorization: Bearer {token}  
**Request Body:**
```json
{
  "type": "assignment",
  "subject_id": "uuid",
  "title": "Project Submission",
  "description": "Final project submission for ML course",
  "due_date": "2025-05-20",
  "due_time": "17:00",
  "priority": "high",
  "notify_days_before": 2
}
```
**Response (201 Created):**
```json
{
  "reminder_id": "uuid",
  "message": "Reminder created successfully"
}
```

---

#### PUT /api/reminders/{reminder_id}
**Purpose:** Update reminder  
**Response (200 OK):**
```json
{
  "message": "Reminder updated successfully"
}
```

---

#### DELETE /api/reminders/{reminder_id}
**Purpose:** Delete reminder  
**Response (200 OK):**
```json
{
  "message": "Reminder deleted successfully"
}
```

---

### 2.5 Performance Analysis Endpoints

#### GET /api/performance/analytics
**Purpose:** Fetch performance analytics data  
**Headers:** Authorization: Bearer {token}  
**Query Parameters:**
- `semester` (optional): current, previous, or semester_id
- `view_type` (optional): sgpa, subject_grades

**Response (200 OK):**
```json
{
  "gpa": {
    "current_gpa": 3.65,
    "previous_gpa": 3.58,
    "target_gpa": 3.7,
    "gpa_trend": "improving"
  },
  "subjects_analytics": [
    {
      "subject_id": "uuid",
      "name": "Data Structures",
      "attendance_percentage": 92,
      "quiz_average": 87,
      "midterm_marks": 84,
      "current_marks": 85,
      "forecast_grade": "A",
      "trend": "stable",
      "priority": 1
    },
    ...
  ],
  "sgpa_history": [
    {
      "semester": 1,
      "sgpa": 3.4,
      "rank": "Top 15%"
    },
    ...
  ],
  "performance_chart": {
    "labels": ["Week 1", "Week 2", ...],
    "datasets": [
      {
        "subject": "Data Structures",
        "data": [78, 82, 85, 87, ...]
      },
      ...
    ]
  }
}
```

---

#### PUT /api/performance/gpa
**Purpose:** Update GPA targets and settings  
**Headers:** Authorization: Bearer {token}  
**Request Body:**
```json
{
  "target_gpa": 3.8,
  "previous_gpa": 3.58
}
```
**Response (200 OK):**
```json
{
  "message": "GPA targets updated",
  "target_gpa": 3.8,
  "gap": 0.15
}
```

---

#### GET /api/performance/trends
**Purpose:** Get performance trend analysis  
**Response (200 OK):**
```json
{
  "trends": [
    {
      "subject": "Algorithms",
      "trend_direction": "improving",
      "improvement_rate": "2.5% per week",
      "latest_marks": 88,
      "weeks_improving": 3
    },
    ...
  ]
}
```

---

### 2.6 Study Planner Endpoints

#### GET /api/planner/schedule
**Purpose:** Fetch weekly study schedule  
**Headers:** Authorization: Bearer {token}  
**Query Parameters:**
- `week` (optional): YYYY-WW format, default: current week

**Response (200 OK):**
```json
{
  "week": "2025-W19",
  "schedule": [
    {
      "day": "Monday",
      "blocks": [
        {
          "subject": "Data Structures",
          "start_time": "10:00",
          "end_time": "11:30",
          "duration_minutes": 90,
          "block_type": "lecture"
        },
        {
          "subject": "Algorithms",
          "start_time": "14:00",
          "end_time": "15:30",
          "duration_minutes": 90,
          "block_type": "self_study"
        },
        ...
      ]
    },
    ...
  ]
}
```

---

#### POST /api/planner/schedule
**Purpose:** Create study schedule block  
**Request Body:**
```json
{
  "day": "Monday",
  "subject_id": "uuid",
  "start_time": "10:00",
  "end_time": "11:30",
  "block_type": "lecture"
}
```
**Response (201 Created):**
```json
{
  "block_id": "uuid",
  "message": "Study block added to schedule"
}
```

---

#### GET /api/planner/focus-sessions
**Purpose:** Get focus session history and stats  
**Response (200 OK):**
```json
{
  "total_sessions": 45,
  "total_hours": 37.5,
  "average_duration_minutes": 50,
  "week_sessions": 8,
  "recent_sessions": [
    {
      "session_id": "uuid",
      "subject": "Data Structures",
      "duration_minutes": 45,
      "completed_at": "2025-05-10T10:30:00Z",
      "focus_quality": "high"
    },
    ...
  ]
}
```

---

#### POST /api/planner/focus-sessions
**Purpose:** Start/log focus session  
**Request Body:**
```json
{
  "subject_id": "uuid",
  "duration_minutes": 45,
  "break_minutes": 15,
  "started_at": "2025-05-10T10:00:00Z"
}
```
**Response (201 Created):**
```json
{
  "session_id": "uuid",
  "message": "Focus session started"
}
```

---

#### GET /api/exams
**Purpose:** Get upcoming exams  
**Headers:** Authorization: Bearer {token}  
**Response (200 OK):**
```json
{
  "exams": [
    {
      "exam_id": "uuid",
      "subject": "Algorithms",
      "exam_type": "midterm",
      "exam_date": "2025-05-25",
      "exam_time": "10:00",
      "exam_location": "Room 101, Building A",
      "duration_minutes": 120,
      "marks": 100,
      "chapters_covered": ["Sorting", "Searching", "Graphs"],
      "days_until_exam": 15
    },
    ...
  ]
}
```

---

#### POST /api/exams
**Purpose:** Add upcoming exam  
**Request Body:**
```json
{
  "subject_id": "uuid",
  "exam_type": "midterm",
  "exam_date": "2025-05-25",
  "exam_time": "10:00",
  "exam_location": "Room 101, Building A",
  "duration_minutes": 120,
  "marks": 100,
  "chapters_covered": ["Sorting", "Searching", "Graphs"]
}
```
**Response (201 Created):**
```json
{
  "exam_id": "uuid",
  "message": "Exam added successfully"
}
```

---

### 2.7 Progress Tracking Endpoints

#### GET /api/progress/summary
**Purpose:** Get overall progress summary  
**Headers:** Authorization: Bearer {token}  
**Response (200 OK):**
```json
{
  "momentum": {
    "study_streak_days": 15,
    "weekly_ranking": "Top 10%",
    "productivity_status": "Excellent"
  },
  "weekly_growth": {
    "current_week_hours": 12.5,
    "previous_week_hours": 10.0,
    "growth_percentage": 25,
    "daily_breakdown": [
      {"day": "Monday", "hours": 2.0},
      ...
    ]
  },
  "semester_progress": {
    "completion_percentage": 75,
    "gpa_trajectory": "on_track",
    "motivational_message": "You're 75% through the semester!"
  }
}
```

---

#### GET /api/progress/milestones
**Purpose:** Get semester milestones  
**Response (200 OK):**
```json
{
  "milestones": [
    {
      "milestone_id": "uuid",
      "title": "Midterm Examination Phase",
      "description": "Conduct midterm exams for all courses",
      "target_date": "2025-03-15",
      "status": "completed",
      "achievements": 100
    },
    {
      "milestone_id": "uuid",
      "title": "Project Submission",
      "target_date": "2025-05-20",
      "status": "in_progress",
      "achievements": 60
    },
    ...
  ],
  "completed_count": 2,
  "in_progress_count": 1,
  "upcoming_count": 3
}
```

---

#### POST /api/progress/milestones
**Purpose:** Add milestone  
**Request Body:**
```json
{
  "title": "Thesis Submission",
  "description": "Submit final thesis draft",
  "target_date": "2025-06-30"
}
```
**Response (201 Created):**
```json
{
  "milestone_id": "uuid",
  "message": "Milestone created successfully"
}
```

---

#### GET /api/progress/badges
**Purpose:** Get earned and available badges  
**Response (200 OK):**
```json
{
  "earned_badges": [
    {
      "badge_id": "uuid",
      "name": "Consistency Master",
      "description": "Maintained 20+ day study streak",
      "earned_at": "2025-05-10",
      "icon_url": "/badges/consistency-master.png"
    },
    ...
  ],
  "locked_badges": [
    {
      "badge_id": "uuid",
      "name": "Attendance Champion",
      "description": "Maintain 95%+ attendance",
      "progress_percentage": 85,
      "requirements": "Current attendance: 85% (need 95%)"
    },
    ...
  ]
}
```

---

#### GET /api/progress/course-details
**Purpose:** Get detailed course progress table data  
**Response (200 OK):**
```json
{
  "courses": [
    {
      "subject_id": "uuid",
      "course_name": "Data Structures",
      "attendance_percentage": 92,
      "assignment_completion": 95,
      "current_grade": "A",
      "performance_status": "On Track",
      "marks_progression": [78, 81, 84, 87, ...]
    },
    ...
  ]
}
```

---

### 2.8 Settings Endpoints

#### GET /api/user/profile
**Purpose:** Get user profile information  
**Headers:** Authorization: Bearer {token}  
**Response (200 OK):**
```json
{
  "user_id": "uuid",
  "email": "john.doe@college.edu",
  "first_name": "John",
  "last_name": "Doe",
  "profile_picture_url": "https://...",
  "semester": 3,
  "department": "Computer Science",
  "year": 2025,
  "bio": "Passionate about algorithms and problem solving",
  "created_at": "2025-01-15"
}
```

---

#### PUT /api/user/profile
**Purpose:** Update user profile  
**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Updated bio",
  "profile_picture": "base64_image_data"
}
```
**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "profile_picture_url": "https://..."
}
```

---

#### PUT /api/user/preferences
**Purpose:** Update notification and appearance preferences  
**Request Body:**
```json
{
  "dark_mode": true,
  "compact_view": false,
  "notifications": {
    "grade_updates": true,
    "deadline_reminders": true,
    "ai_productivity_tips": true,
    "system_announcements": false
  },
  "ai_config": {
    "enable_suggestions": true,
    "recommendation_intensity": "high"
  }
}
```
**Response (200 OK):**
```json
{
  "message": "Preferences updated successfully"
}
```

---

#### POST /api/user/export
**Purpose:** Generate and export academic data  
**Request Body:**
```json
{
  "format": "pdf",
  "include_charts": true,
  "include_badges": true,
  "semester": "current"
}
```
**Response (200 OK):**
```json
{
  "export_id": "uuid",
  "download_url": "https://.../exports/uuid.pdf",
  "expires_in_hours": 24
}
```

---

#### DELETE /api/user/account
**Purpose:** Delete account (dangerous operation)  
**Request Body:**
```json
{
  "password": "user_password",
  "confirmation": true
}
```
**Response (200 OK):**
```json
{
  "message": "Account deletion initiated. You have 30 days to cancel.",
  "cancellation_deadline": "2025-06-10"
}
```

---

## 3. DATABASE SCHEMA

### 3.1 Entity Relationship Diagram
```
┌─────────┐      1:N    ┌──────────────┐
│  Users  ├────────────┤   Subjects   │
└─────────┘            └──────────────┘
    │                         │
    │ 1:N                     │ 1:N
    │                         │
    ├────┐                    └────┬─────┐
    │    │                         │     │
   1:N  1:N              ┌─────────┴─┐   │
    │    │               │           │   │
┌───┴────┴──┐   ┌─────────────────┐  │   │
│ Reminders │   │ Focus Sessions  │  │   │
└───────────┘   └─────────────────┘  │   │
                                      │   │
                              ┌───────┴───┴────┐
                              │  Marks Data    │
                              └────────────────┘
                              (Attendance, etc)
```

### 3.2 Core Tables

#### users
```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  profile_picture_url VARCHAR(500),
  bio TEXT,
  semester INTEGER CHECK (semester >= 1 AND semester <= 8),
  department VARCHAR(100),
  year INTEGER,
  target_gpa DECIMAL(3,2),
  previous_gpa DECIMAL(3,2),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

---

#### subjects
```sql
CREATE TABLE subjects (
  subject_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(20) NOT NULL,
  goal_grade VARCHAR(5),
  scheduled_days TEXT, -- JSON array: ["Monday", "Wednesday"]
  scheduled_time VARCHAR(10),
  risk_status VARCHAR(50) DEFAULT 'Not Started', -- On Track, Attention Required, Critical
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, code),
  CHECK ((SELECT COUNT(*) FROM subjects WHERE user_id = subjects.user_id) <= 6)
);

CREATE INDEX idx_subjects_user_id ON subjects(user_id);
```

---

#### marks_and_attendance
```sql
CREATE TABLE marks_and_attendance (
  record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Marks
  current_marks DECIMAL(5,2),
  total_marks DECIMAL(5,2) DEFAULT 100,
  
  -- Attendance
  attendance_percentage DECIMAL(5,2),
  classes_attended INTEGER,
  total_classes INTEGER,
  
  -- Assignments
  assignment_scores DECIMAL(5,2)[], -- Array of scores
  assignment_count INTEGER,
  
  -- Quiz
  quiz_average DECIMAL(5,2),
  quiz_scores DECIMAL(5,2)[],
  
  -- Midterm
  midterm_marks DECIMAL(5,2),
  
  -- Forecast
  forecast_grade VARCHAR(5),
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT marks_range CHECK (current_marks >= 0 AND current_marks <= 100),
  CONSTRAINT attendance_range CHECK (attendance_percentage >= 0 AND attendance_percentage <= 100)
);

CREATE INDEX idx_marks_subject_id ON marks_and_attendance(subject_id);
CREATE INDEX idx_marks_user_id ON marks_and_attendance(user_id);
```

---

#### reminders
```sql
CREATE TABLE reminders (
  reminder_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(subject_id) ON DELETE SET NULL,
  
  type VARCHAR(50) NOT NULL, -- assignment, midterm, quiz, study_session
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  due_time TIME,
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, overdue
  
  notify_days_before INTEGER DEFAULT 1,
  is_notified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_due_date ON reminders(due_date);
CREATE INDEX idx_reminders_status ON reminders(status);
```

---

#### study_schedules
```sql
CREATE TABLE study_schedules (
  schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
  
  day_of_week VARCHAR(20) NOT NULL, -- Monday, Tuesday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER,
  block_type VARCHAR(50), -- lecture, self_study, exam_prep, group_study
  
  week_number INTEGER,
  year_number INTEGER,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT time_valid CHECK (end_time > start_time)
);

CREATE INDEX idx_schedules_user_id ON study_schedules(user_id);
CREATE INDEX idx_schedules_week ON study_schedules(week_number, year_number);
```

---

#### focus_sessions
```sql
CREATE TABLE focus_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(subject_id) ON DELETE SET NULL,
  
  duration_minutes INTEGER NOT NULL,
  break_minutes INTEGER DEFAULT 15,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  
  focus_quality VARCHAR(20), -- low, medium, high
  notes TEXT,
  
  is_completed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_focus_user_id ON focus_sessions(user_id);
CREATE INDEX idx_focus_completed_at ON focus_sessions(completed_at);
```

---

#### exams
```sql
CREATE TABLE exams (
  exam_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
  
  exam_type VARCHAR(50), -- midterm, final, quiz, practical
  exam_date DATE NOT NULL,
  exam_time TIME,
  exam_location VARCHAR(200),
  duration_minutes INTEGER,
  total_marks INTEGER DEFAULT 100,
  
  chapters_covered TEXT[], -- Array of chapter names
  
  exam_marks DECIMAL(5,2),
  result_published BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exams_user_id ON exams(user_id);
CREATE INDEX idx_exams_exam_date ON exams(exam_date);
CREATE INDEX idx_exams_subject_id ON exams(subject_id);
```

---

#### milestones
```sql
CREATE TABLE milestones (
  milestone_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  
  title VARCHAR(200) NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  
  status VARCHAR(20) DEFAULT 'upcoming', -- upcoming, in_progress, completed, delayed
  achievement_percentage INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_milestones_user_id ON milestones(user_id);
CREATE INDEX idx_milestones_target_date ON milestones(target_date);
```

---

#### badges_earned
```sql
CREATE TABLE badges_earned (
  earned_badge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  badge_type VARCHAR(100) NOT NULL, -- top_researcher, fast_learner, consistency_master, etc.
  
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  icon_url VARCHAR(500),
  description TEXT
);

CREATE INDEX idx_badges_user_id ON badges_earned(user_id);
CREATE INDEX idx_badges_type ON badges_earned(badge_type);
```

---

#### notifications
```sql
CREATE TABLE notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  
  type VARCHAR(50), -- grade_alert, deadline_reminder, gpa_alert, ai_recommendation
  subject_id UUID REFERENCES subjects(subject_id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

---

#### user_preferences
```sql
CREATE TABLE user_preferences (
  preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Appearance
  dark_mode BOOLEAN DEFAULT false,
  compact_view BOOLEAN DEFAULT false,
  
  -- Notifications
  notify_grade_updates BOOLEAN DEFAULT true,
  notify_deadline_reminders BOOLEAN DEFAULT true,
  notify_ai_tips BOOLEAN DEFAULT true,
  notify_announcements BOOLEAN DEFAULT false,
  
  -- AI Configuration
  ai_enabled BOOLEAN DEFAULT true,
  ai_intensity VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_preferences_user_id ON user_preferences(user_id);
```

---

#### daily_goals
```sql
CREATE TABLE daily_goals (
  goal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  goal_date DATE NOT NULL,
  
  title VARCHAR(200) NOT NULL,
  description TEXT,
  priority VARCHAR(20),
  is_completed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  
  UNIQUE(user_id, goal_date, title)
);

CREATE INDEX idx_daily_goals_user_id ON daily_goals(user_id);
CREATE INDEX idx_daily_goals_date ON daily_goals(goal_date);
```

---

### 3.3 Indexes for Performance

```sql
-- Query optimization indexes
CREATE INDEX idx_subjects_user_semester ON subjects(user_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX idx_marks_latest ON marks_and_attendance(subject_id, updated_at DESC) 
  WHERE updated_at > CURRENT_DATE - INTERVAL '30 days';

CREATE INDEX idx_focus_week ON focus_sessions(user_id, EXTRACT(WEEK FROM started_at));

CREATE INDEX idx_exams_upcoming ON exams(user_id, exam_date) 
  WHERE exam_date >= CURRENT_DATE;

CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) 
  WHERE is_read = false;
```

---

## 4. AUTHENTICATION & SECURITY

### 4.1 JWT Token Structure
**Access Token** (24-hour expiry):
```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "sub": "user_id_uuid",
  "email": "user@college.edu",
  "user_type": "student",
  "iat": 1684000000,
  "exp": 1684086400,
  "iss": "SAPAS"
}
```

**Refresh Token** (7-day expiry, stored in httpOnly cookie):
```
Payload: {
  "sub": "user_id_uuid",
  "type": "refresh",
  "iat": 1684000000,
  "exp": 1684604800,
  "jti": "unique_token_id"
}
```

### 4.2 Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character (@, #, $, %)

### 4.3 Rate Limiting
- **Login attempts:** 5 failures = 15-minute lockout
- **API endpoints:** 100 requests/minute per user
- **Password reset:** 3 attempts per hour
- **Email verification:** 1 per day

---

## 5. CACHING STRATEGY

### 5.1 Redis Cache Keys
```
user:{user_id}:profile          # User profile data (TTL: 1 hour)
user:{user_id}:subjects         # User's subjects (TTL: 30 min)
user:{user_id}:dashboard        # Dashboard data (TTL: 15 min)
recommendation:{user_id}        # AI recommendations (TTL: 1 hour)
exam:{user_id}:upcoming         # Upcoming exams (TTL: 30 min)
```

### 5.2 Cache Invalidation
- Cache invalidated on data update operations (PUT, POST, DELETE)
- Automatic expiry based on TTL
- Manual cache clear on logout

---

## 6. ERROR HANDLING

### 6.1 HTTP Status Codes
```
200 OK                   - Successful request
201 Created             - Resource created
204 No Content          - Successful deletion
400 Bad Request         - Invalid input
401 Unauthorized        - Missing/invalid token
403 Forbidden           - Insufficient permissions
404 Not Found           - Resource not found
409 Conflict            - Duplicate resource (e.g., max subjects)
422 Unprocessable Entity - Validation error
429 Too Many Requests   - Rate limit exceeded
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
```

### 6.2 Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "email",
        "issue": "Email already in use"
      }
    ],
    "timestamp": "2025-05-10T15:30:00Z",
    "request_id": "req_uuid"
  }
}
```

---

## 7. TESTING STRATEGY

### 7.1 Unit Tests
- Controller/Route logic
- Validation functions
- AI recommendation rules
- Utility functions

### 7.2 Integration Tests
- API endpoint integration
- Database operations
- Authentication flows
- Cache operations

### 7.3 Test Coverage Target
- Minimum 80% code coverage
- 100% coverage for critical paths (auth, data operations)

### 7.4 Performance Testing
- Load testing (1000+ concurrent users)
- Dashboard load time: < 1.5s
- Search response: < 200ms

---

## 8. DEPLOYMENT CONFIGURATION

### 8.1 Environment Variables
```
DATABASE_URL=postgresql://user:pass@host:5432/sapas
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=very_secure_secret_key_min_32_chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=https://sapas.app,https://www.sapas.app
ENVIRONMENT=production
LOG_LEVEL=info
```

### 8.2 Docker Deployment
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 9. MONITORING & LOGGING

### 9.1 Key Metrics
- API response time (p50, p95, p99)
- Database query latency
- Cache hit/miss ratio
- User session duration
- Feature usage statistics

### 9.2 Logging Levels
```
DEBUG    - Detailed application flow
INFO     - General informational messages
WARNING  - Warning messages (recoverable errors)
ERROR    - Error messages (significant issues)
CRITICAL - Critical system failures
```

### 9.3 Log Aggregation
- ELK Stack (Elasticsearch, Logstash, Kibana) or CloudWatch
- Logs retained for 90 days
- Real-time alerting for critical errors

---

**Document Owner:** Backend Engineering Team  
**Last Review:** May 2026  
**Next Review:** July 2026
```text id="jlwm40"
# UPDATED TECHNICAL REQUIREMENTS DOCUMENT (TRD)
# FOR
# “SAPAS – STUDENT ACADEMIC PERFORMANCE ANALYSIS SYSTEM”

==================================================
1. UPDATED SYSTEM ARCHITECTURE
==================================================

SAPAS now follows a SaaS-style layered architecture:

Public Layer
↓
Authentication Layer
↓
Protected Dashboard Ecosystem
↓
Analytics & Productivity Modules

The system now includes:
- Landing Page
- Login / Registration System
- Protected Dashboard Access
- Premium Theme Engine
- Centralized State Management

==================================================
2. UPDATED FRONTEND ARCHITECTURE
==================================================

Frontend now contains:

Public Pages:
- Landing Page
- Login Page

Protected Pages:
- Dashboard
- Performance Analysis
- Study Planner
- Progress Tracking
- Settings

==================================================
3. UPDATED ROUTING STRUCTURE
==================================================

/                → Landing Page
/login           → Login Page
/dashboard       → Dashboard
/analytics       → Performance Analysis
/planner         → Study Planner
/progress        → Progress Tracking
/settings        → Settings

==================================================
4. UPDATED FRONTEND TECHNOLOGY STACK
==================================================

Frontend Technologies:
- React.js
- Vite
- Tailwind CSS
- Zustand
- React Router DOM
- Framer Motion
- Recharts

Purpose of Technologies:

React.js:
- component-based frontend development
- reusable UI architecture

Vite:
- fast development environment
- optimized frontend build system

Tailwind CSS:
- utility-first responsive styling
- scalable design system

Zustand:
- centralized global state management

Framer Motion:
- premium animations
- smooth transitions
- section reveal effects

Recharts:
- analytics charts
- data visualization

==================================================
5. UPDATED LANDING PAGE REQUIREMENTS
==================================================

The Landing Page acts as the public marketing layer of SAPAS.

Features:
- Hero Section
- Dashboard Showcase
- Performance Analytics Preview
- Study Planner Preview
- AI Insights Showcase
- About Section
- CTA Section
- Footer

Technical Features:
- smooth-scroll navigation
- animated section reveals
- responsive layouts
- glassmorphism UI
- Framer Motion transitions

==================================================
6. UPDATED LOGIN SYSTEM REQUIREMENTS
==================================================

Authentication Features:
- email login
- password authentication
- create account flow
- remember me
- logout system
- protected routes
- session persistence

Frontend Authentication Flow:
Landing Page
↓
Login Page
↓
Authentication
↓
Dashboard Access

==================================================
7. UPDATED THEME MANAGEMENT SYSTEM
==================================================

The application now supports:
- dark mode
- light mode
- compact view

Theme Features:
- global theme synchronization
- localStorage persistence
- smooth animated transitions
- glassmorphism support

Theme states are managed using:
- Zustand
- localStorage

==================================================
8. UPDATED STATE MANAGEMENT SYSTEM
==================================================

Zustand global state management is used for:

- profile synchronization
- theme synchronization
- authentication state
- notifications
- planner data
- analytics data
- dashboard data

Advantages:
- centralized data management
- reduced prop drilling
- scalable architecture
- real-time UI synchronization

==================================================
9. UPDATED COMPONENT ARCHITECTURE
==================================================

Reusable Components:
- cards
- charts
- buttons
- inputs
- sidebar
- navbar
- tables
- modals
- analytics widgets

Component Benefits:
- maintainability
- scalability
- code reusability
- consistent UI design

==================================================
10. UPDATED ANIMATION SYSTEM
==================================================

Framer Motion is used for:
- page transitions
- hover animations
- section reveal effects
- smooth scrolling
- sidebar animations
- theme transitions
- card interactions

Animation Goals:
- premium SaaS experience
- smooth interactions
- cinematic UI feel

==================================================
11. UPDATED RESPONSIVENESS REQUIREMENTS
==================================================

The application supports:
- mobile devices
- tablets
- laptops
- desktops
- ultra-wide displays

Responsive Features:
- adaptive layouts
- responsive sidebar
- responsive cards
- responsive charts
- responsive navigation

==================================================
12. UPDATED MOCK DATA ARCHITECTURE
==================================================

Frontend currently uses centralized mock data.

Mock data includes:
- subjects
- analytics
- planner sessions
- notifications
- profile data
- AI insights
- milestones

Purpose:
- simulate backend responses
- support frontend development
- prepare backend-ready architecture

==================================================
13. UPDATED BACKEND INTEGRATION PLAN
==================================================

Future backend integration will use:
- FastAPI
- PostgreSQL
- SQLAlchemy
- JWT Authentication

Backend Responsibilities:
- authentication
- database operations
- analytics calculations
- AI recommendation engine
- notifications
- planner persistence

Frontend will later replace mock data using REST APIs.

==================================================
14. UPDATED SECURITY REQUIREMENTS
==================================================

Authentication system must support:
- protected routes
- session persistence
- secure login flow
- logout functionality
- future JWT support

Future backend security includes:
- password hashing
- JWT authentication
- protected APIs
- request validation

==================================================
15. UPDATED PERFORMANCE REQUIREMENTS
==================================================

The application must:
- load quickly
- maintain smooth transitions
- support dynamic rendering
- optimize animations
- provide responsive interactions

Dashboard load time target:
- under 2 seconds

==================================================
16. UPDATED PROJECT STRUCTURE
==================================================

src/
│
├── components/
│   ├── ui/
│   ├── charts/
│   ├── cards/
│   ├── planner/
│   ├── analytics/
│   ├── progress/
│   ├── settings/
│   └── layout/
│
├── pages/
│   ├── LandingPage/
│   ├── LoginPage/
│   ├── Dashboard/
│   ├── PerformanceAnalysis/
│   ├── StudyPlanner/
│   ├── ProgressTracking/
│   └── Settings/
│
├── layouts/
├── store/
├── services/
├── hooks/
├── data/
├── utils/
├── assets/
└── styles/

==================================================
17. UPDATED PUBLIC & PRIVATE ARCHITECTURE
==================================================

PUBLIC LAYER:
- Landing Page
- Login Page
- Registration Flow

PRIVATE LAYER:
- Dashboard
- Performance Analysis
- Study Planner
- Progress Tracking
- Settings

==================================================
18. UPDATED USER EXPERIENCE GOALS
==================================================

The frontend aims to provide:
- premium SaaS experience
- cinematic dark mode
- responsive design
- immersive onboarding
- modern analytics visualization
- smooth user interactions

==================================================
19. UPDATED FINAL SYSTEM OBJECTIVE
==================================================

SAPAS is now a complete SaaS-style academic intelligence platform that combines:
- academic analytics
- productivity systems
- AI-based insights
- planner management
- authentication flow
- premium frontend experience
- scalable architecture
- future backend integration support

The platform is designed to feel:
- modern
- intelligent
- immersive
- scalable
- production-ready
```
