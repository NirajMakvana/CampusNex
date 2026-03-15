import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Trash2, Eye, UserCheck, X, BookOpen, Calendar, ToggleLeft, ToggleRight, Users, UserX, Building2, Filter, Pencil } from 'lucide-react';

export default function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewFaculty, setViewFaculty] = useState(null);
  const [editFaculty, setEditFaculty] = useState(null);
  const { user: currentUser } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', employeeId: '', department: '',
    designation: 'Assistant Professor', joiningDate: '', salary: '', phone: '',
  });

  useEffect(() => {
    fetchFaculty();
    api.get('/departments').then(r => setDepartments(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [filterDept]);

  const fetchFaculty = async () => {
    try {
      const params = { limit: 1000 };
      if (filterDept) params.department = filterDept;
      const res = await api.get('/faculty', { params });
      setFaculty(res.data.data || []);
    } catch { toast.error('Failed to load faculty'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/faculty', form);
      toast.success('Faculty added');
      setShowForm(false);
      setForm({ name: '', email: '', employeeId: '', department: '', designation: 'Assistant Professor', joiningDate: '', salary: '', phone: '' });
      fetchFaculty();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this faculty member?')) return;
    try {
      await api.delete(`/faculty/${id}`);
      toast.success('Deleted');
      setFaculty(prev => prev.filter(f => f._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/faculty/${editFaculty._id}`, {
        department: editFaculty.department,
        designation: editFaculty.designation,
        phone: editFaculty.phone,
        salary: editFaculty.salary,
        joiningDate: editFaculty.joiningDate,
      });
      toast.success('Faculty updated');
      setEditFaculty(null);
      fetchFaculty();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleToggleStatus = async (f) => {
    const action = f.userId?.isActive === false ? 'activate' : 'deactivate';
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${f.userId?.name}?`)) return;
    try {
      const res = await api.put(`/faculty/${f._id}/toggle-status`);
      setFaculty(prev => prev.map(fc => fc._id === f._id
        ? { ...fc, userId: { ...fc.userId, isActive: res.data.isActive } }
        : fc
      ));
      toast.success(`Faculty ${res.data.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = faculty.filter(f =>
    f.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.employeeId?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = faculty.filter(f => f.userId?.isActive !== false).length;
  const inactiveCount = faculty.filter(f => f.userId?.isActive === false).length;

  const designations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Lab Instructor'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Faculty</h1>
          <p className="text-sm text-slate-500">{faculty.length} faculty members</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Faculty
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Faculty', value: faculty.length, icon: Users, color: 'bg-emerald-500' },
          { label: 'Active', value: activeCount, icon: UserCheck, color: 'bg-green-500' },
          { label: 'Inactive', value: inactiveCount, icon: UserX, color: 'bg-red-400' },
          { label: 'Departments', value: departments.length, icon: Building2, color: 'bg-amber-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-800">{loading ? '—' : value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by name or employee ID..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          {filterDept && (
            <button onClick={() => setFilterDept('')}
              className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 px-2 py-1.5 border border-slate-200 rounded-lg hover:border-red-200">
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Faculty', 'Employee ID', 'Department', 'Designation', 'Workload', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10"><UserCheck size={32} className="mx-auto mb-2 text-slate-300" /><p className="text-slate-400">No faculty found</p></td></tr>
            ) : filtered.map(f => (
              <tr key={f._id} className={`hover:bg-slate-50 transition-colors ${f.userId?.isActive === false ? 'opacity-60' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {f.userId?.avatar
                      ? <img src={f.userId.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      : <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold">{f.userId?.name?.[0]}</div>
                    }
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-slate-800">{f.userId?.name}</p>
                        {f.userId?.isActive === false && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Inactive</span>}
                      </div>
                      <p className="text-xs text-slate-400">{f.userId?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{f.employeeId}</td>
                <td className="px-4 py-3 text-slate-600">{f.department?.name || '—'}</td>
                <td className="px-4 py-3"><span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full">{f.designation}</span></td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-xs text-slate-600">
                    <BookOpen size={12} className="text-indigo-400" />
                    {f.subjects?.length || 0} courses
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setViewFaculty(f)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="View"><Eye size={15} /></button>
                    <button onClick={() => setEditFaculty({ ...f, department: f.department?._id || f.department })} className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-400 transition-colors" title="Edit"><Pencil size={15} /></button>
                    <button onClick={() => handleToggleStatus(f)} title={f.userId?.isActive === false ? 'Activate' : 'Deactivate'}
                      className={`p-1.5 rounded-lg transition-colors ${f.userId?.isActive === false ? 'hover:bg-green-50 text-green-500' : 'hover:bg-amber-50 text-amber-500'}`}>
                      {f.userId?.isActive === false ? <ToggleLeft size={15} /> : <ToggleRight size={15} />}
                    </button>
                    <button onClick={() => handleDelete(f._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Faculty Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Add Faculty Member</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-slate-500" /></button>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text', col: 2 },
                { label: 'Email', key: 'email', type: 'email', col: 2 },
                { label: 'Employee ID', key: 'employeeId', type: 'text', col: 1 },
                { label: 'Phone', key: 'phone', type: 'text', col: 1 },
                { label: 'Joining Date', key: 'joiningDate', type: 'date', col: 1 },
                { label: 'Salary (₹)', key: 'salary', type: 'number', col: 1 },
              ].map(({ label, key, type, col }) => (
                <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                  <input type={type} required={['name', 'email', 'employeeId'].includes(key)} value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                <select required value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Designation</label>
                <select value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {designations.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-span-2 flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Faculty</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editFaculty && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Edit Faculty</h2>
              <button onClick={() => setEditFaculty(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                  <select value={editFaculty.department} onChange={e => setEditFaculty(prev => ({ ...prev, department: e.target.value }))} required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Designation</label>
                  <select value={editFaculty.designation} onChange={e => setEditFaculty(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {designations.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                  <input type="text" value={editFaculty.phone || ''} onChange={e => setEditFaculty(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="10-digit number"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Salary (₹)</label>
                  <input type="number" value={editFaculty.salary || ''} onChange={e => setEditFaculty(prev => ({ ...prev, salary: e.target.value }))}
                    placeholder="e.g. 50000"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Joining Date</label>
                  <input type="date" value={editFaculty.joiningDate ? editFaculty.joiningDate.slice(0, 10) : ''} onChange={e => setEditFaculty(prev => ({ ...prev, joiningDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => setEditFaculty(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewFaculty && (
        <FacultyDetailModal faculty={viewFaculty} onClose={() => setViewFaculty(null)} isAdmin={['admin','superadmin'].includes(currentUser?.role)} />
      )}
    </div>
  );
}

// ─── Faculty Detail Modal (with Leaves + Workload tabs) ───────────────────────
function FacultyDetailModal({ faculty, onClose, isAdmin }) {
  const [tab, setTab] = useState('info');
  const [leaves, setLeaves] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [workloadLoading, setWorkloadLoading] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type: 'casual', fromDate: '', toDate: '', reason: '' });
  const [perfData, setPerfData] = useState(null);
  const [perfLoading, setPerfLoading] = useState(false);

  const loadPerformance = async () => {
    setPerfLoading(true);
    try {
      const [leavesRes, workloadRes] = await Promise.all([
        api.get(`/leaves/faculty/${faculty._id}`),
        api.get('/courses/workload'),
      ]);
      const allLeaves = leavesRes.data.data || [];
      const wl = workloadRes.data.data?.find(w => w.faculty._id === faculty._id);
      const leaveCounts = allLeaves.reduce((acc, l) => {
        acc[l.status] = (acc[l.status] || 0) + 1;
        return acc;
      }, {});
      const joiningDate = faculty.joiningDate ? new Date(faculty.joiningDate) : null;
      const tenureMonths = joiningDate
        ? Math.floor((Date.now() - joiningDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
        : null;
      setPerfData({
        totalLeaves: allLeaves.length,
        approvedLeaves: leaveCounts.approved || 0,
        pendingLeaves: leaveCounts.pending || 0,
        rejectedLeaves: leaveCounts.rejected || 0,
        coursesAssigned: wl?.courses?.length || 0,
        tenureMonths,
        joiningDate,
      });
    } catch { toast.error('Failed to load performance data'); }
    finally { setPerfLoading(false); }
  };

  const loadLeaves = async () => {
    setLeaveLoading(true);
    try {
      const res = await api.get(`/leaves/faculty/${faculty._id}`);
      setLeaves(res.data.data || []);
    } catch { toast.error('Failed to load leaves'); }
    finally { setLeaveLoading(false); }
  };

  const loadWorkload = async () => {
    setWorkloadLoading(true);
    try {
      const res = await api.get('/courses/workload');
      const mine = res.data.data?.find(w => w.faculty._id === faculty._id);
      setWorkload(mine?.courses || []);
    } catch { toast.error('Failed to load workload'); }
    finally { setWorkloadLoading(false); }
  };

  useEffect(() => {
    if (tab === 'leaves') loadLeaves();
    if (tab === 'workload') loadWorkload();
    if (tab === 'performance') loadPerformance();
  }, [tab]);

  const handleLeaveStatus = async (id, status) => {
    try {
      await api.put(`/leaves/${id}`, { status });
      toast.success(`Leave ${status}`);
      loadLeaves();
    } catch { toast.error('Failed to update'); }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', leaveForm);
      toast.success('Leave applied');
      setShowLeaveForm(false);
      setLeaveForm({ type: 'casual', fromDate: '', toDate: '', reason: '' });
      loadLeaves();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const statusColor = (s) => ({
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600',
  }[s] || 'bg-slate-100 text-slate-600');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl font-bold">
              {faculty.userId?.name?.[0]}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{faculty.userId?.name}</h3>
              <p className="text-xs text-slate-500">{faculty.designation} · {faculty.department?.name}</p>
            </div>
          </div>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 border-b border-slate-200 shrink-0">
          {[['info', 'Info'], ['salary', 'Salary'], ['leaves', 'Leaves'], ['workload', 'Workload'], ['performance', 'Performance']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'info' && (
            <div className="space-y-3 text-sm">
              {[
                ['Employee ID', faculty.employeeId],
                ['Email', faculty.userId?.email],
                ['Phone', faculty.phone || '—'],
                ['Joining Date', faculty.joiningDate ? new Date(faculty.joiningDate).toLocaleDateString('en-IN') : '—'],
                ['Subjects Assigned', faculty.subjects?.length ? `${faculty.subjects.length} courses` : 'None'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-slate-800">{value}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'salary' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 rounded-xl p-5 text-center">
                <p className="text-xs text-slate-500 mb-1">Monthly Salary</p>
                <p className="text-3xl font-bold text-emerald-700">
                  {faculty.salary ? `₹${Number(faculty.salary).toLocaleString('en-IN')}` : 'Not set'}
                </p>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  ['Joining Date', faculty.joiningDate ? new Date(faculty.joiningDate).toLocaleDateString('en-IN') : '—'],
                  ['Designation', faculty.designation],
                  ['Department', faculty.department?.name || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-slate-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'leaves' && (
            <div className="space-y-4">
              {!isAdmin && (
                <div className="flex justify-end">
                  <button onClick={() => setShowLeaveForm(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <Plus size={14} /> Apply Leave
                  </button>
                </div>
              )}
              {showLeaveForm && (
                <form onSubmit={handleApplyLeave} className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                      <select value={leaveForm.type} onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {['casual', 'sick', 'earned', 'maternity', 'other'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">From</label>
                      <input type="date" required value={leaveForm.fromDate} onChange={e => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">To</label>
                      <input type="date" required value={leaveForm.toDate} onChange={e => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Reason</label>
                      <input type="text" required value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setShowLeaveForm(false)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-white">Cancel</button>
                    <button type="submit" className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Submit</button>
                  </div>
                </form>
              )}
              {leaveLoading ? <div className="text-center py-6 text-slate-400">Loading...</div> : leaves.length === 0 ? (
                <div className="text-center py-6 text-slate-400"><Calendar size={28} className="mx-auto mb-2 opacity-30" /><p>No leave requests</p></div>
              ) : (
                <div className="space-y-2">
                  {leaves.map(l => (
                    <div key={l._id} className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-800 capitalize">{l.type} Leave</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(l.status)}`}>{l.status}</span>
                          </div>
                          <p className="text-xs text-slate-500">{new Date(l.fromDate).toLocaleDateString('en-IN')} — {new Date(l.toDate).toLocaleDateString('en-IN')}</p>
                          <p className="text-xs text-slate-600 mt-1">{l.reason}</p>
                        </div>
                        {l.status === 'pending' && (
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => handleLeaveStatus(l._id, 'approved')}
                              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200">Approve</button>
                            <button onClick={() => handleLeaveStatus(l._id, 'rejected')}
                              className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Reject</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'workload' && (
            <div className="space-y-3">
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-500 mb-1">Total Courses Assigned</p>
                <p className="text-3xl font-bold text-indigo-700">{workload.length}</p>
              </div>
              {workloadLoading ? <div className="text-center py-6 text-slate-400">Loading...</div> : workload.length === 0 ? (
                <div className="text-center py-6 text-slate-400"><BookOpen size={28} className="mx-auto mb-2 opacity-30" /><p>No courses assigned</p></div>
              ) : (
                <div className="space-y-2">
                  {workload.map(c => (
                    <div key={c._id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.code} · {c.department?.name}</p>
                      </div>
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Sem {c.semester}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {tab === 'performance' && (
            <div className="space-y-4">
              {perfLoading ? (
                <div className="text-center py-8 text-slate-400">Loading...</div>
              ) : perfData ? (
                <>
                  {/* Tenure */}
                  <div className="bg-indigo-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-500 mb-1">Tenure</p>
                    <p className="text-2xl font-bold text-indigo-700">
                      {perfData.tenureMonths !== null
                        ? `${Math.floor(perfData.tenureMonths / 12)}y ${perfData.tenureMonths % 12}m`
                        : '—'}
                    </p>
                    {perfData.joiningDate && (
                      <p className="text-xs text-slate-400 mt-1">
                        Since {new Date(perfData.joiningDate).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>

                  {/* KPI grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Courses Assigned', value: perfData.coursesAssigned, color: 'text-indigo-700', bg: 'bg-indigo-50' },
                      { label: 'Total Leave Requests', value: perfData.totalLeaves, color: 'text-slate-700', bg: 'bg-slate-50' },
                      { label: 'Approved Leaves', value: perfData.approvedLeaves, color: 'text-green-700', bg: 'bg-green-50' },
                      { label: 'Pending Leaves', value: perfData.pendingLeaves, color: 'text-amber-700', bg: 'bg-amber-50' },
                    ].map(({ label, value, color, bg }) => (
                      <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
                        <p className="text-xs text-slate-500 mb-1">{label}</p>
                        <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Leave breakdown bar */}
                  {perfData.totalLeaves > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-medium text-slate-600 mb-2">Leave Breakdown</p>
                      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                        {perfData.approvedLeaves > 0 && (
                          <div className="bg-green-500 rounded-full" style={{ width: `${(perfData.approvedLeaves / perfData.totalLeaves) * 100}%` }} />
                        )}
                        {perfData.pendingLeaves > 0 && (
                          <div className="bg-amber-400 rounded-full" style={{ width: `${(perfData.pendingLeaves / perfData.totalLeaves) * 100}%` }} />
                        )}
                        {perfData.rejectedLeaves > 0 && (
                          <div className="bg-red-400 rounded-full" style={{ width: `${(perfData.rejectedLeaves / perfData.totalLeaves) * 100}%` }} />
                        )}
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Approved</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Pending</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Rejected</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-slate-400">No data available</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
