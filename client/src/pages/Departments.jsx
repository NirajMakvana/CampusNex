import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, BookOpen, X, Check, UserCog, Users, UserCheck, Building2, GraduationCap } from 'lucide-react';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', totalSeats: 60, description: '', hod: '' });

  useEffect(() => {
    fetchDepartments();
    api.get('/faculty', { params: { limit: 1000 } }).then(r => setFacultyList(r.data.data || [])).catch(() => {});
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.data || []);
    } catch { toast.error('Failed to load departments'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditDept(null); setForm({ name: '', code: '', totalSeats: 60, description: '', hod: '' }); setShowForm(true); };
  const openEdit = (d) => {
    setEditDept(d);
    setForm({ name: d.name, code: d.code, totalSeats: d.totalSeats, description: d.description || '', hod: d.hod?._id || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editDept) {
        const res = await api.put(`/departments/${editDept._id}`, form);
        setDepartments(prev => prev.map(d => d._id === editDept._id ? res.data.data : d));
        toast.success('Department updated');
      } else {
        const res = await api.post('/departments', form);
        setDepartments(prev => [...prev, res.data.data]);
        toast.success('Department created');
      }
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this department? This may affect related data.')) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success('Deleted');
      setDepartments(prev => prev.filter(d => d._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-cyan-500'];

  const totalStudents = departments.reduce((s, d) => s + (d.studentCount || 0), 0);
  const totalFaculty = departments.reduce((s, d) => s + (d.facultyCount || 0), 0);
  const totalCourses = departments.reduce((s, d) => s + (d.courseCount || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Departments</h1>
          <p className="text-sm text-slate-500">{departments.length} departments</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Department
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Departments', value: departments.length, icon: Building2, color: 'bg-indigo-500' },
          { label: 'Total Students', value: totalStudents, icon: GraduationCap, color: 'bg-emerald-500' },
          { label: 'Total Faculty', value: totalFaculty, icon: UserCheck, color: 'bg-amber-500' },
          { label: 'Total Courses', value: totalCourses, icon: BookOpen, color: 'bg-purple-500' },
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

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading...</div>
      ) : departments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
          <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
          <p>No departments yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d, i) => (
            <div key={d._id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${colors[i % colors.length]} flex items-center justify-center text-white font-bold text-sm`}>
                    {d.code?.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{d.name}</h3>
                    <span className="text-xs text-slate-400 font-mono">{d.code}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(d)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(d._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {d.description && <p className="text-xs text-slate-500 mb-3">{d.description}</p>}

              {/* Per-dept stat pills */}
              <div className="flex gap-2 mb-3 flex-wrap">
                <span className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                  <GraduationCap size={11} /> {d.studentCount || 0} students
                </span>
                <span className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                  <UserCheck size={11} /> {d.facultyCount || 0} faculty
                </span>
                <span className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                  <BookOpen size={11} /> {d.courseCount || 0} courses
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span>Seats: <strong className="text-slate-700">{d.totalSeats}</strong></span>
                {d.hod
                  ? <span className="flex items-center gap-1 text-indigo-600"><UserCog size={12} /> {d.hod.userId?.name || 'Assigned'}</span>
                  : <span className="text-slate-300">No HOD assigned</span>
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">{editDept ? 'Edit Department' : 'Add Department'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Department Name</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Code</label>
                  <input type="text" required value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CSE"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Total Seats</label>
                  <input type="number" required value={form.totalSeats} onChange={e => setForm({ ...form, totalSeats: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">HOD (Head of Department)</label>
                <select value={form.hod} onChange={e => setForm({ ...form, hod: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">— No HOD —</option>
                  {facultyList.map(f => (
                    <option key={f._id} value={f._id}>{f.userId?.name} ({f.employeeId})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  <Check size={14} /> {editDept ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
