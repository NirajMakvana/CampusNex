import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap, Users, BookOpen, ClipboardList, CreditCard,
  Library, Home, Bell, BarChart2, ArrowRight, CheckCircle2,
  Calendar, FileText, Shield
} from 'lucide-react';

const features = [
  { icon: Users, title: 'Student Management', desc: 'Enroll, track, and manage student records with ease.' },
  { icon: BookOpen, title: 'Courses & Departments', desc: 'Organize academic structure with departments and courses.' },
  { icon: ClipboardList, title: 'Attendance Tracking', desc: 'Mark and monitor attendance with automated low-attendance alerts.' },
  { icon: FileText, title: 'Exams & Results', desc: 'Schedule exams, enter marks, and auto-calculate CGPA.' },
  { icon: CreditCard, title: 'Fee Management', desc: 'Track payments, generate defaulter lists, and view collection stats.' },
  { icon: Library, title: 'Library System', desc: 'Manage books, issue/return tracking, and fine calculation.' },
  { icon: Home, title: 'Hostel Management', desc: 'Room allocation, occupancy tracking, and maintenance requests.' },
  { icon: Calendar, title: 'Timetable', desc: 'Interactive weekly timetable builder for all courses.' },
  { icon: Bell, title: 'Notice Board', desc: 'Post targeted announcements to students, faculty, or all.' },
  { icon: BarChart2, title: 'Reports & Analytics', desc: 'Visual dashboards with charts for key institutional metrics.' },
];

const roles = [
  { role: 'Super Admin', color: 'bg-red-100 text-red-700 border-red-200', perms: ['Full system access', 'Manage admins', 'All reports'] },
  { role: 'Admin', color: 'bg-purple-100 text-purple-700 border-purple-200', perms: ['Manage students & faculty', 'Fee & hostel control', 'Notice posting'] },
  { role: 'Faculty', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', perms: ['Mark attendance', 'Enter exam results', 'View timetable'] },
  { role: 'Student', color: 'bg-blue-100 text-blue-700 border-blue-200', perms: ['View own results', 'Check attendance', 'Fee & hostel info'] },
];

export default function Landing() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap size={26} className="text-indigo-600" />
          <span className="text-lg font-bold text-indigo-600">CampusNex</span>
        </div>
        <Link
          to="/login"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Sign In <ArrowRight size={14} />
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-6 py-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full tracking-wide uppercase">
            Campus Management System
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-5">
            Manage your campus<br />
            <span className="text-indigo-600">smarter, not harder</span>
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto">
            CampusNex brings students, faculty, and administration onto one unified platform — from attendance to fees, exams to hostel.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Get Started <ArrowRight size={16} />
            </Link>
            <a
              href="#features"
              className="px-6 py-3 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-indigo-600 text-white py-8 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '10+', label: 'Modules' },
            { value: '4', label: 'User Roles' },
            { value: '100%', label: 'Dynamic Data' },
            { value: 'REST', label: 'API Powered' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-extrabold">{value}</div>
              <div className="text-indigo-200 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Everything your campus needs</h2>
            <p className="text-slate-500">A complete suite of tools built for modern educational institutions.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-3">
                  <Icon size={20} className="text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Role-based access control</h2>
            <p className="text-slate-500">Every user sees exactly what they need — nothing more, nothing less.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {roles.map(({ role, color, perms }) => (
              <div key={role} className="rounded-xl border border-slate-200 p-5">
                <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border mb-4 ${color}`}>
                  {role}
                </span>
                <ul className="space-y-2">
                  {perms.map(p => (
                    <li key={p} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Built with modern tech</h2>
          <p className="text-slate-500 mb-8">Production-ready stack with JWT auth, Cloudinary uploads, and email notifications.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['React 19', 'Vite', 'Tailwind CSS v4', 'Node.js', 'Express', 'MongoDB', 'JWT', 'Cloudinary', 'Recharts', 'Nodemailer'].map(t => (
              <span key={t} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-indigo-600 text-white text-center">
        <div className="max-w-xl mx-auto">
          <Shield size={40} className="mx-auto mb-4 text-indigo-200" />
          <h2 className="text-3xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-indigo-200 mb-8">Sign in with your credentials and take control of your campus operations.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Sign In Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-sm py-6 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <GraduationCap size={16} className="text-indigo-400" />
          <span className="font-semibold text-white">CampusNex</span>
        </div>
        <p>Campus Management System — Built with React + Node.js + MongoDB</p>
      </footer>
    </div>
  );
}
