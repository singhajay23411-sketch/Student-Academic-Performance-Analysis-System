# SAPAS User Flow Documentation

## 1. Visitor Flow

1. User opens the landing page.
2. User reviews project sections and navigation.
3. User selects login or signup.
4. User enters the demo portal.

## 2. Login Flow

1. User enters an email on the login page.
2. The frontend calls the Zustand `login` action.
3. The store normalizes the email.
4. Existing user data is loaded from `usersData`, or a new default profile is created.
5. Streak data is updated.
6. `isAuthenticated` becomes true.
7. The route layer redirects the user to `/dashboard`.

## 3. Dashboard Flow

1. Dashboard reads metrics, subjects, reminders, and insights from the store.
2. User can add, edit, or delete subjects.
3. User can set academic goals.
4. User can add or manage reminders.
5. Changes are written to the active user namespace and persisted to localStorage.

## 4. Performance Analysis Flow

1. User opens Performance Analysis.
2. Page displays score, attendance, CGPA, and subject analytics.
3. User can update target or previous GPA values.
4. User can reorder subject priority.
5. Updated values are persisted through Zustand.

## 5. Study Planner Flow

1. User opens Study Planner.
2. User can create and complete study tasks.
3. User can add exams.
4. User can generate a smart weekly schedule.
5. User can set rest days.
6. User can complete focus sessions.
7. Focus and planner data is persisted locally.

## 6. Progress Tracking Flow

1. User opens Progress Tracking.
2. Page displays streaks, study log, badges, milestones, and progress insights.
3. User can create, update, complete, or delete milestones.
4. User can export a progress report.
5. Milestone and study log data persists locally.

## 7. Settings Flow

1. User opens Settings.
2. User can update profile details.
3. User can toggle theme.
4. User can review and export local data.
5. Profile changes persist locally.

## 8. Logout Flow

1. User selects logout from the sidebar.
2. `isAuthenticated` becomes false.
3. Active page state resets to demo fallback values.
4. Email-specific data remains stored in `usersData`.
5. User returns to the public landing/login flow.

## 9. Data Loss Scenarios

Data may disappear when:

- Browser localStorage is cleared.
- User logs in with a different email.
- User switches browsers or devices.
- The app is opened in a private browsing session.
- The localStorage key is manually removed.

Production fix:

- Move persistence to backend APIs and PostgreSQL.
- Keep localStorage only for short-lived auth/session metadata.
