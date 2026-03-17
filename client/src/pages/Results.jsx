import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Award, TrendingUp, BookOpen, Download } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { CardSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const GRADE_COLORS = {
  'A+': 'bg-emerald-100 text-emerald-700',
  'A': 'bg-green-100 text-green-700',
  'B+': 'bg-blue-100 text-blue-700',
  'B': 'bg-indigo-100 text-indigo-700',
  'C': 'bg-amber-100 text-amber-700',
  'D': 'bg-orange-100 text-orange-700',
  'F': 'bg-red-100 text-red-700',
};

export default function Results() {
  usePageTitle('My Results');
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [cgpa, setCgpa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    if (user?.role === 'student') {
      api.get('/students/me').then(res => {
        const id = res.data.data?._id;
        setStudentId(id);
        if (id) {
          api.get(`/exams/results/student/${id}`)
            .then(r => { setResults(r.data.data || []); setCgpa(r.data.cgpa); })
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (user?.role !== 'student') {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-400">Results page is only for students</p>
      </div>
    );
  }

  if (loading) return <CardSkeleton count={3} />;

  // Group by semester
  const bySemester = {};
  results.forEach(r => {
    const sem = r.exam?.course?.semester || 0;
    if (!bySemester[sem]) bySemester[sem] = [];
    bySemester[sem].push(r);
  });

  const semesters = Object.keys(bySemester).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Results</h1>
          <p className="text-sm text-slate-500 mt-0.5">View your semester-wise academic performance</p>
        </div>
      </div>

      {/* CGPA Card */}
      {cgpa && (
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm mb-1">Cumulative Grade Point Average</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">{cgpa}</span>
                <span className="text-xl text-indigo-100">/ 10.0</span>
              </div>
            </div>
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Award size={40} className="text-white" />
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Exams', value: results.length, icon: BookOpen, color: 'bg-blue-500' },
          { label: 'Passed', value: results.filter(r => r.status === 'pass').length, icon: TrendingUp, color: 'bg-green-500' },
          { label: 'Failed', value: results.filter(r => r.status === 'fail').length, icon: Award, color: 'bg-red-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Semester-wise results */}
      {semesters.length === 0 ? (
        <EmptyState icon={Award} title="No results yet" message="Your exam results will appear here once published by faculty." />
      ) : (
        <div className="space-y-4">
          {semesters.map(sem => {
            const semResults = bySemester[sem];
            const semTotal = semResults.reduce((s, r) => s + (r.exam?.course?.credits || 0), 0);
            const semGradePoints = semResults.reduce((s, r) => {
              const gp = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6, 'D': 5, 'F': 0 }[r.grade] || 0;
              return s + gp * (r.exam?.course?.credits || 0);
            }, 0);
            const sgpa = semTotal > 0 ? (semGradePoints / semTotal).toFixed(2) : null;

            return (
              <div key={sem} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-800">Semester {sem}</h2>
                  {sgpa && <span className="text-sm font-bold text-indigo-600">SGPA: {sgpa}</span>}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        {['Course', 'Code', 'Type', 'Marks', 'Grade', 'Credits', 'Status'].map(h => (
                          <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {semResults.map(r => (
                        <tr key={r._id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{r.exam?.course?.name || '—'}</td>
                          <td className="px-4 py-3 text-slate-600 font-mono text-xs">{r.exam?.course?.code || '—'}</td>
                          <td className="px-4 py-3 text-slate-600 capitalize">{r.exam?.type || '—'}</td>
                          <td className="px-4 py-3 text-slate-700">{r.marksObtained} / {r.exam?.totalMarks}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${GRADE_COLORS[r.grade] || 'bg-slate-100 text-slate-600'}`}>
                              {r.grade}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{r.exam?.course?.credits || 0}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              r.status === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                            }`}>{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
