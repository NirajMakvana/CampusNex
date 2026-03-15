import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Search, Trash2, Upload, Download, X, AlertCircle, CheckCircle2, FileText, GraduationCap, Award, ToggleLeft, ToggleRight, Pencil, Users, UserCheck, UserX, Building2, Filter } from 'lucide-react';
import { exportElementToPdf } from '../utils/exportPdf';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 50;

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearch(q);
  }, [searchParams]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', enrollmentNo: '', department: '', semester: 1, batch: '', gender: '', phone: '' });
  const [departments, setDepartments] = useState([]);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvRows, setCsvRows] = useState([]);
  const [csvError, setCsvError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const csvFileRef = useRef();
  const [marksheetStudent, setMarksheetStudent] = useState(null);
  const [tcStudent, setTcStudent] = useState(null);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
    fetchStudents(1);
  }, [search, filterDept, filterSem]);

  useEffect(() => {
    if (page > 1) fetchStudents(page);
  }, [page]);

  const fetchStudents = async (p = page) => {
    try {
      const params = { page: p, limit: PAGE_SIZE };
      if (search) params.search = search;
      if (filterDept) params.department = filterDept;
      if (filterSem) params.semester = filterSem;
      const res = await api.get('/students', { params });
      setStudents(res.data.data || []);
      setTotalPages(res.data.pages || 1);
      setTotalCount(res.data.count || 0);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/students', form);
      toast.success('Student added');
      setShowForm(false);
      setForm({ name: '', email: '', enrollmentNo: '', department: '', semester: 1, batch: '', gender: '', phone: '' });
      fetchStudents();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/students/${editStudent._id}`, {
        department: editStudent.department,
        semester: editStudent.semester,
        batch: editStudent.batch,
        phone: editStudent.phone,
        gender: editStudent.gender,
      });
      toast.success('Student updated');
      setEditStudent(null);
      fetchStudents(page);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {    if (!confirm('Delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Deleted');
      setStudents(prev => prev.filter(s => s._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const handleToggleStatus = async (s) => {
    const action = s.userId?.isActive === false ? 'activate' : 'deactivate';
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${s.userId?.name}?`)) return;
    try {
      const res = await api.put(`/students/${s._id}/toggle-status`);
      setStudents(prev => prev.map(st => st._id === s._id
        ? { ...st, userId: { ...st.userId, isActive: res.data.isActive } }
        : st
      ));
      toast.success(`Student ${res.data.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update status'); }
  };

  const downloadTemplate = () => {
    const csv = 'name,email,enrollmentNo,department,semester,batch,gender,phone\nJohn Doe,john@campus.edu,CS2024001,,1,2024-28,male,9876543210';
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'students_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleCsvFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError(''); setCsvRows([]); setImportResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.trim().split('\n').filter(Boolean);
      if (lines.length < 2) { setCsvError('CSV must have header + at least 1 row'); return; }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const missing = ['name', 'email', 'enrollmentno'].filter(r => !headers.includes(r));
      if (missing.length) { setCsvError(`Missing columns: ${missing.join(', ')}`); return; }
      const rows = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return { name: obj.name, email: obj.email, enrollmentNo: obj.enrollmentno, department: obj.department || '', semester: Number(obj.semester) || 1, batch: obj.batch || '', gender: obj.gender || '', phone: obj.phone || '' };
      });
      setCsvRows(rows);
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (!csvRows.length) { toast.error('No rows to import'); return; }
    setImporting(true);
    try {
      const res = await api.post('/students/bulk-import', { students: csvRows });
      setImportResult(res.data);
      if (res.data.created > 0) { fetchStudents(); toast.success(`${res.data.created} students imported`); }
    } catch (err) { toast.error(err.response?.data?.message || 'Import failed'); }
    finally { setImporting(false); }
  };

  // KPI derived from current page — for accurate totals we use totalCount + students list
  const activeCount = students.filter(s => s.userId?.isActive !== false).length;
  const inactiveCount = students.filter(s => s.userId?.isActive === false).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Students</h1>
          <p className="text-sm text-slate-500">{totalCount} total students</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowPromoteModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <GraduationCap size={16} /> Promote
          </button>
          <button onClick={() => { setShowCsvModal(true); setImportResult(null); setCsvRows([]); setCsvError(''); }}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Upload size={16} /> Bulk Import
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: totalCount, icon: Users, color: 'bg-indigo-500' },
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

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by name or enrollment no..." value={search}
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
          <select value={filterSem} onChange={e => setFilterSem(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Sem {n}</option>)}
          </select>
          {(filterDept || filterSem) && (
            <button onClick={() => { setFilterDept(''); setFilterSem(''); }}
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
              {['Student', 'Enrollment No', 'Department', 'Semester', 'Batch', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">Loading...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">No students found</td></tr>
            ) : students.map(s => (
              <tr key={s._id} className={`hover:bg-slate-50 transition-colors ${s.userId?.isActive === false ? 'opacity-60' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {s.userId?.avatar
                      ? <img src={s.userId.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      : <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">{s.userId?.name?.[0]}</div>
                    }
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-slate-800">{s.userId?.name}</p>
                        {s.userId?.isActive === false && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Inactive</span>}
                      </div>
                      <p className="text-xs text-slate-400">{s.userId?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.enrollmentNo}</td>
                <td className="px-4 py-3 text-slate-600">{s.department?.name || '—'}</td>
                <td className="px-4 py-3"><span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">Sem {s.semester}</span></td>
                <td className="px-4 py-3 text-slate-600">{s.batch}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditStudent({ ...s, department: s.department?._id || s.department })} title="Edit"
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><Pencil size={15} /></button>
                    <button onClick={() => setMarksheetStudent(s)} title="Marksheet"
                      className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-400"><Award size={15} /></button>
                    <button onClick={() => setTcStudent(s)} title="Transfer Certificate"
                      className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-500"><FileText size={15} /></button>
                    <button onClick={() => handleToggleStatus(s)} title={s.userId?.isActive === false ? 'Activate' : 'Deactivate'}
                      className={`p-1.5 rounded-lg transition-colors ${s.userId?.isActive === false ? 'hover:bg-green-50 text-green-500' : 'hover:bg-amber-50 text-amber-500'}`}>
                      {s.userId?.isActive === false ? <ToggleLeft size={15} /> : <ToggleRight size={15} />}
                    </button>
                    <button onClick={() => handleDelete(s._id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800 mb-5">Add New Student</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text', col: 2 },
                { label: 'Email', key: 'email', type: 'email', col: 2 },
                { label: 'Enrollment No', key: 'enrollmentNo', type: 'text', col: 1 },
                { label: 'Batch (e.g. 2022-26)', key: 'batch', type: 'text', col: 1 },
                { label: 'Phone', key: 'phone', type: 'text', col: 1 },
                { label: 'Semester', key: 'semester', type: 'number', col: 1 },
              ].map(({ label, key, type, col }) => (
                <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                  <input type={type} required value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-span-2 flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCsvModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Bulk Import Students</h2>
              <button onClick={() => setShowCsvModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Step 1: Download CSV Template</p>
                <p className="text-xs text-slate-400 mt-0.5">Fill in student data using this format</p>
              </div>
              <button onClick={downloadTemplate} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-white text-slate-600">
                <Download size={14} /> Template
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-slate-700 mb-2">Step 2: Upload filled CSV</p>
              <div onClick={() => csvFileRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30">
                <Upload size={24} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-500">Click to select CSV file</p>
                <input ref={csvFileRef} type="file" accept=".csv" className="hidden" onChange={handleCsvFile} />
              </div>
              {csvError && <div className="flex items-center gap-2 mt-2 text-red-600 text-sm"><AlertCircle size={14} /> {csvError}</div>}
            </div>
            {csvRows.length > 0 && !importResult && (
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-700 mb-2">{csvRows.length} rows — Preview (first 3):</p>
                <div className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200 text-xs">
                  <table className="w-full">
                    <thead className="bg-slate-100">
                      <tr>{['Name', 'Email', 'Enrollment', 'Sem', 'Batch'].map(h => <th key={h} className="px-3 py-2 text-left text-slate-500">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {csvRows.slice(0, 3).map((r, i) => (
                        <tr key={i} className="border-t border-slate-200">
                          <td className="px-3 py-1.5">{r.name}</td>
                          <td className="px-3 py-1.5">{r.email}</td>
                          <td className="px-3 py-1.5 font-mono">{r.enrollmentNo}</td>
                          <td className="px-3 py-1.5">{r.semester}</td>
                          <td className="px-3 py-1.5">{r.batch}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {importResult && (
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2 text-sm">
                  <CheckCircle2 size={15} /> {importResult.created} students imported successfully
                </div>
                {importResult.skipped > 0 && (
                  <div className="bg-amber-50 rounded-lg px-3 py-2 text-sm text-amber-700">{importResult.skipped} rows skipped</div>
                )}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCsvModal(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                {importResult ? 'Close' : 'Cancel'}
              </button>
              {!importResult && (
                <button onClick={handleBulkImport} disabled={importing || !csvRows.length}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60">
                  <Upload size={14} /> {importing ? 'Importing...' : `Import ${csvRows.length} Students`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showPromoteModal && <PromoteModal departments={departments} onClose={() => setShowPromoteModal(false)} onDone={() => fetchStudents(page)} />}
      {marksheetStudent && <AdminMarksheetModal student={marksheetStudent} onClose={() => setMarksheetStudent(null)} />}
      {tcStudent && <TransferCertModal student={tcStudent} onClose={() => setTcStudent(null)} />}

      {editStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Edit Student</h2>
              <button onClick={() => setEditStudent(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                <select value={editStudent.department} onChange={e => setEditStudent(prev => ({ ...prev, department: e.target.value }))} required
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Semester</label>
                  <select value={editStudent.semester} onChange={e => setEditStudent(prev => ({ ...prev, semester: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Sem {n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                  <select value={editStudent.gender || ''} onChange={e => setEditStudent(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Batch</label>
                  <input type="text" value={editStudent.batch || ''} onChange={e => setEditStudent(prev => ({ ...prev, batch: e.target.value }))}
                    placeholder="e.g. 2022-26"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                  <input type="text" value={editStudent.phone || ''} onChange={e => setEditStudent(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="10-digit number"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => setEditStudent(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Page {page} of {totalPages} · {totalCount} students</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40">← Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Promote Modal ───────────────────────────────────────────────────────────
function PromoteModal({ departments, onClose, onDone }) {
  const [dept, setDept] = useState('');
  const [fromSem, setFromSem] = useState(1);
  const [toSem, setToSem] = useState(2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handlePromote = async () => {
    if (!dept) { toast.error('Select a department'); return; }
    if (fromSem >= toSem) { toast.error('Target semester must be higher'); return; }
    setLoading(true);
    try {
      const res = await api.post('/students/promote', { department: dept, fromSemester: fromSem, toSemester: toSem });
      setResult(res.data);
      toast.success(`${res.data.promoted} students promoted`);
      onDone();
    } catch (err) { toast.error(err.response?.data?.message || 'Promotion failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">Promote Students</h2>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        {!result ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
              <select value={dept} onChange={e => setDept(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select department</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">From Semester</label>
                <select value={fromSem} onChange={e => { const v = Number(e.target.value); setFromSem(v); if (toSem <= v) setToSem(v + 1); }}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>Sem {n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">To Semester</label>
                <select value={toSem} onChange={e => setToSem(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {[2,3,4,5,6,7,8].filter(n => n > fromSem).map(n => <option key={n} value={n}>Sem {n}</option>)}
                </select>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              This will promote all students in the selected department from Sem {fromSem} to Sem {toSem}.
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={handlePromote} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60">
                <GraduationCap size={14} /> {loading ? 'Promoting...' : 'Promote'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
              <CheckCircle2 size={24} className="text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-green-800">{result.promoted} students promoted</p>
                <p className="text-xs text-green-600 mt-0.5">Sem {fromSem} → Sem {toSem} in selected department</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={onClose} className="px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-900">Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin Marksheet Modal ────────────────────────────────────────────────────
function AdminMarksheetModal({ student, onClose }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    api.get(`/exams/results/student/${student._id}`)
      .then(r => setResults(r.data.data || []))
      .catch(() => toast.error('Failed to load results'))
      .finally(() => setLoading(false));
  }, [student._id]);

  const handlePdf = () => exportElementToPdf('marksheet-print', `Marksheet_${student.enrollmentNo}`);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Academic Marksheet</h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePdf}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Download size={14} /> Export PDF
            </button>
            <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
          </div>
        </div>
        <div className="overflow-y-auto p-5">
          {loading ? (
            <p className="text-center py-10 text-slate-400">Loading results...</p>
          ) : (
            <div id="marksheet-print" className="bg-white p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">CampusNex University</h3>
                <p className="text-sm text-slate-500">Official Academic Marksheet</p>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div><span className="text-slate-500">Student Name:</span> <span className="font-medium">{student.userId?.name}</span></div>
                <div><span className="text-slate-500">Enrollment No:</span> <span className="font-mono font-medium">{student.enrollmentNo}</span></div>
                <div><span className="text-slate-500">Department:</span> <span className="font-medium">{student.department?.name}</span></div>
                <div><span className="text-slate-500">Batch:</span> <span className="font-medium">{student.batch}</span></div>
              </div>
              {results.length === 0 ? (
                <p className="text-center py-6 text-slate-400 text-sm">No results found for this student.</p>
              ) : (
                results.map((r, idx) => {
                  const pct = r.exam?.totalMarks > 0 ? ((r.marksObtained / r.exam.totalMarks) * 100).toFixed(1) : '—';
                  return (
                    <div key={idx} className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-700 text-sm">{r.exam?.course?.name || 'Exam'} — {r.exam?.type} — Sem {r.exam?.course?.semester}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {r.status?.toUpperCase()}
                        </span>
                      </div>
                      <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                        <thead className="bg-slate-100">
                          <tr>
                            {['Course', 'Total Marks', 'Obtained', 'Grade', '%'].map(h => (
                              <th key={h} className="px-3 py-2 text-left text-slate-500 font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="px-3 py-2">{r.exam?.course?.name}</td>
                            <td className="px-3 py-2">{r.exam?.totalMarks}</td>
                            <td className="px-3 py-2 font-medium">{r.marksObtained}</td>
                            <td className="px-3 py-2">
                              <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono">{r.grade}</span>
                            </td>
                            <td className="px-3 py-2 font-bold text-indigo-700">{pct}%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Transfer Certificate Modal ───────────────────────────────────────────────
function TransferCertModal({ student, onClose }) {
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const handlePdf = () => exportElementToPdf('tc-print', `TC_${student.enrollmentNo}`);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Transfer Certificate</h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePdf}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <Download size={14} /> Export PDF
            </button>
            <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
          </div>
        </div>
        <div className="overflow-y-auto p-5">
          <div id="tc-print" className="bg-white p-8 font-serif">
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-wide">CampusNex University</h2>
              <p className="text-sm text-slate-500 mt-1">Accredited Institution of Higher Education</p>
              <h3 className="text-lg font-bold text-slate-800 mt-3 underline underline-offset-4">TRANSFER CERTIFICATE</h3>
            </div>
            <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
              <p>This is to certify that <strong>{student.userId?.name}</strong>, son/daughter of ____________, bearing Enrollment No. <strong className="font-mono">{student.enrollmentNo}</strong>, was a bonafide student of this institution.</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 my-5 border border-slate-200 rounded-lg p-4 bg-slate-50 font-sans text-xs">
                {[
                  ['Department', student.department?.name || '—'],
                  ['Semester', `Semester ${student.semester}`],
                  ['Batch', student.batch || '—'],
                  ['Gender', student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : '—'],
                  ['Email', student.userId?.email || '—'],
                  ['Phone', student.phone || '—'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="text-slate-500">{label}: </span>
                    <span className="font-medium text-slate-800">{value}</span>
                  </div>
                ))}
              </div>
              <p>The student has completed his/her studies up to Semester <strong>{student.semester}</strong> and his/her conduct during the period of study was <strong>Good</strong>.</p>
              <p>This certificate is issued on <strong>{today}</strong> for the purpose of seeking admission in another institution.</p>
            </div>
            <div className="mt-12 flex justify-between text-sm text-slate-700">
              <div className="text-center">
                <div className="border-t border-slate-400 pt-2 w-36">Class Teacher</div>
              </div>
              <div className="text-center">
                <div className="border-t border-slate-400 pt-2 w-36">HOD</div>
              </div>
              <div className="text-center">
                <div className="border-t border-slate-400 pt-2 w-36">Principal / Registrar</div>
              </div>
            </div>
            <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-200 pt-3">
              Generated on {today} — CampusNex University Management System
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
