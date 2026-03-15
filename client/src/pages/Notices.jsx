import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Bell, Pin, Plus, Trash2, Paperclip, CalendarDays, List, ChevronLeft, ChevronRight, X, Upload, Search } from 'lucide-react';

export default function Notices() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', targetRole: 'all', isPinned: false, eventDate: '' });
  const [attachFiles, setAttachFiles] = useState([]);
  const fileRef = useRef();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearch(q);
  }, [searchParams]);

  useEffect(() => { fetchNotices(); }, []);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices');
      setNotices(res.data.data || []);
    } catch { toast.error('Failed to load notices'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      attachFiles.forEach(f => fd.append('attachments', f));
      await api.post('/notices', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Notice posted');
      setShowForm(false);
      setForm({ title: '', message: '', targetRole: 'all', isPinned: false, eventDate: '' });
      setAttachFiles([]);
      fetchNotices();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      toast.success('Deleted');
      setNotices(prev => prev.filter(n => n._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const canPost = ['admin', 'superadmin', 'faculty'].includes(user?.role);
  const filtered = notices.filter(n =>
    !search || n.title?.toLowerCase().includes(search.toLowerCase()) || n.message?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Notice Board</h1>
          <p className="text-sm text-slate-500">{notices.length} notices</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search notices..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44" />
          </div>
          {/* View toggle */}
          <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
            <button onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <List size={13} /> List
            </button>
            <button onClick={() => setView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === 'calendar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <CalendarDays size={13} /> Calendar
            </button>
          </div>
          {canPost && (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Plus size={16} /> Post Notice
            </button>
          )}
        </div>
      </div>

      {view === 'list'
        ? <ListView notices={filtered} user={user} onDelete={handleDelete} />
        : <CalendarView notices={filtered} />
      }

      {/* Post Notice Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Post New Notice</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Message</label>
                <textarea required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Target</label>
                  <select value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="all">All</option>
                    <option value="student">Students</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Event Date (optional)</label>
                  <input type="date" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={form.isPinned} onChange={e => setForm({ ...form, isPinned: e.target.checked })} className="rounded" />
                Pin this notice
              </label>
              {/* Attachments */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Attachments (optional)</label>
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-lg p-3 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/20 transition-colors">
                  <Upload size={16} className="mx-auto mb-1 text-slate-300" />
                  <p className="text-xs text-slate-400">Click to attach files (max 5)</p>
                  <input ref={fileRef} type="file" multiple accept="*/*" className="hidden"
                    onChange={e => setAttachFiles(Array.from(e.target.files || []).slice(0, 5))} />
                </div>
                {attachFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {attachFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-slate-50 rounded px-2 py-1">
                        <span className="text-slate-600 truncate">{f.name}</span>
                        <button type="button" onClick={() => setAttachFiles(prev => prev.filter((_, j) => j !== i))}
                          className="text-red-400 hover:text-red-600 ml-2"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────
function ListView({ notices, user, onDelete }) {
  const roleColor = (r) => ({
    all: 'bg-slate-100 text-slate-600',
    student: 'bg-blue-100 text-blue-600',
    faculty: 'bg-green-100 text-green-600',
    admin: 'bg-purple-100 text-purple-600',
  }[r] || 'bg-slate-100 text-slate-600');

  if (notices.length === 0) return (
    <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
      <Bell size={32} className="mx-auto mb-2 opacity-30" />
      <p>No notices yet</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {notices.map(n => (
        <div key={n._id} className={`bg-white rounded-xl border p-5 ${n.isPinned ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {n.isPinned && <Pin size={14} className="text-amber-500" />}
                <h3 className="font-semibold text-slate-800">{n.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${roleColor(n.targetRole)}`}>{n.targetRole}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{n.message}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 flex-wrap">
                <span>By {n.postedBy?.name}</span>
                <span>•</span>
                <span>{new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                {n.eventDate && <><span>•</span><span className="text-indigo-500">📅 Event: {new Date(n.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></>}
                {n.attachments?.length > 0 && <><span>•</span><span className="flex items-center gap-1"><Paperclip size={11} />{n.attachments.length} attachment(s)</span></>}
              </div>
            </div>
            {['admin', 'superadmin'].includes(user?.role) && (
              <button onClick={() => onDelete(n._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors shrink-0">
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Calendar View ────────────────────────────────────────────────────────────
function CalendarView({ notices }) {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(null); // date string YYYY-MM-DD

  const { year, month } = current;
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  // Map notices to dates — use eventDate if set, else createdAt
  const noticesByDate = {};
  notices.forEach(n => {
    const d = n.eventDate ? new Date(n.eventDate) : new Date(n.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!noticesByDate[key]) noticesByDate[key] = [];
    noticesByDate[key].push(n);
  });

  const selectedKey = selected;
  const selectedNotices = selectedKey ? (noticesByDate[selectedKey] || []) : [];

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const cells = [];
  // Empty cells before first day (week starts Sunday)
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getKey = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Calendar grid */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrent(c => { const d = new Date(c.year, c.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; })}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft size={16} className="text-slate-600" />
          </button>
          <h2 className="font-semibold text-slate-800">{monthName}</h2>
          <button onClick={() => setCurrent(c => { const d = new Date(c.year, c.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; })}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronRight size={16} className="text-slate-600" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={`e-${i}`} />;
            const key = getKey(d);
            const hasNotices = noticesByDate[key]?.length > 0;
            const isToday = key === todayKey;
            const isSelected = key === selected;
            return (
              <button key={key} onClick={() => setSelected(isSelected ? null : key)}
                className={`relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-lg text-sm transition-colors
                  ${isSelected ? 'bg-indigo-600 text-white' : isToday ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}
                `}>
                <span className="text-xs font-medium leading-none">{d}</span>
                {hasNotices && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                    {noticesByDate[key].slice(0, 3).map((_, ni) => (
                      <span key={ni} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-400'}`} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day notices */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-3 text-sm">
          {selected
            ? new Date(selected + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'Select a date'
          }
        </h3>
        {!selected ? (
          <p className="text-sm text-slate-400">Click a date to see notices</p>
        ) : selectedNotices.length === 0 ? (
          <p className="text-sm text-slate-400">No notices on this date</p>
        ) : (
          <div className="space-y-3">
            {selectedNotices.map(n => (
              <div key={n._id} className={`rounded-lg border p-3 ${n.isPinned ? 'border-amber-200 bg-amber-50/40' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {n.isPinned && <Pin size={11} className="text-amber-500" />}
                  <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1.5">By {n.postedBy?.name}</p>
              </div>
            ))}
          </div>
        )}

        {/* This month summary */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">This Month</p>
          <p className="text-2xl font-bold text-indigo-600">
            {Object.keys(noticesByDate).filter(k => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).reduce((sum, k) => sum + noticesByDate[k].length, 0)}
          </p>
          <p className="text-xs text-slate-400">notices / events</p>
        </div>
      </div>
    </div>
  );
}
