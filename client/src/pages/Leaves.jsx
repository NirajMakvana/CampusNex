import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, X, CheckCircle, Clock, XCircle } from 'lucide-react';

const STATUS_STYLES = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

const STATUS_ICONS = {
  pending:  Clock,
  approved: CheckCircle,
  rejected: XCircle,
};

export default function Leaves() {
  const { user } = useAuth();
  const isAdmin = ['admin', 'superadmin'].includes(user?.role);
  const isStudent = user?.role === 'student';
  const isFaculty = user?.role === 'faculty';

  const tabs = isAdmin
    ? ['All Leaves']
    : isFaculty
    ? ['My Leaves', 'Department Leaves']
    : ['My Leave Requests']; // student

  const [tab, setTab] = useState(tabs[0]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Leave Management</h1>
        <p className="text-sm text-slate-500">Apply and track leave requests</p>
      </div>
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'My Leaves' && <MyLeavesTab />}
      {tab === 'My Leave Requests' && <StudentLeavesTab />}
      {tab === 'Department Leaves' && <DeptLeavesTab />}
      {tab === 'All Leaves' && <AllLeavesTab />}
    </div>
  );
}

// ─── Shared leave apply form + days helper ────────────────────────────────────
const days = (from, to) => {
  if (!from || !to) return 0;
  return Math.max(1, Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1);
};

function ApplyLeaveModal({ onClose, onSubmit, submitting }) {
  const [form, setForm] = useState({ type: 'casual', fromDate: '', toDate: '', reason: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (new Date(form.toDate) < new Date(form.fromDate)) { toast.error('End date must be after start date'); return; }
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">Apply for Leave</h2>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Leave Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="casual">Casual Leave</option>
              <option value="medical">Medical Leave</option>
              <option value="earned">Earned Leave</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">From Date</label>
              <input type="date" required value={form.fromDate} onChange={e => setForm({ ...form, fromDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">To Date</label>
              <input type="date" required value={form.toDate} onChange={e => setForm({ ...form, toDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          {form.fromDate && form.toDate && new Date(form.toDate) >= new Date(form.fromDate) && (
            <p className="text-xs text-indigo-600">{days(form.fromDate, form.toDate)} day(s) selected</p>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Reason</label>
            <textarea rows={3} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
              placeholder="Brief reason for leave..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60">
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Reject remark modal ──────────────────────────────────────────────────────
function RejectModal({ onClose, onConfirm }) {
  const [remark, setRemark] = useState('');
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">Reject Leave</h2>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-medium text-slate-600 mb-1">Rejection Reason (optional)</label>
          <textarea rows={3} value={remark} onChange={e => setRemark(e.target.value)}
            placeholder="e.g. Insufficient leave balance..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
          <button onClick={() => onConfirm(remark)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Reject</button>
        </div>
      </div>
    </div>
  );
}

// ─── My Leaves (Faculty) ──────────────────────────────────────────────────────
function MyLeavesTab() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/faculty/me')
      .then(res => {
        const id = res.data.data?._id;
        return id ? api.get(`/leaves/faculty/${id}`) : Promise.resolve({ data: { data: [] } });
      })
      .then(res => setLeaves(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (form) => {
    setSubmitting(true);
    try {
      const res = await api.post('/leaves', form);
      setLeaves(prev => [res.data.data, ...prev]);
      toast.success('Leave applied successfully');
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to apply'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={16} /> Apply Leave
        </button>
      </div>
      <MyLeaveTable leaves={leaves} loading={loading} />
      {showForm && <ApplyLeaveModal onClose={() => setShowForm(false)} onSubmit={handleSubmit} submitting={submitting} />}
    </div>
  );
}

// ─── My Leave Requests (Student) ──────────────────────────────────────────────
function StudentLeavesTab() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // backend resolves student from JWT token
    api.get('/leaves/student/me')
      .then(res => setLeaves(res.data.data || []))
      .catch(() => setLeaves([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (form) => {
    setSubmitting(true);
    try {
      const res = await api.post('/leaves', form);
      setLeaves(prev => [res.data.data, ...prev]);
      toast.success('Leave applied successfully');
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to apply'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={16} /> Apply Leave
        </button>
      </div>
      <MyLeaveTable leaves={leaves} loading={loading} />
      {showForm && <ApplyLeaveModal onClose={() => setShowForm(false)} onSubmit={handleSubmit} submitting={submitting} />}
    </div>
  );
}

// ─── Read-only table for own leaves ──────────────────────────────────────────
function MyLeaveTable({ leaves, loading }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {['Type', 'From', 'To', 'Days', 'Reason', 'Status', 'Remark'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr><td colSpan={7} className="text-center py-10 text-slate-400">Loading...</td></tr>
          ) : leaves.length === 0 ? (
            <tr><td colSpan={7} className="text-center py-10 text-slate-400">No leave requests yet</td></tr>
          ) : leaves.map(l => {
            const Icon = STATUS_ICONS[l.status] || Clock;
            return (
              <tr key={l._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 capitalize font-medium text-slate-700">{l.type}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{new Date(l.fromDate).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{new Date(l.toDate).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3 text-slate-600">{days(l.fromDate, l.toDate)}</td>
                <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">{l.reason || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[l.status] || STATUS_STYLES.pending}`}>
                    <Icon size={11} /> {l.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{l.adminRemark || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Department Leaves (HOD / Faculty) ───────────────────────────────────────
function DeptLeavesTab() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null); // leave id

  useEffect(() => {
    api.get('/leaves/department').then(r => setLeaves(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAction = async (id, status, remark = '') => {
    try {
      const res = await api.put(`/leaves/${id}`, { status, adminRemark: remark });
      setLeaves(prev => prev.map(l => l._id === id ? res.data.data : l));
      toast.success(`Leave ${status}`);
    } catch { toast.error('Action failed'); }
  };

  return (
    <>
      <LeaveTable leaves={leaves} loading={loading} showFaculty
        onApprove={id => handleAction(id, 'approved')}
        onReject={id => setRejectModal(id)} />
      {rejectModal && (
        <RejectModal
          onClose={() => setRejectModal(null)}
          onConfirm={remark => { handleAction(rejectModal, 'rejected', remark); setRejectModal(null); }} />
      )}
    </>
  );
}

// ─── All Leaves (Admin) ───────────────────────────────────────────────────────
function AllLeavesTab() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    api.get('/leaves').then(r => setLeaves(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAction = async (id, status, remark = '') => {
    try {
      const res = await api.put(`/leaves/${id}`, { status, adminRemark: remark });
      setLeaves(prev => prev.map(l => l._id === id ? res.data.data : l));
      toast.success(`Leave ${status}`);
    } catch { toast.error('Action failed'); }
  };

  const filtered = statusFilter === 'all' ? leaves : leaves.filter(l => l.status === statusFilter);

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap">
        {/* KPI pills */}
        {['all', 'pending', 'approved', 'rejected'].map(s => {
          const count = s === 'all' ? leaves.length : leaves.filter(l => l.status === s).length;
          const active = statusFilter === s;
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors capitalize ${
                active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {s} ({count})
            </button>
          );
        })}
      </div>
      <LeaveTable leaves={filtered} loading={loading} showFaculty
        onApprove={id => handleAction(id, 'approved')}
        onReject={id => setRejectModal(id)} />
      {rejectModal && (
        <RejectModal
          onClose={() => setRejectModal(null)}
          onConfirm={remark => { handleAction(rejectModal, 'rejected', remark); setRejectModal(null); }} />
      )}
    </>
  );
}

// ─── Shared admin/HOD table ───────────────────────────────────────────────────
function LeaveTable({ leaves, loading, onApprove, onReject, showFaculty }) {
  const cols = [...(showFaculty ? ['Faculty'] : []), 'Type', 'From', 'To', 'Days', 'Reason', 'Status', 'Actions'];
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {cols.map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr><td colSpan={cols.length} className="text-center py-10 text-slate-400">Loading...</td></tr>
          ) : leaves.length === 0 ? (
            <tr><td colSpan={cols.length} className="text-center py-10 text-slate-400">No leave requests</td></tr>
          ) : leaves.map(l => {
            const Icon = STATUS_ICONS[l.status] || Clock;
            return (
              <tr key={l._id} className="hover:bg-slate-50">
                {showFaculty && (
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{l.faculty?.userId?.name || l.student?.userId?.name || '—'}</p>
                    <p className="text-xs text-slate-400">{l.faculty?.userId?.email || l.student?.userId?.email || ''}</p>
                  </td>
                )}
                <td className="px-4 py-3 capitalize text-slate-700">{l.type}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{new Date(l.fromDate).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{new Date(l.toDate).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3 text-slate-600">{days(l.fromDate, l.toDate)}</td>
                <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">{l.reason || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[l.status] || STATUS_STYLES.pending}`}>
                    <Icon size={11} /> {l.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {l.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button onClick={() => onApprove(l._id)}
                        className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium">
                        Approve
                      </button>
                      <button onClick={() => onReject(l._id)}
                        className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium">
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">{l.adminRemark || '—'}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
