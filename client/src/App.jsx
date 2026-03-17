import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Faculty from './pages/Faculty';
import Departments from './pages/Departments';
import Courses from './pages/Courses';
import Notices from './pages/Notices';
import Attendance from './pages/Attendance';
import Exams from './pages/Exams';
import Timetable from './pages/Timetable';
import Fees from './pages/Fees';
import Library from './pages/Library';
import Hostel from './pages/Hostel';
import Leaves from './pages/Leaves';
import Reports from './pages/Reports';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Landing from './pages/Landing';

// Public website pages
import PublicHome from './pages/public/PublicHome';
import PublicAbout from './pages/public/PublicAbout';
import PublicCourses from './pages/public/PublicCourses';
import PublicAdmissions from './pages/public/PublicAdmissions';
import PublicFaculty from './pages/public/PublicFaculty';
import PublicCampusLife from './pages/public/PublicCampusLife';
import PublicContact from './pages/public/PublicContact';
import ApplyForm from './pages/public/ApplyForm';
import TrackApplication from './pages/public/TrackApplication';

import AdminAdmissions from './pages/AdminAdmissions';
import Testimonials from './pages/Testimonials';
import ManageWebsite from './pages/ManageWebsite';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={
              <ProtectedRoute roles={['admin', 'superadmin']}><Students /></ProtectedRoute>
            } />
            <Route path="/faculty" element={
              <ProtectedRoute roles={['admin', 'superadmin']}><Faculty /></ProtectedRoute>
            } />
            <Route path="/departments" element={
              <ProtectedRoute roles={['admin', 'superadmin']}><Departments /></ProtectedRoute>
            } />
            <Route path="/courses" element={<Courses />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/library" element={<Library />} />
            <Route path="/hostel" element={
              <ProtectedRoute roles={['admin', 'superadmin', 'student']}><Hostel /></ProtectedRoute>
            } />
            <Route path="/notices" element={<Notices />} />
            <Route path="/leaves" element={
              <ProtectedRoute roles={['admin', 'superadmin', 'faculty', 'student']}><Leaves /></ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute roles={['admin', 'superadmin']}><Reports /></ProtectedRoute>
            } />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admissions-admin" element={
              <ProtectedRoute roles={['admin', 'superadmin']}><AdminAdmissions /></ProtectedRoute>
            } />
            <Route path="/testimonials" element={
              <ProtectedRoute roles={['admin', 'superadmin']}><Testimonials /></ProtectedRoute>
            } />
            <Route path="/website-settings" element={
              <ProtectedRoute roles={['admin', 'superadmin']}><ManageWebsite /></ProtectedRoute>
            } />
          </Route>

          {/* Public website routes */}
          <Route path="/home" element={<PublicHome />} />
          <Route path="/about" element={<PublicAbout />} />
          <Route path="/courses-info" element={<PublicCourses />} />
          <Route path="/admissions" element={<PublicAdmissions />} />
          <Route path="/admissions/apply" element={<ApplyForm />} />
          <Route path="/admissions/track" element={<TrackApplication />} />
          <Route path="/faculty-info" element={<PublicFaculty />} />
          <Route path="/campus-life" element={<PublicCampusLife />} />
          <Route path="/contact" element={<PublicContact />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
