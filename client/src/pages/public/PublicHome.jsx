import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Users, BookOpen, Award, Star, ChevronRight } from 'lucide-react';
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

const courseImages = {
  BCA: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=200&fit=crop',
  BBA: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=200&fit=crop',
  'BSc IT': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop',
};

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

  return (
    <PublicLayout>
      {/* Hero with background image */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?w=1600&h=900&fit=crop"
          alt="Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-transparent" />
        <div className="relative max-w-3xl mx-auto px-6 py-28 text-left">
          <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 rounded-full tracking-wide uppercase backdrop-blur-sm">
            {settings?.isOpen ? '🟢 Admissions Open 2025–26' : 'Admissions 2025–26'}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
            Shape Your Future at<br />
            <span className="text-indigo-400">CampusNex College</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-xl">
            VNSGU affiliated institution offering BCA, BBA, and BSc programs with world-class facilities and expert faculty.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link to="/admissions/apply" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-900/40">
              Apply Now <ArrowRight size={16} />
            </Link>
            <Link to="/courses-info" className="px-6 py-3 border border-white/30 text-white font-medium rounded-xl hover:bg-white/10 transition-colors backdrop-blur-sm">
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Stats — dynamic from API */}
      <section className="bg-indigo-600 text-white py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: `${stats.students}+`, label: 'Students' },
            { value: `${stats.faculty}+`, label: 'Faculty Members' },
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

      {/* Featured Courses with images */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Our Programs</h2>
            <p className="text-slate-500">Industry-aligned programs designed for the future.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: 'BCA', full: 'Bachelor of Computer Applications', duration: '3 Years', seats: 60, badge: 'bg-blue-100 text-blue-700' },
              { name: 'BBA', full: 'Bachelor of Business Administration', duration: '3 Years', seats: 60, badge: 'bg-emerald-100 text-emerald-700' },
              { name: 'BSc IT', full: 'Bachelor of Science in IT', duration: '3 Years', seats: 40, badge: 'bg-purple-100 text-purple-700' },
            ].map(c => (
              <div key={c.name} className="rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                <img src={courseImages[c.name]} alt={c.name} className="w-full h-40 object-cover" />
                <div className="p-5">
                  <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3 ${c.badge}`}>{c.name}</span>
                  <h3 className="font-semibold text-slate-800 mb-2">{c.full}</h3>
                  <div className="text-sm text-slate-500 space-y-1 mb-4">
                    <div>Duration: {c.duration}</div>
                    <div>Seats: {c.seats}</div>
                  </div>
                  <Link to="/admissions/apply" className="text-sm font-medium text-indigo-600 hover:underline flex items-center gap-1">
                    Apply Now <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why CampusNex */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Why Choose CampusNex?</h2>
            <p className="text-slate-500">We go beyond academics to prepare you for the real world.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-3">
                  <Icon size={20} className="text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admission CTA Banner — dynamic last date */}
      <section className="relative py-20 px-6 text-white text-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&h=500&fit=crop"
          alt="Admissions"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-indigo-900/75" />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Admissions Open for 2025–26</h2>
          <p className="text-indigo-200 mb-6">Last date to apply: <strong className="text-white">{lastDate}</strong>. Don't miss your chance.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/admissions/apply" className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors">
              Apply Now
            </Link>
            <Link to="/admissions/track" className="px-6 py-3 border border-white/40 text-white font-medium rounded-xl hover:bg-white/10 transition-colors">
              Track Application
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Notices — dynamic */}
      {notices.length > 0 && (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Latest News & Notices</h2>
            </div>
            <div className="space-y-4">
              {notices.map(n => (
                <div key={n._id} className="flex gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                  <div>
                    <h4 className="font-medium text-slate-800">{n.title}</h4>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <span className="text-xs text-slate-400 mt-1 block">{new Date(n.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials with avatars */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">What Our Students Say</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.course}</div>
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
