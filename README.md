# CampusNex — Campus Management System

A full-stack campus management platform for colleges. Handles students, faculty, attendance, exams, fees, hostel, library, timetable, and more — all in one place.

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
| Reports | ✅ | ✅ | — | — |
| Profile | ✅ | ✅ | ✅ | ✅ |
| Leave Requests | ✅ | ✅ | ✅ | — |

---

## API Overview

All routes are prefixed with `/api`.

| Prefix | Description |
|--------|-------------|
| `/api/auth` | Login, logout, forgot/reset password |
| `/api/students` | CRUD, bulk import, promote, avatar upload |
| `/api/faculty` | CRUD, toggle status, avatar upload |
| `/api/departments` | CRUD |
| `/api/courses` | CRUD |
| `/api/attendance` | Mark, view, stats |
| `/api/exams` | Schedules, results, marksheets, seating plans, revaluation |
| `/api/fees` | Structures, bulk assign, defaulters, student fees |
| `/api/notices` | CRUD, pin/unpin |
| `/api/timetable` | CRUD with conflict detection |
| `/api/library` | Books, issue/return, stats, my-issues |
| `/api/hostel` | Rooms, allocate, transfer, maintenance, mess menu |
| `/api/leaves` | Submit, approve/reject leave requests |
| `/api/activity` | Activity log (admin) |
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
- Pagination on all list endpoints (students, faculty, books)
- Student search across full dataset (not just current page)
- Bulk student import via JSON
- Semester promotion with guard rails
- Attendance alerts via cron job (email to low-attendance students)
- Fee due reminders via cron job
- PDF receipt download for paid fees
- Excel export for reports
- Cloudinary avatar uploads
- Timetable conflict detection
- Exam seating plan generation
- Revaluation request workflow
- HOD dashboard (faculty with HOD role)
- Hostel room allocation, transfer, maintenance requests, mess menu
- Library book issue/return with overdue tracking
- Activity log for admin audit trail
- Winston logging to file (`logs/combined.log`, `logs/error.log`)
