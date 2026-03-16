import { useState } from 'react';
import { Search, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  'applied':      { label: 'Applied', color: 'bg-blue-100 text-blue-700', icon: Clock },
  'under-review': { label: 'Under Review', color: 'bg-amber-100 text-amber-700', icon: Clock },
  'shortlisted':  { label: 'Shortlisted', color: 'bg-purple-100 text-purple-700', icon: CheckCircle2 },
  'fee-pending':  { label: 'Fee Pending', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  'confirmed':    { label: 'Confirmed ✓', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  'rejected':     { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const TIMELINE = ['applied', 'under-review', 'shortlisted', 'fee-pending', 'confirmed'];

export default function TrackApplication() {
  const [form, setForm] = useState({ applicationId: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/admissions/track', form);
      setResult(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application not found');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const statusCfg = result ? (STATUS_CONFIG[result.status] || STATUS_CONFIG['applied']) : null;
  const currentIdx = result ? TIMELINE.indexOf(result.status) : -1;

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 to-white py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full uppercase tracking-wide">Application Status</span>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Track Your Application</h1>
          <p className="text-slate-500 text-lg">Enter your Application ID and registered email to check status.</p>
        </div>
      </section>

      <section className="py-12 px-6 bg-white">
        <div className="max-w-lg mx-auto">
          <form onSubmit={handleTrack} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Application ID</label>
              <input
                required
                value={form.applicationId}
                onChange={e => setForm({ ...form, applicationId: e.target.value })}
                placeholder="e.g. CX-2025-00001"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Registered Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              <Search size={16} />
              {loading ? 'Searching...' : 'Track Application'}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className="mt-8 space-y-5">
              {/* Status badge */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Application ID</div>
                    <div className="text-lg font-bold text-slate-900">{result.applicationId}</div>
                  </div>
                  <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                  <div>
                    <div className="text-xs text-slate-400">Applicant</div>
                    <div className="font-medium text-slate-800">{result.personalInfo?.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Applied On</div>
                    <div className="font-medium text-slate-800">{new Date(result.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Program Preference</div>
                    <div className="font-medium text-slate-800">{result.coursePreference?.[0]?.program || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Academic Year</div>
                    <div className="font-medium text-slate-800">{result.academicYear}</div>
                  </div>
                </div>

                {/* Timeline */}
                {result.status !== 'rejected' && (
                  <div className="space-y-2">
                    {TIMELINE.map((s, i) => {
                      const cfg = STATUS_CONFIG[s];
                      const done = i <= currentIdx;
                      const active = i === currentIdx;
                      return (
                        <div key={s} className={`flex items-center gap-3 p-2.5 rounded-lg ${active ? 'bg-indigo-50' : ''}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${done ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {done ? '✓' : i + 1}
                          </div>
                          <span className={`text-sm ${active ? 'font-semibold text-indigo-700' : done ? 'text-slate-700' : 'text-slate-400'}`}>
                            {cfg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Status-specific messages */}
                {result.status === 'rejected' && (
                  <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200 text-sm text-red-700">
                    <strong>Application Rejected</strong>
                    {result.adminRemarks && <p className="mt-1 text-red-600">{result.adminRemarks}</p>}
                  </div>
                )}
                {result.status === 'confirmed' && (
                  <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-sm text-emerald-700">
                    🎉 Congratulations! Your admission is confirmed. Login credentials have been sent to your email.
                  </div>
                )}
                {result.status === 'shortlisted' && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200 text-sm text-purple-700">
                    You have been shortlisted! Please pay the confirmation fee to secure your seat.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
