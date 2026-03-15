import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { CheckCircle, XCircle, Clock, BarChart2, Calendar, Users, Upload, FileSpreadsheet, X, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Attendance() {
  const { user } = useAuth();
  const role = user?.role;
  const isStudent = role === 'student';
  const isAdmin = role === 'admin' || role === 'superadmin';
  const isFaculty = role === 'faculty';

  const tabs = isAdmin
    ? ['Overview', 'Mark Attendance', 'Course Report']
    : isFaculty
    ? ['Mark Attendance', 'Course Report']
    : ['My Attendance'];

  const [tab, setTab] = useState(tabs[0]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Attendance</h1>
        <p className="text-sm text-slate-500">Track and manage attendance records</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && <AttendanceOverviewTab />}
      {tab === 'Mark Attendance' && <MarkAttendanceTab />}
      {tab === 'Course Report' && <CourseReportTab />}
      {tab === 'My Attendance' && <MyAttendanceTab />}
    </div>
  );
}

// ─── Tab 0: Overview (Admin) ──────────────────────────────────────────────────
function AttendanceOverviewTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const fetchStats = (date) => {
    setLoading(true);
    api.get('/attendance/stats', { params: { date } })
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStats(selectedDate); }, []);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    fetchStats(e.target.value);
  };

  const dayRate = stats?.dayTotal > 0
    ? (((stats.dayPresent + stats.dayLate) / stats.dayTotal) * 100).toFixed(1)
    : null;

  const isToday = selectedDate === today;
  const dateLabel = isToday ? "Today" : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-5">
      {/* Date filter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2">
          <Calendar size={15} className="text-slate-400" />
          <input type="date" value={selectedDate} onChange={handleDateChange} max={today}
            className="text-sm text-slate-700 focus:outline-none bg-transparent" />
        </div>
        {!isToday && (
          <button onClick={() => { setSelectedDate(today); fetchStats(today); }}
            className="text-xs px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium">
            Back to Today
          </button>
        )}
        {loading && <span className="text-xs text-slate-400">Loading...</span>}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: `${dateLabel}'s Present`, value: stats?.dayPresent ?? 0, sub: `of ${stats?.dayTotal ?? 0} marked`, icon: CheckCircle, color: 'bg-green-500' },
          { label: `${dateLabel}'s Absent`, value: stats?.dayAbsent ?? 0, sub: `${stats?.dayLate ?? 0} late`, icon: XCircle, color: 'bg-red-400' },
          { label: 'Overall Rate', value: `${stats?.overallRate ?? 0}%`, sub: `${stats?.allPresent ?? 0} / ${stats?.allTotal ?? 0} all-time`, icon: TrendingUp, color: parseFloat(stats?.overallRate) >= 75 ? 'bg-indigo-500' : 'bg-orange-400' },
          { label: 'At-Risk Students', value: stats?.atRiskCount ?? 0, sub: 'below 75% attendance', icon: AlertTriangle, color: (stats?.atRiskCount ?? 0) > 0 ? 'bg-red-500' : 'bg-emerald-500' },
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

      {/* Selected day attendance rate bar */}
      {stats?.dayTotal > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800">{dateLabel}'s Attendance Rate</h2>
            <span className={`text-lg font-bold ${parseFloat(dayRate) >= 75 ? 'text-green-600' : 'text-red-500'}`}>{dayRate}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${parseFloat(dayRate) >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${dayRate}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>{(stats.dayPresent + stats.dayLate)} attended out of {stats.dayTotal} marked</span>
            <span>75% required</span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center text-slate-400 text-sm">
          <Calendar size={24} className="mx-auto mb-2 opacity-30" />
          No attendance marked for {dateLabel}
        </div>
      )}

      {/* Overall rate bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Overall Attendance Rate (All Time)</h2>
          <span className={`text-lg font-bold ${parseFloat(stats?.overallRate) >= 75 ? 'text-green-600' : 'text-red-500'}`}>{stats?.overallRate ?? 0}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${parseFloat(stats?.overallRate) >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${stats?.overallRate ?? 0}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>{stats?.allPresent} attended out of {stats?.allTotal} total records</span>
          <span>75% required</span>
        </div>
      </div>

      {/* Low attendance students */}
      {stats?.lowAttendance?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <h2 className="font-semibold text-slate-800">Low Attendance Students</h2>
            <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{stats.lowAttendance.length} students</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Student', 'Course', 'Present', 'Total', 'Attendance %'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.lowAttendance.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{r.studentName}</td>
                  <td className="px-4 py-3 text-slate-600">{r.courseName}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{r.present}</td>
                  <td className="px-4 py-3 text-slate-600">{r.total}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{r.percentage}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Course-wise breakdown */}
      {stats?.byCourse?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">Course-wise Attendance</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.byCourse.map((c, i) => {
              const cpct = c.total > 0 ? ((c.present / c.total) * 100).toFixed(1) : 0;
              return (
                <div key={i} className="px-5 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{c.courseName}</p>
                    <p className="text-xs text-slate-400">{c.total} records</p>
                  </div>
                  <div className="flex items-center gap-3 w-48">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${parseFloat(cpct) >= 75 ? 'bg-green-500' : 'bg-red-400'}`}
                        style={{ width: `${cpct}%` }} />
                    </div>
                    <span className={`text-xs font-bold w-10 text-right ${parseFloat(cpct) >= 75 ? 'text-green-600' : 'text-red-500'}`}>{cpct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 1: Mark Attendance ───────────────────────────────────────────────────
function MarkAttendanceTab() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [excelPreview, setExcelPreview] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data.data || [])).catch(() => {});
  }, []);

  // When course+date changes and students are loaded, re-fetch existing attendance
  useEffect(() => {
    if (selectedCourse && date && studentsLoaded && students.length > 0) {
      // Reset all to 'present' first, then overlay with DB records
      const reset = {};
      students.forEach(s => { reset[s._id] = 'present'; });
      api.get(`/attendance/${selectedCourse}/${date}`)
        .then(r => {
          const existing = {};
          r.data.data?.forEach(rec => {
            if (rec.student?._id) existing[rec.student._id] = rec.status;
          });
          // If DB has records for this date, apply them; otherwise keep reset defaults
          setAttendance({ ...reset, ...existing });
        })
        .catch(() => setAttendance(reset));
    }
  }, [selectedCourse, date, studentsLoaded]);

  const loadStudents = async () => {
    if (!selectedCourse) { toast.error('Select a course first'); return; }
    setLoading(true);
    try {
      const course = courses.find(c => c._id === selectedCourse);
      const deptId = course?.department?._id || course?.department;
      const semester = course?.semester;

      const params = {};
      if (deptId) params.department = deptId;
      if (semester) params.semester = semester;

      const res = await api.get('/students', { params: { ...params, limit: 1000 } });
      const list = res.data.data || [];
      setStudents(list);

      // Default all to present
      const init = {};
      list.forEach(s => { init[s._id] = 'present'; });

      // Fetch existing attendance for selected date and overlay
      try {
        const existing = await api.get(`/attendance/${selectedCourse}/${date}`);
        existing.data.data?.forEach(rec => {
          if (rec.student?._id) init[rec.student._id] = rec.status;
        });
      } catch { /* no existing records is fine */ }

      setAttendance(init);
      setStudentsLoaded(true);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!selectedCourse) { toast.error('Select a course'); return; }
    if (students.length === 0) { toast.error('Load students first'); return; }
    setLoading(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({ studentId, status }));
      await api.post('/attendance/mark', { courseId: selectedCourse, date, records });
      toast.success('Attendance saved');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const setAll = (status) => {
    const a = {};
    students.forEach(s => { a[s._id] = status; });
    setAttendance(a);
  };

  const handleExcelImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (students.length === 0) { toast.error('Load students first before importing'); return; }
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        const matched = [];
        const unmatched = [];
        rows.forEach(row => {
          const enroll = String(row['enrollmentNo'] || row['EnrollmentNo'] || row['enrollment_no'] || '').trim();
          const status = String(row['status'] || row['Status'] || 'present').trim().toLowerCase();
          const validStatus = ['present', 'absent', 'late'].includes(status) ? status : 'present';
          const student = students.find(s => s.enrollmentNo === enroll);
          if (student) {
            matched.push({ studentId: student._id, name: student.userId?.name, enrollmentNo: enroll, status: validStatus });
          } else {
            unmatched.push(enroll);
          }
        });
        setExcelPreview({ matched, unmatched });
      } catch { toast.error('Failed to parse Excel file'); }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const applyExcelImport = () => {
    if (!excelPreview) return;
    const updated = { ...attendance };
    excelPreview.matched.forEach(({ studentId, status }) => { updated[studentId] = status; });
    setAttendance(updated);
    toast.success(`Applied ${excelPreview.matched.length} records from Excel`);
    setExcelPreview(null);
  };

  const counts = students.reduce((acc, s) => {
    const st = attendance[s._id] || 'present';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  const filteredStudents = students.filter(s => {
    const matchSearch = !search || s.userId?.name?.toLowerCase().includes(search.toLowerCase()) || s.enrollmentNo?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || attendance[s._id] === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex flex-wrap gap-4 mb-5">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-slate-600 mb-1">Course</label>
            <select value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); setStudentsLoaded(false); setStudents([]); setSearch(''); setStatusFilter('all'); }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex items-end">
            <button onClick={loadStudents} disabled={loading}
              className="px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-60">
              {loading ? 'Loading...' : 'Load Students'}
            </button>
          </div>
          <div className="flex items-end">
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelImport} />
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              <Upload size={14} /> Import Excel
            </button>
          </div>
        </div>

        {students.length > 0 && (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Total', value: students.length, color: 'bg-slate-500', icon: Users },
                { label: 'Present', value: counts.present || 0, color: 'bg-green-500', icon: CheckCircle },
                { label: 'Absent', value: counts.absent || 0, color: 'bg-red-400', icon: XCircle },
                { label: 'Late', value: counts.late || 0, color: 'bg-amber-500', icon: Clock },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                    <Icon size={15} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-lg font-bold text-slate-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Search + filter bar */}
            <div className="flex flex-wrap gap-3 mb-4">
              <input
                type="text" placeholder="Search by name or enrollment..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 min-w-48 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setAll('present')} className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">All Present</button>
                <button onClick={() => setAll('absent')} className="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100">All Absent</button>
              </div>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">No students match the filter</div>
              ) : filteredStudents.map(s => (
                <div key={s._id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    {s.userId?.avatar
                      ? <img src={s.userId.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                      : <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                          {s.userId?.name?.[0]}
                        </div>
                    }
                    <div>
                      <p className="text-sm font-medium text-slate-800">{s.userId?.name}</p>
                      <p className="text-xs text-slate-400">{s.enrollmentNo}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { status: 'present', icon: <CheckCircle size={14} />, active: 'bg-green-500 text-white', inactive: 'bg-slate-100 text-slate-400' },
                      { status: 'absent', icon: <XCircle size={14} />, active: 'bg-red-500 text-white', inactive: 'bg-slate-100 text-slate-400' },
                      { status: 'late', icon: <Clock size={14} />, active: 'bg-amber-500 text-white', inactive: 'bg-slate-100 text-slate-400' },
                    ].map(({ status, icon, active, inactive }) => (
                      <button key={status} onClick={() => setAttendance(prev => ({ ...prev, [s._id]: status }))}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${attendance[s._id] === status ? active : inactive}`}>
                        {icon} {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={handleSubmit} disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
                {loading ? 'Saving...' : 'Submit Attendance'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Excel Import Preview Modal */}
      {excelPreview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-emerald-600" />
                <h3 className="font-semibold text-slate-800">Excel Import Preview</h3>
              </div>
              <button onClick={() => setExcelPreview(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{excelPreview.matched.length}</p>
                  <p className="text-xs text-slate-500">Matched</p>
                </div>
                <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">{excelPreview.unmatched.length}</p>
                  <p className="text-xs text-slate-500">Unmatched</p>
                </div>
              </div>
              {excelPreview.matched.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">Matched Records</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {excelPreview.matched.map(m => (
                      <div key={m.studentId} className="flex items-center justify-between text-sm px-3 py-2 bg-slate-50 rounded-lg">
                        <span className="text-slate-700">{m.name} <span className="text-xs text-slate-400 font-mono">({m.enrollmentNo})</span></span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          m.status === 'present' ? 'bg-green-100 text-green-700' :
                          m.status === 'absent' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                        }`}>{m.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {excelPreview.unmatched.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-500 mb-2">Unmatched Enrollment Numbers</p>
                  <div className="flex flex-wrap gap-2">
                    {excelPreview.unmatched.map(e => (
                      <span key={e} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded font-mono">{e}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-200 flex gap-3 justify-end">
              <button onClick={() => setExcelPreview(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={applyExcelImport} disabled={excelPreview.matched.length === 0}
                className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60">
                Apply {excelPreview.matched.length} Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 2: Course Report ─────────────────────────────────────────────────────
function CourseReportTab() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data.data || [])).catch(() => {});
  }, []);

  const fetchReport = async () => {
    if (!selectedCourse) { toast.error('Select a course'); return; }
    setLoading(true);
    setSearch(''); setStatusFilter('all');
    try {
      const res = await api.get(`/attendance/course/${selectedCourse}/report`, { params: { month } });
      setReport(res.data.data || []);
    } catch { toast.error('Failed to load report'); }
    finally { setLoading(false); }
  };

  const exportExcel = () => {
    if (!report.length) return;
    const rows = report.map(r => ({
      Student: r.student?.userId?.name || '',
      'Enrollment No': r.student?.enrollmentNo || '',
      Present: r.present,
      Absent: r.absent,
      Late: r.late,
      Total: r.total,
      'Attendance %': r.percentage,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
    const courseName = courses.find(c => c._id === selectedCourse)?.name || 'report';
    XLSX.writeFile(wb, `attendance_${courseName}_${month}.xlsx`);
  };

  // KPIs from report
  const totalStudents = report.length;
  const avgPresent = totalStudents > 0 ? (report.reduce((s, r) => s + r.present, 0) / totalStudents).toFixed(1) : 0;
  const atRisk = report.filter(r => parseFloat(r.percentage) < 75).length;
  const avgRate = totalStudents > 0
    ? (report.reduce((s, r) => s + parseFloat(r.percentage), 0) / totalStudents).toFixed(1)
    : 0;

  const filtered = report.filter(r => {
    const matchSearch = !search ||
      r.student?.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.student?.enrollmentNo?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'atrisk' && parseFloat(r.percentage) < 75) ||
      (statusFilter === 'good' && parseFloat(r.percentage) >= 75);
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-5">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-slate-600 mb-1">Course</label>
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Month</label>
            <input type="month" value={month} onChange={e => setMonth(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex items-end gap-2">
            <button onClick={fetchReport} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60">
              <BarChart2 size={15} /> {loading ? 'Loading...' : 'Generate Report'}
            </button>
            {report.length > 0 && (
              <button onClick={exportExcel}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                <FileSpreadsheet size={15} /> Export Excel
              </button>
            )}
          </div>
        </div>

        {report.length > 0 && (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Total Students', value: totalStudents, color: 'bg-indigo-500', icon: Users },
                { label: 'Avg Attendance', value: `${avgRate}%`, color: parseFloat(avgRate) >= 75 ? 'bg-green-500' : 'bg-orange-400', icon: TrendingUp },
                { label: 'Avg Present Days', value: avgPresent, color: 'bg-slate-500', icon: CheckCircle },
                { label: 'At-Risk Students', value: atRisk, color: atRisk > 0 ? 'bg-red-500' : 'bg-emerald-500', icon: AlertTriangle },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                    <Icon size={15} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-lg font-bold text-slate-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Search + filter */}
            <div className="flex flex-wrap gap-3 mb-4">
              <input type="text" placeholder="Search by name or enrollment..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 min-w-48 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">All Students</option>
                <option value="atrisk">At-Risk (&lt;75%)</option>
                <option value="good">Good (≥75%)</option>
              </select>
              {(search || statusFilter !== 'all') && (
                <button onClick={() => { setSearch(''); setStatusFilter('all'); }}
                  className="px-3 py-2 text-sm text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50">
                  Clear
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Student', 'Enrollment No', 'Present', 'Absent', 'Late', 'Total', 'Attendance %'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(r => (
                    <tr key={r.student?._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                            {r.student?.userId?.name?.[0]}
                          </div>
                          <span className="font-medium text-slate-800">{r.student?.userId?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.student?.enrollmentNo}</td>
                      <td className="px-4 py-3 text-green-600 font-medium">{r.present}</td>
                      <td className="px-4 py-3 text-red-500 font-medium">{r.absent}</td>
                      <td className="px-4 py-3 text-amber-500 font-medium">{r.late}</td>
                      <td className="px-4 py-3 text-slate-600">{r.total}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-20">
                            <div className={`h-full rounded-full ${parseFloat(r.percentage) >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${r.percentage}%` }} />
                          </div>
                          <span className={`text-xs font-semibold ${parseFloat(r.percentage) >= 75 ? 'text-green-600' : 'text-red-500'}`}>
                            {r.percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">No students match the filter</div>
              )}
            </div>
          </>
        )}

        {report.length === 0 && !loading && selectedCourse && (
          <div className="text-center py-8 text-slate-400">
            <Users size={28} className="mx-auto mb-2 opacity-30" />
            <p>No records found. Generate report to see data.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab 3: My Attendance (Student view) ─────────────────────────────────────
function MyAttendanceTab() {
  const { user } = useAuth();
  const [summary, setSummary] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students/me').then(res => {
      const myProfile = res.data.data;
      if (myProfile) {
        setStudentId(myProfile._id);
        api.get(`/attendance/student/${myProfile._id}`)
          .then(r => setSummary(r.data.data || []))
          .catch(() => {})
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, [user]);

  const fetchMonthly = async () => {
    if (!studentId) return;
    try {
      const res = await api.get(`/attendance/student/${studentId}/monthly`, { params: { month } });
      setMonthlyData(res.data.data);
    } catch { toast.error('Failed to load monthly report'); }
  };

  if (loading) return <div className="text-center py-10 text-slate-400">Loading...</div>;

  const totalPresent = summary.reduce((s, i) => s + i.present, 0);
  const totalClasses = summary.reduce((s, i) => s + i.total, 0);
  const overallPct = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(1) : 0;
  const lowCount = summary.filter(i => parseFloat(i.percentage) < 75).length;

  return (
    <div className="space-y-5">
      {/* Aggregate KPI cards */}
      {summary.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Overall Attendance', value: `${overallPct}%`, icon: TrendingUp, color: parseFloat(overallPct) >= 75 ? 'bg-green-500' : 'bg-red-400' },
            { label: 'Classes Attended', value: totalPresent, icon: CheckCircle, color: 'bg-indigo-500' },
            { label: 'Total Classes', value: totalClasses, icon: Calendar, color: 'bg-slate-500' },
            { label: 'Low Attendance', value: lowCount, icon: AlertTriangle, color: lowCount > 0 ? 'bg-red-400' : 'bg-emerald-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
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
      {/* Overall summary cards */}
      {summary.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
          <Calendar size={32} className="mx-auto mb-2 opacity-30" />
          <p>No attendance records yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summary.map(item => (
            <div key={item.course?._id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800">{item.course?.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{item.course?.code}</p>
                </div>
                <span className={`text-lg font-bold ${parseFloat(item.percentage) >= 75 ? 'text-green-600' : 'text-red-500'}`}>
                  {item.percentage}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full transition-all ${parseFloat(item.percentage) >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(parseFloat(item.percentage), 100)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{item.present} present / {item.total} total</span>
                {parseFloat(item.percentage) < 75 && (
                  <span className="text-red-500 font-medium">⚠ Shortage</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Monthly detail */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Monthly Report</h2>
        <div className="flex gap-3 mb-4">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={fetchMonthly}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            View
          </button>
        </div>

        {monthlyData && (
          <div className="space-y-3">
            {monthlyData.courseSummary?.map(c => (
              <div key={c.course?._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-800">{c.course?.name}</p>
                  <p className="text-xs text-slate-400">P: {c.present} | A: {c.absent} | L: {c.late} | Total: {c.total}</p>
                </div>
                <span className={`text-sm font-bold ${parseFloat(c.percentage) >= 75 ? 'text-green-600' : 'text-red-500'}`}>
                  {c.percentage}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
