import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Users, UserCheck, BookOpen, Bell, ClipboardList, GraduationCap, Library, CreditCard, AlertTriangle, TrendingUp, BookMarked } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import HodDashboard from '../components/HodDashboard';
import { usePageTitle } from '../hooks/usePageTitle';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value ?? '—'}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [notices, setNotices] = useState([]);
  const [isHod, setIsHod] = useState(false);
  const [myTimetable, setMyTimetable] = useState([]);
  const [feeChartData, setFeeChartData] = useState([]);

  usePageTitle('Dashboard');

  useEffect(() => {
    api.get('/notices').then(res => setNotices(res.data.data?.slice(0, 5) || [])).catch(() => {});

    if (['admin', 'superadmin'].includes(user?.role)) {
      api.get('/dashboard/stats').then(res => setStats(res.data.data)).catch(() => {});
      api.get('/dashboard/fee-trend').then(res => setFeeChartData(res.data.data || [])).catch(() => {});
    }

    if (user?.role === 'student') {
      api.get('/dashboard/stats/student').then(res => setStats(res.data.data)).catch(() => {});
    }

    if (user?.role === 'faculty') {
      api.get('/departments/my-department')
        .then(() => setIsHod(true))
        .catch(() => setIsHod(false));
      api.get('/timetable/my').then(res => setMyTimetable(res.data.data || [])).catch(() => {});
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

      {/* Admin stats */}
      {['admin', 'superadmin'].includes(user?.role) && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Students" value={stats.students} color="bg-indigo-500" />
            <StatCard icon={UserCheck} label="Faculty Members" value={stats.faculty} color="bg-emerald-500" />
            <StatCard icon={BookOpen} label="Departments" value={stats.departments} color="bg-amber-500" />
            <StatCard icon={Library} label="Library Books" value={stats.books} color="bg-rose-500" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={CreditCard} label="Fee Collected" value={stats.feeCollected ? `₹${stats.feeCollected.toLocaleString()}` : '₹0'} color="bg-teal-500" sub="Total paid" />
            <StatCard icon={AlertTriangle} label="Fee Defaulters" value={stats.feePending ?? '—'} color={stats.feePending > 0 ? 'bg-red-500' : 'bg-slate-400'} sub="Pending / overdue" />
            <StatCard icon={ClipboardList} label="New Applications" value={stats.pendingApplications ?? '—'} color="bg-purple-500" sub="Awaiting review" />
          </div>

          {/* Fee Collection Trend Chart */}
          {feeChartData.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-500" /> Fee Collection Trend (Last 6 Months)
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={feeChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#64748b" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} labelStyle={{ color: '#334155' }} />
                    <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {/* Student personalized stats */}
      {user?.role === 'student' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={ClipboardList}
            label="Avg Attendance"
            value={stats.attendance ? `${stats.attendance}%` : '—'}
            color={stats.attendance && parseFloat(stats.attendance) < 75 ? 'bg-red-500' : 'bg-indigo-500'}
            sub={stats.attendance && parseFloat(stats.attendance) < 75 ? 'Below 75% threshold' : 'Overall across courses'}
          />
          <StatCard
            icon={CreditCard}
            label="Fee Pending"
            value={stats.feePending ? `₹${stats.feePending.toLocaleString()}` : '₹0'}
            color={stats.feePending > 0 ? 'bg-amber-500' : 'bg-emerald-500'}
            sub={stats.feePending > 0 ? 'Clear dues soon' : 'All clear'}
          />
          <StatCard
            icon={BookMarked}
            label="Books Issued"
            value={stats.activeBooks ?? '—'}
            color={stats.overdueBooks > 0 ? 'bg-red-500' : 'bg-teal-500'}
            sub={stats.overdueBooks > 0 ? `${stats.overdueBooks} overdue` : 'No overdue books'}
          />
          <StatCard icon={TrendingUp} label="Semester" value={stats.semester ?? user?.semester ?? '—'} color="bg-purple-500" sub="Current semester" />
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
          <Link key={path} to={path} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-shadow">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <span className="text-sm font-medium text-slate-700">{label}</span>
          </Link>
        ))}
      </div>

      {/* HOD Dashboard — only for faculty who are actually HODs */}
      {user?.role === 'faculty' && isHod && <HodDashboard />}

      {/* Faculty — Today's Schedule */}
      {user?.role === 'faculty' && myTimetable.length > 0 && (() => {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todaySlots = myTimetable.filter(t => t.day === today).flatMap(t => t.slots.map(s => ({ ...s, dept: t.department, semester: t.semester })));
        if (todaySlots.length === 0) return null;
        return (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <GraduationCap size={16} className="text-indigo-500" /> Today's Classes — {today}
            </h2>
            <div className="space-y-2">
              {todaySlots.sort((a, b) => a.time?.localeCompare(b.time)).map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-indigo-50 rounded-lg">
                  <span className="text-xs font-mono font-semibold text-indigo-600 w-24 shrink-0">{s.time}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{s.course?.name || '—'}</p>
                    <p className="text-xs text-slate-500">{s.dept?.name} · Sem {s.semester} {s.room ? `· ${s.room}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

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
