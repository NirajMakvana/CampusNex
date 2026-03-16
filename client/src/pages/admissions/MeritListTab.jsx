import { useEffect, useState } from 'react';
import { Trophy, Download } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const PROGRAMS = ['BCA', 'BBA', 'BSc IT'];
const YEARS = ['2025-26', '2024-25'];

export default function MeritListTab() {
  const [program, setProgram] = useState('BCA');
  const [year, setYear] = useState('2025-26');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMerit = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admissions/merit-list', { params: { program, academicYear: year } });
      setList(res.data.data);
    } catch {
      toast.error('Failed to load merit list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMerit(); }, [program, year]);

  const exportCSV = () => {
    const rows = [['Rank', 'App ID', 'Name', 'Email', 'Percentage', 'Stream', 'Status']];
    list.forEach((a, i) => rows.push([
      i + 1, a.applicationId, a.personalInfo?.name, a.personalInfo?.email,
      a.academicInfo?.percentage, a.academicInfo?.stream, a.status,
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `merit-${program}-${year}.csv`; a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Program</label>
            <select value={program} onChange={e => setProgram(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400">
              {PROGRAMS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Academic Year</label>
            <select value={year} onChange={e => setYear(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400">
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
          <Download size={14} /> Export Merit List
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-indigo-50 px-4 py-3 flex items-center gap-2">
          <Trophy size={16} className="text-indigo-600" />
          <span className="text-sm font-semibold text-indigo-700">Merit List — {program} ({year})</span>
          <span className="ml-auto text-xs text-indigo-500">{list.length} candidates</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Rank', 'App ID', 'Name', 'Email', 'Percentage', 'Stream', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">Loading...</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No shortlisted candidates for {program}</td></tr>
              ) : list.map((a, i) => (
                <tr key={a._id} className={`hover:bg-slate-50 ${i === 0 ? 'bg-amber-50' : i === 1 ? 'bg-slate-50' : ''}`}>
                  <td className="px-4 py-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-300 text-slate-700' : i === 2 ? 'bg-orange-300 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>{i + 1}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-indigo-600">{a.applicationId}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{a.personalInfo?.name}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{a.personalInfo?.email}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{a.academicInfo?.percentage}%</td>
                  <td className="px-4 py-3 text-slate-500">{a.academicInfo?.stream}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700 capitalize">{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
