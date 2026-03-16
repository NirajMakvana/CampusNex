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
  { name: 'Priya Shah', course: 'BCA 3rd Year', text: 'CampusNex made tracking my attendance and results so easy. The portal is super intuitive.', rating: 5 },
  { name: 'Rahul Patel', course: 'BBA 2nd Year', text: 'The fee payment and hostel management features saved me so much time. Highly recommend.', rating: 5 },
  { name: 'Anjali Mehta', course: 'BSc IT 1st Year', text: 'Applying for admission was seamless. Got my application ID instantly and tracked everything online.', rating: 4 },
];

export default function PublicHome() {
  const [stats, setStats] = useState({ students: 1200, faculty: 80, departments: 6, yearsEstablished: 15 });
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    axios.get('/api/public/stats').then(r => setStats(r.data.data)).catch(() => {});
    axios.get('/api/public/notices').then(r => setNotices(r.data.data || [])).catch(() => {});
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-6 py-28 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full tracking-wide uppercase">
            Admissions Open 2025–26
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-5">
            Shape Your Future at<br />
            <span className="text-indigo-600">CampusNex College</span>
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto">
            VNSGU affiliated institution offering BCA, BBA, and BSc programs with world-class facilities and expert faculty.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/admissions/apply" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
              Apply Now <ArrowRight size={16} />
            </Link>
            <Link to="/courses-info" className="px-6 py-3 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors">
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
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

      {/* Featured Courses */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Our Programs</h2>
            <p className="text-slate-500">Industry-aligned programs designed for the future.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: 'BCA', full: 'Bachelor of Computer Applications', duration: '3 Years', seats: 60, color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-700' },
              { name: 'BBA', full: 'Bachelor of Business Administration', duration: '3 Years', seats: 60, color: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
              { name: 'BSc IT', full: 'Bachelor of Science in IT', duration: '3 Years', seats: 40, color: 'bg-purple-50 border-purple-200', badge: 'bg-purple-100 text-purple-700' },
            ].map(c => (
              <div key={c.name} className={`rounded-xl border p-6 ${c.color}`}>
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

      {/* Admission CTA Banner */}
      <section className="py-14 px-6 bg-indigo-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Admissions Open for 2025–26</h2>
          <p className="text-indigo-200 mb-6">Last date to apply: <strong className="text-white">July 31, 2025</strong>. Don't miss your chance.</p>
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

      {/* Latest Notices */}
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

      {/* Testimonials */}
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
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-400">{t.course}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
