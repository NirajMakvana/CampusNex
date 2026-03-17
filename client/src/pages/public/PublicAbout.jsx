import { useEffect, useState } from 'react';
import { Target, Eye, Library, FlaskConical, Home, Trophy, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/public/PublicLayout';
import axios from '../../api/axios';

const infra = [
  { icon: Library, title: 'Central Library', desc: '10,000+ books, digital resources, and reading rooms.', img: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=250&fit=crop' },
  { icon: FlaskConical, title: 'Modern Labs', desc: 'Computer labs with latest hardware and software.', img: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=250&fit=crop' },
  { icon: Home, title: 'Hostel', desc: 'Separate hostels for boys and girls with all amenities.', img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=250&fit=crop' },
  { icon: Trophy, title: 'Sports Complex', desc: 'Cricket ground, basketball court, indoor games.', img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=250&fit=crop' },
];

export default function PublicAbout() {
  const [stats, setStats] = useState({ students: 1200, faculty: 80, departments: 6, yearsEstablished: 15 });
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get('/public/stats'),
      axios.get('/website/public')
    ]).then(([statsRes, settingsRes]) => {
      setStats(statsRes.data.data);
      setSettings(settingsRes.data.data);
    }).catch(() => {});
  }, []);

  const s = settings || {
    collegeName: 'CampusNex',
    affiliation: 'Affiliated to VNSGU, Surat'
  };

  return (
    <PublicLayout>
      {/* Hero — consistent py-28 with image */}
      <section className="relative overflow-hidden py-28 px-6 text-center">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1400&h=600&fit=crop"
          alt="College campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/70" />
        <div className="relative max-w-2xl mx-auto">
          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-white/20 text-white border border-white/30 rounded-full uppercase tracking-wide backdrop-blur-sm">About Us</span>
          <h1 className="text-4xl font-extrabold text-white mb-3">Our Story</h1>
          <p className="text-indigo-200 text-lg max-w-xl mx-auto">Established in 2010, CampusNex College has been a beacon of quality education in Gujarat.</p>
        </div>
      </section>

      {/* Story — dynamic stats */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">Our Journey</span>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{stats.yearsEstablished}+ Years of Excellence</h2>
            <p className="text-slate-500 leading-relaxed mb-4">
                Founded in {2026 - stats.yearsEstablished}, {s.collegeName} is {s.affiliation}. We have been consistently producing graduates who excel in industry and academia.
            </p>
            <p className="text-slate-500 leading-relaxed">
              With state-of-the-art infrastructure, experienced faculty, and a student-first approach, we provide an environment where learning meets innovation.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: `${stats.students}+`, label: 'Students' },
              { value: `${stats.faculty}+`, label: 'Faculty' },
              { value: '95%', label: 'Placement Rate' },
              { value: '2010', label: 'Est. Year' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-indigo-50 rounded-2xl p-5 text-center border border-indigo-100">
                <div className="text-2xl font-extrabold text-indigo-600">{value}</div>
                <div className="text-sm text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission — both indigo theme */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">Our Purpose</span>
            <h2 className="text-2xl font-bold text-slate-900">Vision & Mission</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-indigo-200 transition-all">
              <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                <Eye size={22} className="text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Our Vision</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                To be a premier institution that nurtures innovative thinkers, ethical leaders, and skilled professionals who contribute meaningfully to society.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-indigo-200 transition-all">
              <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                <Target size={22} className="text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Our Mission</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                To provide quality education through innovative teaching, research, and industry collaboration, empowering students to achieve their full potential.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Principal Message */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block mb-6 px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">Principal's Message</span>
          <img
            src={s.principal?.image || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=120&fit=crop&crop=face"}
            alt="Principal"
            className="w-20 h-20 rounded-full object-cover mx-auto mb-5 ring-4 ring-indigo-100"
          />
          <blockquote className="text-lg text-slate-600 italic leading-relaxed mb-5">
            "{s.principal?.message || "Education is not just about acquiring knowledge — it's about developing the character, skills, and mindset to make a difference in the world. At CampusNex, we are committed to that journey with every student."}"
          </blockquote>
          <div className="font-semibold text-slate-800">{s.principal?.name || "Dr. Ramesh Patel"}</div>
          <div className="text-sm text-indigo-500 mt-0.5">{s.principal?.designation || `Principal, ${s.collegeName}`}</div>
        </div>
      </section>

      {/* Infrastructure with images */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">Facilities</span>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">World-Class Infrastructure</h2>
            <p className="text-slate-500">Facilities designed to support holistic development.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {infra.map(({ title, desc, img }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all group">
                <div className="overflow-hidden h-28">
                  <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-slate-800 mb-1 text-sm">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Affiliation bar */}
      <section className="py-12 px-6 bg-slate-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-2">{s.affiliation}</h3>
          <p className="text-slate-400 text-sm mb-6">Veer Narmad South Gujarat University — Recognized by UGC, Government of India</p>
          <Link
            to="/admissions/apply"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Apply for Admission <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
