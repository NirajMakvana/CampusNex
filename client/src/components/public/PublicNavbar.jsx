import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', to: '/home' },
  { label: 'About', to: '/about' },
  { label: 'Courses', to: '/courses-info' },
  { label: 'Admissions', to: '/admissions' },
  { label: 'Faculty', to: '/faculty-info' },
  { label: 'Campus Life', to: '/campus-life' },
  { label: 'Contact', to: '/contact' },
];

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/80 backdrop-blur'} border-b border-slate-100`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2">
          <GraduationCap size={26} className="text-indigo-600" />
          <span className="text-lg font-bold text-indigo-600">CampusNex</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === to
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="hidden lg:flex items-center gap-2">
          <Link
            to="/admissions/apply"
            className="px-4 py-2 text-sm font-medium border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Apply Now
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Login to Portal
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`block px-3 py-2.5 text-sm font-medium rounded-lg ${
                location.pathname === to ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link to="/admissions/apply" className="text-center px-4 py-2.5 text-sm font-medium border border-indigo-600 text-indigo-600 rounded-lg">
              Apply Now
            </Link>
            <Link to="/login" className="text-center px-4 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-lg">
              Login to Portal
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
