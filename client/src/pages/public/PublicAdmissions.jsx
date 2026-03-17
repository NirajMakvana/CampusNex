import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Calendar, FileText, ArrowRight, AlertCircle } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import axios from '../../api/axios';

const steps = [
  { num: '01', title: 'Fill Application', desc: 'Complete the online application form with personal and academic details.' },
  { num: '02', title: 'Upload Documents', desc: 'Upload required documents — marksheets, photo, Aadhar, category certificate.' },
  { num: '03', title: 'Pay Application Fee', desc: 'Pay the application fee online via simulated payment (UPI, card, net banking).' },
  { num: '04', title: 'Track & Confirm', desc: 'Track your application status and pay confirmation fee once shortlisted.' },
];

const docs = [
  '10th Marksheet (original + photocopy)',
  '12th Marksheet (original + photocopy)',
  'School Leaving Certificate',
  'Passport size photographs (4 copies)',
  'Aadhar Card',
  'Category Certificate (if applicable — OBC/SC/ST/EWS)',
  'Migration Certificate (if from other board)',
];

export default function PublicAdmissions() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    axios.get('/public/admission-settings').then(r => setSettings(r.data.data)).catch(() => {});
  }, []);

  return (
    <PublicLayout>
      {/* Hero with background image */}
      <section className="relative overflow-hidden py-28 px-6 text-center">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1400&h=500&fit=crop"
          alt="Admissions"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/75" />
        <div className="relative max-w-2xl mx-auto">
          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-white/20 text-white border border-white/30 rounded-full uppercase tracking-wide backdrop-blur-sm">
            {settings?.isOpen ? '🟢 Admissions Open' : '🔴 Admissions Closed'}
          </span>
          <h1 className="text-4xl font-extrabold text-white mb-4">Admissions 2025–26</h1>
          <p className="text-indigo-200 text-lg">Join CampusNex and start your journey towards a successful career.</p>
          <div className="flex justify-center gap-4 mt-8 flex-wrap">
            {settings?.isOpen ? (
              <Link to="/admissions/apply" className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
                Apply Now <ArrowRight size={16} />
              </Link>
            ) : (
              <div className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white font-medium rounded-xl backdrop-blur-sm">
                <AlertCircle size={16} /> Applications not open yet
              </div>
            )}
            <Link to="/admissions/track" className="px-6 py-3 border border-white/40 text-white font-medium rounded-xl hover:bg-white/10 transition-colors">
              Track Application
            </Link>
          </div>
        </div>
      </section>

      {/* Important Dates */}
      {settings && (
        <section className="py-12 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Important Dates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Last Date to Apply', date: settings.lastDateToApply },
                { label: 'Merit List Announcement', date: settings.meritListDate },
                { label: 'Confirmation Last Date', date: settings.confirmationLastDate },
              ].map(({ label, date }) => date && (
                <div key={label} className="flex gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <Calendar size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500">{label}</div>
                    <div className="font-semibold text-slate-800 text-sm mt-0.5">
                      {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Admission Process */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">How It Works</span>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Admission Process</h2>
            <p className="text-slate-500">Simple 4-step process to secure your seat.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map(s => (
              <div key={s.num} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-sm">{s.num}</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fee Structure */}
      {settings?.programs?.length > 0 && (
        <section className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Fee Structure</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['Program', 'Duration', 'Seats', 'Eligibility %', 'Annual Fees'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {settings.programs.map(p => (
                    <tr key={p.name} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                      <td className="px-4 py-3 text-slate-500">{p.duration}</td>
                      <td className="px-4 py-3 text-slate-500">{p.seats}</td>
                      <td className="px-4 py-3 text-slate-500">{p.eligibilityPercent}%</td>
                      <td className="px-4 py-3 text-slate-800 font-medium">₹{p.annualFees?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {settings.applicationFee && (
              <p className="text-sm text-slate-500 mt-3">
                Application Fee: <strong className="text-slate-700">₹{settings.applicationFee}</strong> (non-refundable)
              </p>
            )}
          </div>
        </section>
      )}

      {/* Documents Required */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
              <FileText size={20} className="text-indigo-600" /> Documents Required
            </h2>
            <ul className="space-y-2">
              {(settings?.documentsRequired?.length ? settings.documentsRequired : docs).map(d => (
                <li key={d} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={15} className="text-indigo-500 mt-0.5 shrink-0" />{d}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 text-white">
            <h3 className="font-bold text-lg mb-3">Ready to Apply?</h3>
            <p className="text-slate-400 text-sm mb-5">Fill out the online application form and take the first step towards your future.</p>
            {settings?.isOpen ? (
              <Link to="/admissions/apply" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors text-sm">
                Start Application <ArrowRight size={14} />
              </Link>
            ) : (
              <p className="text-indigo-300 text-sm">Applications will open soon. Check back later.</p>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
