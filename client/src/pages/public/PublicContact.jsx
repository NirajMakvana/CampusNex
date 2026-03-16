import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

export default function PublicContact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/public/contact', form);
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 to-white py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full uppercase tracking-wide">Get in Touch</span>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Contact Us</h1>
          <p className="text-slate-500 text-lg">We'd love to hear from you. Reach out for admissions, queries, or anything else.</p>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Get in Touch</h2>
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-indigo-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-800 text-sm">Address</div>
                  <div className="text-sm text-slate-500 mt-0.5">123 College Road, Surat, Gujarat — 395001</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-indigo-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-800 text-sm">Phone</div>
                  <div className="text-sm text-slate-500 mt-0.5">+91 98765 43210 | +91 98765 43211</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-indigo-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-800 text-sm">Email</div>
                  <div className="text-sm text-slate-500 mt-0.5">admissions@campusnex.ac.in</div>
                  <div className="text-sm text-slate-500">info@campusnex.ac.in</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-indigo-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-800 text-sm">Office Hours</div>
                  <div className="text-sm text-slate-500 mt-0.5">Mon – Sat: 9:00 AM – 5:00 PM</div>
                  <div className="text-sm text-slate-500">Sunday: Closed</div>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="mt-8 rounded-xl bg-slate-100 h-48 flex items-center justify-center text-slate-400 text-sm border border-slate-200">
              📍 Google Maps — Surat, Gujarat
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input
                  required
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                  placeholder="Admission inquiry / General query"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 resize-none"
                  placeholder="Write your message here..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
              >
                <Send size={16} />
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
