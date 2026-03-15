import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, BookOpen, X, Check, Filter, Upload, ExternalLink, Layers, Award, Users } from 'lucide-react';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [syllabusUploadId, setSyllabusUploadId] = useState(null);
  const syllabusRef = useRef();
  const [form, setForm] = useState({
    name: '', code: '', department: '', semester: 1,
    credits: 4, faculty: '', isElective: false,
  });

  useEffect(() => {
    fetchCourses();
    api.get('/departments').then(r => setDepartments(r.data.data || [])).catch(() => {});
    api.get('/faculty', { params: { limit: 1000 } }).then(r => setFaculty(r.data.data || [])).catch(() => {});
  }, []);

  const fetchCourses = async () => {
    try {
      const params = {};
      if (filterDept) params.department = filterDept;
      if (filterSem) params.semester = filterSem;
      const res = await api.get('/courses', { params });
      setCourses(res.data.data || []);
    } catch { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, [filterDept, filterSem]);

  const openCreate = () => {
    setEditCourse(null);
    setForm({ name: '', code: '', department: '', semester: 1, credits: 4, faculty: '', isElective: false });
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditCourse(c);
    setForm({ name: c.name, code: c.code, department: c.department?._id || '', semester: c.semester, credits: c.credits, faculty: c.faculty?._id || '', isElective: c.isElective });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCourse) {
        const res = await api.put(`/courses/${editCourse._id}`, form);
        setCourses(prev => prev.map(c => c._id === editCourse._id ? res.data.data : c));
        toast.success('Course updated');
      } else {
        const res = await api.post('/courses', form);
        setCourses(prev => [...prev, res.data.data]);
        toast.success('Course created');
      }
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Deleted');
      setCourses(prev => prev.filter(c => c._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const handleSyllabusUpload = async (e, courseId) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('syllabus', file);
    try {
      const res = await api.put(`/courses/${courseId}/syllabus`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCourses(prev => prev.map(c => c._id === courseId ? { ...c, syllabus: res.data.url } : c));
      toast.success('Syllabus uploaded');
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    setSyllabusUploadId(null);
  };

  const semColors = ['', 'bg-blue-50 text-blue-700', 'bg-indigo-50 text-indigo-700', 'bg-violet-50 text-violet-700', 'bg-purple-50 text-purple-700', 'bg-pink-50 text-pink-700', 'bg-rose-50 text-rose-700', 'bg-orange-50 text-orange-700', 'bg-amber-50 text-amber-700'];

  const electiveCount = courses.filter(c => c.isElective).length;
  const assignedCount = courses.filter(c => c.faculty).length;
  const totalCredits = courses.reduce((s, c) => s + (c.credits || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Courses</h1>
          <p className="text-sm text-slate-500">{courses.length} courses</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Course
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'bg-indigo-500' },
          { label: 'Elective', value: electiveCount, icon: Layers, color: 'bg-amber-500' },
          { label: 'Faculty Assigned', value: assignedCount, icon: Users, color: 'bg-emerald-500' },
          { label: 'Total Credits', value: totalCredits, icon: Award, color: 'bg-purple-500' },
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

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter size={15} className="text-slate-400" />
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select value={filterSem} onChange={e => setFilterSem(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
        {(filterDept || filterSem) && (
          <button onClick={() => { setFilterDept(''); setFilterSem(''); }}
            className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 px-2 py-1.5 border border-slate-200 rounded-lg hover:border-red-200">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Course', 'Code', 'Department', 'Semester', 'Credits', 'Faculty', 'Syllabus', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-slate-400">Loading...</td></tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10">
                  <BookOpen size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-slate-400">No courses found</p>
                </td>
              </tr>
            ) : courses.map(c => (
              <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{c.name}</span>
                    {c.isElective && <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">Elective</span>}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{c.code}</td>
                <td className="px-4 py-3 text-slate-600">{c.department?.name || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${semColors[c.semester] || 'bg-slate-100 text-slate-600'}`}>
                    Sem {c.semester}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{c.credits} cr</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{c.faculty?.userId?.name || c.faculty?.employeeId || '—'}</td>
                <td className="px-4 py-3">
                  {c.syllabus
                    ? <a href={c.syllabus} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                        <ExternalLink size={12} /> View
                      </a>
                    : <button onClick={() => { setSyllabusUploadId(c._id); syllabusRef.current?.click(); }}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600">
                        <Upload size={12} /> Upload
                      </button>
                  }
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(c._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hidden syllabus file input */}
      <input ref={syllabusRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
        onChange={e => syllabusUploadId && handleSyllabusUpload(e, syllabusUploadId)} />

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">{editCourse ? 'Edit Course' : 'Add Course'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Course Name</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Course Code</label>
                <input type="text" required value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CS301"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Credits</label>
                <input type="number" min={1} max={6} required value={form.credits} onChange={e => setForm({ ...form, credits: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                <select required value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Semester</label>
                <select required value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Assign Faculty</label>
                <select value={form.faculty} onChange={e => setForm({ ...form, faculty: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Not assigned</option>
                  {faculty.map(f => <option key={f._id} value={f._id}>{f.userId?.name} ({f.employeeId})</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={form.isElective} onChange={e => setForm({ ...form, isElective: e.target.checked })} className="rounded" />
                  This is an elective subject
                </label>
              </div>
              <div className="col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  <Check size={14} /> {editCourse ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
