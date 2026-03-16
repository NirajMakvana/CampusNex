import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, Phone, Mail } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap size={22} className="text-indigo-400" />
            <span className="text-white font-bold text-lg">CampusNex</span>
          </div>
          <p className="text-sm leading-relaxed mb-4">
            Empowering education through smart campus management. VNSGU affiliated institution.
          </p>
          <div className="flex gap-3">
            {[
              { label: 'FB', href: '#' },
              { label: 'TW', href: '#' },
              { label: 'IG', href: '#' },
              { label: 'YT', href: '#' },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-colors text-xs font-bold text-slate-400 hover:text-white">
                {label}
              </a>
            ))}
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
              <span>123 College Road, Surat, Gujarat — 395001</span>
            </li>
            <li className="flex gap-2">
              <Phone size={15} className="text-indigo-400 shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex gap-2">
              <Mail size={15} className="text-indigo-400 shrink-0" />
              <span>admissions@campusnex.ac.in</span>
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
        © {new Date().getFullYear()} CampusNex. All rights reserved. | Affiliated to VNSGU, Surat
      </div>
    </footer>
  );
}
