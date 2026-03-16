import { useEffect, useState } from 'react';
import { Target, Eye, Library, FlaskConical, Home, Trophy } from 'lucide-react';
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

  useEffect(() => {
    axios.get('/api/public/stats').then(r => setStats(r.data.data)).catch(() => {});
  }, []);

  return (
    <PublicLayout>
      {/* Hero with real image */}
      <section className="relative overflow-hidden h-72 sm:h-96 flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1400&h=600&fit=crop"
          alt="College campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/60" />
        <div className="relative text-center px-6">
          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-white/20 text-white border border-white/30 rounded-full uppercase tracking-wide backdrop-blur-sm">About Us</span>
          <h1 className="text-4xl font-extrabold text-white mb-3">Our Story</h1>
          <p className="text-slate-200 text-lg max-w-xl mx-auto">Established in 2010, CampusNex College has been a beacon of quality education in Gujarat.</p>
        </div>
      </section>

      {/* Story — dynamic stats */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{stats.yearsEstablished}+ Years of Excellence</h2>
            <p className="text-slate-500 leading-relaxed mb-4">
              Founded in 2010, CampusNex College is affiliated to Veer Narmad South Gujarat University (VNSGU), Surat. We have been consistently producing graduates who excel in industry and academia.
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
              { value: '2010', label: 'Established' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-indigo-50 rounded-xl p-5 text-center">
                <div className="text-2xl font-extrabold text-indigo-600">{value}</div>
                <div className="text-sm text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
              <Eye size={20} className="text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Our Vision</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              To be a premier institution that nurtures innovative thinkers, ethical leaders, and skilled professionals who contribute meaningfully to society.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
              <Target size={20} className="text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Our Mission</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              To provide quality education through innovative teaching, research, and industry collaboration, empowering students to achieve their full potential.
            </p>
          </div>
        </div>
      </section>

      {/* Principal Message with real photo */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <img
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=120&fit=crop&crop=face"
            alt="Principal"
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-indigo-100"
          />
          <blockquote className="text-lg text-slate-600 italic leading-relaxed mb-4">
            "Education is not just about acquiring knowledge — it's about developing the character, skills, and mindset to make a difference in the world. At CampusNex, we are committed to that journey with every student."
          </blockquote>
          <div className="font-semibold text-slate-800">Dr. Ramesh Patel</div>
          <div className="text-sm text-slate-400">Principal, CampusNex College</div>
        </div>
      </section>

      {/* Infrastructure with images */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">World-Class Infrastructure</h2>
            <p className="text-slate-500">Facilities designed to support holistic development.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {infra.map(({ title, desc, img }) => (
              <div key={title} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all">
                <img src={img} alt={title} className="w-full h-36 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Affiliation */}
      <section className="py-12 px-6 bg-indigo-600 text-white text-center">
        <div className="max-w-xl mx-auto">
          <h3 className="text-xl font-bold mb-2">Affiliated to VNSGU, Surat</h3>
          <p className="text-indigo-200 text-sm">Veer Narmad South Gujarat University — Recognized by UGC, Government of India</p>
        </div>
      </section>
    </PublicLayout>
  );
}
