import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  GraduationCap, LayoutDashboard, Users, UserCheck, BookOpen,
  Calendar, ClipboardList, FileText, CreditCard, Library,
  Home, Bell, BarChart2, LogOut, ChevronRight, Building2, CalendarOff
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['superadmin', 'admin', 'faculty', 'student'] },
  { label: 'Students', icon: Users, path: '/students', roles: ['superadmin', 'admin'] },
  { label: 'Faculty', icon: UserCheck, path: '/faculty', roles: ['superadmin', 'admin'] },
  { label: 'Departments', icon: Building2, path: '/departments', roles: ['superadmin', 'admin'] },
  { label: 'Courses', icon: BookOpen, path: '/courses', roles: ['superadmin', 'admin', 'faculty'] },
  { label: 'Timetable', icon: Calendar, path: '/timetable', roles: ['superadmin', 'admin', 'faculty', 'student'] },
  { label: 'Attendance', icon: ClipboardList, path: '/attendance', roles: ['superadmin', 'admin', 'faculty', 'student'] },
  { label: 'Exams & Results', icon: FileText, path: '/exams', roles: ['superadmin', 'admin', 'faculty', 'student'] },
  { label: 'Fees', icon: CreditCard, path: '/fees', roles: ['superadmin', 'admin', 'student'] },
  { label: 'Library', icon: Library, path: '/library', roles: ['superadmin', 'admin', 'faculty', 'student'] },
  { label: 'Hostel', icon: Home, path: '/hostel', roles: ['superadmin', 'admin', 'student'], requiresHostel: true },
  { label: 'Notices', icon: Bell, path: '/notices', roles: ['superadmin', 'admin', 'faculty', 'student'] },
  { label: 'Leave', icon: CalendarOff, path: '/leaves', roles: ['superadmin', 'admin', 'faculty'] },
  { label: 'Reports', icon: BarChart2, path: '/reports', roles: ['superadmin', 'admin'] },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hasHostel, setHasHostel] = useState(null); // null = loading, true/false = resolved

  useEffect(() => {
    if (user?.role === 'student') {
      api.get('/students/me')
        .then(res => setHasHostel(!!res.data.data?.hostelId))
        .catch(() => setHasHostel(false));
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const filtered = navItems.filter(item => {
    if (!item.roles.includes(user?.role)) return false;
    // For student: hide Hostel link until we know they have a room
    if (item.requiresHostel && user?.role === 'student') {
      return hasHostel === true;
    }
    return true;
  });

  return (
    <aside className={`flex flex-col h-screen bg-slate-900 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} fixed left-0 top-0 z-40`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
        <GraduationCap size={24} className="text-indigo-400 shrink-0" />
        {!collapsed && <span className="font-bold text-lg tracking-tight">CampusNex</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {filtered.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-slate-700 p-3">
        {!collapsed && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 mb-2 px-2 py-1.5 rounded-lg transition-colors ${isActive ? 'bg-slate-700' : 'hover:bg-slate-800'}`
            }
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
              {user?.avatar
                ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                : user?.name?.[0]?.toUpperCase()
              }
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </NavLink>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white text-sm transition-colors"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 bg-slate-700 rounded-full p-1 hover:bg-slate-600 transition-colors"
      >
        <ChevronRight size={14} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
      </button>
    </aside>
  );
}
