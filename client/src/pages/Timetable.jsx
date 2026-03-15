import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2, AlertTriangle, Download, Calendar, BookOpen, Users, Clock } from 'lucide-react';
import { exportElementToPdf } from '../utils/exportPdf';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];

export default function Timetable() {
  const { user } = useAuth();
  const isAdmin = ['admin', 'superadmin'].includes(user?.role);
  const isStudent = user?.role === 'student';

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [timetable, setTimetable] = useState({});
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('1');
  const [academicYear, setAcademicYear] = useState('2025-26');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [editCell, setEditCell] = useState(null);
  const [cellForm, setCellForm] = useState({ course: '', faculty: '', room: '' });
  const [studentProfile, setStudentProfile] = useState(null);
  const [facultyProfile, setFacultyProfile] = useState(null);
  const today = DAYS[new Date().getDay() - 1] || null; // Mon=1..Sat=6, Sun=0→null

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data.data || [])).catch(() => {});
    api.get('/faculty', { params: { limit: 1000 } }).then(r => setFaculty(r.data.data || [])).catch(() => {});

    // Faculty: fetch own profile to highlight their classes
    if (user?.role === 'faculty') {
      api.get('/faculty/me').then(res => setFacultyProfile(res.data.data || null)).catch(() => {});
    }

    // Student: fetch own profile to get dept + sem, then auto-load timetable
    if (isStudent) {
      api.get('/students/me').then(res => {
        const myProfile = res.data.data;
        if (myProfile) {
          setStudentProfile(myProfile);
          setFilterDept(myProfile.department?._id || myProfile.department);
          setFilterSem(String(myProfile.semester));
        }
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    // For student: backend auto-filters, just call without params
    // For admin/faculty: need filterDept + filterSem
    if (isStudent) {
      if (studentProfile) fetchTimetable();
    } else {
      if (filterDept && filterSem) fetchTimetable();
    }
  }, [filterDept, filterSem, academicYear, studentProfile]);

  useEffect(() => {
    if (filterDept) {
      api.get('/courses', { params: { department: filterDept, semester: filterSem } })
        .then(r => setCourses(r.data.data || [])).catch(() => {});
    }
  }, [filterDept, filterSem]);

  const fetchTimetable = async () => {
    try {
      const params = isStudent
        ? { academicYear }
        : { department: filterDept, semester: filterSem, academicYear };
      const res = await api.get('/timetable', { params });
      const grid = {};
      res.data.data.forEach(entry => {
        grid[entry.day] = {};
        entry.slots.forEach(slot => { grid[entry.day][slot.time] = slot; });
      });
      setTimetable(grid);
    } catch { toast.error('Failed to load timetable'); }
  };

  const openEdit = (day, time) => {
    if (!isAdmin) return;
    const existing = timetable[day]?.[time];
    setCellForm({ course: existing?.course?._id || '', faculty: existing?.faculty?._id || '', room: existing?.room || '' });
    setEditCell({ day, time });
  };

  const saveCell = () => {
    const { day, time } = editCell;

    // Check for faculty conflict at same time on other days
    if (cellForm.faculty) {
      const conflictDay = DAYS.find(d => d !== day && timetable[d]?.[time]?.faculty === cellForm.faculty);
      if (conflictDay) {
        toast(`Warning: ${getFacultyLabel(cellForm.faculty)} already has a class at ${time} on ${conflictDay}`, {
          icon: '⚠️', duration: 4000,
        });
      }
    }

    setTimetable(prev => ({
      ...prev,
      [day]: { ...(prev[day] || {}), [time]: { ...cellForm, time } },
    }));
    setEditCell(null);
  };

  const clearCell = (day, time) => {
    setTimetable(prev => {
      const updated = { ...prev, [day]: { ...(prev[day] || {}) } };
      delete updated[day][time];
      return updated;
    });
  };

  const handleSave = async () => {
    if (!filterDept || !filterSem) { toast.error('Select department and semester'); return; }

    // Conflict detection — same faculty in same time slot across days
    const facultySlotMap = {}; // facultyId -> [{ day, time }]
    const conflicts = [];
    for (const day of DAYS) {
      for (const [time, data] of Object.entries(timetable[day] || {})) {
        if (data.faculty) {
          const key = `${data.faculty}__${time}`;
          if (facultySlotMap[key]) {
            conflicts.push(`${getFacultyLabel(data.faculty)} is already assigned at ${time} on ${facultySlotMap[key]}`);
          } else {
            facultySlotMap[key] = day;
          }
        }
      }
    }
    if (conflicts.length > 0) {
      toast.error(`Conflict detected: ${conflicts[0]}`, { duration: 5000 });
      return;
    }

    setSaving(true);
    try {
      for (const day of DAYS) {
        const slots = Object.entries(timetable[day] || {}).map(([time, data]) => ({
          time,
          course: data.course || undefined,
          faculty: data.faculty || undefined,
          room: data.room || undefined,
        }));
        if (slots.length > 0) {
          await api.post('/timetable', { department: filterDept, semester: filterSem, day, slots, academicYear });
        }
      }
      toast.success('Timetable saved');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleExport = async () => {
    if (!filterDept) { toast.error('Select a department first'); return; }
    setExporting(true);
    const deptName = departments.find(d => d._id === filterDept)?.name || 'timetable';
    try {
      await exportElementToPdf('timetable-print', `timetable-${deptName}-sem${filterSem}`, 'landscape');
      toast.success('Timetable downloaded');
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  };

  const getCourseLabel = (id) => courses.find(c => c._id === id)?.name || id;
  const getFacultyLabel = (id) => faculty.find(f => f._id === id)?.userId?.name || id;

  // KPI derived from current timetable grid
  const allCells = DAYS.flatMap(d => TIME_SLOTS.map(t => timetable[d]?.[t]).filter(Boolean));
  const filledSlots = allCells.length;
  const uniqueCourses = new Set(allCells.map(c => c.course?._id || c.course).filter(Boolean)).size;
  const activeDays = DAYS.filter(d => Object.values(timetable[d] || {}).some(Boolean)).length;
  const todayCells = (timetable[today] ? Object.values(timetable[today]).filter(Boolean) : []).length;

  // For faculty: is this cell theirs?
  const isMine = (cell) => {
    if (!facultyProfile) return false;
    const fid = typeof cell.faculty === 'object' ? cell.faculty?._id : cell.faculty;
    return fid?.toString() === facultyProfile._id?.toString();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Timetable</h1>
          <p className="text-sm text-slate-500">Weekly schedule management</p>
        </div>
        {isAdmin && filterDept && (
          <div className="flex gap-2">
            <button onClick={handleExport} disabled={exporting}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Download size={15} /> {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Save size={15} /> {saving ? 'Saving...' : 'Save Timetable'}
            </button>
          </div>
        )}
        {!isAdmin && filterDept && (
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Download size={15} /> {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
        )}
      </div>

      {/* Filters — admin/faculty only */}
      {!isStudent && (
        <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Department</label>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select Department</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Semester</label>
            <select value={filterSem} onChange={e => setFilterSem(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Academic Year</label>
            <select value={academicYear} onChange={e => setAcademicYear(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {['2023-24', '2024-25', '2025-26', '2026-27'].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Student info bar */}
      {isStudent && studentProfile && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-sm text-indigo-700 flex items-center gap-3">
          <span className="font-medium">{studentProfile.department?.name || 'Your Department'}</span>
          <span className="text-indigo-400">•</span>
          <span>Semester {studentProfile.semester}</span>
          <span className="text-indigo-400">•</span>
          <span className="text-xs text-indigo-500">{academicYear}</span>
        </div>
      )}

      {/* KPI cards — show when timetable is loaded */}
      {(filterDept || isStudent) && filledSlots > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Classes Scheduled', value: filledSlots, icon: Calendar, color: 'bg-indigo-500' },
            { label: 'Unique Courses', value: uniqueCourses, icon: BookOpen, color: 'bg-emerald-500' },
            { label: 'Active Days', value: activeDays, icon: Users, color: 'bg-amber-500' },
            { label: "Today's Classes", value: todayCells, icon: Clock, color: 'bg-purple-500' },
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

      {!isStudent && !filterDept ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
          <p>Select a department to view or edit the timetable</p>
        </div>
      ) : (
        <div id="timetable-print" className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          {/* Print header — visible in PDF */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-800">
                {departments.find(d => d._id === filterDept)?.name} — Semester {filterSem} Timetable
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Academic Year: {academicYear}</p>
            </div>
            <span className="text-xs text-slate-400">CampusNex</span>
          </div>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-3 py-3 text-left font-semibold text-slate-500 border-b border-r border-slate-200 w-28">Time</th>
                {DAYS.map(day => (
                  <th key={day} className={`px-3 py-3 text-center font-semibold border-b border-r border-slate-200 last:border-r-0 min-w-32 ${day === today ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'}`}>
                    {day}
                    {day === today && <span className="ml-1 text-xs bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded-full">Today</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map(time => (
                <tr key={time} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 font-medium text-slate-500 border-r border-slate-200 bg-slate-50 whitespace-nowrap">{time}</td>
                  {DAYS.map(day => {
                    const cell = timetable[day]?.[time];
                    const isToday = day === today;
                    const mine = cell && isMine(cell);
                    return (
                      <td key={day} className={`px-2 py-2 border-r border-slate-100 last:border-r-0 align-top ${isToday ? 'bg-indigo-50/30' : ''}`}>
                        {cell ? (
                          <div className={`border rounded-lg p-2 relative group ${mine ? 'bg-emerald-50 border-emerald-200' : 'bg-indigo-50 border-indigo-100'}`}>
                            <p className={`font-semibold leading-tight ${mine ? 'text-emerald-800' : 'text-indigo-800'}`}>
                              {cell.course?.name || getCourseLabel(typeof cell.course === 'object' ? cell.course?._id : cell.course)}
                            </p>
                            {(cell.faculty?.userId?.name || cell.faculty) && (
                              <p className={`mt-0.5 ${mine ? 'text-emerald-600' : 'text-indigo-500'}`}>
                                {cell.faculty?.userId?.name || getFacultyLabel(typeof cell.faculty === 'object' ? cell.faculty?._id : cell.faculty)}
                              </p>
                            )}
                            {cell.room && <p className={mine ? 'text-emerald-400' : 'text-indigo-400'}>Room: {cell.room}</p>}
                            {isAdmin && (
                              <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                                <button onClick={() => openEdit(day, time)} className="p-0.5 bg-white rounded shadow-sm hover:bg-indigo-100">
                                  <Plus size={10} className="text-indigo-600" />
                                </button>
                                <button onClick={() => clearCell(day, time)} className="p-0.5 bg-white rounded shadow-sm hover:bg-red-50">
                                  <Trash2 size={10} className="text-red-400" />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          isAdmin ? (
                            <button onClick={() => openEdit(day, time)}
                              className="w-full h-12 border border-dashed border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors flex items-center justify-center text-slate-300 hover:text-indigo-400">
                              <Plus size={14} />
                            </button>
                          ) : (
                            <div className="h-12 flex items-center justify-center text-slate-200 text-xs">—</div>
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAdmin && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <AlertTriangle size={13} />
          <span>Click any empty cell to add a class. Hover over filled cells to edit or remove. Save when done.</span>
        </div>
      )}

      {/* Cell Edit Modal */}
      {editCell && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h2 className="text-base font-bold text-slate-800 mb-1">Set Class</h2>
            <p className="text-xs text-slate-400 mb-4">{editCell.day} — {editCell.time}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Course</label>
                <select value={cellForm.course} onChange={e => setCellForm({ ...cellForm, course: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select course</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Faculty</label>
                <select value={cellForm.faculty} onChange={e => setCellForm({ ...cellForm, faculty: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select faculty</option>
                  {faculty.map(f => <option key={f._id} value={f._id}>{f.userId?.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Room / Lab</label>
                <input type="text" value={cellForm.room} onChange={e => setCellForm({ ...cellForm, room: e.target.value })}
                  placeholder="e.g. Room 101, Lab A"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-5">
              <button onClick={() => setEditCell(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={saveCell} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Set</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
