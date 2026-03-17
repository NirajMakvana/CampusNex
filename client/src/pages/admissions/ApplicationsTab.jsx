import { useEffect, useState, useCallback } from 'react';
import { Search, Eye, RefreshCw, Download, Users, CheckCircle2, Clock, XCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const STATUSES = ['all', 'applied', 'under-review', 'shortlisted', 'fee-pending', 'confirmed', 'rejected'];

const STATUS_COLORS = {
  'applied':      'bg-blue-100 text-blue-700',
  'under-review': 'bg-amber-100 text-amber-700',
  'shortlisted':  'bg-purple-100 text-purple-700',
  'fee-pending':  'bg-orange-100 text-orange-700',
  'confirmed':    'bg-emerald-100 text-emerald-700',
  'rejected':     'bg-red-100 text-red-700',
};

export default function ApplicationsTab({ onView }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, pending: 0, shortlisted: 0, confirmed: 0, rejected: 0 });

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (status !== 'all') params.status = status;
      if (search) params.search = search;
      const [appsRes, statsRes] = await Promise.all([
        api.get('/admissions', { params }),
        api.get('/admissions/admin-stats'),
      ]);
      setApps(appsRes.data.data);
      setTotal(appsRes.data.count);
      setPages(appsRes.data.pages);
      setStats(statsRes.data.data);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [status, search, page]);

  useEffect(() => { fetchApps(); }, [fetchApps]);
  useEffect(() => { setPage(1); }, [status, search]);

  const exportCSV = () => {
    const rows = [['App ID', 'Name', 'Email', 'Mobile', 'Program', 'Percentage', 'Status', 'Applied On']];
    apps.forEach(a => rows.push([
      a.applicationId,
      a.personalInfo?.name,
      a.personalInfo?.email,
      a.personalInfo?.mobile,
      a.coursePreference?.[0]?.program,
      a.academicInfo?.percentage,
      a.status,
      new Date(a.createdAt).toLocaleDateString('en-IN'),
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'applications.csv'; a.click();
  };

  return (
    <div className="space-y-4">
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Applications', value: stats.total,       icon: Users,        iconBg: 'bg-indigo-500',  cardBg: 'bg-white' },
          { label: 'Shortlisted',        value: stats.shortlisted, icon: Clock,         iconBg: 'bg-purple-500',  cardBg: 'bg-white' },
          { label: 'Confirmed',          value: stats.confirmed,   icon: CheckCircle2,  iconBg: 'bg-emerald-500', cardBg: 'bg-white' },
          { label: 'Rejected',           value: stats.rejected,    icon: XCircle,       iconBg: 'bg-red-500',     cardBg: 'bg-white' },
        ].map(({ label, value, icon: Icon, iconBg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
                status === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300'
              }`}
            >
              {s === 'all' ? `All (${total})` : s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, ID, email..."
              className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 w-52"
            />
          </div>
          <button onClick={fetchApps} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
            <RefreshCw size={15} />
          </button>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['App ID', 'Name', 'Email', 'Program', '%', 'Status', 'Applied', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">Loading...</td></tr>
              ) : apps.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">No applications found</td></tr>
              ) : apps.map(a => (
                <tr key={a._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-indigo-600 font-medium">{a.applicationId}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{a.personalInfo?.name}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{a.personalInfo?.email}</td>
                  <td className="px-4 py-3 text-slate-600">{a.coursePreference?.[0]?.program || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{a.academicInfo?.percentage}%</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => onView(a._id)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Showing {apps.length} of {total}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Prev</button>
            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-medium">{page} / {pages}</span>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
