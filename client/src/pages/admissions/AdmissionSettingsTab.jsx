import { useEffect, useState } from 'react';
import { Plus, Save, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const DEFAULT_DOCS = [
  '10th Marksheet', '12th Marksheet', 'School Leaving Certificate',
  'Passport size photographs (4 copies)', 'Aadhar Card',
  'Category Certificate (if applicable)', 'Migration Certificate (if from other board)',
];

const DEFAULT_PROGRAMS = [
  { name: 'BCA', seats: 60, eligibilityPercent: 45, annualFees: 35000, duration: '3 Years' },
  { name: 'BBA', seats: 60, eligibilityPercent: 45, annualFees: 30000, duration: '3 Years' },
  { name: 'BSc IT', seats: 40, eligibilityPercent: 45, annualFees: 32000, duration: '3 Years' },
];

export default function AdmissionSettingsTab() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    api.get('/admissions/settings').then(r => {
      setSettings(r.data.data);
      if (r.data.data.length > 0) setForm(r.data.data[0]);
    }).catch(() => toast.error('Failed to load settings')).finally(() => setLoading(false));
  }, []);

  const startNew = () => {
    setForm({
      academicYear: `${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(-2)}`,
      isOpen: false, applicationFee: 300, confirmationFee: 5000,
      lastDateToApply: '', meritListDate: '', confirmationLastDate: '',
      programs: DEFAULT_PROGRAMS,
      documentsRequired: DEFAULT_DOCS,
    });
    setIsNew(true);
  };

  const setF = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setProgram = (i, key, val) => setForm(f => ({
    ...f, programs: f.programs.map((p, idx) => idx === i ? { ...p, [key]: val } : p),
  }));
  const addProgram = () => setForm(f => ({ ...f, programs: [...f.programs, { name: '', seats: 0, eligibilityPercent: 45, annualFees: 0, duration: '3 Years' }] }));
  const removeProgram = (i) => setForm(f => ({ ...f, programs: f.programs.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNew) {
        const res = await api.post('/admissions/settings', form);
        setSettings(s => [res.data.data, ...s]);
        setForm(res.data.data);
        setIsNew(false);
        toast.success('Settings created');
      } else {
        const res = await api.put(`/admissions/settings/${form._id}`, form);
        setSettings(s => s.map(x => x._id === form._id ? res.data.data : x));
        setForm(res.data.data);
        toast.success('Settings saved');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-10 text-center text-slate-400">Loading...</div>;

  return (
    <div className="space-y-5">
      {/* Year selector */}
      <div className="flex items-center gap-3 flex-wrap">
        {settings.map(s => (
          <button key={s._id} onClick={() => { setForm(s); setIsNew(false); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${form?._id === s._id ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
            {s.academicYear}
          </button>
        ))}
        <button onClick={startNew} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-dashed border-slate-300 text-slate-500 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-colors">
          <Plus size={14} /> New Year
        </button>
      </div>

      {form && (
        <div className="space-y-5">
          {/* Basic settings */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Basic Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Academic Year</label>
                <input value={form.academicYear} onChange={e => setF('academicYear', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Application Fee (₹)</label>
                <input type="number" value={form.applicationFee} onChange={e => setF('applicationFee', Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Confirmation Fee (₹)</label>
                <input type="number" value={form.confirmationFee} onChange={e => setF('confirmationFee', Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Last Date to Apply</label>
                <input type="date" value={form.lastDateToApply?.slice(0, 10) || ''} onChange={e => setF('lastDateToApply', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Merit List Date</label>
                <input type="date" value={form.meritListDate?.slice(0, 10) || ''} onChange={e => setF('meritListDate', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Confirmation Last Date</label>
                <input type="date" value={form.confirmationLastDate?.slice(0, 10) || ''} onChange={e => setF('confirmationLastDate', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
              </div>
            </div>

            {/* Admissions open toggle */}
            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => setF('isOpen', !form.isOpen)} className="flex items-center gap-2 text-sm font-medium">
                {form.isOpen
                  ? <ToggleRight size={28} className="text-emerald-500" />
                  : <ToggleLeft size={28} className="text-slate-400" />}
                <span className={form.isOpen ? 'text-emerald-600' : 'text-slate-500'}>
                  Admissions {form.isOpen ? 'OPEN' : 'CLOSED'}
                </span>
              </button>
            </div>
          </div>

          {/* Programs */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Programs</h3>
              <button onClick={addProgram} className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                <Plus size={13} /> Add Program
              </button>
            </div>
            {form.programs?.map((p, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-slate-50 rounded-lg">
                <input placeholder="Name" value={p.name} onChange={e => setProgram(i, 'name', e.target.value)}
                  className="px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
                <input type="number" placeholder="Seats" value={p.seats} onChange={e => setProgram(i, 'seats', Number(e.target.value))}
                  className="px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
                <input type="number" placeholder="Min %" value={p.eligibilityPercent} onChange={e => setProgram(i, 'eligibilityPercent', Number(e.target.value))}
                  className="px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
                <input type="number" placeholder="Annual Fees" value={p.annualFees} onChange={e => setProgram(i, 'annualFees', Number(e.target.value))}
                  className="px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
                <button onClick={() => removeProgram(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors justify-self-end">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Documents Required */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Documents Required</h3>
            <div className="space-y-2">
              {form.documentsRequired?.map((doc, i) => (
                <div key={i} className="flex gap-2">
                  <input value={doc} onChange={e => setForm(f => ({ ...f, documentsRequired: f.documentsRequired.map((d, idx) => idx === i ? e.target.value : d) }))}
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
                  <button onClick={() => setForm(f => ({ ...f, documentsRequired: f.documentsRequired.filter((_, idx) => idx !== i) }))}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button onClick={() => setForm(f => ({ ...f, documentsRequired: [...(f.documentsRequired || []), ''] }))}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                <Plus size={13} /> Add Document
              </button>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60">
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
}
