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
              <ProtectedRoute roles={['admin', 'superadmin', 'faculty']}><Leaves /></ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute roles={['admin', 'superadmin']}><Reports /></ProtectedRoute>
            } />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
