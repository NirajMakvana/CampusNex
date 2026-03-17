import { useEffect, useState } from 'react';
import { X, ExternalLink, CheckCircle2, User, CreditCard, ShieldCheck, ShieldX, Clock } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['applied', 'under-review', 'shortlisted', 'fee-pending', 'confirmed', 'rejected'];
const STATUS_COLORS = {
  'applied': 'bg-blue-100 text-blue-700', 'under-review': 'bg-amber-100 text-amber-700',
  'shortlisted': 'bg-purple-100 text-purple-700', 'fee-pending': 'bg-orange-100 text-orange-700',
  'confirmed': 'bg-emerald-100 text-emerald-700', 'rejected': 'bg-red-100 text-red-700',
};

export default function ApplicationDetailModal({ appId, onClose }) {
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [updating, setUpdating] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [allocatedProgram, setAllocatedProgram] = useState('');
  const [simPaying, setSimPaying] = useState(false);
  // docVerification: { photo: { status, remark }, ... } — local edits before save
  const [docVerification, setDocVerification] = useState({});
  const [savingDocs, setSavingDocs] = useState(false);

  useEffect(() => {
    api.get(`/admissions/${appId}`).then(r => {
      setApp(r.data.data);
      setNewStatus(r.data.data.status);
      setRemark(r.data.data.adminRemarks || '');
      setAllocatedProgram(r.data.data.allocatedProgram?._id || '');
      setDocVerification(r.data.data.documentVerification || {});
    }).catch(() => toast.error('Failed to load application')).finally(() => setLoading(false));
    api.get('/departments').then(r => setDepartments(r.data.data || [])).catch(() => {});
  }, [appId]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const res = await api.put(`/admissions/${appId}/status`, {
        status: newStatus,
        adminRemarks: remark,
        allocatedProgram: allocatedProgram || undefined,
      });
      toast.success(`Status updated to ${newStatus}`);
      if (res.data.studentCreated) {
        toast.success(`Student account created! Enrollment: ${res.data.studentCreated.enrollmentNo}`, { duration: 5000 });
      }
      setApp(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const setDocStatus = (docKey, status) => {
    setDocVerification(prev => ({ ...prev, [docKey]: { ...prev[docKey], status } }));
  };
  const setDocRemark = (docKey, remark) => {
    setDocVerification(prev => ({ ...prev, [docKey]: { ...prev[docKey], remark } }));
  };
  const handleSaveDocVerification = async () => {
    setSavingDocs(true);
    try {
      await api.put(`/admissions/${appId}/documents/verify`, { verifications: docVerification });
      toast.success('Document verification saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSavingDocs(false);
    }
  };

  const handleSimulateConfirmationFee = async () => {
    setSimPaying(true);
    await new Promise(r => setTimeout(r, 2000));
    try {
      await api.post('/admissions/payment/simulate', {
        applicationId: app.applicationId,
        type: 'confirmation',
      });
      toast.success('Confirmation fee marked as paid');
      setApp(a => ({ ...a, confirmationFee: { ...a.confirmationFee, status: 'paid' } }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSimPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-bold text-slate-900">Application Detail</h2>
            {app && <p className="text-xs text-indigo-600 font-mono mt-0.5">{app.applicationId}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400">Loading...</div>
        ) : !app ? (
          <div className="p-10 text-center text-slate-400">Application not found</div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Status badge */}
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold px-3 py-1.5 rounded-full capitalize ${STATUS_COLORS[app.status]}`}>{app.status}</span>
              <span className="text-xs text-slate-400">Applied: {new Date(app.createdAt).toLocaleDateString('en-IN')}</span>
              {app.statusUpdatedAt && <span className="text-xs text-slate-400">Updated: {new Date(app.statusUpdatedAt).toLocaleDateString('en-IN')}</span>}
            </div>

            {/* Personal Info */}
            <Section title="Personal Information">
              <Grid2>
                <InfoRow label="Name" value={app.personalInfo?.name} />
                <InfoRow label="DOB" value={app.personalInfo?.dob ? new Date(app.personalInfo.dob).toLocaleDateString('en-IN') : '—'} />
                <InfoRow label="Gender" value={app.personalInfo?.gender} />
                <InfoRow label="Mobile" value={app.personalInfo?.mobile} />
                <InfoRow label="Email" value={app.personalInfo?.email} />
                <InfoRow label="Category" value={app.personalInfo?.category} />
                <InfoRow label="City" value={app.personalInfo?.address?.city} />
                <InfoRow label="State" value={app.personalInfo?.address?.state} />
              </Grid2>
            </Section>

            {/* Academic Info */}
            <Section title="Academic Information">
              <Grid2>
                <InfoRow label="Board (12th)" value={app.academicInfo?.board} />
                <InfoRow label="School" value={app.academicInfo?.school} />
                <InfoRow label="Passing Year" value={app.academicInfo?.passingYear} />
                <InfoRow label="Percentage" value={`${app.academicInfo?.percentage}%`} />
                <InfoRow label="Stream" value={app.academicInfo?.stream} />
                <InfoRow label="Subjects" value={app.academicInfo?.subjects} />
              </Grid2>
            </Section>

            {/* Course Preference */}
            <Section title="Course Preference">
              <div className="flex gap-3 flex-wrap">
                {app.coursePreference?.map(c => (
                  <span key={c.rank} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm rounded-lg font-medium">
                    {c.rank}. {c.program}
                  </span>
                ))}
              </div>
            </Section>

            {/* Documents & Verification */}
            {app.documents && Object.keys(app.documents).some(k => app.documents[k]) && (
              <Section title="Documents & Verification">
                <DocVerificationPanel
                  documents={app.documents}
                  docVerification={docVerification}
                  setDocStatus={setDocStatus}
                  setDocRemark={setDocRemark}
                  onSave={handleSaveDocVerification}
                  saving={savingDocs}
                />
              </Section>
            )}

            {/* Payment Info */}
            <Section title="Payment Status">
              <Grid2>
                <InfoRow label="App Fee" value={`₹${app.applicationFee?.amount} — ${app.applicationFee?.status}`} />
                <InfoRow label="Confirmation Fee" value={`₹${app.confirmationFee?.amount} — ${app.confirmationFee?.status}`} />
              </Grid2>
              {app.confirmationFee?.status === 'pending' && app.confirmationFee?.amount > 0 && (
                <div className="mt-3">
                  <button
                    onClick={handleSimulateConfirmationFee}
                    disabled={simPaying}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
                  >
                    {simPaying ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                    ) : (
                      <><CreditCard size={14} /> Simulate Confirmation Fee Payment</>
                    )}
                  </button>
                </div>
              )}
              {app.confirmationFee?.status === 'paid' && (
                <div className="flex items-center gap-2 mt-2 text-sm text-emerald-700">
                  <CheckCircle2 size={14} /> Confirmation fee paid
                </div>
              )}
            </Section>

            {/* Student created */}
            {app.studentCreated && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-sm text-emerald-700">
                <User size={15} />
                Student account created — Enrollment: <strong>{app.studentCreated?.enrollmentNo}</strong>
              </div>
            )}

            {/* Status History Timeline */}
            {app.statusHistory?.length > 0 && (
              <Section title="Status History">
                <div className="space-y-2">
                  {app.statusHistory.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[h.status] || 'bg-slate-100 text-slate-600'}`}>{h.status}</span>
                        {h.remark && <span className="ml-2 text-slate-500 text-xs">— {h.remark}</span>}
                        <div className="text-xs text-slate-400 mt-0.5">{new Date(h.changedAt).toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Admin Action */}
            <Section title="Update Status">
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">New Status</label>
                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400">
                      {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Allocate Department</label>
                    <select value={allocatedProgram} onChange={e => setAllocatedProgram(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400">
                      <option value="">— Select Department —</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Remarks / Reason</label>
                  <textarea value={remark} onChange={e => setRemark(e.target.value)} rows={2}
                    placeholder="Add remarks or rejection reason..."
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 resize-none" />
                </div>
                <button onClick={handleUpdate} disabled={updating}
                  className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60">
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}
function Grid2({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">{children}</div>;
}
function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm py-1 border-b border-slate-50">
      <span className="text-slate-400 w-32 shrink-0">{label}</span>
      <span className="text-slate-800 font-medium">{value}</span>
    </div>
  );
}

const DOC_LABELS = {
  photo: 'Photo',
  marksheet12: '12th Marksheet',
  marksheet10: '10th Marksheet',
  categoryCert: 'Category Certificate',
  aadhar: 'Aadhar Card',
};

function DocVerificationPanel({ documents, docVerification, setDocStatus, setDocRemark, onSave, saving }) {
  const docKeys = Object.keys(documents).filter(k => documents[k]);

  const allVerified = docKeys.length > 0 && docKeys.every(k => (docVerification[k]?.status || 'pending') === 'verified');
  const anyRejected = docKeys.some(k => (docVerification[k]?.status || 'pending') === 'rejected');

  return (
    <div className="space-y-3">
      {/* Summary badge */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
        allVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : anyRejected ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-amber-50 text-amber-700 border-amber-200'
      }`}>
        {allVerified ? <ShieldCheck size={14} /> : anyRejected ? <ShieldX size={14} /> : <Clock size={14} />}
        {allVerified ? 'All documents verified' : anyRejected ? 'Some documents rejected' : 'Verification pending'}
      </div>

      {/* Per-document rows */}
      {docKeys.map(key => {
        const url = documents[key];
        const verif = docVerification[key] || { status: 'pending', remark: '' };
        return (
          <div key={key} className="border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              {/* Doc link */}
              <a href={url} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline font-medium">
                <ExternalLink size={13} /> {DOC_LABELS[key] || key}
              </a>
              {/* Status buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDocStatus(key, 'verified')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    verif.status === 'verified'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-emerald-600 border-emerald-300 hover:bg-emerald-50'
                  }`}>
                  <ShieldCheck size={12} /> Verify
                </button>
                <button
                  onClick={() => setDocStatus(key, 'rejected')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    verif.status === 'rejected'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-red-600 border-red-300 hover:bg-red-50'
                  }`}>
                  <ShieldX size={12} /> Reject
                </button>
                <button
                  onClick={() => setDocStatus(key, 'pending')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    verif.status === 'pending'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-amber-600 border-amber-300 hover:bg-amber-50'
                  }`}>
                  <Clock size={12} /> Pending
                </button>
              </div>
            </div>
            {/* Remark input — show when rejected */}
            {verif.status === 'rejected' && (
              <input
                type="text"
                value={verif.remark || ''}
                onChange={e => setDocRemark(key, e.target.value)}
                placeholder="Rejection reason (e.g. Blurry image, wrong document)"
                className="w-full px-3 py-1.5 text-xs border border-red-200 rounded-lg focus:outline-none focus:border-red-400 bg-red-50"
              />
            )}
          </div>
        );
      })}

      {/* Save button */}
      <button
        onClick={onSave}
        disabled={saving}
        className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-60">
        {saving ? 'Saving...' : 'Save Verification'}
      </button>
    </div>
  );
}
