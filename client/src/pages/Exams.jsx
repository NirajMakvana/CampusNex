import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Trash2, FileText, Calendar, Award, X, Download, Users, CheckCircle, XCircle, Clock, TrendingUp, Search } from 'lucide-react';
import { exportElementToPdf } from '../utils/exportPdf';

export default function Exams() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  const isAdmin = ['admin', 'superadmin'].includes(user?.role);
  const isFaculty = user?.role === 'faculty';

  const defaultTab = isStudent ? 'Schedule' : 'Schedule';
  const [tab, setTab] = useState(defaultTab);
  const tabs = isStudent
    ? ['Schedule', 'My Results', 'Hall Ticket', 'Revaluation']
    : isAdmin
    ? ['Schedule', 'Enter Marks', 'Revaluation']
    : ['Schedule', 'Enter Marks', 'Revaluation'];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Exams & Results</h1>
        <p className="text-sm text-slate-500">Manage exam schedules and student results</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Schedule' && <ExamScheduleTab isAdmin={isAdmin} isStudent={isStudent} />}
      {tab === 'Enter Marks' && <EnterMarksTab />}
      {tab === 'My Results' && <MyResultsTab />}
      {tab === 'Hall Ticket' && <HallTicketTab />}
      {tab === 'Revaluation' && <RevaluationTab isStudent={isStudent} isAdmin={isAdmin} />}
    </div>
  );
}

// ─── Tab 1: Exam Schedule ─────────────────────────────────────────────────────
function ExamScheduleTab({ isAdmin, isStudent }) {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ course: '', type: 'mid', date: '', totalMarks: 100, passingMarks: 40, hall: '', duration: 180 });
  const [seatingExam, setSeatingExam] = useState(null);
  const [seatingData, setSeatingData] = useState(null);
  const [seatingLoading, setSeatingLoading] = useState(false);
  const [hallsInput, setHallsInput] = useState('Hall A,Hall B,Hall C');
  const [seatsPerHall, setSeatsPerHall] = useState(30);
  const [exportingSeating, setExportingSeating] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [editExam, setEditExam] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    api.get('/exams').then(r => { setExams(r.data.data || []); setLoading(false); }).catch(() => setLoading(false));
    api.get('/courses').then(r => setCourses(r.data.data || [])).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/exams', form);
      setExams(prev => [...prev, res.data.data]);
      toast.success('Exam scheduled');
      setShowForm(false);
      setForm({ course: '', type: 'mid', date: '', totalMarks: 100, passingMarks: 40, hall: '', duration: 180 });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this exam?')) return;
    try {
      await api.delete(`/exams/${id}`);
      setExams(prev => prev.filter(e => e._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleEdit = (exam) => {
    setEditExam(exam);
    setEditForm({
      course: exam.course?._id || exam.course,
      type: exam.type,
      date: exam.date ? new Date(exam.date).toISOString().split('T')[0] : '',
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      hall: exam.hall || '',
      duration: exam.duration || 180,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/exams/${editExam._id}`, editForm);
      setExams(prev => prev.map(e => e._id === editExam._id ? res.data.data : e));
      toast.success('Exam updated');
      setEditExam(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const loadSeatingPlan = async (exam) => {
    setSeatingExam(exam);
    setSeatingData(null);
    setSeatingLoading(true);
    try {
      const res = await api.get(`/exams/${exam._id}/seating-plan`, {
        params: { halls: hallsInput, seatsPerHall },
      });
      setSeatingData(res.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to generate seating plan'); }
    finally { setSeatingLoading(false); }
  };

  const handleExportSeating = async () => {
    setExportingSeating(true);
    try {
      await exportElementToPdf('seating-plan-print', `seating-${seatingExam?.course?.name}-${seatingExam?.type}`, 'portrait');
      toast.success('Seating plan downloaded');
    } catch { toast.error('Export failed'); }
    finally { setExportingSeating(false); }
  };

  const typeColors = {
    mid: 'bg-blue-100 text-blue-700',
    end: 'bg-red-100 text-red-700',
    internal: 'bg-green-100 text-green-700',
    practical: 'bg-purple-100 text-purple-700',
  };

  const now = new Date();
  const upcoming = exams.filter(e => new Date(e.date) >= now);
  const past = exams.filter(e => new Date(e.date) < now);
  const todayStr = now.toISOString().split('T')[0];
  const todayExams = exams.filter(e => new Date(e.date).toISOString().split('T')[0] === todayStr);

  const filtered = exams.filter(e => {
    const matchSearch = !search || e.course?.name?.toLowerCase().includes(search.toLowerCase()) || e.course?.code?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || e.type === typeFilter;
    return matchSearch && matchType;
  });
  const filteredUpcoming = filtered.filter(e => new Date(e.date) >= now);
  const filteredPast = filtered.filter(e => new Date(e.date) < now);

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      {!loading && exams.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Exams', value: exams.length, icon: FileText, color: 'bg-indigo-500' },
            { label: 'Upcoming', value: upcoming.length, icon: Clock, color: 'bg-blue-500' },
            { label: 'Completed', value: past.length, icon: CheckCircle, color: 'bg-green-500' },
            { label: "Today's Exams", value: todayExams.length, icon: Calendar, color: todayExams.length > 0 ? 'bg-amber-500' : 'bg-slate-400' },
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

      {/* Search + filter + add button */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-48 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by course name or code..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Types</option>
          <option value="mid">Mid Term</option>
          <option value="end">End Term</option>
          <option value="internal">Internal</option>
          <option value="practical">Practical</option>
        </select>
        {(search || typeFilter !== 'all') && (
          <button onClick={() => { setSearch(''); setTypeFilter('all'); }}
            className="px-3 py-2 text-sm text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50">
            Clear
          </button>
        )}
        {isAdmin && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium ml-auto">
            <Plus size={16} /> Schedule Exam
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading...</div>
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
          <FileText size={32} className="mx-auto mb-2 opacity-30" />
          <p>No exams scheduled</p>
        </div>
      ) : (
        <>
          {filteredUpcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">Upcoming ({filteredUpcoming.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUpcoming.map(exam => (
                  <ExamCard key={exam._id} exam={exam} typeColors={typeColors} isAdmin={isAdmin} isStudent={isStudent} onDelete={handleDelete} onSeating={loadSeatingPlan} onEdit={handleEdit} />
                ))}
              </div>
            </div>
          )}
          {filteredPast.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">Past ({filteredPast.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
                {filteredPast.map(exam => (
                  <ExamCard key={exam._id} exam={exam} typeColors={typeColors} isAdmin={isAdmin} isStudent={isStudent} onDelete={handleDelete} onSeating={loadSeatingPlan} onEdit={handleEdit} />
                ))}
              </div>
            </div>
          )}
          {filteredUpcoming.length === 0 && filteredPast.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
              <Search size={28} className="mx-auto mb-2 opacity-30" />
              <p>No exams match your filter</p>
            </div>
          )}
        </>
      )}

      {/* Seating Plan Modal */}
      {seatingExam && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Seating Plan</h2>
                <p className="text-xs text-slate-400">{seatingExam.course?.name} — {seatingExam.type} — {new Date(seatingExam.date).toLocaleDateString('en-IN')}</p>
              </div>
              <button onClick={() => { setSeatingExam(null); setSeatingData(null); }}><X size={18} className="text-slate-400" /></button>
            </div>

            {/* Config */}
            <div className="flex flex-wrap gap-3 mb-4 p-3 bg-slate-50 rounded-xl shrink-0">
              <div className="flex-1 min-w-40">
                <label className="block text-xs font-medium text-slate-500 mb-1">Halls (comma separated)</label>
                <input value={hallsInput} onChange={e => setHallsInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium text-slate-500 mb-1">Seats per Hall</label>
                <input type="number" value={seatsPerHall} onChange={e => setSeatsPerHall(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex items-end">
                <button onClick={() => loadSeatingPlan(seatingExam)} disabled={seatingLoading}
                  className="px-4 py-1.5 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-60">
                  {seatingLoading ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>

            {/* Plan */}
            <div className="flex-1 overflow-y-auto">
              {seatingLoading ? (
                <div className="text-center py-10 text-slate-400">Generating seating plan...</div>
              ) : seatingData ? (
                <div id="seating-plan-print" className="space-y-4 bg-white p-2">
                  <div className="text-center border-b pb-3 mb-3">
                    <p className="font-bold text-slate-800">{seatingData.exam?.course} — {seatingData.exam?.type} Exam</p>
                    <p className="text-xs text-slate-500">{new Date(seatingData.exam?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} | Total Students: {seatingData.totalStudents}</p>
                  </div>
                  {seatingData.halls.map(hall => {
                    const hallSeats = seatingData.seatingPlan.filter(s => s.hall === hall);
                    if (!hallSeats.length) return null;
                    return (
                      <div key={hall}>
                        <h3 className="text-sm font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg mb-2">{hall} — {hallSeats.length} students</h3>
                        <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                          <thead className="bg-slate-50">
                            <tr>{['Seat No', 'Enrollment No', 'Student Name'].map(h => <th key={h} className="px-3 py-2 text-left text-slate-500 font-medium border-r border-slate-200 last:border-r-0">{h}</th>)}</tr>
                          </thead>
                          <tbody>
                            {hallSeats.map((s, i) => (
                              <tr key={i} className="border-t border-slate-100">
                                <td className="px-3 py-1.5 font-mono font-bold text-slate-700 border-r border-slate-100">{s.seatNo}</td>
                                <td className="px-3 py-1.5 font-mono text-slate-600 border-r border-slate-100">{s.enrollmentNo}</td>
                                <td className="px-3 py-1.5 text-slate-800">{s.studentName}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <Users size={32} className="mx-auto mb-2 opacity-30" />
                  <p>Configure halls and click Generate</p>
                </div>
              )}
            </div>

            {seatingData && (
              <div className="flex justify-end mt-4 shrink-0">
                <button onClick={handleExportSeating} disabled={exportingSeating}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60">
                  <Download size={14} /> {exportingSeating ? 'Exporting...' : 'Download PDF'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Exam Modal */}
      {editExam && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Edit Exam</h2>
              <button onClick={() => setEditExam(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="mid">Mid Term</option>
                    <option value="end">End Term</option>
                    <option value="internal">Internal</option>
                    <option value="practical">Practical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                  <input type="date" required value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Total Marks</label>
                  <input type="number" required value={editForm.totalMarks} onChange={e => setEditForm({ ...editForm, totalMarks: +e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Passing Marks</label>
                  <input type="number" required value={editForm.passingMarks} onChange={e => setEditForm({ ...editForm, passingMarks: +e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Hall / Room</label>
                  <input type="text" value={editForm.hall} onChange={e => setEditForm({ ...editForm, hall: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Duration (min)</label>
                  <input type="number" value={editForm.duration} onChange={e => setEditForm({ ...editForm, duration: +e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setEditExam(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Schedule Exam</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Course</label>
                <select required value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select course</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="mid">Mid Term</option>
                    <option value="end">End Term</option>
                    <option value="internal">Internal</option>
                    <option value="practical">Practical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                  <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Total Marks</label>
                  <input type="number" required value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: +e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Passing Marks</label>
                  <input type="number" required value={form.passingMarks} onChange={e => setForm({ ...form, passingMarks: +e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Hall / Room</label>
                  <input type="text" value={form.hall} onChange={e => setForm({ ...form, hall: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Duration (min)</label>
                  <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: +e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ExamCard({ exam, typeColors, isAdmin, isStudent, onDelete, onSeating, onEdit }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800">{exam.course?.name}</h3>
          <p className="text-xs text-slate-400 font-mono">{exam.course?.code}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[exam.type]}`}>{exam.type}</span>
          {isAdmin && (
            <div className="flex gap-1">
              <button onClick={() => onEdit(exam)} className="p-1 hover:bg-indigo-50 rounded text-indigo-400">
                <FileText size={13} />
              </button>
              <button onClick={() => onDelete(exam._id)} className="p-1 hover:bg-red-50 rounded text-red-400">
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-1.5 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-slate-400" />
          <span>{new Date(exam.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Total: <strong className="text-slate-700">{exam.totalMarks}</strong></span>
          <span>Pass: <strong className="text-slate-700">{exam.passingMarks}</strong></span>
          <span>Duration: <strong className="text-slate-700">{exam.duration}m</strong></span>
        </div>
        {exam.hall && <p className="text-xs text-slate-400">📍 {exam.hall}</p>}
        {exam.course?.department && <p className="text-xs text-slate-400">{exam.course.department.name}</p>}
      </div>
      {isAdmin && (
        <button onClick={() => onSeating(exam)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-indigo-600 border border-indigo-200 rounded-lg py-1.5 hover:bg-indigo-50 transition-colors">
          <Users size={12} /> Seating Plan
        </button>
      )}
    </div>
  );
}

// ─── Tab 2: Enter Marks ───────────────────────────────────────────────────────
function EnterMarksTab() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [existingResults, setExistingResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/exams').then(r => setExams(r.data.data || [])).catch(() => {});
  }, []);

  const loadStudents = async () => {
    if (!selectedExam) { toast.error('Select an exam'); return; }
    setLoading(true);
    try {
      const exam = exams.find(e => e._id === selectedExam);
      const deptId = exam?.course?.department?._id || exam?.course?.department;
      const semester = exam?.course?.semester;

      const params = {};
      if (deptId) params.department = deptId;
      if (semester) params.semester = semester;

      const [studRes, resRes] = await Promise.all([
        api.get('/students', { params: { ...params, limit: 1000 } }),
        api.get(`/exams/results/exam/${selectedExam}`),
      ]);
      const list = studRes.data.data || [];
      setStudents(list);

      // Pre-fill existing marks
      const existing = {};
      resRes.data.data?.forEach(r => { existing[r.student?._id] = r.marksObtained; });
      setExistingResults(resRes.data.data || []);

      const initMarks = {};
      list.forEach(s => { initMarks[s._id] = existing[s._id] ?? ''; });
      setMarks(initMarks);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    const exam = exams.find(e => e._id === selectedExam);
    const results = students
      .filter(s => marks[s._id] !== '' && marks[s._id] !== undefined)
      .map(s => ({ studentId: s._id, marksObtained: Number(marks[s._id]) }));

    if (results.length === 0) { toast.error('Enter at least one mark'); return; }

    // Validate marks don't exceed total
    const invalid = results.find(r => r.marksObtained > exam?.totalMarks);
    if (invalid) { toast.error(`Marks cannot exceed ${exam?.totalMarks}`); return; }

    setSaving(true);
    try {
      await api.post('/exams/results/bulk', { examId: selectedExam, results });
      toast.success('Results saved');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const exam = exams.find(e => e._id === selectedExam);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex flex-wrap gap-4 mb-5">
          <div className="flex-1 min-w-64">
            <label className="block text-xs font-medium text-slate-600 mb-1">Select Exam</label>
            <select value={selectedExam} onChange={e => { setSelectedExam(e.target.value); setStudents([]); }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select exam</option>
              {exams.map(e => (
                <option key={e._id} value={e._id}>
                  {e.course?.name} — {e.type} ({new Date(e.date).toLocaleDateString('en-IN')})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={loadStudents} disabled={loading}
              className="px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-60">
              {loading ? 'Loading...' : 'Load Students'}
            </button>
          </div>
        </div>

        {exam && students.length > 0 && (
          <>
            {/* KPI summary bar */}
            {(() => {
              const entered = students.filter(s => marks[s._id] !== '' && marks[s._id] !== undefined);
              const passed = entered.filter(s => Number(marks[s._id]) >= exam.passingMarks);
              const failed = entered.filter(s => Number(marks[s._id]) < exam.passingMarks);
              return (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Total Students', value: students.length, color: 'bg-slate-500', icon: Users },
                    { label: 'Marks Entered', value: entered.length, color: 'bg-indigo-500', icon: FileText },
                    { label: 'Passing', value: passed.length, color: 'bg-green-500', icon: CheckCircle },
                    { label: 'Failing', value: failed.length, color: failed.length > 0 ? 'bg-red-500' : 'bg-emerald-500', icon: XCircle },
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
              );
            })()}

            <div className="flex items-center justify-between mb-3 p-3 bg-indigo-50 rounded-lg text-sm">
              <span className="text-indigo-700 font-medium">{exam.course?.name} — {exam.type}</span>
              <span className="text-indigo-600">Total: {exam.totalMarks} | Pass: {exam.passingMarks}</span>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {students.map(s => {
                const val = marks[s._id];
                const num = Number(val);
                const isPassing = val !== '' && num >= exam.passingMarks;
                const isFailing = val !== '' && num < exam.passingMarks;
                return (
                  <div key={s._id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                        {s.userId?.name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{s.userId?.name}</p>
                        <p className="text-xs text-slate-400">{s.enrollmentNo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {val !== '' && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isPassing ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {isPassing ? 'Pass' : 'Fail'}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={exam.totalMarks}
                          value={val}
                          onChange={e => setMarks(prev => ({ ...prev, [s._id]: e.target.value }))}
                          placeholder="—"
                          className={`w-20 px-3 py-1.5 text-sm border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            isFailing ? 'border-red-300 bg-red-50' : isPassing ? 'border-green-300 bg-green-50' : 'border-slate-200'
                          }`}
                        />
                        <span className="text-xs text-slate-400">/ {exam.totalMarks}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Results'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Tab 3: My Results (Student) ──────────────────────────────────────────────
// Calculate SGPA for a group of results
function calcSgpa(results) {
  const gradePoints = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6, 'D': 5, 'F': 0 };
  let totalCredits = 0, weighted = 0;
  results.forEach(r => {
    const credits = r.exam?.course?.credits || 1;
    const gp = gradePoints[r.grade] ?? 0;
    totalCredits += credits;
    weighted += gp * credits;
  });
  return totalCredits > 0 ? (weighted / totalCredits).toFixed(2) : null;
}

function MyResultsTab() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [cgpa, setCgpa] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    api.get('/students/me').then(res => {
      const myProfile = res.data.data;
      if (myProfile) {
        setProfile(myProfile);
        api.get(`/exams/results/student/${myProfile._id}`)
          .then(r => { setResults(r.data.data || []); setCgpa(r.data.cgpa); })
          .catch(() => {})
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, [user]);

  // Group results by semester
  const bySemester = results.reduce((acc, r) => {
    const sem = r.exam?.course?.semester || 'N/A';
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(r);
    return acc;
  }, {});

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportElementToPdf('marksheet-print', `marksheet-${user?.name?.replace(/\s+/g, '-')}`, 'portrait');
      toast.success('Marksheet downloaded');
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  };

  const gradeColor = (g) => {
    if (!g) return 'bg-slate-100 text-slate-500';
    if (['A+', 'A'].includes(g)) return 'bg-green-100 text-green-700';
    if (['B+', 'B'].includes(g)) return 'bg-blue-100 text-blue-700';
    if (['C', 'D'].includes(g)) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-600';
  };

  if (loading) return <div className="text-center py-10 text-slate-400">Loading...</div>;

  const totalExams = results.length;
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Exams', value: totalExams, icon: FileText, color: 'bg-indigo-500' },
            { label: 'Passed', value: passed, icon: CheckCircle, color: 'bg-green-500' },
            { label: 'Failed', value: failed, icon: XCircle, color: failed > 0 ? 'bg-red-500' : 'bg-emerald-500' },
            { label: 'CGPA', value: cgpa ?? '—', icon: TrendingUp, color: parseFloat(cgpa) >= 7 ? 'bg-indigo-500' : parseFloat(cgpa) >= 5 ? 'bg-amber-500' : 'bg-red-400' },
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

      {results.length > 0 && (
        <div className="flex justify-end">
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60">
            <Download size={15} /> {exporting ? 'Exporting...' : 'Download Marksheet PDF'}
          </button>
        </div>
      )}

      {/* Printable marksheet — this div gets captured */}
      <div id="marksheet-print" className="bg-white rounded-xl border border-slate-200 overflow-hidden p-6">
        {/* Header */}
        <div className="text-center border-b border-slate-200 pb-5 mb-5">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <Award size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold text-indigo-700">CampusNex</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800 mt-2">Student Marksheet</h2>
          <p className="text-xs text-slate-400 mt-1">Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Student info */}
        <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
          <div className="space-y-1">
            <div className="flex gap-2"><span className="text-slate-500 w-32">Student Name</span><span className="font-semibold text-slate-800">{user?.name}</span></div>
            <div className="flex gap-2"><span className="text-slate-500 w-32">Enrollment No.</span><span className="font-semibold text-slate-800">{profile?.enrollmentNo || '—'}</span></div>
            <div className="flex gap-2"><span className="text-slate-500 w-32">Department</span><span className="font-semibold text-slate-800">{profile?.department?.name || '—'}</span></div>
          </div>
          <div className="space-y-1">
            <div className="flex gap-2"><span className="text-slate-500 w-32">Semester</span><span className="font-semibold text-slate-800">{profile?.semester || '—'}</span></div>
            <div className="flex gap-2"><span className="text-slate-500 w-32">Batch</span><span className="font-semibold text-slate-800">{profile?.batch || '—'}</span></div>
            <div className="flex gap-2"><span className="text-slate-500 w-32">CGPA</span>
              <span className="font-bold text-indigo-600 text-base">{cgpa ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Results — grouped by semester with SGPA */}
        {results.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <FileText size={32} className="mx-auto mb-2 opacity-30" />
            <p>No results yet</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.keys(bySemester).sort((a, b) => Number(a) - Number(b)).map(sem => {
              const semResults = bySemester[sem];
              const sgpa = calcSgpa(semResults);
              return (
                <div key={sem}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">Semester {sem}</h3>
                    {sgpa && <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">SGPA: {sgpa}</span>}
                  </div>
                  <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {['Subject', 'Code', 'Type', 'Date', 'Marks', 'Grade', 'Status'].map(h => (
                          <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase border-r border-slate-200 last:border-r-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {semResults.map(r => (
                        <tr key={r._id}>
                          <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-100">{r.exam?.course?.name}</td>
                          <td className="px-3 py-2 text-xs font-mono text-slate-500 border-r border-slate-100">{r.exam?.course?.code}</td>
                          <td className="px-3 py-2 capitalize text-slate-600 border-r border-slate-100">{r.exam?.type}</td>
                          <td className="px-3 py-2 text-slate-500 text-xs border-r border-slate-100">{r.exam?.date ? new Date(r.exam.date).toLocaleDateString('en-IN') : '—'}</td>
                          <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-100">{r.marksObtained} / {r.exam?.totalMarks}</td>
                          <td className="px-3 py-2 border-r border-slate-100">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gradeColor(r.grade)}`}>{r.grade}</span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.status === 'pass' ? 'bg-green-100 text-green-700' : r.status === 'absent' ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-600'}`}>{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                      <tr>
                        <td colSpan={4} className="px-3 py-2 text-xs font-semibold text-slate-600">Sem Total</td>
                        <td className="px-3 py-2 font-bold text-slate-800 text-xs">{semResults.reduce((s, r) => s + (r.marksObtained || 0), 0)} / {semResults.reduce((s, r) => s + (r.exam?.totalMarks || 0), 0)}</td>
                        <td colSpan={2} className="px-3 py-2 font-bold text-indigo-600 text-xs">SGPA: {sgpa ?? '—'}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              );
            })}
            <div className="flex justify-end">
              <div className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold">Overall CGPA: {cgpa ?? '—'}</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-400">
          <span>CampusNex — Campus Management System</span>
          <span>This is a computer-generated document</span>
        </div>
      </div>
    </div>
  );
}

// ─── Hall Ticket Tab (Student) ────────────────────────────────────────────────
function HallTicketTab() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    api.get('/exams/my-hall-ticket')
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load hall ticket'))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportElementToPdf('hall-ticket-print', `hall-ticket-${data?.student?.enrollmentNo}`, 'portrait');
      toast.success('Hall ticket downloaded');
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  };

  const typeColors = {
    mid: 'bg-blue-100 text-blue-700',
    end: 'bg-red-100 text-red-700',
    internal: 'bg-green-100 text-green-700',
    practical: 'bg-purple-100 text-purple-700',
  };

  if (loading) return <div className="text-center py-10 text-slate-400">Loading...</div>;
  if (!data) return <div className="text-center py-10 text-slate-400">No hall ticket data found.</div>;

  const now = new Date();
  const upcoming = data.exams.filter(e => new Date(e.date) >= now);
  const past = data.exams.filter(e => new Date(e.date) < now);
  const filtered = data.exams.filter(e => typeFilter === 'all' || e.type === typeFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">All Types</option>
            <option value="mid">Mid Term</option>
            <option value="end">End Term</option>
            <option value="internal">Internal</option>
            <option value="practical">Practical</option>
          </select>
          <span className="text-xs text-slate-400">{upcoming.length} upcoming · {past.length} past</span>
        </div>
        <button onClick={handleExport} disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60">
          <Download size={15} /> {exporting ? 'Exporting...' : 'Download Hall Ticket PDF'}
        </button>
      </div>

      {/* Printable Hall Ticket */}
      <div id="hall-ticket-print" className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Award size={16} className="text-indigo-600" />
            </div>
            <span className="text-xl font-bold">CampusNex</span>
          </div>
          <h2 className="text-lg font-bold mt-2">HALL TICKET / ADMIT CARD</h2>
          <p className="text-indigo-200 text-xs mt-1">Academic Year {data.student.batch}</p>
        </div>

        {/* Student Info */}
        <div className="p-5 border-b border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {[
              { label: 'Student Name', value: data.student.name },
              { label: 'Enrollment No.', value: data.student.enrollmentNo },
              { label: 'Department', value: `${data.student.department} (${data.student.departmentCode})` },
              { label: 'Semester', value: `Semester ${data.student.semester}` },
              { label: 'Batch', value: data.student.batch },
              { label: 'Email', value: data.student.email },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                <p className="font-semibold text-slate-800 text-xs">{value || '—'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Exam Schedule Table */}
        <div className="p-5">
          <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Calendar size={15} className="text-indigo-500" /> Examination Schedule
          </h3>
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <FileText size={28} className="mx-auto mb-2 opacity-30" />
              <p>No exams found</p>
            </div>
          ) : (
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Subject', 'Code', 'Type', 'Date & Time', 'Duration', 'Hall', 'Seat No', 'Max Marks'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide border-r border-slate-200 last:border-r-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((exam, i) => {
                  const isPast = new Date(exam.date) < now;
                  return (
                    <tr key={exam.examId} className={isPast ? 'opacity-50' : 'hover:bg-slate-50'}>
                      <td className="px-3 py-2.5 font-medium text-slate-800 border-r border-slate-100">{exam.courseName}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-500 border-r border-slate-100">{exam.courseCode}</td>
                      <td className="px-3 py-2.5 border-r border-slate-100">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[exam.type]}`}>{exam.type}</span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 border-r border-slate-100 whitespace-nowrap">
                        {new Date(exam.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 border-r border-slate-100">{exam.duration} min</td>
                      <td className="px-3 py-2.5 font-medium text-indigo-700 border-r border-slate-100">{exam.hall || '—'}</td>
                      <td className="px-3 py-2.5 font-bold text-slate-800 border-r border-slate-100">
                        {exam.seatNo ? (
                          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono">{exam.seatNo}</span>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700">{exam.totalMarks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Instructions */}
        <div className="mx-5 mb-5 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-semibold text-amber-800 mb-2">Important Instructions:</p>
          <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
            <li>Carry this hall ticket to every examination.</li>
            <li>Report to the examination hall 15 minutes before the scheduled time.</li>
            <li>Mobile phones and electronic devices are strictly prohibited.</li>
            <li>Sit only on the allotted seat number mentioned above.</li>
            <li>Carry a valid college ID card along with this hall ticket.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-4">
          <span>Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span>CampusNex — This is a computer-generated document</span>
        </div>
      </div>
    </div>
  );
}

// ─── Revaluation Tab ──────────────────────────────────────────────────────────
function RevaluationTab({ isStudent, isAdmin }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [results, setResults] = useState([]);
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ resultId: '', reason: '' });
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'approved', reviewNote: '', updatedMarks: '' });

  useEffect(() => {
    if (isStudent) {
      api.get('/students/me').then(res => {
        const me = res.data.data;
        if (me) {
          setStudentId(me._id);
          Promise.all([
            api.get(`/revaluation/my/${me._id}`),
            api.get(`/exams/results/student/${me._id}`),
          ]).then(([revRes, resRes]) => {
            setRequests(revRes.data.data || []);
            setResults(resRes.data.data || []);
          }).catch(() => {}).finally(() => setLoading(false));
        } else setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      api.get('/revaluation').then(r => { setRequests(r.data.data || []); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [isStudent, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/revaluation', form);
      setRequests(prev => [res.data.data, ...prev]);
      toast.success('Revaluation request submitted');
      setShowForm(false);
      setForm({ resultId: '', reason: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/revaluation/${reviewModal._id}`, {
        ...reviewForm,
        updatedMarks: reviewForm.updatedMarks ? Number(reviewForm.updatedMarks) : undefined,
      });
      setRequests(prev => prev.map(r => r._id === reviewModal._id ? res.data.data : r));
      toast.success('Review submitted');
      setReviewModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    under_review: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600',
  };

  if (loading) return <div className="text-center py-10 text-slate-400">Loading...</div>;

  return (
    <div className="space-y-4">
      {isStudent && (
        <div className="flex justify-end">
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={16} /> Request Revaluation
          </button>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
          <FileText size={32} className="mx-auto mb-2 opacity-30" />
          <p>No revaluation requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r._id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-slate-800">{r.exam?.course?.name}</span>
                    <span className="text-xs text-slate-400 font-mono">{r.exam?.course?.code}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>{r.status.replace('_', ' ')}</span>
                  </div>
                  {!isStudent && <p className="text-xs text-slate-500 mb-1">Student: {r.student?.userId?.name}</p>}
                  <p className="text-sm text-slate-600">Reason: {r.reason}</p>
                  {r.reviewNote && <p className="text-xs text-slate-500 mt-1">Review note: {r.reviewNote}</p>}
                  {r.updatedMarks !== undefined && r.updatedMarks !== null && (
                    <p className="text-xs text-green-600 mt-1 font-medium">Updated marks: {r.updatedMarks}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                {!isStudent && r.status === 'pending' && (
                  <button onClick={() => { setReviewModal(r); setReviewForm({ status: 'approved', reviewNote: '', updatedMarks: '' }); }}
                    className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 shrink-0">
                    Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student: Submit request modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Request Revaluation</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Select Result</label>
                <select required value={form.resultId} onChange={e => setForm({ ...form, resultId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select exam result</option>
                  {results.map(r => (
                    <option key={r._id} value={r._id}>
                      {r.exam?.course?.name} — {r.exam?.type} — {r.marksObtained}/{r.exam?.totalMarks} ({r.grade})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Reason for Revaluation</label>
                <textarea required rows={3} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                  placeholder="Explain why you believe your marks should be reconsidered..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin/Faculty: Review modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Review Request</h2>
              <button onClick={() => setReviewModal(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 mb-4 text-sm">
              <p className="font-medium text-slate-800">{reviewModal.exam?.course?.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">Student: {reviewModal.student?.userId?.name}</p>
              <p className="text-slate-600 mt-1">Reason: {reviewModal.reason}</p>
              <p className="text-slate-500 text-xs mt-1">Current marks: {reviewModal.result?.marksObtained ?? '—'} | Grade: {reviewModal.result?.grade ?? '—'}</p>
            </div>
            <form onSubmit={handleReview} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Decision</label>
                <select value={reviewForm.status} onChange={e => setReviewForm({ ...reviewForm, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                  <option value="under_review">Mark Under Review</option>
                </select>
              </div>
              {reviewForm.status === 'approved' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Updated Marks (optional)</label>
                  <input type="number" value={reviewForm.updatedMarks} onChange={e => setReviewForm({ ...reviewForm, updatedMarks: e.target.value })}
                    placeholder="Leave blank to keep original"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Review Note</label>
                <textarea rows={2} value={reviewForm.reviewNote} onChange={e => setReviewForm({ ...reviewForm, reviewNote: e.target.value })}
                  placeholder="Optional note to student..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setReviewModal(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
