import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { CreditCard, Plus, AlertTriangle, CheckCircle, Clock, X, IndianRupee, Download, Search, TrendingUp } from 'lucide-react';
import { exportElementToPdf, printReceipt } from '../utils/exportPdf';

export default function Fees() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isAdmin = ['admin', 'superadmin'].includes(user?.role);

  if (!isStudent && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <CreditCard size={48} className="text-slate-300 mb-4" />
        <h2 className="text-lg font-semibold text-slate-600 mb-1">Fee Module Not Available</h2>
        <p className="text-sm text-slate-400">This section is only accessible to students and administrators.</p>
      </div>
    );
  }

  const [tab, setTab] = useState(isStudent ? 'My Fees' : 'Overview');
  const tabs = isAdmin
    ? ['Overview', 'Fee Structures', 'Assign Fees', 'Defaulters']
    : ['My Fees'];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Fee Management</h1>
        <p className="text-sm text-slate-500">Track and manage student fees</p>
      </div>
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'Overview' && <FeeOverviewTab />}
      {tab === 'Fee Structures' && <FeeStructuresTab />}
      {tab === 'Assign Fees' && <AssignFeesTab />}
      {tab === 'Defaulters' && <DefaultersTab />}
      {tab === 'My Fees' && <MyFeesTab />}
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function FeeOverviewTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/fees/stats').then(r => setStats(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10 text-slate-400">Loading...</div>;

  const collected = stats?.collectedAmount || 0;
  const total = stats?.totalAmount || 0;
  const pending = total - collected;
  const pct = total > 0 ? ((collected / total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Billed', value: `₹${(total / 100000).toFixed(1)}L`, sub: `${stats?.totalCount || 0} records`, icon: IndianRupee, color: 'bg-indigo-500' },
          { label: 'Collected', value: `₹${(collected / 100000).toFixed(1)}L`, sub: `${pct}% of total`, icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Pending', value: stats?.pendingCount || 0, sub: `₹${(pending / 100000).toFixed(1)}L remaining`, icon: Clock, color: 'bg-amber-500' },
          { label: 'Overdue', value: stats?.overdueCount || 0, sub: 'past due date', icon: AlertTriangle, color: 'bg-red-500' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Collection Progress</h2>
          <span className="text-sm font-bold text-indigo-600">{pct}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span className="text-green-600 font-medium">₹{collected.toLocaleString()} collected</span>
          <span className="text-red-500 font-medium">₹{pending.toLocaleString()} remaining</span>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Paid', count: stats?.paidCount || 0, amount: collected, color: 'border-green-200 bg-green-50', textColor: 'text-green-700', barColor: 'bg-green-500' },
          { label: 'Pending', count: stats?.pendingCount || 0, amount: pending, color: 'border-amber-200 bg-amber-50', textColor: 'text-amber-700', barColor: 'bg-amber-500' },
          { label: 'Overdue', count: stats?.overdueCount || 0, amount: stats?.overdueAmount || 0, color: 'border-red-200 bg-red-50', textColor: 'text-red-700', barColor: 'bg-red-500' },
        ].map(({ label, count, amount, color, textColor, barColor }) => (
          <div key={label} className={`rounded-xl border p-4 ${color}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-semibold ${textColor}`}>{label}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white ${textColor}`}>{count} records</span>
            </div>
            <p className={`text-2xl font-bold ${textColor}`}>₹{amount.toLocaleString()}</p>
            <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
              <div className={`h-full ${barColor} rounded-full`} style={{ width: total > 0 ? `${Math.min((amount / total) * 100, 100)}%` : '0%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Fee Structures ───────────────────────────────────────────────────────────
function FeeStructuresTab() {
  const [structures, setStructures] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ department: '', semester: '', amount: '', academicYear: '2026-27', description: '' });

  useEffect(() => {
    api.get('/fees/structures').then(r => setStructures(r.data.data || [])).catch(() => {});
    api.get('/departments').then(r => setDepartments(r.data.data || [])).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/fees/structures', form);
      setStructures(prev => [...prev, res.data.data]);
      toast.success('Fee structure created');
      setShowForm(false);
      setForm({ department: '', semester: '', amount: '', academicYear: '2026-27', description: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this fee structure?')) return;
    try {
      await api.delete(`/fees/structures/${id}`);
      setStructures(prev => prev.filter(s => s._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={16} /> Add Structure
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Department', 'Semester', 'Amount', 'Academic Year', 'Description', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {structures.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">No fee structures defined</td></tr>
            ) : structures.map(s => (
              <tr key={s._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{s.department?.name || 'All'}</td>
                <td className="px-4 py-3 text-slate-600">{s.semester ? `Sem ${s.semester}` : 'All'}</td>
                <td className="px-4 py-3 font-semibold text-indigo-700">₹{s.amount?.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600">{s.academicYear}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{s.description || '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(s._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400">
                    <X size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Add Fee Structure</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                  <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Semester</label>
                  <select value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">All Semesters</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Amount (₹)</label>
                  <input type="number" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="e.g. 50000"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Academic Year</label>
                  <select value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {['2023-24', '2024-25', '2025-26', '2026-27'].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Tuition Fee Sem 1"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Assign Fees ──────────────────────────────────────────────────────────────
function AssignFeesTab() {
  const [structures, setStructures] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ feeStructureId: '', department: '', semester: '', dueDate: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get('/fees/structures').then(r => setStructures(r.data.data || [])).catch(() => {});
    api.get('/departments').then(r => setDepartments(r.data.data || [])).catch(() => {});
  }, []);

  // Auto-fill dept+sem when structure is selected
  const handleStructureChange = (id) => {
    const s = structures.find(x => x._id === id);
    setForm(prev => ({
      ...prev,
      feeStructureId: id,
      department: s?.department?._id || '',
      semester: s?.semester?.toString() || '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.feeStructureId) { toast.error('Select a fee structure'); return; }
    if (!form.dueDate) { toast.error('Set a due date'); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/fees/bulk-assign', {
        feeStructureId: form.feeStructureId,
        department: form.department || undefined,
        semester: form.semester ? Number(form.semester) : undefined,
        dueDate: form.dueDate,
      });
      setResult(res.data.message);
      toast.success(res.data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const selectedStructure = structures.find(s => s._id === form.feeStructureId);

  return (
    <div className="max-w-lg space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-1">Bulk Assign Fees</h2>
        <p className="text-xs text-slate-400 mb-5">
          Assigns the selected fee structure to all matching students. Already-assigned students are skipped (no duplicates).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fee Structure */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Fee Structure <span className="text-red-400">*</span></label>
            <select required value={form.feeStructureId} onChange={e => handleStructureChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select a fee structure</option>
              {structures.map(s => (
                <option key={s._id} value={s._id}>
                  {s.department?.name || 'All Depts'} · {s.semester ? `Sem ${s.semester}` : 'All Sems'} · ₹{s.amount?.toLocaleString()} · {s.academicYear}
                </option>
              ))}
            </select>
          </div>

          {/* Selected structure preview */}
          {selectedStructure && (
            <div className="bg-indigo-50 rounded-lg px-4 py-3 text-xs text-indigo-700 space-y-1">
              <p><span className="font-medium">Amount:</span> ₹{selectedStructure.amount?.toLocaleString()}</p>
              <p><span className="font-medium">Academic Year:</span> {selectedStructure.academicYear}</p>
              {selectedStructure.description && <p><span className="font-medium">Note:</span> {selectedStructure.description}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Department override */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
              <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All Departments</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>

            {/* Semester override */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Semester</label>
              <select value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All Semesters</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Due Date <span className="text-red-400">*</span></label>
            <input type="date" required value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Assigning...</>
              : <><Plus size={15} /> Assign Fees</>
            }
          </button>
        </form>

        {result && (
          <div className="mt-4 flex items-center gap-2 bg-green-50 text-green-700 rounded-lg px-4 py-3 text-sm">
            <CheckCircle size={16} />
            {result}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Defaulters ───────────────────────────────────────────────────────────────
function DefaultersTab() {
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [discountModal, setDiscountModal] = useState({ fee: null, value: '' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchDefaulters = () => {
    setLoading(true);
    api.get('/fees/defaulters').then(r => setDefaulters(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDefaulters(); }, []);

  const handleMarkPaid = async (id) => {
    try {
      await api.put(`/fees/${id}/pay`, {});
      setDefaulters(prev => prev.filter(d => d._id !== id));
      toast.success('Marked as paid');
    } catch { toast.error('Failed'); }
  };

  const handleApplyDiscount = async () => {
    const { fee, value } = discountModal;
    const amount = Number(value);
    if (!amount || amount < 0) { toast.error('Enter a valid discount amount'); return; }
    if (amount > fee.amount) { toast.error('Discount cannot exceed fee amount'); return; }
    try {
      await api.put(`/fees/${fee._id}/discount`, { discount: amount });
      toast.success('Discount applied');
      setDiscountModal({ fee: null, value: '' });
      fetchDefaulters();
    } catch { toast.error('Failed to apply discount'); }
  };

  // KPIs
  const totalDue = defaulters.reduce((s, d) => s + (d.amount - d.discount), 0);
  const overdueCount = defaulters.filter(d => d.status === 'overdue').length;
  const overdueAmount = defaulters.filter(d => d.status === 'overdue').reduce((s, d) => s + (d.amount - d.discount), 0);

  const filtered = defaulters.filter(d => {
    const matchSearch = !search ||
      d.student?.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.student?.userId?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      {!loading && defaulters.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Defaulters', value: defaulters.length, sub: 'pending + overdue', icon: AlertTriangle, color: 'bg-amber-500' },
            { label: 'Total Due', value: `₹${(totalDue / 1000).toFixed(1)}K`, sub: 'net after discounts', icon: IndianRupee, color: 'bg-red-500' },
            { label: 'Overdue', value: overdueCount, sub: 'past due date', icon: Clock, color: 'bg-red-600' },
            { label: 'Overdue Amount', value: `₹${(overdueAmount / 1000).toFixed(1)}K`, sub: 'needs urgent action', icon: TrendingUp, color: overdueAmount > 0 ? 'bg-red-700' : 'bg-emerald-500' },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-xl font-bold text-slate-800">{value}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center gap-3">
          <h2 className="font-semibold text-slate-800 mr-auto">Fee Defaulters</h2>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search student..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{filtered.length} records</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Student', 'Department', 'Amount Due', 'Due Date', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">{defaulters.length === 0 ? 'No defaulters 🎉' : 'No records match filter'}</td></tr>
            ) : filtered.map(d => (
              <tr key={d._id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{d.student?.userId?.name}</p>
                  <p className="text-xs text-slate-400">{d.student?.userId?.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{d.student?.department?.name || '—'}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-red-600">₹{(d.amount - d.discount).toLocaleString()}</p>
                  {d.discount > 0 && <p className="text-xs text-green-600">-₹{d.discount.toLocaleString()} discount</p>}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {d.dueDate ? new Date(d.dueDate).toLocaleDateString('en-IN') : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.status === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleMarkPaid(d._id)}
                      className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium">
                      Mark Paid
                    </button>
                    <button onClick={() => setDiscountModal({ fee: d, value: d.discount > 0 ? String(d.discount) : '' })}
                      className="text-xs px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium">
                      Discount
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {discountModal.fee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800">Apply Discount</h2>
              <button onClick={() => setDiscountModal({ fee: null, value: '' })}><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="mb-4 bg-slate-50 rounded-lg p-3 text-sm space-y-1">
              <p className="text-slate-700 font-medium">{discountModal.fee.student?.userId?.name}</p>
              <p className="text-slate-500 text-xs">{discountModal.fee.student?.userId?.email}</p>
              <p className="text-slate-600 text-xs mt-1">Original amount: <span className="font-semibold">₹{discountModal.fee.amount?.toLocaleString()}</span></p>
            </div>
            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-600 mb-1">Discount Amount (₹)</label>
              <input
                type="number"
                min="0"
                max={discountModal.fee.amount}
                value={discountModal.value}
                onChange={e => setDiscountModal(prev => ({ ...prev, value: e.target.value }))}
                placeholder="e.g. 5000"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              {discountModal.value && Number(discountModal.value) > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  Net payable: ₹{(discountModal.fee.amount - Number(discountModal.value)).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDiscountModal({ fee: null, value: '' })} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handleApplyDiscount} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── My Fees (Student) ────────────────────────────────────────────────────────
function MyFeesTab() {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiptFee, setReceiptFee] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const [payModal, setPayModal] = useState(null); // fee object

  useEffect(() => {
    api.get('/students/me').then(res => {
      const myProfile = res.data.data;
      if (myProfile) {
        setStudentId(myProfile._id);
        setStudentProfile(myProfile);
        api.get(`/fees/student/${myProfile._id}`)
          .then(r => { setFees(r.data.data || []); setSummary(r.data.summary); })
          .catch(() => {})
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, [user]);

  const handleSimulatePayment = async (fee) => {
    console.log('Starting payment for fee:', fee._id);
    setPayingId(fee._id);
    try {
      console.log('Sending payment request...');
      const response = await api.put(`/fees/${fee._id}/pay`, { 
        transactionId: `SIM_TXN_${Date.now()}`,
        paymentMethod: 'simulated'
      });
      console.log('Payment response:', response.data);
      
      // Refresh fees
      console.log('Refreshing fees for student:', studentId);
      const r = await api.get(`/fees/student/${studentId}`);
      setFees(r.data.data || []);
      setSummary(r.data.summary);
      toast.success('Payment successful!');
      setPayModal(null);
    } catch (err) { 
      console.error('Payment error:', err);
      console.error('Error response:', err.response?.data);
      toast.error(err.response?.data?.message || 'Payment failed'); 
    }
    finally { setPayingId(null); }
  };

  const handleDownloadReceipt = async (fee) => {
    console.log('Starting receipt download for fee:', fee._id);
    setReceiptFee(fee);
    // Wait for DOM to render then export
    setTimeout(async () => {
      setExporting(true);
      try {
        console.log('Looking for element: fee-receipt-print');
        const element = document.getElementById('fee-receipt-print');
        if (!element) {
          throw new Error('Receipt element not found');
        }
        console.log('Element found, starting PDF export...');
        await exportElementToPdf('fee-receipt-print', `receipt-${fee._id}`, 'portrait');
        toast.success('Receipt downloaded as PDF');
        console.log('Receipt download successful');
      } catch (error) { 
        console.error('PDF export failed, trying print fallback:', error);
        try {
          printReceipt('fee-receipt-print');
          toast.success('Receipt opened for printing');
        } catch (printError) {
          console.error('Print fallback also failed:', printError);
          toast.error('Receipt download failed. Please try again.');
        }
      }
      finally { 
        setExporting(false); 
        setReceiptFee(null); 
      }
    }, 500); // Increased timeout to ensure DOM is ready
  };

  if (loading) return <div className="text-center py-10 text-slate-400">Loading...</div>;

  const paidPct = summary?.total > 0 ? ((summary.paid / summary.total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-5">
      {summary && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Fees', value: `₹${summary.total?.toLocaleString()}`, icon: IndianRupee, color: 'bg-indigo-500' },
              { label: 'Paid', value: `₹${summary.paid?.toLocaleString()}`, icon: CheckCircle, color: 'bg-green-500' },
              { label: 'Pending', value: `₹${summary.pending?.toLocaleString()}`, icon: Clock, color: summary.pending > 0 ? 'bg-red-500' : 'bg-emerald-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                  <Icon size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-lg font-bold text-slate-800">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Payment Progress</span>
              <span className={`text-sm font-bold ${parseFloat(paidPct) === 100 ? 'text-green-600' : 'text-indigo-600'}`}>{paidPct}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${parseFloat(paidPct) === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                style={{ width: `${paidPct}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">₹{summary.paid?.toLocaleString()} paid of ₹{summary.total?.toLocaleString()} total</p>
          </div>
        </>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Description', 'Amount', 'Discount', 'Net Amount', 'Due Date', 'Status', 'Receipt'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fees.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-slate-400">No fee records</td></tr>
            ) : fees.map(f => (
              <tr key={f._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-700">{f.feeStructure?.description || f.feeStructure?.academicYear || '—'}</td>
                <td className="px-4 py-3 text-slate-700">₹{f.amount?.toLocaleString()}</td>
                <td className="px-4 py-3 text-green-600">{f.discount > 0 ? `₹${f.discount.toLocaleString()}` : '—'}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">₹{(f.amount - f.discount).toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {f.dueDate ? new Date(f.dueDate).toLocaleDateString('en-IN') : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    f.status === 'paid' ? 'bg-green-100 text-green-700' :
                    f.status === 'overdue' ? 'bg-red-100 text-red-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>{f.status}</span>
                </td>
                <td className="px-4 py-3">
                  {f.status === 'paid' ? (
                    <button onClick={() => handleDownloadReceipt(f)} disabled={exporting}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:underline disabled:opacity-60">
                      <Download size={12} /> Receipt
                    </button>
                  ) : (
                    <button onClick={() => setPayModal(f)}
                      className="flex items-center gap-1 text-xs px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                      Pay Now
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Simulated Payment Modal */}
      {payModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800">Confirm Payment</h2>
              <button onClick={() => setPayModal(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Description</span>
                <span className="font-medium text-slate-800">{payModal.feeStructure?.description || payModal.feeStructure?.academicYear || 'Fee Payment'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-medium text-slate-800">₹{payModal.amount?.toLocaleString()}</span>
              </div>
              {payModal.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount</span>
                  <span className="font-medium text-green-600">-₹{payModal.discount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-indigo-200 pt-2 mt-1">
                <span className="font-semibold text-slate-700">Net Payable</span>
                <span className="font-bold text-indigo-700 text-base">₹{(payModal.amount - payModal.discount)?.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 mb-5">
              This is a simulated payment. No real transaction will occur.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPayModal(null)} className="flex-1 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleSimulatePayment(payModal)} disabled={payingId === payModal._id}
                className="flex-1 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-60 flex items-center justify-center gap-2">
                {payingId === payModal._id
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                  : 'Confirm Payment'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden receipt for PDF export */}
      {receiptFee && (
        <div style={{ position: 'fixed', left: '-9999px', top: '0' }}>
          <div id="fee-receipt-print" style={{ 
            backgroundColor: 'white', 
            padding: '32px', 
            width: '600px',
            fontFamily: 'Arial, sans-serif',
            color: '#1e293b'
          }}>
            {/* Header */}
            <div style={{ 
              textAlign: 'center', 
              borderBottom: '1px solid #e2e8f0', 
              paddingBottom: '16px', 
              marginBottom: '16px' 
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px', 
                marginBottom: '8px' 
              }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  backgroundColor: '#4f46e5', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  ₹
                </div>
                <span style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#4f46e5' 
                }}>
                  CampusNex
                </span>
              </div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#1e293b', 
                margin: '8px 0 4px 0' 
              }}>
                Fee Payment Receipt
              </h2>
              <p style={{ 
                fontSize: '12px', 
                color: '#64748b', 
                margin: '0' 
              }}>
                Receipt No: {receiptFee._id?.slice(-8).toUpperCase()}
              </p>
            </div>

            {/* Receipt Details */}
            <div style={{ marginBottom: '24px' }}>
              {[
                ['Student Name', user?.name || 'N/A'],
                ['Description', receiptFee.feeStructure?.description || receiptFee.feeStructure?.academicYear || 'Fee Payment'],
                ['Amount', `₹${receiptFee.amount?.toLocaleString() || '0'}`],
                ['Discount', receiptFee.discount > 0 ? `₹${receiptFee.discount?.toLocaleString()}` : 'None'],
                ['Net Amount Paid', `₹${((receiptFee.amount || 0) - (receiptFee.discount || 0))?.toLocaleString()}`],
                ['Payment Date', receiptFee.paidDate ? new Date(receiptFee.paidDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')],
                ['Transaction ID', receiptFee.transactionId || 'N/A'],
                ['Status', 'PAID'],
              ].map(([label, value]) => (
                <div key={label} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  borderBottom: '1px solid #f1f5f9', 
                  padding: '8px 0',
                  fontSize: '14px'
                }}>
                  <span style={{ color: '#64748b' }}>{label}:</span>
                  <span style={{ 
                    fontWeight: label === 'Net Amount Paid' || label === 'Status' ? 'bold' : '600', 
                    color: label === 'Status' ? '#059669' : '#1e293b'
                  }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ 
              textAlign: 'center', 
              marginTop: '24px', 
              paddingTop: '16px', 
              borderTop: '1px solid #e2e8f0' 
            }}>
              <p style={{ 
                fontSize: '12px', 
                color: '#64748b', 
                margin: '0 0 4px 0' 
              }}>
                This is a computer-generated receipt. No signature required.
              </p>
              <p style={{ 
                fontSize: '12px', 
                color: '#64748b', 
                margin: '0' 
              }}>
                Generated on {new Date().toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
