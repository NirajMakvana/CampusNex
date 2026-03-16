import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Users, BookOpen, Award, Star, ChevronRight, Bell } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import axios from '../../api/axios';

const features = [
  { icon: GraduationCap, title: 'Smart Management', desc: 'Unified platform for all campus operations — attendance, exams, fees and more.' },
  { icon: BookOpen, title: 'Digital Learning', desc: 'Timetables, course materials, and results accessible anytime, anywhere.' },
  { icon: Users, title: 'Expert Faculty', desc: 'Experienced educators dedicated to student success and academic excellence.' },
  { icon: Award, title: 'Industry Connect', desc: 'Strong industry partnerships for internships, placements, and guest lectures.' },
];

const testimonials = [
  { name: 'Priya Shah', course: 'BCA 3rd Year', text: 'CampusNex made tracking my attendance and results so easy. The portal is super intuitive.', rating: 5, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face' },
  { name: 'Rahul Patel', course: 'BBA 2nd Year', text: 'The fee payment and hostel management features saved me so much time. Highly recommend.', rating: 5, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' },
  { name: 'Anjali Mehta', course: 'BSc IT 1st Year', text: 'Applying for admission was seamless. Got my application ID instantly and tracked everything online.', rating: 4, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face' },
];

// Course images map — fallback to a generic education image
const courseImages = {
  BCA: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=200&fit=crop',
  BBA: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=200&fit=crop',
  'BSc IT': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop',
  default: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=200&fit=crop',
};

// Full name map for known programs
const programFullNames = {
  BCA: 'Bachelor of Computer Applications',
  BBA: 'Bachelor of Business Administration',
  'BSc IT': 'Bachelor of Science in IT',
  'BSc CS': 'Bachelor of Science in Computer Science',
  MCA: 'Master of Computer Applications',
  MBA: 'Master of Business Administration',
};

const badgeColors = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
];

export default function PublicHome() {
  const [stats, setStats] = useState({ students: 1200, faculty: 80, departments: 6, yearsEstablished: 15 });
  const [notices, setNotices] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    axios.get('/api/public/stats').then(r => setStats(r.data.data)).catch(() => {});
    axios.get('/api/public/notices').then(r => setNotices(r.data.data || [])).catch(() => {});
    axios.get('/api/public/admission-settings').then(r => setSettings(r.data.data)).catch(() => {});
  }, []);

  const lastDate = settings?.lastDateToApply
    ? new Date(settings.lastDateToApply).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'July 31, 2025';

  const programs = settings?.programs?.length
    ? settings.programs.map((p, i) => ({
        name: p.name,
        full: programFullNames[p.name] || p.name,
        duration: p.duration || '3 Years',
        seats: p.seats,
        badge: badgeColors[i % badgeColors.length],
        img: courseImages[p.name] || courseImages.default,
      }))
    : [
        { name: 'BCA', full: 'Bachelor of Computer Applications', duration: '3 Years', seats: 60, badge: badgeColors[0], img: courseImages.BCA },
        { name: 'BBA', full: 'Bachelor of Business Administration', duration: '3 Years', seats: 60, badge: badgeColors[1], img: courseImages.BBA },
        { name: 'BSc IT', full: 'Bachelor of Science in IT', duration: '3 Years', seats: 40, badge: badgeColors[2], img: courseImages['BSc IT'] },
      ];

  return (
    <PublicLayout>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?w=1600&h=900&fit=crop"
          alt="Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark gradient overlay — left heavy so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/55 to-slate-900/20" />

        <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 py-24">
          <div className="max-w-2xl">
            {/* Admission status badge */}
            <span className={`inline-flex items-center gap-1.5 mb-5 px-3.5 py-1.5 text-xs font-semibold rounded-full border backdrop-blur-sm ${
              settings?.isOpen
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                : 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${settings?.isOpen ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
              {settings?.isOpen ? 'Admissions Open 2025–26' : 'Admissions 2025–26'}
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
              Shape Your Future<br />
              <span className="text-indigo-400">at CampusNex</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              VNSGU affiliated institution offering BCA, BBA, and BSc programs with world-class facilities and expert faculty.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to="/admissions/apply"
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/50 hover:shadow-indigo-900/70 hover:-translate-y-0.5"
              >
                Apply Now <ArrowRight size={16} />
              </Link>
              <Link
                to="/courses-info"
                className="px-6 py-3 border border-white/30 text-white font-medium rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm hover:-translate-y-0.5"
              >
                Explore Courses
              </Link>
            </div>

            {/* Quick trust indicators */}
            <div className="flex items-center gap-6 mt-10 flex-wrap">
              {[
                { val: `${stats.students}+`, label: 'Students' },
                { val: `${stats.faculty}+`, label: 'Faculty' },
                { val: `${stats.yearsEstablished}+`, label: 'Years' },
              ].map(({ val, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-extrabold text-white">{val}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <section className="bg-indigo-600 text-white py-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: `${stats.students}+`, label: 'Students Enrolled' },
            { value: `${stats.faculty}+`, label: 'Expert Faculty' },
            { value: `${stats.departments}`, label: 'Departments' },
            { value: `${stats.yearsEstablished}+`, label: 'Years of Excellence' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-extrabold">{value}</div>
              <div className="text-indigo-200 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── OUR PROGRAMS ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">Programs</span>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Our Programs</h2>
            <p className="text-slate-500 max-w-md mx-auto">Industry-aligned undergraduate programs designed for the future.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {programs.map(c => (
              <div key={c.name} className="group rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
                <div className="overflow-hidden h-44">
                  <img
                    src={c.img}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3 ${c.badge}`}>{c.name}</span>
                  <h3 className="font-semibold text-slate-800 mb-2 leading-snug">{c.full}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <span>⏱ {c.duration}</span>
                    <span>🪑 {c.seats} Seats</span>
                  </div>
                  <Link
                    to="/admissions/apply"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:gap-2 transition-all"
                  >
                    Apply Now <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/courses-info" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors">
              View All Programs <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY CAMPUSNEX ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">Why Us</span>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Why Choose CampusNex?</h2>
            <p className="text-slate-500">We go beyond academics to prepare you for the real world.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300">
                <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={22} className="text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ADMISSION CTA BANNER ─────────────────────────────────────────── */}
      <section className="relative py-24 px-6 text-white text-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&h=500&fit=crop"
          alt="Admissions"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-indigo-900/80" />
        <div className="relative max-w-2xl mx-auto">
          {settings?.isOpen !== false && (
            <span className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Applications Open Now
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            {settings?.isOpen === false ? 'Admissions Coming Soon' : 'Admissions Open for 2025–26'}
          </h2>
          <p className="text-indigo-200 mb-8 text-lg">
            {settings?.isOpen === false
              ? 'Applications will open soon. Stay tuned for updates.'
              : <>Last date to apply: <strong className="text-white">{lastDate}</strong>. Don't miss your chance.</>
            }
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            {settings?.isOpen !== false && (
              <Link to="/admissions/apply" className="px-7 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
                Apply Now
              </Link>
            )}
            <Link to="/admissions/track" className="px-7 py-3 border border-white/40 text-white font-medium rounded-xl hover:bg-white/10 transition-colors">
              Track Application
            </Link>
            <Link to="/admissions" className="px-7 py-3 border border-white/40 text-white font-medium rounded-xl hover:bg-white/10 transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ── LATEST NOTICES ───────────────────────────────────────────────── */}
      {notices.length > 0 && (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">Updates</span>
              <h2 className="text-3xl font-bold text-slate-900">Latest News & Notices</h2>
            </div>
            <div className="space-y-3">
              {notices.map(n => (
                <div key={n._id} className="flex gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Bell size={14} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800">{n.title}</h4>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <span className="text-xs text-slate-400 mt-1 block">{new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl font-bold text-slate-900">What Our Students Say</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-indigo-200 transition-all">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                  ))}
                </div>
                <p className="text-sm text-slate-600 mb-5 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100" />
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{t.name}</div>
                    <div className="text-xs text-indigo-500 mt-0.5">{t.course}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
