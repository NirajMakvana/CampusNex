# CampusNex — Campus Management System

A full-stack campus management platform for colleges. Handles students, faculty, attendance, exams, fees, hostel, library, timetable, admissions, and more — all in one place.

> Built with React 19 + Node.js/Express + MongoDB. Supports 4 roles: Super Admin, Admin, Faculty, Student — each with a tailored dashboard and access controls.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| Backend | Node.js, Express 5 |
| Database | MongoDB + Mongoose |
| Auth | JWT + HTTP-only cookies |
| File Uploads | Cloudinary + Multer |
| Email | Nodemailer (Gmail SMTP) |
| Charts | Recharts |
| PDF Export | jsPDF + html2canvas |
| Excel Export | xlsx |
| Cron Jobs | node-cron |
| Logging | Winston + Morgan |
| Security | Helmet, express-rate-limit |

---

## Project Structure

```
CampusNex/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── api/             # Axios instance
│   │   ├── components/      # Layout, Sidebar, ProtectedRoute, HodDashboard
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # All page components
│   │   │   ├── admissions/  # Admin admission tabs
│   │   │   └── public/      # Public-facing website pages
│   │   └── utils/           # PDF export helper
│   └── vite.config.js
└── server/                  # Express backend
    ├── config/              # DB + Cloudinary config
    ├── controllers/         # Route handlers
    ├── middleware/          # Auth, error handler, upload
    ├── models/              # Mongoose schemas
    ├── routes/              # Express routers
    ├── jobs/                # Cron jobs (attendance alert, fee reminder)
    ├── utils/               # Token, email, logger, activity log
    └── server.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)
- Gmail app password (for email notifications)

### 1. Clone & Install

```bash
git clone <repo-url>
cd CampusNex
```

**Server:**

```bash
cd server
npm install
```

**Client:**

```bash
cd client
npm install --legacy-peer-deps
```

### 2. Configure Environment

Copy `.env.example` to `.env` inside `server/`:

```bash
cp server/.env.example server/.env
```

Fill in the values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/CampusNex-CMS
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 3. Run

**Server** (port 5000):

```bash
cd server
npm run dev
```

**Client** (port 5173):

```bash
cd client
npm run dev
```

The client proxies all `/api` requests to `http://localhost:5000` via `vite.config.js`.

---

## First-Time Setup

Create the superadmin account by running the seed script:

```bash
cd server
node createSuperAdmin.js
```

Default superadmin credentials:
```
Email:    campusnex@edu.in
Password: CampusNex@123
```

### Seed Demo Data (optional)

Run these in order to populate the database with demo data:

```bash
node seedData.js          # Departments, faculty, students (BCA)
node seedBBA.js           # BBA department data
node seedTimetable.js     # Timetable entries
node seedExams.js         # Exam schedules + results
node seedFees.js          # Fee structures + assignments
node seedAttendance.js    # Attendance records
node seedLibrary.js       # Books + issue records
node seedNotices.js       # Notice board entries
node seedHostel.js        # Hostel rooms + allocations
node seedLeaves.js        # Leave requests
node seedBBAHostelLibrary.js  # BBA hostel + library data
```

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | campusnex@edu.in | CampusNex@123 |
| BCA HOD | herry@hod.campusnex.edu | Faculty@123 |
| BBA HOD | meera@hod.bba.campusnex.edu | Faculty@123 |
| Faculty (others) | — | Faculty@123 |
| Student | — | Campus@123 |

---

## Modules & Role Access

| Module | Super Admin | Admin | Faculty | Student |
|--------|:-----------:|:-----:|:-------:|:-------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Students | ✅ | ✅ | — | — |
| Faculty | ✅ | ✅ | — | — |
| Departments | ✅ | ✅ | — | — |
| Courses | ✅ | ✅ | ✅ | — |
| Timetable | ✅ | ✅ | ✅ | ✅ |
| Attendance | ✅ | ✅ | ✅ (mark) | ✅ (view own) |
| Exams & Results | ✅ | ✅ | ✅ (enter marks) | ✅ (view own) |
| Fees | ✅ | ✅ | — | ✅ (view own) |
| Library | ✅ | ✅ | — | ✅ (my books) |
| Hostel | ✅ | ✅ | — | ✅ (if allocated) |
| Notices | ✅ | ✅ | ✅ | ✅ |
| Leave Requests | ✅ | ✅ | ✅ | — |
| Reports | ✅ | ✅ | — | — |
| Admissions (Admin) | ✅ | ✅ | — | — |
| Testimonials | ✅ | ✅ | — | — |
| Website Settings | ✅ | ✅ | — | — |
| Profile | ✅ | ✅ | ✅ | ✅ |

---

## Public Website Pages

CampusNex includes a fully functional public-facing website (no login required):

| Route | Page |
|-------|------|
| `/home` | Home — hero, stats, programs, testimonials |
| `/about` | About — college info, principal's message |
| `/courses-info` | Programs & courses listing |
| `/admissions` | Admission info, eligibility, process |
| `/admissions/apply` | Online application form |
| `/admissions/track` | Track application status by ID |
| `/faculty-info` | Faculty directory |
| `/campus-life` | Hostel, library, activities |
| `/contact` | Contact form + map |

---

## API Overview

All routes are prefixed with `/api`.

| Prefix | Description |
|--------|-------------|
| `/api/auth` | Login, logout, forgot/reset password, avatar, admin management |
| `/api/students` | CRUD, bulk import, promote, avatar upload |
| `/api/faculty` | CRUD, toggle status, workload |
| `/api/departments` | CRUD with student/faculty/course counts |
| `/api/courses` | CRUD, syllabus upload, workload |
| `/api/attendance` | Mark, view, monthly report, stats |
| `/api/exams` | Schedules, results, marksheets, seating plans, revaluation |
| `/api/fees` | Structures, bulk assign, defaulters, student fees, stats |
| `/api/notices` | CRUD, pin/unpin, attachments |
| `/api/timetable` | CRUD with conflict detection |
| `/api/library` | Books, issue/return, reservations, stats, my-issues |
| `/api/hostel` | Rooms, allocate, transfer, maintenance, mess menu |
| `/api/leaves` | Submit, approve/reject leave requests |
| `/api/activity` | Activity log (admin audit trail) |
| `/api/revaluation` | Revaluation requests (student) |
| `/api/testimonials` | Testimonials management |
| `/api/website` | College website settings (public + admin) |
| `/api/admissions` | Applications, merit list, settings, contact messages |
| `/api/public` | Public endpoints (stats, programs, faculty, notices) |
| `/api/health` | Health check |

---

## Deployment

### Frontend → Vercel

1. Connect your repo to Vercel
2. Set root directory to `CampusNex/client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. `vercel.json` is already configured for SPA routing

### Backend → Render

1. Connect your repo to Render
2. `render.yaml` is already configured
3. Set all environment variables in Render dashboard
4. Set `CLIENT_URL` to your Vercel domain (e.g. `https://campusnex.vercel.app`)

### Production Client Config

Update `vite.config.js` proxy target to your Render URL, or set `VITE_API_URL` as an env variable and update the Axios base URL in `src/api/axios.js`.

---

## Key Features

- Role-based access control (superadmin / admin / faculty / student)
- HTTP-only cookie auth — no localStorage token exposure
- Public-facing college website with online admission form
- Online application tracking by application ID
- Admission merit list generation with CSV export
- Pagination on all list endpoints (students, faculty, books, applications)
- DB-level search for students (regex, not in-memory)
- Bulk student import via CSV with preview
- Semester promotion with guard rails
- Attendance alerts via cron job (email to low-attendance students)
- Fee due reminders via cron job
- PDF receipt download for paid fees
- Excel export for attendance reports
- Cloudinary avatar + document uploads
- Timetable conflict detection (faculty double-booking)
- Exam seating plan generation
- Revaluation request workflow
- HOD dashboard (faculty assigned as HOD)
- Hostel room allocation, transfer, maintenance requests, mess menu
- Library book issue/return with overdue fine tracking + reservations
- Activity log for admin audit trail
- Winston logging to file (`logs/combined.log`, `logs/error.log`)
- Singleton SMTP transporter (no new connection per email)
- Atomic application ID generation (no race conditions)
- Rate limiting + Helmet security headers
