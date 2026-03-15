import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { BarChart2, Users, CreditCard, BookOpen, TrendingUp, Download, FileText } from 'lucide-react';
import { exportElementToPdf } from '../utils/exportPdf';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function Reports() {
  const [stats, setStats] = useState({ students: 0, faculty: 0, departments: 0, books: 0 });
  const [feeStats, setFeeStats] = useState(null);
  const [deptData, setDeptData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filterDept) params.department = filterDept;
    if (filterSem) params.semester = filterSem;

    Promise.all([
      api.get('/students', { params }),
      api.get('/faculty'),
      api.get('/departments'),
      api.get('/library/books'),
      api.get('/fees/stats'),
    ]).then(([s, f, d, b, fee]) => {
      setStats({
        students: s.data.count || s.data.data?.length || 0,
        faculty: f.data.count || f.data.data?.length || 0,
        departments: d.data.data?.length || 0,
        books: b.data.count || 0,
      });
      setFeeStats(fee.data.data);
      const depts = d.data.data || [];
      const studentList = s.data.data || [];
      const deptMap = {};
      depts.forEach(dept => { deptMap[dept._id] = { name: dept.code, fullName: dept.name, students: 0 }; });
      studentList.forEach(st => {
        const dId = st.department?._id || st.department;
        if (dId && deptMap[dId]) deptMap[dId].students++;
      });
      setDeptData(Object.values(deptMap).filter(d => d.students > 0));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [filterDept, filterSem]);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      await exportElementToPdf('reports-print', 'campus-report', 'portrait');
      toast.success('Report exported as PDF');
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  };

  const handleExportCsv = () => {
    const rows = [['Department', 'Students', 'Share %']];
    deptData.forEach(d => {
      rows.push([d.fullName || d.name, d.students, stats.students > 0 ? ((d.students / stats.students) * 100).toFixed(1) : 0]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'department-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const feeChartData = feeStats ? [
    { name: 'Collected', value: feeStats.collectedAmount || 0 },
    { name: 'Pending', value: (feeStats.totalAmount || 0) - (feeStats.collectedAmount || 0) },
  ] : [];

  const kpiCards = [
    { label: 'Total Students', value: stats.students, icon: Users, color: 'bg-indigo-500' },
    { label: 'Faculty Members', value: stats.faculty, icon: Users, color: 'bg-emerald-500' },
    { label: 'Departments', value: stats.departments, icon: BookOpen, color: 'bg-amber-500' },
    { label: 'Library Books', value: stats.books, icon: BookOpen, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-sm text-slate-500">Live data from the system</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <select value={filterSem} onChange={e => setFilterSem(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
          </select>
          {(filterDept || filterSem) && (
            <button onClick={() => { setFilterDept(''); setFilterSem(''); }} className="text-xs text-indigo-600 hover:underline">Clear</button>
          )}
          <button onClick={handleExportCsv} disabled={deptData.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-50">
            <FileText size={15} /> Export CSV
          </button>
          <button onClick={handleExportPdf} disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60">
            <Download size={15} /> {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div id="reports-print" className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-800">{loading ? '—' : value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Department-wise Students */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-indigo-500" /> Students per Department
          </h2>
          {deptData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: 12 }} />
                <Bar dataKey="students" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Fee Collection Pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-emerald-500" /> Fee Collection Status
          </h2>
          {!feeStats || feeStats.totalAmount === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No fee data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={feeChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" nameKey="name" paddingAngle={3}>
                  {feeChartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {feeStats && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-indigo-50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500">Collected</p>
                <p className="font-bold text-indigo-700">₹{(feeStats.collectedAmount / 1000).toFixed(0)}K</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500">Pending ({feeStats.pendingCount + feeStats.overdueCount})</p>
                <p className="font-bold text-red-600">₹{((feeStats.totalAmount - feeStats.collectedAmount) / 1000).toFixed(0)}K</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-amber-500" /> Department Summary
        </h2>
        {deptData.length === 0 ? (
          <p className="text-slate-400 text-sm">No department data available</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Department', 'Students', 'Share'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deptData.map((d, i) => (
                <tr key={d.name} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="font-medium text-slate-800">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{d.students}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
                        <div className="h-full rounded-full" style={{ width: `${(d.students / stats.students) * 100}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                      <span className="text-xs text-slate-500">{stats.students > 0 ? ((d.students / stats.students) * 100).toFixed(1) : 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </div> {/* end reports-print */}
    </div>
  );
}
