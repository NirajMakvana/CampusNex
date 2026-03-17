import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Users, UserCheck, BookOpen, ClipboardList, CheckCircle, XCircle, Plus, X } from 'lucide-react';

export default function HodDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [leaves, setLeaves] = useState([]);
  const [leavesLoading, setLeavesLoading] = useState(false);
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeForm, setNoticeForm] = useState({ title: '', message: '', targetRole: 'all' });
  const [noticeLoading, setNoticeLoading] = useState(false);

  useEffect(() => {
    api.get('/departments/my-department')
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadLeaves = async () => {
    setLeavesLoading(true);
    try {
      const res = await api.get('/leaves/department');
      setLeaves(res.data.data || []);
    } catch { toast.error('Failed to load leaves'); }
    finally { setLeavesLoading(false); }
  };

  useEffect(() => {
    if (tab === 'leaves') loadLeaves();
  }, [tab]);

  const handleLeaveStatus = async (id, status) => {
    try {
      await api.put(`/leaves/${id}`, { status });
      toast.success(`Leave ${status}`);
      loadLeaves();
    } catch { toast.error('Failed to update'); }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    setNoticeLoading(true);
    try {
      await api.post('/notices', noticeForm);
      toast.success('Notice posted');
      setShowNoticeForm(false);
      setNoticeForm({ title: '', message: '', targetRole: 'all' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setNoticeLoading(false); }
  };

  const statusColor = (s) => ({
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600',
  }[s] || 'bg-slate-100 text-slate-600');

  if (loading) return null;
  if (!data) return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-400">
      <p className="text-sm">You are not assigned as a Head of Department.</p>
      <p className="text-xs mt-1">Contact admin if this is incorrect.</p>
    </div>
  );

  const { department, faculty, students, courses } = data;

  return (
    <div className="bg-white rounded-xl border border-indigo-200 overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-600 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-indigo-200 text-xs font-medium uppercase tracking-wide">HOD Dashboard</p>
          <h2 className="text-white font-bold text-lg">{department.name}</h2>
        </div>
        <span className="text-xs bg-indigo-500 text-indigo-100 px-3 py-1 rounded-full">{department.code}</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 px-5">
        {[['overview','Overview'],['faculty','Faculty'],['students','Students'],['leaves','Leave Requests'],['notice','Post Notice']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: UserCheck, label: 'Faculty', value: faculty.length, color: 'bg-emerald-500' },
              { icon: Users, label: 'Students', value: students.length, color: 'bg-indigo-500' },
              { icon: BookOpen, label: 'Courses', value: courses.length, color: 'bg-amber-500' },
              { icon: ClipboardList, label: 'Total Seats', value: department.totalSeats, color: 'bg-rose-500' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-xl font-bold text-slate-800">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Faculty List */}
        {tab === 'faculty' && (
          <div className="space-y-2">
            {faculty.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No faculty in this department</p>
            ) : faculty.map(f => (
              <div key={f._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                  {f.userId?.name?.[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{f.userId?.name}</p>
                  <p className="text-xs text-slate-400">{f.userId?.email}</p>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{f.designation}</span>
              </div>
            ))}
          </div>
        )}

        {/* Students List */}
        {tab === 'students' && (
          <div className="space-y-2">
            {students.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No students in this department</p>
            ) : students.map(s => (
              <div key={s._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {s.userId?.name?.[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{s.userId?.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{s.enrollmentNo}</p>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">Sem {s.semester}</span>
              </div>
            ))}
          </div>
        )}

        {/* Leave Requests */}
        {tab === 'leaves' && (
          <div className="space-y-3">
            {leavesLoading ? (
              <p className="text-center text-slate-400 py-6">Loading...</p>
            ) : leaves.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No leave requests</p>
            ) : leaves.map(l => (
              <div key={l._id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">
                        {l.faculty?.userId?.name || l.student?.userId?.name}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${l.faculty ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {l.faculty ? 'Faculty' : 'Student'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(l.status)}`}>{l.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium capitalize">
                      {l.type} leave · {new Date(l.fromDate).toLocaleDateString('en-IN')} — {new Date(l.toDate).toLocaleDateString('en-IN')}
                    </p>
                    <p className="text-xs text-slate-600 bg-white/50 p-2 rounded border border-slate-100 mt-2 italic">
                      "{l.reason}"
                    </p>
                  </div>
                  {l.status === 'pending' && (
                    <div className="flex gap-1 shrink-0 ml-4">
                      <button onClick={() => handleLeaveStatus(l._id, 'approved')}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition-colors">
                        <CheckCircle size={12} /> Approve
                      </button>
                      <button onClick={() => handleLeaveStatus(l._id, 'rejected')}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm transition-colors">
                        <XCircle size={12} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Post Notice */}
        {tab === 'notice' && (
          <div className="max-w-lg">
            <form onSubmit={handlePostNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
                <input type="text" required value={noticeForm.title}
                  onChange={e => setNoticeForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Message</label>
                <textarea rows={4} required value={noticeForm.message}
                  onChange={e => setNoticeForm(p => ({ ...p, message: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Target</label>
                <select value={noticeForm.targetRole} onChange={e => setNoticeForm(p => ({ ...p, targetRole: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="all">Everyone</option>
                  <option value="student">Students Only</option>
                  <option value="faculty">Faculty Only</option>
                </select>
              </div>
              <button type="submit" disabled={noticeLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60">
                <Plus size={14} /> {noticeLoading ? 'Posting...' : 'Post Notice'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
