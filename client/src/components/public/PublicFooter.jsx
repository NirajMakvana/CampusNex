import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, Phone, Mail } from 'lucide-react';
import axios from '../../api/axios';

export default function PublicFooter() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    axios.get('/website/public')
      .then(res => setSettings(res.data.data))
      .catch(() => {});
  }, []);

  const s = settings || {
    collegeName: 'CampusNex',
    address: { street: '123 College Road', city: 'Surat', state: 'Gujarat', pin: '395001' },
    contact: { phone: '+91 98765 43210', email: 'admissions@campusnex.ac.in' },
    socialLinks: { facebook: '#', twitter: '#', instagram: '#', youtube: '#' },
    aboutCollege: 'Empowering education through smart campus management. VNSGU affiliated institution.',
    affiliation: 'Affiliated to VNSGU, Surat'
  };

  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap size={22} className="text-indigo-400" />
            <span className="text-white font-bold text-lg">{s.collegeName}</span>
          </div>
          <p className="text-sm leading-relaxed mb-4">
            {s.aboutCollege}
          </p>
          <div className="flex gap-3">
            {s.socialLinks.facebook && (
              <a href={s.socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-colors text-slate-400 hover:text-white">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            )}
            {s.socialLinks.twitter && (
              <a href={s.socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-colors text-slate-400 hover:text-white">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            )}
            {s.socialLinks.instagram && (
              <a href={s.socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-colors text-slate-400 hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            )}
            {s.socialLinks.youtube && (
              <a href={s.socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-colors text-slate-400 hover:text-white">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
              </a>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'About Us', to: '/about' },
              { label: 'Courses', to: '/courses-info' },
              { label: 'Admissions', to: '/admissions' },
              { label: 'Faculty', to: '/faculty-info' },
              { label: 'Campus Life', to: '/campus-life' },
              { label: 'Contact', to: '/contact' },
            ].map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className="hover:text-indigo-400 transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Admissions */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Admissions</h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'Apply Now', to: '/admissions/apply' },
              { label: 'Track Application', to: '/admissions/track' },
              { label: 'Eligibility Criteria', to: '/admissions' },
              { label: 'Fee Structure', to: '/admissions' },
              { label: 'Documents Required', to: '/admissions' },
            ].map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="hover:text-indigo-400 transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2">
              <MapPin size={15} className="text-indigo-400 mt-0.5 shrink-0" />
              <span>{s.address.street}, {s.address.city}, {s.address.state} — {s.address.pin}</span>
            </li>
            <li className="flex gap-2">
              <Phone size={15} className="text-indigo-400 shrink-0" />
              <span>{s.contact.phone}</span>
            </li>
            <li className="flex gap-2">
              <Mail size={15} className="text-indigo-400 shrink-0" />
              <span>{s.contact.email}</span>
            </li>
          </ul>
          <Link
            to="/login"
            className="inline-block mt-5 text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
          >
            Login to Portal →
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-800 py-5 px-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {s.collegeName}. All rights reserved. | {s.affiliation}
      </div>
    </footer>
  );
}
