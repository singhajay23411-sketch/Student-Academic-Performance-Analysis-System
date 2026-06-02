# SAPAS: Student Academic Performance Analysis System
## Updated Product Requirements Document (PRD)

**Version:** 2.0 | **Last Updated:** May 2026 | **Status:** Enhanced with Public Landing & Auth

---

## 1. EXECUTIVE SUMMARY

SAPAS is now a **complete SaaS-style academic platform** with a public-facing landing experience, robust authentication system, and premium dashboard ecosystem. The system helps students monitor, analyze, and improve their academic performance through intelligent insights, predictive analytics, personalized recommendations, and real-time progress tracking.

### Key Updates in v2.0
- **Public Landing Page:** Marketing-focused homepage with smooth-scroll sections
- **Authentication Layer:** Integrated login/signup flow with session persistence
- **Protected Dashboard:** Route-based access control for authenticated users
- **Premium Visual Design:** Upgraded glassmorphism, modern gradients, cinematic feel
- **SaaS Architecture:** Public → Auth → Private ecosystem pattern

---

## 2. UPDATED APPLICATION FLOW

### 2.1 User Journey Paths

#### Path 1: New User Journey
```
Landing Page (Public)
  ↓
Click "Get Started For Free" / "Sign Up"
  ↓
Login Page (Auth)
  ├─ New user? Create Account
  ├─ Fill: Email, Password, Name, Semester, Department
  ├─ Form Validation
  └─ Register
  ↓
Academic Profile Setup (First Time)
  ├─ Select Semester (1-8)
  ├─ Select Department
  ├─ Set Current Year
  └─ [Continue to Dashboard]
  ↓
Add Subjects (1-6)
  ├─ Subject Name
  ├─ Subject Code
  ├─ Goal Grade
  ├─ Schedule
  └─ [Finish Setup]
  ↓
Dashboard (Protected) - Full Access
```

#### Path 2: Existing User Journey
```
Landing Page (Public)
  ↓
Click "Login"
  ↓
Login Page (Auth)
  ├─ Email
  ├─ Password
  ├─ Remember Me
  └─ [Sign In]
  ↓
Dashboard (Protected) - Full Access
```

#### Path 3: Returning User Journey
```
Open SAPAS URL
  ↓
Check localStorage for session token
  ↓
If valid token exists:
  └─ Redirect directly to /dashboard
  ↓
If expired/invalid:
  └─ Redirect to /login
  ↓
User continues from there
```

### 2.2 Route Structure (Updated)

```
PUBLIC ROUTES (No Authentication Required)
├─ / (Landing Page)
│  ├─ Hero Section
│  ├─ Features Section
│  ├─ How It Works Section
│  ├─ Pricing Section (Optional)
│  ├─ CTA Sections
│  └─ Footer
│
└─ /login (Authentication Page)
   ├─ Sign In Tab
   ├─ Create Account Tab
   ├─ Forgot Password Link
   └─ Social Login (Future)

PROTECTED ROUTES (Authentication Required)
├─ /dashboard (Main Dashboard)
├─ /analytics (Performance Analysis)
├─ /planner (Study Planner)
├─ /progress (Progress Tracking)
└─ /settings (User Settings)
```

---

## 3. LANDING PAGE SPECIFICATION

### 3.1 Purpose
- Primary entry point for all users
- Market SAPAS features and benefits
- Drive users to login/signup
- Professional, premium SaaS aesthetic
- Mobile-optimized

### 3.2 Page Structure

#### Section 1: Navigation Bar
```
Left: SAPAS Logo
Center: Navigation Links
  - Features (smooth scroll)
  - Dashboard (smooth scroll)
  - Analytics (smooth scroll)
  - AI Insights (smooth scroll)
  - About (smooth scroll)
Right: 
  - Login Button → /login
  - Get Started Button → /login?tab=signup
```

#### Section 2: Hero Section
```
Heading: "Master Your Academic Journey"
Subheading: "Intelligent Analytics • Predictive Insights • Personalized Support"
Visual: Premium gradient background + animated elements
CTAs:
  - "Get Started For Free" (Primary) → /login?tab=signup
  - "View Demo" (Secondary) → Demo video/section
```

#### Section 3: Features Section
```
4-6 Feature Cards showcasing:
- Performance Intelligence
- Academic Forecasting
- Goal Tracking
- AI Recommendations
- Progress Monitoring
- Achievement System

Each card:
- Icon
- Title
- Description
- Hover animation
```

#### Section 4: How It Works Section
```
4-Step Process:
1. Sign Up & Profile Setup
   - Create account
   - Add academic info
2. Add Your Subjects
   - Import or manually add
   - Set goals
3. Track Performance
   - Update marks
   - Monitor progress
4. Get AI Insights
   - Receive recommendations
   - Improve continuously
```

#### Section 5: Benefits Section
```
Grid of benefits:
- Real-time analytics
- Predictive grading
- Personalized recommendations
- Track your streak
- Unlock achievements
- Study optimization
- GPA forecasting
- Goal achievement
```

#### Section 6: Testimonials Section (Optional)
```
Student testimonials with:
- Profile picture
- Name & semester
- Quote
- GPA improvement stat
```

#### Section 7: CTA Section
```
"Ready to Transform Your Academics?"
Primary Button: "Start Free Today" → /login?tab=signup
Secondary Button: "Learn More" → scroll to features
```

#### Section 8: Footer
```
Company: About, Blog, Contact
Product: Features, Pricing, Security
Legal: Privacy, Terms, Cookies
Social: LinkedIn, Twitter, GitHub
```

### 3.3 Design Requirements
- **Theme:** Premium dark/light mode
- **Colors:** Gradient blues, purples, golds (from uploaded design)
- **Typography:** Modern, clean fonts (Poppins, Sora)
- **Animations:** Smooth transitions, scroll reveals
- **Responsiveness:** Mobile-first design
- **Glassmorphism:** Modern card design with backdrop blur

---

## 4. LOGIN PAGE SPECIFICATION

### 4.1 Purpose
- Unified authentication (login + signup)
- Secure credential management
- Session persistence
- Route protection
- Premium SaaS experience

### 4.2 Page Layout

#### Left Column (Optional on Desktop)
```
Visual Element:
- Interactive graphic
- Animated lamp (from design)
- Branding
- Feature highlight
```

#### Right Column: Authentication Card
```
Logo Section:
- SAPAS Icon + Text

Tab Navigation:
├─ Sign In Tab (Default)
│  ├─ Email Input
│  ├─ Password Input
│  ├─ Remember Me Checkbox
│  ├─ Forgot Password Link
│  └─ Sign In Button
│
└─ Create Account Tab
   ├─ Email Input (validation)
   ├─ Password Input (strength meter)
   ├─ Confirm Password
   ├─ Full Name
   ├─ Semester Dropdown
   ├─ Department Field
   └─ Sign Up Button

Footer:
- Link between tabs
- Social login options (future)
```

### 4.3 Validation Rules

#### Sign In
- Email: Valid format required
- Password: Min 8 characters
- Error messages shown inline
- Rate limiting: Max 5 attempts in 15 min

#### Create Account
- Email: Unique, valid format, college domain (optional)
- Password: 
  - Min 8 characters
  - 1 uppercase letter
  - 1 number
  - 1 special character
- Confirm Password: Must match
- Name: Non-empty
- Semester: 1-8 required
- Department: Required

### 4.4 Features
- **Dark Mode:** Full theme support
- **Remember Me:** localStorage persistence (7 days)
- **Forgot Password:** Email recovery flow
- **Account Creation:** Registration with validation
- **Responsive:** Mobile-optimized layout
- **Animations:** Smooth transitions, loading states
- **Error Handling:** Clear error messages
- **Success States:** Confirmation feedback

---

## 5. AUTHENTICATION SYSTEM

### 5.1 Authentication Flow

```
User Submits Credentials
  ↓
Frontend Validation
  ├─ Email format
  ├─ Password strength
  └─ Required fields
  ↓
POST /api/auth/login OR /api/auth/register
  ↓
Backend Validation
  ├─ Database check
  ├─ Password verification
  └─ Email uniqueness
  ↓
If Valid:
  ├─ Generate JWT tokens
  ├─ Access Token (24h)
  ├─ Refresh Token (7d)
  └─ Return to Frontend
  ↓
Frontend Session Management
  ├─ Store Access Token in localStorage
  ├─ Store Refresh Token in httpOnly cookie
  ├─ Set Auth State (Zustand)
  ├─ Redirect to /dashboard
  └─ Initialize user profile
```

### 5.2 Session Persistence

```
Initial Load:
  ↓
Check localStorage for token
  ↓
If Token Exists:
  ├─ Verify token validity
  ├─ Check expiry
  └─ If valid → Auto-login to /dashboard
  ↓
If Token Invalid/Expired:
  ├─ Attempt refresh with refresh_token
  ├─ If success → Update tokens, continue
  └─ If fail → Redirect to /login
```

### 5.3 Route Protection

```
Protected Route Access:
  ↓
Check if user authenticated
  ├─ Valid token?
  ├─ Non-expired?
  └─ User profile loaded?
  ↓
If YES: Grant access
If NO: Redirect to /login
```

---

## 6. UPDATED CORE MODULES (Preserved from v1.0)

### 6.1 Dashboard Module (Protected)
- My Courses with dynamic subject cards
- Goal Completion visualization
- AI Recommendations panel
- Reminders management
- Real-time notifications
- Performance overview

### 6.2 Performance Analysis Module (Protected)
- GPA tracking (current, target, previous)
- Subject-wise analytics table
- Performance trends (SGPA vs grades)
- Forecast grades
- AI Insight Engine
- Trend monitoring

### 6.3 Study Planner Module (Protected)
- Weekly schedule management
- Focus Session Pomodoro timer
- Upcoming exams tracking
- Daily goals checklist
- AI smart suggestions
- Subject priority system

### 6.4 Progress Tracking Module (Protected)
- Momentum/streak tracking
- Weekly study growth analytics
- Semester milestones
- Achievement badges
- Course progress table
- Export functionality

### 6.5 Settings Module (Protected)
- Profile management
- Appearance customization
- AI configuration
- Notification preferences
- Data export
- Account management

---

## 7. DESIGN SYSTEM UPDATES

### 7.1 Color Palette (Updated Premium Theme)

**Dark Mode:**
```
Primary: #2563eb (Deep Blue)
Secondary: #7c3aed (Purple)
Accent: #f5b300 (Gold)
Background: #0f172a (Dark Navy)
Surface: #1e293b (Card Background)
Text Primary: #ffffff
Text Secondary: #cbd5e1
```

**Light Mode:**
```
Primary: #1e40af (Bright Blue)
Secondary: #6d28d9 (Deep Purple)
Accent: #f59e0b (Warm Gold)
Background: #f9fafb (Off-White)
Surface: #ffffff
Text Primary: #1a1a1a
Text Secondary: #4b5563
```

### 7.2 Typography
- **Headings:** Poppins (700, 800)
- **Body:** Sora (400, 500, 600)
- **Mono:** Fira Code (Code snippets)

### 7.3 Components
- **Cards:** Glassmorphism with backdrop blur
- **Buttons:** Gradient backgrounds, smooth hover effects
- **Inputs:** Clean borders, focus states
- **Navigation:** Sticky navbar with logo
- **Modals:** Centered, overlay with backdrop blur

### 7.4 Animations
- **Page Transitions:** Fade + slide
- **Hover Effects:** Scale, color change
- **Section Reveals:** Stagger animations on scroll
- **Theme Switch:** Smooth 300ms transition
- **Loading States:** Spinner animations

---

## 8. RESPONSIVE DESIGN

### Breakpoints
```
Mobile: 0px - 640px
Tablet: 641px - 1024px
Desktop: 1025px - 1920px
Ultra-Wide: 1921px+
```

### Mobile Landing Page
```
- Single column layout
- Full-width cards
- Hamburger menu
- Simplified navigation
- Touch-friendly CTAs
- Vertical scrolling
```

### Mobile Auth Page
```
- Full-screen layout
- No sidebar on small screens
- Bottom-aligned footer
- Large input fields
- Touch-friendly buttons
```

---

## 9. USER EXPERIENCE FLOWS

### 9.1 New User Onboarding (Updated)
```
1. Land on Landing Page
   - Browse features
   - Read benefits
   - Build confidence

2. Click "Get Started For Free"
   - Redirected to /login?tab=signup

3. Create Account
   - Fill registration form
   - Instant validation
   - Clear error messages

4. Successful Registration
   - Email verification (optional)
   - Auto-login
   - Redirect to profile setup

5. Profile Setup
   - Add academic info
   - Select semester/department
   - Skip or complete later option

6. Add Subjects (1-6)
   - Name, code, schedule
   - Goal grade
   - Can skip and add later

7. Dashboard Access
   - See dashboard with initial data
   - AI generates recommendations
   - Start tracking immediately
```

### 9.2 Returning User Experience
```
1. Visit landing page
2. Click "Login"
3. Enter credentials
4. Immediate dashboard access
5. All data preserved
6. Continue where left off
```

### 9.3 Session Management
```
- Session persists across browser refresh
- Remember Me for 7 days
- Auto-logout on 24h inactivity
- Secure logout clears tokens
- Login link in nav when logged out
```

---

## 10. FEATURE MATRIX

| Feature | Landing Page | Login | Dashboard | Protected Routes |
|---------|-------------|-------|-----------|-----------------|
| Public Access | ✅ | ✅ | ❌ | ❌ |
| Authentication | ❌ | ✅ | ✅ | ✅ |
| Smooth Scroll Nav | ✅ | ❌ | ❌ | ❌ |
| Dark Mode | ✅ | ✅ | ✅ | ✅ |
| Responsive | ✅ | ✅ | ✅ | ✅ |
| Session Persist | ❌ | ✅ | ✅ | ✅ |
| Token Refresh | ❌ | ✅ | ✅ | ✅ |

---

## 11. SECURITY CONSIDERATIONS

### 11.1 Frontend Security
- JWT tokens stored securely
- Password never stored locally
- Refresh tokens in httpOnly cookies
- Input validation on all forms
- XSS protection via React escaping
- CSRF tokens for state-changing operations

### 11.2 Authentication Security
- Passwords hashed with bcrypt (backend)
- Min 8 character passwords
- Rate limiting on login attempts
- Email verification for signups
- Session timeout (24 hours)
- Logout clears all tokens

### 11.3 Data Protection
- HTTPS/TLS only
- Sensitive data encrypted
- Audit logs maintained
- GDPR compliance
- Data deletion on account removal

---

## 12. PERFORMANCE TARGETS

### Landing Page
- Load Time: < 2.5s
- First Contentful Paint: < 1.5s
- Smooth scrolling: 60 FPS
- Mobile: < 3s on 4G

### Login Page
- Load Time: < 1.5s
- Form submission: < 2s (with backend)
- Validation: Real-time, instant feedback

### Dashboard (Protected)
- Initial load: < 2s
- Data refresh: < 1s
- Animation smooth: 60 FPS

---

## 13. SUCCESS METRICS

### User Acquisition
- Landing page bounce rate: < 40%
- Signup conversion: > 25%
- Login success rate: > 98%

### User Retention
- Session persistence: > 90%
- Return rate: > 60% weekly
- Churn rate: < 5% monthly

### User Engagement
- Dashboard daily visits: > 4
- Feature adoption: > 70%
- Average session: > 15 minutes

---

## 14. ROADMAP & FUTURE ENHANCEMENTS

### Phase 1 (Current)
- ✅ Landing Page
- ✅ Authentication System
- ✅ Protected Dashboard Ecosystem
- ✅ Premium Visual Design

### Phase 2 (Next)
- [ ] Social Login (Google, GitHub)
- [ ] Email Verification
- [ ] Two-Factor Authentication
- [ ] Password Reset Flow
- [ ] Admin Portal

### Phase 3
- [ ] Mobile Apps (iOS/Android)
- [ ] Advanced Analytics
- [ ] Collaboration Features
- [ ] Third-party Integrations
- [ ] API Access

---

## 15. COMPONENT & STATE MANAGEMENT

### Zustand Stores (Preserved & Enhanced)
```
auth.ts
  ├─ isAuthenticated
  ├─ user profile
  ├─ tokens
  ├─ login()
  ├─ logout()
  └─ refreshToken()

theme.ts
  ├─ isDarkMode
  ├─ isCompactMode
  ├─ toggleTheme()
  └─ toggleCompactMode()

ui.ts
  ├─ notifications
  ├─ modals
  ├─ showNotification()
  └─ closeModal()

dashboard.ts
  ├─ subjects
  ├─ goals
  ├─ recommendations
  └─ fetchDashboard()
```

### Reusable Components (Enhanced)
```
Layout/
  ├─ Navigation.tsx (Updated with auth links)
  ├─ Sidebar.tsx (Protected only)
  ├─ Footer.tsx (Updated)
  └─ ProtectedRoute.tsx (NEW)

Common/
  ├─ Button.tsx (Enhanced styles)
  ├─ Card.tsx (Glassmorphism)
  ├─ Input.tsx (Auth-optimized)
  └─ Modal.tsx

Auth/ (NEW)
  ├─ LoginForm.tsx
  ├─ SignupForm.tsx
  └─ ForgotPasswordForm.tsx

Landing/ (NEW)
  ├─ HeroSection.tsx
  ├─ FeaturesSection.tsx
  ├─ HowItWorksSection.tsx
  ├─ BenefitsSection.tsx
  └─ CTASection.tsx
```

---

## 16. APPENDIX: GLOSSARY

| Term | Definition |
|------|-----------|
| Landing Page | Public-facing homepage for new users |
| Authentication | Login/signup system with token management |
| Session | Authenticated user's active state |
| Protected Route | Dashboard accessible only to logged-in users |
| Smooth Scroll | Navigation links scroll to page sections |
| Glassmorphism | Modern design with blur and transparency |
| JWT | JSON Web Token for authentication |
| Remember Me | Persistent login for 7 days |

---

**Document Owner:** Product Team  
**Version:** 2.0 (Enhanced with Landing & Auth)  
**Last Review:** May 2026  
**Next Review:** July 2026
# UPDATED PRD CHANGES FOR SAPAS

```text id="jlwm38"
==================================================
UPDATED MODULES
==================================================

The SAPAS platform now contains the following modules:

1. Landing Page
2. Login / Authentication System
3. Dashboard
4. Performance Analysis
5. Study Planner
6. Progress Tracking
7. Settings

==================================================
NEW LANDING PAGE MODULE
==================================================

The Landing Page acts as the public-facing introduction of SAPAS.

Purpose:
- showcase SAPAS features
- introduce the platform professionally
- improve user onboarding
- create SaaS-style product experience

Features:
- Hero Section
- Dashboard Preview
- Performance Analytics Showcase
- Study Planner Showcase
- AI Insights Showcase
- About SAPAS Section
- CTA Section
- Footer

The landing page uses:
- smooth-scroll navigation
- premium glassmorphism UI
- responsive layouts
- Framer Motion animations

==================================================
NEW LOGIN & AUTHENTICATION MODULE
==================================================

The Login Page allows users to securely access the SAPAS dashboard ecosystem.

Features:
- email login
- password authentication
- remember me
- forgot password
- create account system
- protected dashboard access
- session persistence
- logout system

==================================================
UPDATED APPLICATION FLOW
==================================================

New User Flow:

Landing Page
↓
Login / Get Started
↓
Authentication
↓
Dashboard Access
↓
Analytics & Productivity Modules

==================================================
UPDATED UI SYSTEM
==================================================

The SAPAS UI system now supports:
- dark mode
- light mode
- compact view
- premium glassmorphism design
- animated transitions
- responsive SaaS layouts

==================================================
UPDATED NAVIGATION SYSTEM
==================================================

Landing page navigation now uses smooth-scroll section navigation.

Navbar Sections:
- Dashboard
- Performance
- Study Planner
- AI Insights
- About

Each section smoothly scrolls to corresponding landing page sections.

==================================================
UPDATED USER EXPERIENCE GOALS
==================================================

The platform now aims to provide:
- premium SaaS experience
- modern dashboard aesthetics
- immersive onboarding
- cinematic dark mode
- responsive cross-device usability

==================================================
UPDATED FRONTEND FEATURES
==================================================

Frontend now includes:
- public marketing layer
- authentication flow
- protected dashboard system
- centralized theme management
- global profile synchronization
- animated section reveals
- dynamic rendering system

==================================================
UPDATED STATE MANAGEMENT
==================================================

SAPAS uses centralized Zustand state management for:
- profile synchronization
- theme management
- notifications
- analytics
- planner data
- authentication state

==================================================
UPDATED THEME SYSTEM
==================================================

The application now supports:
- global dark mode
- global light mode
- compact dashboard mode
- localStorage theme persistence
- animated theme transitions

==================================================
UPDATED RESPONSIVENESS REQUIREMENTS
==================================================

The application supports:
- mobile devices
- tablets
- laptops
- desktop systems
- ultra-wide screens

==================================================
UPDATED PROJECT OBJECTIVE
==================================================

SAPAS is now a complete SaaS-style academic productivity and analytics platform that combines:
- academic tracking
- AI-based insights
- productivity management
- planner systems
- centralized dashboards
- authentication systems
- premium frontend experience
```

---

# UPDATED TECHNICAL REQUIREMENTS DOCUMENT (TRD) CHANGES

```text id="jlwm39"
==================================================
UPDATED FRONTEND ARCHITECTURE
==================================================

Frontend now contains:

Public Layer:
- Landing Page
- Login Page
- Registration Flow

Private Layer:
- Dashboard
- Performance Analysis
- Study Planner
- Progress Tracking
- Settings

==================================================
UPDATED ROUTING STRUCTURE
==================================================

/                → Landing Page
/login           → Login Page
/dashboard       → Dashboard
/analytics       → Performance Analysis
/planner         → Study Planner
/progress        → Progress Tracking
/settings        → Settings

==================================================
UPDATED FRONTEND STACK
==================================================

Frontend Technologies:
- React.js
- Vite
- Tailwind CSS
- Zustand
- Framer Motion
- Recharts
- React Router DOM

==================================================
UPDATED LANDING PAGE REQUIREMENTS
==================================================

Landing Page Features:
- smooth-scroll navigation
- responsive SaaS layout
- animated reveal effects
- premium hero section
- feature showcase sections
- CTA interactions
- glassmorphism design

==================================================
UPDATED LOGIN SYSTEM REQUIREMENTS
==================================================

Authentication Features:
- login system
- create account flow
- protected routes
- localStorage session persistence
- logout system
- auth state synchronization

==================================================
UPDATED THEME SYSTEM
==================================================

Global Theme System:
- dark mode
- light mode
- compact mode
- global UI synchronization
- animated theme transitions

Theme state is stored using:
- Zustand
- localStorage

==================================================
UPDATED STATE MANAGEMENT
==================================================

Zustand manages:
- profile data
- theme state
- notifications
- planner data
- analytics data
- authentication state

==================================================
UPDATED ANIMATION SYSTEM
==================================================

Framer Motion is used for:
- section reveal animations
- hover effects
- smooth page transitions
- theme transitions
- sidebar interactions
- card animations

==================================================
UPDATED COMPONENT SYSTEM
==================================================

Reusable Components:
- cards
- charts
- buttons
- inputs
- sidebar
- navbar
- modals
- tables
- analytics widgets

==================================================
UPDATED RESPONSIVE REQUIREMENTS
==================================================

The frontend must support:
- mobile responsiveness
- tablet responsiveness
- desktop responsiveness
- ultra-wide responsiveness

==================================================
UPDATED SECURITY REQUIREMENTS
==================================================

Authentication system must support:
- route protection
- session persistence
- secure login flow
- logout functionality
- future JWT integration

==================================================
UPDATED APPLICATION ARCHITECTURE
==================================================

SAPAS now follows:

Public SaaS Layer
↓
Authentication Layer
↓
Protected Dashboard Ecosystem
↓
Analytics & Productivity Modules

==================================================
UPDATED USER FLOW REQUIREMENTS
==================================================

Landing Page
↓
Login / Get Started
↓
Authentication
↓
Dashboard Access
↓
Module Navigation

==================================================
UPDATED PERFORMANCE REQUIREMENTS
==================================================

The application must:
- load smoothly
- maintain fast transitions
- support dynamic rendering
- preserve responsive performance
- support animated UI interactions

==================================================
UPDATED PROJECT STRUCTURE
==================================================

src/
│
├── components/
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
└── styles/

==================================================
UPDATED FINAL OBJECTIVE
==================================================

SAPAS is now a modern SaaS-style academic intelligence platform featuring:
- premium onboarding experience
- authentication flow
- protected dashboard system
- centralized analytics
- productivity tools
- responsive architecture
- scalable frontend system
- future backend integration support
```
