import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { GraduationCap, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: otp+new pass
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ otp: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (err) { toast.error(err.response?.data?.message || 'Email not found'); }
    finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp: form.otp, newPassword: form.newPassword });
      toast.success('Password reset successful! Please login.');
      navigate('/login');
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid or expired OTP'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <GraduationCap size={28} className="text-indigo-600" />
          <span className="text-xl font-bold text-indigo-600">CampusNex</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <Link to="/login" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-6 transition-colors">
            <ArrowLeft size={14} /> Back to login
          </Link>

          {step === 1 ? (
            <>
              <h1 className="text-xl font-bold text-slate-800 mb-1">Forgot Password</h1>
              <p className="text-sm text-slate-500 mb-6">Enter your email and we'll send you an OTP</p>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@campus.edu"
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-slate-800 mb-1">Reset Password</h1>
              <p className="text-sm text-slate-500 mb-6">
                OTP sent to <strong>{email}</strong>. Valid for 10 minutes.
              </p>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">OTP Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={form.otp}
                    onChange={e => setForm({ ...form, otp: e.target.value })}
                    placeholder="6-digit OTP"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 tracking-widest text-center text-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={form.newPassword}
                    onChange={e => setForm({ ...form, newPassword: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button type="button" onClick={async () => {
                    setLoading(true);
                    try {
                      await api.post('/auth/forgot-password', { email });
                      toast.success('OTP resent to your email');
                    } catch (err) { toast.error(err.response?.data?.message || 'Failed to resend OTP'); }
                    finally { setLoading(false); }
                  }}
                  className="w-full py-2 text-sm text-slate-500 hover:text-slate-700">
                  Resend OTP
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
