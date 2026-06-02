# SAPAS: App Flow & User Journey Document
**Version:** 1.0 | **Status:** Final | **Last Updated:** May 2026

---

## 1. APPLICATION ARCHITECTURE FLOW

### 1.1 High-Level System Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                         │
│  (Mobile/Desktop Browser - React SPA)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST + WebSocket
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              API GATEWAY & LOAD BALANCER                    │
│              (FastAPI + CORS Middleware)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Auth Service │ │ Data Service │ │ AI Service   │
│ (JWT)        │ │ (CRUD ops)   │ │ (Rules)      │
└──────────────┘ └──────────────┘ └──────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       ↓
        ┌──────────────┴──────────────┐
        ↓                             ↓
   ┌─────────────┐          ┌─────────────────┐
   │ PostgreSQL  │          │ Redis Cache     │
   │ (Primary)   │          │ (Session/Data)  │
   └─────────────┘          └─────────────────┘
```

### 1.2 Request-Response Cycle
```
1. User Action (Click, Submit)
        ↓
2. Frontend Component Dispatches Redux Action
        ↓
3. Redux Middleware (Thunk) Makes API Call
        ↓
4. Axios Intercepts & Adds JWT Token
        ↓
5. Request Reaches Backend (FastAPI)
        ↓
6. Authentication Middleware Validates Token
        ↓
7. Request Handler (Controller) Processes
        ↓
8. Database Query or Cache Lookup
        ↓
9. Response Built & Returned
        ↓
10. Frontend Redux Store Updated
        ↓
11. React Components Re-render
        ↓
12. UI Updated with New Data
```

---

## 2. AUTHENTICATION FLOW

### 2.1 User Registration Flow
```
┌─────────────────────────────────────────────────────────────┐
│                  REGISTRATION PAGE                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Email: student@college.edu                          │   │
│  │ Password: ••••••••                                   │   │
│  │ Name: John Doe                                       │   │
│  │ Semester: 3                                          │   │
│  │ [Register Button]                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │ Submit Form
                      ↓
┌─────────────────────────────────────────────────────────────┐
│         FRONTEND VALIDATION                                  │
│ ✓ Email format valid                                        │
│ ✓ Password meets requirements                              │
│ ✓ All fields filled                                         │
└─────────────────────┬───────────────────────────────────────┘
                      │ POST /api/auth/register
                      ↓
┌─────────────────────────────────────────────────────────────┐
│      BACKEND VALIDATION & USER CREATION                     │
│ • Check email uniqueness                                    │
│ • Validate password strength                                │
│ • Hash password (bcrypt)                                    │
│ • Create user record in DB                                  │
│ • Create user_preferences record                            │
└─────────────────────┬───────────────────────────────────────┘
                      │ Success
                      ↓
┌─────────────────────────────────────────────────────────────┐
│              SEND VERIFICATION EMAIL                        │
│ Subject: Verify your SAPAS account                         │
│ Link: /verify?token=xyz...                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │ Generate JWT Tokens
                      ↓
┌─────────────────────────────────────────────────────────────┐
│      RETURN RESPONSE & STORE TOKENS                         │
│ {                                                            │
│   "access_token": "eyJhbGc...",                            │
│   "refresh_token": "eyJhbGc...",                           │
│   "expires_in": 86400                                       │
│ }                                                            │
│ • Access Token → localStorage                              │
│ • Refresh Token → httpOnly cookie                          │
└─────────────────────┬───────────────────────────────────────┘
                      │ Redirect to
                      ↓
┌─────────────────────────────────────────────────────────────┐
│         VERIFICATION PAGE OR DASHBOARD                      │
│ (Email verification step before full access)               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 User Login Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    LOGIN PAGE                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Email: student@college.edu                          │   │
│  │ Password: ••••••••                                   │   │
│  │ [Remember Me?]    [Login Button]                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │ Submit Credentials
                      ↓
┌─────────────────────────────────────────────────────────────┐
│         FRONTEND CLIENT-SIDE VALIDATION                     │
│ ✓ Email format valid                                       │
│ ✓ Password not empty                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │ POST /api/auth/login
                      ↓
┌─────────────────────────────────────────────────────────────┐
│       BACKEND AUTHENTICATION                                │
│ 1. Find user by email                                       │
│ 2. Verify password (bcrypt compare)                         │
│ 3. Check if email verified                                  │
│ 4. Check if account active                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │ Valid
                      ↓
┌─────────────────────────────────────────────────────────────┐
│         GENERATE JWT TOKENS                                 │
│ • Access Token (24 hours)                                   │
│ • Refresh Token (7 days, httpOnly)                          │
│ • Store token metadata in Redis                             │
└─────────────────────┬───────────────────────────────────────┘
                      │ Return Tokens
                      ↓
┌─────────────────────────────────────────────────────────────┐
│      FRONTEND: STORE TOKENS & REDIRECT                      │
│ localStorage['access_token'] = token                       │
│ Redux: SET_AUTH_STATE = true                              │
│ Redirect → /dashboard                                      │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Token Refresh Flow
```
┌─────────────────────────────────────────────────────────────┐
│     USER MAKING API CALL WITH EXPIRED ACCESS TOKEN         │
│  (e.g., fetching dashboard after 24 hours)                 │
└─────────────────────┬───────────────────────────────────────┘
                      │ Request with old token
                      ↓
┌─────────────────────────────────────────────────────────────┐
│         AXIOS INTERCEPTOR DETECTS 401                       │
│ Response: {error: "Token expired"}                         │
└─────────────────────┬───────────────────────────────────────┘
                      │ Automatic retry
                      ↓
┌─────────────────────────────────────────────────────────────┐
│      POST /api/auth/refresh-token                          │
│ Body: {refresh_token: "eyJhbGc..."}                       │
└─────────────────────┬───────────────────────────────────────┘
                      │ Backend validates refresh token
                      ↓
┌─────────────────────────────────────────────────────────────┐
│        RETURN NEW ACCESS TOKEN                              │
│ {                                                            │
│   "access_token": "newToken...",                           │
│   "expires_in": 86400                                       │
│ }                                                            │
└─────────────────────┬───────────────────────────────────────┘
                      │ Update localStorage
                      ↓
┌─────────────────────────────────────────────────────────────┐
│      RETRY ORIGINAL REQUEST WITH NEW TOKEN                  │
│ (Automatic, user doesn't notice)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. CORE USER JOURNEYS

### 3.1 First-Time User Journey (Complete Onboarding)
```
STEP 1: LANDING PAGE
├─ "Sign Up" button visible
└─ Intro videos/benefits shown

STEP 2: REGISTRATION
├─ Fill registration form
├─ Email verification (if required)
└─ Auto-login with new credentials

STEP 3: ACADEMIC PROFILE SETUP
├─ Semester: Select from dropdown (1-8)
├─ Department: Select/enter
├─ Year: Current year
└─ [Save Profile]

STEP 4: ADD SUBJECTS (1-6 required, can add up to 6)
├─ Subject Name: "Data Structures"
├─ Subject Code: "CS201"
├─ Goal Grade: "A"
├─ Scheduled Days: [Mon, Wed, Fri]
├─ [Add Subject Button]
└─ Repeat until all subjects added

STEP 5: SET ACADEMIC GOALS
├─ Current GPA: 3.2 (if available)
├─ Target GPA: 3.7
├─ Previous SGPA: 3.2 (if applicable)
└─ [Set Goals]

STEP 6: DASHBOARD GENERATES
├─ My Courses cards appear (4 subjects shown)
├─ Goal Tracker graph loads (auto-populated)
├─ AI generates initial recommendations
├─ Sample reminders created (assignments, exams)
└─ User sees complete dashboard

STEP 7: FIRST-TIME TOUR (OPTIONAL)
├─ Tooltip: "This is your GPA progress"
├─ Tooltip: "Click to see detailed performance"
├─ Tooltip: "Add marks here to get accurate predictions"
└─ Skip/Complete tour

RESULT: User is fully onboarded and can start tracking
```

### 3.2 Daily User Journey (Typical Session)
```
TIME: 8:00 AM - User opens SAPAS on phone

ACTION 1: VIEW DASHBOARD (30 seconds)
├─ Dashboard loads
├─ User glances at "My Courses" cards
├─ Sees "Goal Completion: 72%"
└─ Checks today's AI recommendations

ACTION 2: CHECK REMINDERS (1 minute)
├─ Notification badge shows "3"
├─ Clicks reminders section
├─ Sees: "Assignment due in 2 days"
│        "Quiz coming up tomorrow"
│        "Attend Algorithm class today"
└─ Marks important reminders

ACTION 3: VIEW DAILY GOALS (2 minutes)
├─ Clicks "Study Planner"
├─ Views today's study blocks
├─ Sees: 10:00-11:30 AM Data Structures (lecture)
│        14:00-15:30 Algorithms (self-study)
│        18:00-19:00 Quiz prep
└─ Confirms today's schedule

TIME: 10:00 AM - Attends class
TIME: 14:00 PM - Ready to self-study

ACTION 4: START FOCUS SESSION (45 minutes)
├─ Clicks "Start Focus Session"
├─ Selects subject: "Algorithms"
├─ Sets duration: 45 minutes
├─ Sets break: 15 minutes
├─ Pomodoro timer starts
├─ Studies with timer running
└─ Timer completes, records session

TIME: 15:00 PM - Takes break
TIME: 18:00 PM - Quiz prep session

ACTION 5: CHECK PROGRESS (Before bed)
├─ Opens Progress Tracking
├─ Views "Study Streak: 15 days"
├─ Sees weekly growth: +25% from last week
├─ Checks achievement progress
└─ Goes to sleep

RESULT: User completed one study day, logged 1.5 hours,
        maintained streak, received AI feedback
```

### 3.3 Weekly Planning Journey
```
SUNDAY EVENING: PLAN THE WEEK (15 minutes)

ACTION 1: REVIEW LAST WEEK (2 minutes)
├─ Go to Progress Tracking
├─ View "Weekly Study Growth"
├─ See: Monday: 2h, Tuesday: 2.5h, Wednesday: 1.5h (light day)
├─ Review which subjects benefited most
└─ Note trends

ACTION 2: CHECK UPCOMING EXAMS (3 minutes)
├─ Go to Study Planner
├─ View "Upcoming Exams" section
├─ See exam dates:
│   - Algorithms: May 25 (15 days away)
│   - Data Structures: May 28 (18 days away)
│   - Mathematics: June 1 (22 days away)
└─ Plan accordingly

ACTION 3: ADJUST PRIORITIES (3 minutes)
├─ Go to Performance Analysis
├─ View current performance:
│   - Data Structures: 85% (steady)
│   - Algorithms: 78% (needs attention)
│   - Mathematics: 81% (improving)
├─ Reorder priority list:
│   1. Algorithms (critical)
│   2. Mathematics (medium)
│   3. Data Structures (on track)
└─ Save priorities

ACTION 4: CREATE WEEKLY SCHEDULE (5 minutes)
├─ Go to Study Planner → Weekly Schedule
├─ For each subject, add study blocks:
│   Monday:
│   - 10:00-12:00 Lecture (Algorithms)
│   - 14:00-15:30 Self-study (Algorithms)
│   Tuesday:
│   - 10:00-11:30 Lecture (Data Structures)
│   - 18:00-19:30 Quiz prep (Mathematics)
│   ... (continue for week)
├─ Focus extra on Algorithms
└─ Save schedule

ACTION 5: SET WEEKLY GOALS (2 minutes)
├─ Go to Study Planner → Daily Goals
├─ Add weekly targets:
│   - Complete Algorithms assignment
│   - Review 2 chapters of Mathematics
│   - Maintain 90%+ attendance
│   - 3+ focus sessions daily
└─ Set up reminders

RESULT: Week is planned, priorities adjusted, ready for
        productive week ahead
```

### 3.4 Performance Analysis Journey (Mid-Semester)
```
TIME: May 15 (Mid-semester check-in)

ACTION 1: VIEW PERFORMANCE OVERVIEW (2 minutes)
├─ Go to Performance Analysis
├─ See current state:
│   Current GPA: 3.65
│   Target GPA: 3.7
│   Gap: 0.05 (almost there!)
│   Trend: Improving ↑
└─ Positive momentum visible

ACTION 2: VIEW SUBJECT-WISE ANALYTICS (3 minutes)
├─ Look at Analytics Table:
│   Data Structures: Attendance 92%, Quiz 87%, Marks 85 → Grade: A
│   Algorithms: Attendance 88%, Quiz 78%, Marks 78 → Grade: B+
│   Math: Attendance 95%, Quiz 85%, Marks 83 → Grade: A-
├─ See at a glance which needs attention
└─ Algorithms is weak area

ACTION 3: CHECK TREND ANALYSIS (2 minutes)
├─ View Trend Toggle: Switch to "SGPA Analytics"
├─ See semester GPA growth:
│   Week 1-2: 3.45 (classes starting)
│   Week 3-4: 3.52 (settling in)
│   Week 5-8: 3.65 (improvement)
├─ Visualize clear upward trend
└─ Switch back to "Subject Grades" view

ACTION 4: AI INSIGHTS (2 minutes)
├─ Floating AI Button shows:
│   ✓ "Excellent progress in Data Structures"
│   ⚠ "Algorithms needs 5+ more points to reach A-"
│   ✓ "Your attendance is excellent (91% average)"
│   💡 "Focus on Algorithms quiz prep this week"
└─ Read personalized feedback

ACTION 5: ADJUST TARGETS (2 minutes)
├─ Based on progress, update:
│   - New target GPA: 3.8 (upgraded)
│   - Previous GPA: 3.58
├─ System recalculates recommendations
└─ More aggressive targets set

ACTION 6: VIEW FORECAST (1 minute)
├─ See Forecast Grade System:
│   Data Structures: A (95% confident)
│   Algorithms: B+ (85% confident, could improve to A-)
│   Math: A- (90% confident)
│   Predicted GPA: 3.68 (close to target!)
└─ Feel motivated

RESULT: Mid-semester review complete, targets adjusted,
        strategy refined for second half
```

### 3.5 Progress Tracking Journey (Monthly Review)
```
TIME: May 30 (End of month)

ACTION 1: CHECK MOMENTUM (1 minute)
├─ Progress Tracking main page
├─ "Current Momentum" card shows:
│   - Study Streak: 28 days ✨
│   - Weekly Ranking: Top 8%
│   - Productivity Status: Excellent
└─ Feel proud of consistency

ACTION 2: WEEKLY GROWTH ANALYSIS (2 minutes)
├─ "Weekly Study Growth" chart shows:
│   Week 1: 8 hours
│   Week 2: 10.5 hours (+31%)
│   Week 3: 12 hours (+14%)
│   Week 4: 13.5 hours (+12%)
├─ Clear upward trend in study time
└─ Visual confirmation of progress

ACTION 3: CHECK MILESTONES (2 minutes)
├─ "Semester Milestones" section:
│   ✅ Completed: Midterm Exam Phase (May 1-15)
│   ✅ Completed: Project Submission (May 20)
│   🔄 In Progress: Assignment 3 (40% done)
│   ⏳ Upcoming: Final Exam Prep (June 1+)
│   ⏳ Upcoming: Internship Applications (June 15)
├─ Can see semester progression visually
└─ Click on milestone for details

ACTION 4: UNLOCK ACHIEVEMENTS (1 minute)
├─ "Achievement Badges" section shows:
│   🎖️ NEW: "Consistency Master" (20+ day streak)
│   🎖️ "Productivity Expert" (40+ focus sessions)
│   🎖️ LOCKED: "Attendance Champion" (Need 95%, at 91%)
│   🎖️ LOCKED: "Fast Learner" (Need 10% GPA improvement)
├─ Pop-up notification: "You unlocked Consistency Master!"
└─ Two badges earned this month!

ACTION 5: AI PROGRESS INSIGHTS (2 minutes)
├─ Floating AI shows monthly analysis:
│   📈 "Algorithm Lab performance improving steadily (78→84→87)"
│   💡 "Numerical Methods requires more assignment focus"
│   ✓ "Your consistency increased by 20% this month"
│   💪 "Attendance improvement may boost your GPA by 0.1"
├─ Personalized insights based on data
└─ Clear action items

ACTION 6: COURSE PROGRESS TABLE (2 minutes)
├─ Table view shows all subjects:
│   Subject | Attend% | Assign% | Grade | Status
│   DS      | 92      | 95      | A     | On Track
│   Algo    | 88      | 90      | B+    | Improving
│   Math    | 95      | 98      | A-    | On Track
├─ Performance Status color-coded
└─ See overall picture of progress

ACTION 7: EXPORT REPORT (1 minute)
├─ Click "Export Report"
├─ Select options:
│   Format: PDF
│   Include Charts: Yes
│   Include Badges: Yes
│   Semester: Current
├─ Report generated and downloaded
└─ Can share with mentors/parents

RESULT: Monthly review complete, achievements celebrated,
        clear picture of semester progress obtained
```

### 3.6 Settings & Customization Journey
```
ACTION 1: UPDATE PROFILE (3 minutes)
├─ Settings → Profile Management
├─ Update fields:
│   - Name: John Doe ✓
│   - Email: john.doe@college.edu ✓
│   - Bio: "Data science enthusiast"
│   - Upload new profile picture
│   - Semester: 3 (if changed)
│   - Department: Computer Science
├─ [Save Changes]
└─ Success message: "Profile updated"

ACTION 2: CUSTOMIZE APPEARANCE (1 minute)
├─ Settings → Appearance
├─ Toggle dark mode: OFF → ON
├─ See immediate visual change
├─ Toggle compact view: OFF → ON
├─ Dashboard becomes denser, more info visible
└─ Changes apply to all pages

ACTION 3: CONFIGURE AI INSIGHTS (1 minute)
├─ Settings → AI Configuration
├─ Enable/disable:
│   - AI Suggestions: ON ✓
│   - Recommendation Intensity: HIGH
│   - Productivity Insights: ON ✓
│   - Study Recommendations: ON ✓
├─ Save configuration
└─ AI starts giving stronger recommendations

ACTION 4: MANAGE NOTIFICATIONS (1 minute)
├─ Settings → Notifications
├─ Toggle notification types:
│   - Grade Updates: ON ✓
│   - Deadline Reminders: ON ✓
│   - AI Productivity Tips: ON ✓
│   - System Announcements: OFF
├─ (Backend ensures reminders still work)
└─ Preferences saved to database

ACTION 5: EXPORT DATA (2 minutes)
├─ Settings → Data Export
├─ Select export format: PDF
├─ Include: Charts, Badges, Analytics
├─ Click "Generate Report"
├─ File downloaded: "SAPAS_Report_May2025.pdf"
└─ Contains full semester analytics

ACTION 6: SECURITY CHECK (1 minute)
├─ Settings → Security
├─ View last login: May 30, 8:00 AM
├─ Active sessions: 1 (this device)
├─ Password last changed: 3 months ago
├─ [Change Password] available
└─ Everything looks secure

ACTION 7: DANGER ZONE (If needed)
├─ Settings → Danger Zone
├─ Option: Delete Account
├─ Required: Password confirmation
├─ Warning: "This action cannot be undone"
│   "You have 30 days to cancel"
├─ Only proceed if absolutely certain
└─ 30-day grace period before deletion

RESULT: User has fully customized their SAPAS experience
```

---

## 4. FEATURE-SPECIFIC FLOWS

### 4.1 Adding Marks & Updating Performance
```
USER ACTION: Click "Data Structures" course card on dashboard

FLOW:
1. Card expands/redirects to Performance Analysis
2. Find "Data Structures" in Subject Analytics table
3. See current state:
   ├─ Attendance: 90%
   ├─ Quiz Average: 85%
   ├─ Mid-term: 82%
   ├─ Current Marks: 84
   └─ Forecast Grade: A-

4. Click "Edit" button on Data Structures row
5. Modal opens with editable fields:
   ├─ Current Marks: 84 → 87 (quiz scores uploaded)
   ├─ Attendance: 90% → 92% (attended 2 more classes)
   ├─ Quiz Average: 85% → 86% (new quiz score)
   └─ Mid-term: 82% (unchanged)

6. Click "Save Changes"
7. Backend updates database:
   ├─ marks_and_attendance table updated
   ├─ Invalidate Redis cache
   ├─ Recalculate forecast grade (87 marks → A)
   ├─ Recalculate GPA impact
   └─ Check AI rules for new recommendations

8. Frontend updates immediately:
   ├─ Forecast Grade: A- → A ✨
   ├─ Goal Tracker graph updates
   ├─ GPA Progress: 3.65 → 3.68
   ├─ Dashboard cards refresh
   └─ AI generates new recommendation:
       "Excellent work in Data Structures! Keep it up."

RESULT: Single change cascades across all modules
```

### 4.2 Focus Session Timer Flow
```
USER ACTION: Click "Start Focus Session" in Study Planner

FLOW:
1. Focus Session Modal opens with:
   ├─ Subject: [Dropdown: Select Subject]
   ├─ Duration: [Slider: 45 minutes]
   ├─ Break Duration: [Slider: 15 minutes]
   └─ [Start Button]

2. User selects:
   ├─ Subject: Algorithms
   ├─ Duration: 45 minutes
   ├─ Break: 15 minutes

3. Click [Start]
4. Timer page loads with:
   ├─ Large countdown: 45:00
   ├─ Subject name: "Algorithms"
   ├─ Elapsed time: 0 seconds
   ├─ [Pause] [Reset] [Stop] buttons
   └─ Focus mode activated (disable notifications)

5. User studies for 45 minutes
6. Timer reaches 00:00
7. Modal pops: "Break time! 15:00 countdown started"
8. Break timer runs for 15 minutes
9. Break timer ends
10. Modal pops: "Ready for another session?"
    Options: [Start Another] [End Session]

11. User clicks [End Session]
12. Session logged to backend:
    POST /api/planner/focus-sessions
    {
      "subject_id": "uuid",
      "duration_minutes": 45,
      "break_minutes": 15,
      "started_at": "2025-05-30T14:00:00Z",
      "completed_at": "2025-05-30T15:00:00Z"
    }

13. Backend records:
    ├─ Creates focus_sessions record
    ├─ Updates weekly study hours
    ├─ Recalculates momentum
    ├─ Checks for badge unlocks
    └─ Updates progress analytics

14. Frontend shows completion:
    ├─ Toast: "Great session! 45 min recorded"
    ├─ Momentum card updates: "Study Streak: 15 days"
    ├─ Weekly hours updated: 12.5h → 13.25h
    └─ Return to Study Planner

RESULT: One focus session successfully tracked and analyzed
```

### 4.3 Creating a Reminder Flow
```
USER ACTION: Click [Add Reminder] in Dashboard

FLOW:
1. Reminder Modal opens with fields:
   ├─ Type: [Dropdown: Assignment/Midterm/Quiz/Study]
   ├─ Subject: [Dropdown: Select from user's subjects]
   ├─ Title: [Text field]
   ├─ Description: [Text area]
   ├─ Due Date: [Date picker]
   ├─ Due Time: [Time picker]
   ├─ Priority: [Radio: Low/Medium/High]
   ├─ Notify Days Before: [Spinner: 1/2/3]
   └─ [Create Reminder] [Cancel]

2. User fills:
   ├─ Type: Assignment
   ├─ Subject: Algorithms
   ├─ Title: Assignment 4 Submission
   ├─ Description: Implement graph algorithms
   ├─ Due Date: June 5, 2025
   ├─ Due Time: 23:59
   ├─ Priority: High
   └─ Notify Days Before: 2

3. Click [Create Reminder]
4. Frontend validation:
   ├─ ✓ All required fields filled
   ├─ ✓ Due date is in future
   └─ ✓ Title is not empty

5. POST /api/reminders sent to backend
6. Backend creates:
   ├─ reminders table entry
   ├─ scheduled reminder for June 3 (2 days before)
   ├─ adds to notification queue
   └─ updates Redis cache

7. Frontend receives 201 response
8. Reminder immediately appears in:
   ├─ Dashboard Reminders section
   ├─ Study Planner upcoming reminders
   ├─ Calendar/timeline view
   └─ Toast notification: "Reminder created"

RESULT: Reminder created and will alert user on June 3
```

---

## 5. ERROR HANDLING FLOWS

### 5.1 Validation Error Flow
```
USER ACTION: Try to add 7th subject (max is 6)

FLOW:
1. User clicks [Add Subject]
2. Fills form:
   ├─ Name: Statistics
   ├─ Code: STAT101
   └─ Goal Grade: A

3. Click [Save Subject]
4. Frontend sends POST /api/subjects
5. Backend validation fails:
   - Query: SELECT COUNT(*) FROM subjects 
             WHERE user_id = 'uuid' → Returns 6
   - Check: 6 < 6? NO → ERROR

6. Backend returns 409 Conflict:
   {
     "error": {
       "code": "MAX_SUBJECTS_EXCEEDED",
       "message": "Cannot add more than 6 subjects",
       "details": {
         "max_allowed": 6,
         "current_count": 6
       }
     }
   }

7. Frontend Axios interceptor catches 409
8. Redux dispatch error action
9. Error modal displays:
   ├─ Heading: "Cannot Add Subject"
   ├─ Message: "You've reached the maximum of 6 subjects"
   ├─ Suggestion: "Remove a subject to add a new one"
   └─ [OK] button

10. User clicks [OK]
11. Modal closes, user remains on Add Subject page

RESULT: Error handled gracefully, user understands limit
```

### 5.2 Authentication Error Flow (Token Expired)
```
USER ACTION: Dashboard open for 25+ hours without logout

FLOW:
1. User clicks something that requires API call
2. Frontend sends request with old access_token
3. Backend middleware verifies token:
   - Token.exp < Current_time → EXPIRED
4. Backend returns 401 Unauthorized:
   {
     "error": {
       "code": "TOKEN_EXPIRED",
       "message": "Access token has expired"
     }
   }

5. Frontend Axios interceptor:
   ├─ Detects 401 response
   ├─ Checks if refresh_token exists
   └─ Attempts refresh (auto-transparent)

6. POST /api/auth/refresh-token sent:
   {
     "refresh_token": "eyJhbGc..."
   }

7. Backend validates refresh token:
   ├─ Signature valid?
   ├─ Not revoked?
   ├─ Expiry valid?
   └─ If all pass: Generate new access_token

8. Backend returns 200:
   {
     "access_token": "newToken...",
     "expires_in": 86400
   }

9. Frontend updates:
   ├─ localStorage['access_token'] = newToken
   ├─ Retry original request with newToken
   └─ User doesn't notice

RESULT: Token refreshed seamlessly, user experience uninterrupted
```

### 5.3 Network Error Flow
```
USER ACTION: Internet drops while saving marks

FLOW:
1. User editing marks on slow 3G connection
2. Clicks [Save Changes]
3. PUT /api/performance/analytics sent
4. Network drops → Request hangs for 30s
5. Browser timeout after 30 seconds
6. Axios catch block triggered:
   ├─ Error type: Network Error
   ├─ No response from server
   └─ Trigger error handler

7. Frontend shows:
   ├─ Spinner stops
   ├─ Error toast: "Connection lost. Retrying..."
   ├─ [Retry] [Cancel] buttons appear
   └─ Form data preserved in state

8. User clicks [Retry]
9. Request resent when connection restored
10. Backend receives request → Processes normally
11. Frontend receives 200 response
12. Toast: "Changes saved successfully"

RESULT: User can retry, data not lost, good UX
```

---

## 6. DATA FLOW SEQUENCES

### 6.1 Dashboard Load Sequence
```
USER ACTION: Open SAPAS, navigate to Dashboard

TIME    COMPONENT              ACTION
────    ─────────────────────  ──────────────────────────────
0ms     Route Change           Navigate to /dashboard
50ms    Redux Dispatch         FETCH_DASHBOARD_START
100ms   API Call               GET /api/dashboard (with token)
        Backend Processing     
        - Query subjects (100ms)
        - Calculate GPA (50ms)
        - Generate recommendations (150ms)
        - Fetch reminders (50ms)
        - Fetch notifications (30ms)
250ms   Backend Response       200 OK + complete dashboard data
350ms   Redux Update           FETCH_DASHBOARD_SUCCESS
        - Store subjects in Redux
        - Store goal completion data
        - Store recommendations
        - Store reminders
400ms   React Re-render        Components receive new props
450ms   UI Display             Dashboard fully visible
        - Course cards animated in
        - Goal Tracker graph renders
        - AI recommendations displayed
        - Recent notifications shown

RESULT: Dashboard loads in ~450ms from route change
```

### 6.2 Mark Update Cascade
```
USER ACTION: Update marks in Performance Analysis

SEQUENCE:
1. User edits: Current Marks 84 → 87

2. Frontend sends: PUT /api/subjects/{id}
   {"current_marks": 87}

3. Backend receives update:
   ├─ UPDATE marks_and_attendance SET current_marks = 87
   ├─ SELECT * FROM subjects WHERE id = xyz
   ├─ Calculate new forecast grade (87 → A)
   ├─ Calculate predicted GPA impact
   ├─ Invalidate Redis cache
   ├─ Check AI rules for triggered recommendations
   └─ Return updated subject data

4. Frontend receives response:
   ├─ Update Redux: subject.current_marks = 87
   ├─ Update Redux: subject.forecast_grade = 'A'
   └─ Trigger re-render

5. React components update:
   ├─ Performance Analysis table shows A (was A-)
   ├─ Dashboard course card updates
   ├─ Goal Tracker graph recalculates
   ├─ AI recommendations refresh
   └─ Notifications generated if needed

6. Additional effects:
   ├─ If GPA changed, banner updates
   ├─ If badge unlocked, toast shows
   ├─ If risk status improved, alert removed
   └─ Student sees all changes in real-time

RESULT: Single update cascades through entire app
```

---

## 7. MOBILE vs DESKTOP FLOWS

### 7.1 Mobile-Specific Interactions
```
DASHBOARD MOBILE (375px width):

Layout: Vertical stack
├─ Header (Profile + Notifications)
├─ Search bar (full-width)
├─ Goal Completion card (full-width)
├─ Scrollable: My Courses (horizontal scroll, 2 visible)
├─ AI Recommendations (collapsed, tap to expand)
├─ Reminders (collapsed, tap to expand)
└─ Floating Action Button (bottom-right)
    └─ [+] Add quick task/goal

NAVIGATION: Bottom tab bar
├─ Dashboard (home icon)
├─ Performance (chart icon)
├─ Study Planner (calendar icon)
├─ Progress (graph icon)
└─ Settings (gear icon)

INTERACTIONS:
├─ Swipe left: Next course card
├─ Tap card: Expand details (modal)
├─ Long-press: Edit/delete options
├─ Floating button: Quick add modal
└─ Pull-to-refresh: Reload dashboard
```

### 7.2 Desktop-Specific Interactions
```
DASHBOARD DESKTOP (1920px width):

Layout: Multi-column grid
├─ Left sidebar (fixed):
│   ├─ Navigation menu
│   ├─ Quick stats
│   └─ Search bar
├─ Main content (scrollable):
│   ├─ Header (Profile + Notifications)
│   ├─ Goal Completion + Goal Tracker (2-col grid)
│   ├─ My Courses (grid: 3-4 columns)
│   ├─ AI Recommendations (full-width)
│   └─ Reminders (full-width)
└─ Right sidebar (collapsible):
    ├─ Recent activity
    ├─ Achievements preview
    └─ Quick links

INTERACTIONS:
├─ Hover: Tooltips appear on cards
├─ Click course card: Detailed panel opens (right slide)
├─ Keyboard shortcuts: D=Dashboard, P=Performance, etc.
├─ Drag-drop: Reorder reminders/goals
└─ Right-click: Context menus for actions
```

---

## 8. STATE MANAGEMENT (Redux) Structure
```
REDUX STORE:

/auth
├─ isAuthenticated: boolean
├─ user: {user_id, email, name, semester}
├─ tokens: {access_token, refresh_token}
└─ loading: boolean

/subjects
├─ list: [Subject]
├─ selectedSubject: Subject
├─ loading: boolean
└─ error: string

/dashboard
├─ courses: [CourseCard]
├─ goalCompletion: {percentage, predictedGPA, message}
├─ goalTracker: {labels, datasets}
├─ recommendations: [Recommendation]
├─ reminders: [Reminder]
├─ notifications: [Notification]
└─ loading: boolean

/performance
├─ gpa: {current, target, previous, trend}
├─ subjectsAnalytics: [SubjectAnalytic]
├─ performanceChart: ChartData
├─ trends: [Trend]
└─ loading: boolean

/planner
├─ weeklySchedule: [ScheduleBlock]
├─ focusSessions: [FocusSession]
├─ exams: [Exam]
├─ dailyGoals: [Goal]
├─ currentSession: FocusSession | null
└─ loading: boolean

/progress
├─ momentum: {streak, ranking, status}
├─ weeklyGrowth: ChartData
├─ milestones: [Milestone]
├─ badges: {earned: [Badge], locked: [Badge]}
├─ courseProgress: [CourseProgress]
└─ loading: boolean

/ui
├─ theme: 'light' | 'dark'
├─ compactView: boolean
├─ sidebarOpen: boolean
├─ modalOpen: string | null
└─ notifications: [Toast]

/preferences
├─ darkMode: boolean
├─ compactView: boolean
├─ aiEnabled: boolean
├─ aiIntensity: 'low' | 'medium' | 'high'
└─ notifications: {enabled: boolean}
```

---

**Document Owner:** Product & Engineering Team  
**Last Review:** May 2026  
**Next Review:** July 2026
```text id="jlwm37"
# UPDATED SAPAS APPLICATION FLOW

==================================================
1. PUBLIC USER FLOW
==================================================

User Opens SAPAS Website
↓
Landing Page Loads
↓
User Explores:
- Dashboard Preview
- Performance Analytics
- Study Planner
- AI Insights
- About SAPAS
↓
User Clicks:
- Login
OR
- Get Started For Free
↓
Navigate to Login Page

==================================================
2. LANDING PAGE NAVIGATION FLOW
==================================================

User Opens Landing Page
↓
User Scrolls Through Sections
↓
Navbar Navigation:
- Dashboard
- Performance
- Study Planner
- AI Insights
- About
↓
Smooth Scroll Navigation Triggered
↓
Corresponding Section Opens
↓
Animated Reveal Effects Triggered

==================================================
3. LOGIN AUTHENTICATION FLOW
==================================================

User Opens Login Page
↓
User Enters:
- Email
- Password
↓
System Validates Credentials
↓
Authentication Success
↓
User Session Created
↓
Dashboard Access Granted
↓
Redirect to Dashboard

==================================================
4. USER REGISTRATION FLOW
==================================================

User Opens Login Page
↓
User Clicks:
"Create Account"
↓
Registration Form Opens
↓
User Enters:
- Name
- Email
- Password
↓
Account Created Successfully
↓
Authentication Session Created
↓
User Redirected to Dashboard

==================================================
5. PROTECTED ROUTE FLOW
==================================================

User Attempts Dashboard Access
↓
System Checks Authentication State

IF Authenticated:
→ Allow Dashboard Access

IF Not Authenticated:
→ Redirect to Login Page

==================================================
6. THEME MANAGEMENT FLOW
==================================================

User Opens Settings
↓
User Toggles:
- Dark Mode
- Compact View
↓
Theme State Updates Globally
↓
UI Updates Across:
- Landing Page
- Dashboard
- Planner
- Analytics
- Settings
↓
Theme Stored in localStorage
↓
Theme Restored on Reload

==================================================
7. PROFILE SYNCHRONIZATION FLOW
==================================================

User Opens Settings
↓
User Updates Profile Information
↓
Global Profile State Updates
↓
Navbar Profile Updates
↓
Sidebar Profile Updates
↓
Data Stored in localStorage

==================================================
8. DASHBOARD MODULE FLOW
==================================================

Dashboard Loads
↓
Subject Data Retrieved
↓
Analytics Generated
↓
Goal Tracking Updated
↓
AI Insights Generated
↓
Charts Render Dynamically

==================================================
9. PERFORMANCE ANALYSIS FLOW
==================================================

User Opens Performance Analysis
↓
System Retrieves:
- Marks
- Attendance
- GPA Data
↓
Charts and Trends Generated
↓
Weak Subject Analysis Displayed
↓
Performance Forecast Generated

==================================================
10. STUDY PLANNER FLOW
==================================================

User Opens Study Planner
↓
Planner Data Loaded
↓
User Creates Study Sessions
↓
Focus Timer Activated
↓
Planner Progress Updated
↓
AI Productivity Insights Updated

==================================================
11. PROGRESS TRACKING FLOW
==================================================

User Opens Progress Tracking
↓
Milestones Retrieved
↓
Growth Analytics Calculated
↓
Study Streak Updated
↓
Achievement Cards Displayed

==================================================
12. SETTINGS MODULE FLOW
==================================================

User Opens Settings
↓
User Can Manage:
- Profile
- Theme
- Notifications
- Privacy
- AI Preferences
↓
Changes Applied Globally

==================================================
13. LOGOUT FLOW
==================================================

User Clicks Logout
↓
Authentication Session Cleared
↓
localStorage Cleared
↓
Redirect to Landing Page

==================================================
14. COMPLETE SAPAS APPLICATION FLOW
==================================================

Landing Page
↓
Login / Get Started
↓
Authentication
↓
Dashboard
↓
Performance Analysis
↓
Study Planner
↓
Progress Tracking
↓
Settings
↓
Logout
↓
Landing Page

==================================================
15. PUBLIC & PRIVATE ARCHITECTURE FLOW
==================================================

PUBLIC LAYER:
- Landing Page
- Login Page
- Create Account

PRIVATE LAYER:
- Dashboard
- Performance Analysis
- Study Planner
- Progress Tracking
- Settings

==================================================
16. LANDING PAGE SECTION FLOW
==================================================

Hero Section
↓
Dashboard Preview Section
↓
Performance Analytics Section
↓
Study Planner Showcase
↓
AI Insights Showcase
↓
About SAPAS Section
↓
CTA Section
↓
Footer

==================================================
17. STATE MANAGEMENT FLOW
==================================================

Zustand Global Store
↓
Centralized Data Management
↓
Shared Across:
- Dashboard
- Planner
- Analytics
- Progress
- Settings
↓
Real-Time UI Synchronization

==================================================
18. MOCK DATA FLOW
==================================================

Mock Data Loaded
↓
Dynamic Rendering Triggered
↓
Components Render Using:
- props
- map()
- state
↓
Backend APIs Will Replace Mock Data Later

==================================================
19. RESPONSIVE UI FLOW
==================================================

User Opens SAPAS
↓
Device Detection
↓
Responsive Layout Adjusted
↓
Mobile / Tablet / Desktop UI Rendered

==================================================
20. ANIMATION FLOW
==================================================

Page Load
↓
Framer Motion Animations Triggered
↓
Section Reveal Effects
↓
Hover Animations
↓
Smooth Scroll Effects
↓
Theme Transition Effects
```
