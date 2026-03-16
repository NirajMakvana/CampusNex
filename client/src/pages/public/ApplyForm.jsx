import { useState, useEffect } from 'react';
import { CheckCircle2, ChevronRight, ChevronLeft, Upload, CreditCard, Smartphone, Building2, Lock } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const STEPS = ['Personal Info', 'Academic Info', 'Course & Docs', 'Payment & Submit'];

const initialPersonal = { name: '', dob: '', gender: '', mobile: '', email: '', address: { street: '', city: '', state: '', pin: '' }, category: 'General', nationality: 'Indian', religion: '' };
const initialAcademic = { board: '', school: '', passingYear: '', percentage: '', stream: '', subjects: '', tenth: { board: '', school: '', passingYear: '', percentage: '' } };
const initialCourse = [{ rank: 1, program: '' }, { rank: 2, program: '' }, { rank: 3, program: '' }];

export default function ApplyForm() {
  const [step, setStep] = useState(0);
  const [personal, setPersonal] = useState(initialPersonal);
  const [academic, setAcademic] = useState(initialAcademic);
  const [coursePreference, setCoursePreference] = useState(initialCourse);
  const [files, setFiles] = useState({});
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    axios.get('/api/public/admission-settings').then(r => setSettings(r.data.data)).catch(() => {});
  }, []);

  const setP = (field, val) => setPersonal(p => ({ ...p, [field]: val }));
  const setAddr = (field, val) => setPersonal(p => ({ ...p, address: { ...p.address, [field]: val } }));
  const setA = (field, val) => setAcademic(a => ({ ...a, [field]: val }));
  const setTenth = (field, val) => setAcademic(a => ({ ...a, tenth: { ...a.tenth, [field]: val } }));

  const handleFileChange = (field, file) => setFiles(f => ({ ...f, [field]: file }));

  // Simulate payment — 2 second processing, then submit
  const handlePayAndSubmit = async () => {
    // Basic validation
    if (paymentMethod === 'upi' && !upiId.includes('@')) {
      toast.error('Enter a valid UPI ID (e.g. name@upi)'); return;
    }
    if (paymentMethod === 'card' && (cardNo.replace(/\s/g, '').length < 16 || !cardExpiry || !cardCvv)) {
      toast.error('Enter valid card details'); return;
    }

    setPaymentProcessing(true);
    // Simulate payment gateway processing
    await new Promise(r => setTimeout(r, 2500));
    setPaymentProcessing(false);
    setPaymentDone(true);
    await new Promise(r => setTimeout(r, 800));
    await handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('personalInfo', JSON.stringify(personal));
      formData.append('academicInfo', JSON.stringify(academic));
      formData.append('coursePreference', JSON.stringify(coursePreference.filter(c => c.program)));
      Object.entries(files).forEach(([key, file]) => { if (file) formData.append(key, file); });

      const res = await axios.post('/api/admissions/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubmitted(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!settings?.isOpen) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Admissions Closed</h2>
            <p className="text-slate-500">Applications are not open at this time. Please check back later.</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (submitted) {
    const fakeTxnId = `TXN${Date.now().toString().slice(-10)}`;
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <CheckCircle2 size={56} className="text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
            <p className="text-slate-500 mb-4">Payment successful. Your application has been received and a confirmation email has been sent.</p>
            <div className="bg-indigo-50 rounded-xl p-5 mb-3">
              <div className="text-xs text-slate-500 mb-1">Your Application ID</div>
              <div className="text-2xl font-extrabold text-indigo-600">{submitted.applicationId}</div>
              <div className="text-xs text-slate-400 mt-1">Save this ID to track your application</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 mb-6 text-left">
              <div className="text-xs text-slate-500 mb-1">Payment Details</div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-semibold text-emerald-700">₹{settings?.applicationFee || 300}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono text-xs text-slate-700">{fakeTxnId}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-500">Status</span>
                <span className="text-emerald-600 font-medium">✓ Success</span>
              </div>
            </div>
            <a href="/admissions/track" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm">
              Track Application <ChevronRight size={14} />
            </a>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="py-12 px-4 sm:px-6 bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Online Application Form</h1>
            <p className="text-slate-500 text-sm mt-1">Academic Year 2025–26</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <div className={`hidden sm:block text-xs ml-2 font-medium ${i === step ? 'text-indigo-600' : 'text-slate-400'}`}>{s}</div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            {/* Step 1 — Personal Info */}
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="font-semibold text-slate-800 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Name *" value={personal.name} onChange={v => setP('name', v)} placeholder="As per marksheet" />
                  <Field label="Date of Birth *" type="date" value={personal.dob} onChange={v => setP('dob', v)} />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                    <select value={personal.gender} onChange={e => setP('gender', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400">
                      <option value="">Select</option>
                      {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <Field label="Mobile No *" value={personal.mobile} onChange={v => setP('mobile', v)} placeholder="10-digit mobile" />
                  <Field label="Email *" type="email" value={personal.email} onChange={v => setP('email', v)} placeholder="your@email.com" />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select value={personal.category} onChange={e => setP('category', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400">
                      {['General', 'OBC', 'SC', 'ST', 'EWS'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="City" value={personal.address.city} onChange={v => setAddr('city', v)} />
                  <Field label="State" value={personal.address.state} onChange={v => setAddr('state', v)} />
                  <Field label="PIN Code" value={personal.address.pin} onChange={v => setAddr('pin', v)} />
                  <Field label="Street / Area" value={personal.address.street} onChange={v => setAddr('street', v)} />
                </div>
              </div>
            )}

            {/* Step 2 — Academic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-semibold text-slate-800 mb-4">Academic Information</h2>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">12th Standard Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Board *" value={academic.board} onChange={v => setA('board', v)} placeholder="e.g. GSEB, CBSE" />
                  <Field label="School / College Name *" value={academic.school} onChange={v => setA('school', v)} />
                  <Field label="Passing Year *" type="number" value={academic.passingYear} onChange={v => setA('passingYear', v)} placeholder="2024" />
                  <Field label="Percentage / CGPA *" type="number" value={academic.percentage} onChange={v => setA('percentage', v)} placeholder="e.g. 75.5" />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stream *</label>
                    <select value={academic.stream} onChange={e => setA('stream', e.target.value)} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400">
                      <option value="">Select Stream</option>
                      {['Science', 'Commerce', 'Arts', 'Other'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <Field label="Subjects" value={academic.subjects} onChange={v => setA('subjects', v)} placeholder="e.g. Maths, Physics, Chemistry" />
                </div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-4">10th Standard (Optional)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Board" value={academic.tenth.board} onChange={v => setTenth('board', v)} />
                  <Field label="School" value={academic.tenth.school} onChange={v => setTenth('school', v)} />
                  <Field label="Passing Year" type="number" value={academic.tenth.passingYear} onChange={v => setTenth('passingYear', v)} />
                  <Field label="Percentage" type="number" value={academic.tenth.percentage} onChange={v => setTenth('percentage', v)} />
                </div>
              </div>
            )}

            {/* Step 3 — Course + Documents */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-semibold text-slate-800 mb-4">Course Preference & Documents</h2>
                <div className="space-y-3">
                  {coursePreference.map((cp, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-500 w-20 shrink-0">Preference {i + 1}</span>
                      <select
                        value={cp.program}
                        onChange={e => setCoursePreference(prev => prev.map((p, idx) => idx === i ? { ...p, program: e.target.value } : p))}
                        className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                      >
                        <option value="">Select Program</option>
                        {['BCA', 'BBA', 'BSc IT'].map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-5 space-y-3">
                  <p className="text-sm font-medium text-slate-700">Upload Documents</p>
                  {[
                    { key: 'photo', label: 'Passport Photo *', accept: 'image/*' },
                    { key: 'marksheet12', label: '12th Marksheet *', accept: 'image/*,application/pdf' },
                    { key: 'marksheet10', label: '10th Marksheet', accept: 'image/*,application/pdf' },
                    { key: 'aadhar', label: 'Aadhar Card *', accept: 'image/*,application/pdf' },
                    { key: 'categoryCert', label: 'Category Certificate (if applicable)', accept: 'image/*,application/pdf' },
                  ].map(({ key, label, accept }) => (
                    <div key={key} className="flex items-center gap-3">
                      <label className="text-sm text-slate-600 w-52 shrink-0">{label}</label>
                      <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors text-sm text-slate-500">
                        <Upload size={14} />
                        {files[key] ? files[key].name : 'Choose file'}
                        <input type="file" accept={accept} className="hidden" onChange={e => handleFileChange(key, e.target.files[0])} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4 — Payment */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-semibold text-slate-800 mb-1">Application Fee Payment</h2>
                <p className="text-sm text-slate-500 mb-4">Pay the application fee to submit your application.</p>

                {/* Fee summary */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Application Fee</div>
                    <div className="text-2xl font-extrabold text-indigo-600">₹{settings?.applicationFee || 300}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Non-refundable • Academic Year 2025–26</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-full border border-emerald-200">
                    <Lock size={11} /> Secure Payment
                  </div>
                </div>

                {/* Application summary */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-sm space-y-1.5">
                  <div className="flex justify-between"><span className="text-slate-500">Applicant</span><span className="font-medium text-slate-800">{personal.name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Program</span><span className="font-medium text-slate-800">{coursePreference.find(c => c.program)?.program || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-medium text-slate-800">{personal.email}</span></div>
                </div>

                {/* Payment method tabs */}
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-3">Select Payment Method</p>
                  <div className="flex gap-2 mb-4">
                    {[
                      { id: 'upi', label: 'UPI', icon: Smartphone },
                      { id: 'card', label: 'Card', icon: CreditCard },
                      { id: 'netbanking', label: 'Net Banking', icon: Building2 },
                    ].map(({ id, label, icon: Icon }) => (
                      <button key={id} onClick={() => setPaymentMethod(id)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
                          paymentMethod === id ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                        }`}>
                        <Icon size={15} /> {label}
                      </button>
                    ))}
                  </div>

                  {/* UPI */}
                  {paymentMethod === 'upi' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">UPI ID</label>
                        <input value={upiId} onChange={e => setUpiId(e.target.value)}
                          placeholder="yourname@upi / yourname@okaxis"
                          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                          <span key={app} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600">{app}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Card */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Card Number</label>
                        <input value={cardNo} onChange={e => setCardNo(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19))}
                          placeholder="1234 5678 9012 3456" maxLength={19}
                          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 font-mono tracking-widest" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Expiry (MM/YY)</label>
                          <input value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="12/27" maxLength={5}
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">CVV</label>
                          <input value={cardCvv} onChange={e => setCardCvv(e.target.value)} placeholder="•••" maxLength={3} type="password"
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Net Banking */}
                  {paymentMethod === 'netbanking' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB', 'BOB', 'Canara'].map(bank => (
                        <button key={bank} className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-slate-700 font-medium">
                          {bank}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Processing overlay */}
                {paymentProcessing && (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-slate-700">Processing payment...</p>
                    <p className="text-xs text-slate-400">Please do not close this window</p>
                  </div>
                )}

                {paymentDone && !paymentProcessing && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-sm text-emerald-700">
                    <CheckCircle2 size={16} /> Payment successful! Submitting application...
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-5 border-t border-slate-100">
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handlePayAndSubmit}
                  disabled={loading || paymentProcessing || paymentDone}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60"
                >
                  {paymentProcessing ? 'Processing...' : loading ? 'Submitting...' : `Pay ₹${settings?.applicationFee || 300} & Submit`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
      />
    </div>
  );
}

function ReviewSection({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex px-4 py-2.5 text-sm">
      <span className="text-slate-500 w-36 shrink-0 capitalize">{label}</span>
      <span className="text-slate-800 font-medium">{value}</span>
    </div>
  );
}
