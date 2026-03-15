import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Users, UserCheck, BookOpen, CreditCard, Bell, ClipboardList, GraduationCap, Library } from 'lucide-react';
import HodDashboard from '../components/HodDashboard';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value ?? '—'}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    // Fetch notices for all roles
    api.get('/notices').then(res => setNotices(res.data.data?.slice(0, 5) || [])).catch(() => {});

    // Fetch stats for admin
    if (['admin', 'superadmin'].includes(user?.role)) {
      Promise.all([
        api.get('/students'),
        api.get('/faculty'),
        api.get('/departments'),
        api.get('/library/books'),
      ]).then(([s, f, d, b]) => {
        setStats({
          students: s.data.count,
          faculty: f.data.count,
          departments: d.data.data?.length,
          books: b.data.count || b.data.data?.length,
        });
      }).catch(() => {});
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1 capitalize">{user?.role} Portal — CampusNex</p>
      </div>

      {/* Stats — Admin only */}
      {['admin', 'superadmin'].includes(user?.role) && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Students" value={stats.students} color="bg-indigo-500" />
          <StatCard icon={UserCheck} label="Faculty Members" value={stats.faculty} color="bg-emerald-500" />
          <StatCard icon={BookOpen} label="Departments" value={stats.departments} color="bg-amber-500" />
          <StatCard icon={Library} label="Library Books" value={stats.books} color="bg-rose-500" />
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Attendance', icon: ClipboardList, path: '/attendance', color: 'bg-blue-50 text-blue-600' },
          { label: 'Notices', icon: Bell, path: '/notices', color: 'bg-amber-50 text-amber-600' },
          { label: 'Timetable', icon: GraduationCap, path: '/timetable', color: 'bg-green-50 text-green-600' },
          { label: 'Exams', icon: BookOpen, path: '/exams', color: 'bg-purple-50 text-purple-600' },
        ].map(({ label, icon: Icon, path, color }) => (
          <Link key={path} to={path} className={`flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-shadow`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <span className="text-sm font-medium text-slate-700">{label}</span>
          </Link>
        ))}
      </div>

      {/* HOD Dashboard — faculty who are HOD */}
      {user?.role === 'faculty' && <HodDashboard />}

      {/* Recent Notices */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Bell size={16} className="text-indigo-500" /> Recent Notices
        </h2>
        {notices.length === 0 ? (
          <p className="text-slate-400 text-sm">No notices yet.</p>
        ) : (
          <div className="space-y-3">
            {notices.map(n => (
              <div key={n._id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
                {n.isPinned && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full shrink-0 mt-0.5">Pinned</span>}
                <div>
                  <p className="text-sm font-medium text-slate-700">{n.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
