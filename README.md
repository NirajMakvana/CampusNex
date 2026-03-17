# CampusNex — Complete Campus Management System

> **🎓 A comprehensive, production-ready Campus Management Platform for Colleges & Universities**

Built with modern technologies to handle every aspect of campus operations — from student admissions to fee payments, from attendance tracking to hostel management. Features role-based access control, real-time analytics, mobile responsiveness, and a complete public-facing website.

[![React](https://img.shields.io/badge/React-19.2.4-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-brightgreen.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 **Key Highlights**

- **16 Complete Modules** — Students, Faculty, Attendance, Exams, Fees, Library, Hostel & more
- **4 User Roles** — Super Admin, Admin, Faculty, Student with tailored dashboards
- **Public Website** — Complete college website with online admission system
- **Payment System** — Integrated fee payment with PDF receipt generation
- **Mobile Responsive** — Works seamlessly on all devices
- **Real-time Analytics** — Charts, reports, and data visualization
- **Document Management** — File uploads, verification, and storage
- **Security First** — JWT authentication, role-based access, audit logs

---

## 🚀 **Live Demo**

- **Frontend**: [https://campusnex.vercel.app](https://campusnex.vercel.app)
- **Backend API**: [https://campusnex-api.render.com](https://campusnex-api.render.com)

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | campusnex@edu.in | CampusNex@123 |
| **BCA HOD** | herry@hod.campusnex.edu | Faculty@123 |
| **BBA HOD** | meera@hod.bba.campusnex.edu | Faculty@123 |
| **Student** | Any student email | Campus@123 |
| **Faculty** | Any faculty email | Faculty@123 |

---

## 🏗️ **Architecture & Tech Stack**

### Frontend
- **React 19** — Latest React with concurrent features
- **Vite 8** — Lightning-fast build tool and dev server
- **Tailwind CSS v4** — Utility-first CSS framework
- **Recharts** — Beautiful, composable charts
- **Lucide React** — Modern icon library
- **React Router DOM** — Client-side routing
- **Axios** — HTTP client with interceptors
- **React Hot Toast** — Elegant notifications

### Backend
- **Node.js 18+** — JavaScript runtime
- **Express 5** — Fast, minimalist web framework
- **MongoDB** — NoSQL database with Mongoose ODM
- **JWT** — Secure authentication with HTTP-only cookies
- **Cloudinary** — Cloud-based image and video management
- **Nodemailer** — Email sending with Gmail SMTP
- **Winston** — Professional logging
- **Node-cron** — Scheduled tasks and jobs

### Security & Performance
- **Helmet** — Security headers
- **Express Rate Limit** — API rate limiting
- **CORS** — Cross-origin resource sharing
- **Bcrypt** — Password hashing
- **Multer** — File upload handling
- **Compression** — Response compression

### Development & Deployment
- **ESLint** — Code linting and formatting
- **Vercel** — Frontend deployment
- **Render** — Backend deployment
- **GitHub Actions** — CI/CD pipeline ready

---

## 📁 **Project Structure**

```
CampusNex/
├── 📁 client/                    # React Frontend (Vite)
│   ├── 📁 public/               # Static assets
│   ├── 📁 src/
│   │   ├── 📁 api/              # Axios configuration
│   │   ├── 📁 components/       # Reusable UI components
│   │   │   ├── Layout.jsx       # Main layout with sidebar
│   │   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   │   ├── ProtectedRoute.jsx # Route protection
│   │   │   ├── ConfirmModal.jsx # Confirmation dialogs
│   │   │   ├── LoadingSkeleton.jsx # Loading states
│   │   │   ├── EmptyState.jsx   # Empty data states
│   │   │   └── 📁 public/       # Public website components
│   │   ├── 📁 context/          # React Context providers
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── 📁 hooks/            # Custom React hooks
│   │   │   └── usePageTitle.js  # Dynamic page titles
│   │   ├── 📁 pages/            # Page components
│   │   │   ├── Dashboard.jsx    # Role-based dashboards
│   │   │   ├── Students.jsx     # Student management
│   │   │   ├── Faculty.jsx      # Faculty management
│   │   │   ├── Fees.jsx         # Fee management & payments
│   │   │   ├── Reports.jsx      # Analytics & reports
│   │   │   ├── ActivityLogs.jsx # System audit logs
│   │   │   ├── Results.jsx      # CGPA & results
│   │   │   ├── 📁 admissions/   # Admission management tabs
│   │   │   └── 📁 public/       # Public website pages
│   │   ├── 📁 utils/            # Utility functions
│   │   │   └── exportPdf.js     # PDF export functionality
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # App entry point
│   │   └── index.css            # Global styles
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.js           # Vite configuration
│   └── vercel.json              # Vercel deployment config
│
├── 📁 server/                    # Express Backend
│   ├── 📁 config/               # Configuration files
│   │   ├── db.js                # MongoDB connection
│   │   └── cloudinary.js        # Cloudinary setup
│   ├── 📁 controllers/          # Route handlers
│   │   ├── authController.js    # Authentication logic
│   │   ├── studentController.js # Student operations
│   │   ├── feeController.js     # Fee management
│   │   ├── dashboardController.js # Dashboard APIs
│   │   ├── activityLogController.js # Audit logging
│   │   └── ...                  # Other controllers
│   ├── 📁 middleware/           # Express middleware
│   │   ├── auth.js              # JWT authentication
│   │   ├── errorHandler.js      # Error handling
│   │   └── upload.js            # File upload handling
│   ├── 📁 models/               # Mongoose schemas
│   │   ├── User.js              # User authentication
│   │   ├── Student.js           # Student data model
│   │   ├── Fee.js               # Fee structures & payments
│   │   ├── ActivityLog.js       # Audit trail model
│   │   └── ...                  # Other models
│   ├── 📁 routes/               # Express routers
│   │   ├── authRoutes.js        # Authentication routes
│   │   ├── studentRoutes.js     # Student CRUD routes
│   │   ├── dashboardRoutes.js   # Dashboard APIs
│   │   ├── activityLogRoutes.js # Audit log routes
│   │   └── ...                  # Other route files
│   ├── 📁 jobs/                 # Cron jobs
│   │   ├── attendanceAlert.js   # Low attendance alerts
│   │   └── feeReminder.js       # Fee due reminders
│   ├── 📁 utils/                # Utility functions
│   │   ├── logger.js            # Winston logging setup
│   │   ├── email.js             # Email sending utilities
│   │   └── uploadToCloudinary.js # File upload helpers
│   ├── 📁 logs/                 # Application logs
│   │   ├── combined.log         # All logs
│   │   └── error.log            # Error logs only
│   ├── server.js                # Express server entry point
│   ├── createSuperAdmin.js      # Initial admin setup
│   ├── package.json             # Backend dependencies
│   ├── .env.example             # Environment template
│   └── 📁 seed*/                # Database seeding scripts
│
├── README.md                     # Project documentation
├── .gitignore                    # Git ignore rules
└── LICENSE                       # MIT License
```

---

## 🚀 **Quick Start Guide**

### Prerequisites

Ensure you have the following installed:
- **Node.js 18+** ([Download](https://nodejs.org/))
- **MongoDB** ([Local](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com/))

### 1. 📥 **Clone & Install**

```bash
# Clone the repository
git clone https://github.com/yourusername/CampusNex.git
cd CampusNex

# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install --legacy-peer-deps
```

### 2. ⚙️ **Environment Setup**

Create environment file for the server:

```bash
cd server
cp .env.example .env
```

Configure your `.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb://localhost:27017/CampusNex-CMS

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key  
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 3. 🗄️ **Database Setup**

```bash
# Start MongoDB (if running locally)
mongod

# Create superadmin account
cd server
node createSuperAdmin.js

# Optional: Seed demo data
node seedData.js          # Basic departments, faculty, students
node seedBBA.js           # BBA department data  
node seedTimetable.js     # Timetable entries
node seedExams.js         # Exam schedules + results
node seedFees.js          # Fee structures + assignments
node seedLibrary.js       # Books + issue records
node seedNotices.js       # Notice board entries
```

### 4. 🏃‍♂️ **Run the Application**

**Start the backend server:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Start the frontend (new terminal):**
```bash
cd client  
npm run dev
# Client runs on http://localhost:5173
```

### 5. 🎉 **Access the Application**

- **Main Application**: [http://localhost:5173](http://localhost:5173)
- **Public Website**: [http://localhost:5173/home](http://localhost:5173/home)
- **API Documentation**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

**Default Login:**
- **Email**: `campusnex@edu.in`
- **Password**: `CampusNex@123`

---

## 📋 **Complete Feature Set**

### 🎯 **Core Management Modules**

| Module | Features | Access |
|--------|----------|--------|
| **👥 Students** | CRUD operations, bulk import via CSV, semester promotion, search & filters, profile management | Admin, Super Admin |
| **👨‍🏫 Faculty** | Faculty management, workload tracking, department assignment, status toggle | Admin, Super Admin |
| **🏢 Departments** | Department CRUD, HOD assignment, student/faculty counts, course management | Admin, Super Admin |
| **📚 Courses** | Course creation, syllabus upload, credit management, faculty assignment | Admin, Super Admin, Faculty |
| **📅 Timetable** | Schedule management, conflict detection, personalized views, room allocation | All Roles |
| **✅ Attendance** | Mark attendance, monthly reports, low attendance alerts, statistics | Faculty (mark), Students (view own) |
| **📝 Exams & Results** | Exam scheduling, result entry, CGPA calculation, marksheet generation | Faculty (enter), Students (view) |
| **💰 Fees** | Fee structures, payment processing, receipt generation, defaulter tracking | Admin (manage), Students (pay) |
| **📖 Library** | Book management, issue/return system, fine calculation, reservations | Librarian, Students |
| **🏠 Hostel** | Room allocation, maintenance requests, mess menu, transfer management | Admin, Students (if allocated) |
| **📢 Notices** | Announcements, file attachments, pinning, category-wise organization | All Roles |
| **🏖️ Leaves** | Leave applications, approval workflow, balance tracking, calendar integration | Faculty, Students |
| **🎓 Admissions** | Online applications, document verification, merit list generation, tracking | Admin, Public |
| **📊 Reports** | Analytics dashboard, Excel/PDF export, attendance reports, fee collection | Admin, Super Admin |
| **🔍 Activity Logs** | System audit trail, user action tracking, security monitoring | Super Admin Only |

### 🌐 **Public Website Features**

- **🏠 Homepage** — Hero section, college stats, programs showcase, testimonials
- **ℹ️ About Us** — College information, principal's message, history
- **📚 Programs** — Course listings, eligibility criteria, curriculum details  
- **🎓 Admissions** — Admission process, online application form, document requirements
- **👨‍🏫 Faculty** — Faculty directory with qualifications and experience
- **🏫 Campus Life** — Hostel facilities, library resources, extracurricular activities
- **📞 Contact** — Contact form, location map, office hours
- **🔍 Track Application** — Real-time application status tracking

### 🔐 **Advanced Security Features**

- **JWT Authentication** — Secure token-based authentication
- **Role-Based Access Control** — Granular permissions for different user types
- **HTTP-Only Cookies** — Secure token storage preventing XSS attacks
- **Password Hashing** — Bcrypt encryption for user passwords
- **Rate Limiting** — API protection against brute force attacks
- **Input Validation** — Comprehensive data validation and sanitization
- **Audit Logging** — Complete activity tracking for compliance
- **File Upload Security** — Secure file handling with type validation

### 📱 **User Experience Features**

- **📱 Mobile Responsive** — Optimized for all screen sizes with hamburger navigation
- **🎨 Modern UI/UX** — Clean, intuitive interface with consistent design
- **⚡ Real-time Updates** — Live data updates and notifications
- **🔍 Advanced Search** — Powerful search and filtering across all modules
- **📊 Data Visualization** — Interactive charts and analytics dashboards
- **📄 Export Capabilities** — PDF and Excel export for reports and receipts
- **🔔 Notifications** — Email alerts and in-app notifications
- **💾 Auto-save** — Automatic data saving to prevent loss

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

## 🚀 **Deployment Guide**

### 🌐 **Frontend Deployment (Vercel)**

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Vercel Configuration**
   - Connect your GitHub repository to Vercel
   - Set **Root Directory**: `CampusNex/client`
   - Set **Build Command**: `npm run build`
   - Set **Output Directory**: `dist`
   - The `vercel.json` file is already configured for SPA routing

3. **Environment Variables**
   ```env
   VITE_API_URL=https://your-backend-url.render.com
   ```

### ⚡ **Backend Deployment (Render)**

1. **Render Configuration**
   - Connect your GitHub repository to Render
   - Create a new **Web Service**
   - Set **Root Directory**: `CampusNex/server`
   - Set **Build Command**: `npm install`
   - Set **Start Command**: `npm start`

2. **Environment Variables** (Set in Render Dashboard)
   ```env
   NODE_ENV=production
   PORT=10000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_production_jwt_secret
   JWT_EXPIRE=7d
   CLIENT_URL=https://your-frontend-url.vercel.app
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Email
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

3. **Database Setup**
   - Create a MongoDB Atlas cluster
   - Whitelist Render's IP addresses (or use 0.0.0.0/0 for all IPs)
   - Update the `MONGO_URI` with your Atlas connection string

### 🔧 **Production Optimizations**

- **Frontend**: Automatic code splitting and optimization via Vite
- **Backend**: Compression middleware and security headers enabled
- **Database**: Connection pooling and indexing for performance
- **CDN**: Cloudinary for optimized image delivery
- **Monitoring**: Winston logging for error tracking

---

## 🎯 **Key Features Showcase**

### 💳 **Integrated Payment System**
- **Student Fee Payments** — Secure online fee payment with simulated transactions
- **PDF Receipt Generation** — Automatic receipt download with college branding
- **Payment Tracking** — Complete payment history and status tracking
- **Defaulter Management** — Automated identification and notification of fee defaulters

### 📊 **Advanced Analytics Dashboard**
- **Real-time Charts** — Fee collection trends, attendance statistics, enrollment data
- **Role-based KPIs** — Customized metrics for each user role
- **Export Capabilities** — Excel and PDF export for all reports
- **Visual Data Representation** — Interactive charts using Recharts library

### 🔐 **Enterprise-grade Security**
- **JWT Authentication** — Secure token-based authentication system
- **Role-based Access Control** — Granular permissions for different user types
- **Activity Audit Logs** — Complete system activity tracking for compliance
- **Data Encryption** — Secure password hashing and sensitive data protection

### 📱 **Mobile-first Design**
- **Responsive Layout** — Optimized for all screen sizes and devices
- **Touch-friendly Interface** — Mobile-optimized navigation and interactions
- **Progressive Web App Ready** — Can be installed as a mobile app
- **Offline Capability** — Basic functionality works without internet connection

### 🎓 **Complete Admission Management**
- **Online Application System** — Public-facing admission form with document upload
- **Document Verification** — Per-document approval workflow for admissions team
- **Merit List Generation** — Automated ranking and selection process
- **Application Tracking** — Real-time status updates for applicants

### 📚 **Comprehensive Academic Management**
- **CGPA Calculation** — Automated grade point calculation and tracking
- **Semester-wise Results** — Detailed academic performance analysis
- **Attendance Monitoring** — Real-time attendance tracking with alerts
- **Timetable Management** — Conflict-free scheduling with room allocation

---

## 🔌 **API Documentation**

### Authentication Endpoints
```
POST   /api/auth/login              # User login
POST   /api/auth/logout             # User logout  
POST   /api/auth/forgot-password    # Password reset request
POST   /api/auth/reset-password     # Password reset confirmation
GET    /api/auth/me                 # Get current user profile
PUT    /api/auth/avatar             # Update user avatar
```

### Core Management APIs
```
# Student Management
GET    /api/students                # List all students (paginated)
POST   /api/students                # Create new student
GET    /api/students/:id            # Get student details
PUT    /api/students/:id            # Update student
DELETE /api/students/:id            # Delete student
POST   /api/students/bulk-import    # CSV bulk import
PUT    /api/students/promote        # Semester promotion

# Fee Management  
GET    /api/fees/structures         # Fee structures
POST   /api/fees/structures         # Create fee structure
GET    /api/fees/student/:id        # Student's fees
PUT    /api/fees/:id/pay            # Process payment
GET    /api/fees/defaulters         # Fee defaulters list
GET    /api/dashboard/fee-trend     # Fee collection analytics

# Dashboard & Analytics
GET    /api/dashboard/stats         # Admin dashboard KPIs
GET    /api/dashboard/stats/student # Student dashboard data
GET    /api/activity-logs           # System audit logs (superadmin)

# Reports & Export
GET    /api/reports/attendance      # Attendance reports
GET    /api/reports/fees            # Fee collection reports
POST   /api/reports/export          # Export data to Excel/PDF
```

### Public Website APIs
```
GET    /api/public/stats            # College statistics
GET    /api/public/programs         # Available programs
GET    /api/public/faculty          # Faculty directory
POST   /api/public/contact          # Contact form submission
POST   /api/public/apply            # Online admission application
GET    /api/public/track/:id        # Track application status
```

---

## 🧪 **Testing & Quality Assurance**

### Manual Testing Checklist
- ✅ **Authentication Flow** — Login, logout, password reset
- ✅ **Role-based Access** — Verify permissions for each user type
- ✅ **CRUD Operations** — Create, read, update, delete for all modules
- ✅ **File Uploads** — Avatar, documents, syllabus files
- ✅ **Payment Processing** — Fee payment and receipt generation
- ✅ **Mobile Responsiveness** — Test on various screen sizes
- ✅ **Data Export** — PDF and Excel export functionality
- ✅ **Email Notifications** — Attendance alerts, fee reminders

### Performance Optimization
- **Database Indexing** — Optimized queries for large datasets
- **Image Optimization** — Cloudinary automatic image compression
- **Code Splitting** — Lazy loading for better performance
- **Caching Strategy** — Browser caching and API response caching
- **Bundle Optimization** — Minimized JavaScript and CSS bundles

---

## 🤝 **Contributing**

We welcome contributions to make CampusNex even better! Here's how you can help:

### Development Setup
1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
4. **Make your changes** and test thoroughly
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to your branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request** with a detailed description

### Contribution Guidelines
- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if needed

### Areas for Contribution
- 🐛 **Bug Fixes** — Report and fix issues
- ✨ **New Features** — Add new functionality
- 📚 **Documentation** — Improve guides and API docs
- 🎨 **UI/UX Improvements** — Enhance user experience
- ⚡ **Performance** — Optimize speed and efficiency
- 🔒 **Security** — Strengthen security measures

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 CampusNex

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 **Acknowledgments**

- **React Team** — For the amazing React framework
- **MongoDB** — For the flexible NoSQL database
- **Cloudinary** — For seamless file upload and management
- **Vercel & Render** — For excellent deployment platforms
- **Open Source Community** — For the incredible libraries and tools

---

## 📞 **Support & Contact**

- **📧 Email**: support@campusnex.edu
- **🐛 Issues**: [GitHub Issues](https://github.com/yourusername/CampusNex/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/yourusername/CampusNex/discussions)
- **📖 Documentation**: [Wiki](https://github.com/yourusername/CampusNex/wiki)

---

<div align="center">

### 🌟 **Star this repository if you found it helpful!** 🌟

**Built with ❤️ for the education sector**

[⬆ Back to Top](#campusnex--complete-campus-management-system)

</div>