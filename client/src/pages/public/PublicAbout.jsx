import { GraduationCap, Target, Eye, Library, FlaskConical, Home, Trophy } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';

const infra = [
  { icon: Library, title: 'Central Library', desc: '10,000+ books, digital resources, and reading rooms.' },
  { icon: FlaskConical, title: 'Modern Labs', desc: 'Computer labs with latest hardware and software.' },
  { icon: Home, title: 'Hostel', desc: 'Separate hostels for boys and girls with all amenities.' },
  { icon: Trophy, title: 'Sports Complex', desc: 'Cricket ground, basketball court, indoor games.' },
];

export default function PublicAbout() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 to-white py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full uppercase tracking-wide">About Us</span>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Our Story</h1>
          <p className="text-slate-500 text-lg">Established in 2010, CampusNex College has been a beacon of quality education in Gujarat.</p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">15+ Years of Excellence</h2>
            <p className="text-slate-500 leading-relaxed mb-4">
              Founded in 2010, CampusNex College is affiliated to Veer Narmad South Gujarat University (VNSGU), Surat. We have been consistently producing graduates who excel in industry and academia.
            </p>
            <p className="text-slate-500 leading-relaxed">
              With state-of-the-art infrastructure, experienced faculty, and a student-first approach, we provide an environment where learning meets innovation.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '1200+', label: 'Students' },
              { value: '80+', label: 'Faculty' },
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

      {/* Principal Message */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} className="text-indigo-600" />
          </div>
          <blockquote className="text-lg text-slate-600 italic leading-relaxed mb-4">
            "Education is not just about acquiring knowledge — it's about developing the character, skills, and mindset to make a difference in the world. At CampusNex, we are committed to that journey with every student."
          </blockquote>
          <div className="font-semibold text-slate-800">Dr. Ramesh Patel</div>
          <div className="text-sm text-slate-400">Principal, CampusNex College</div>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">World-Class Infrastructure</h2>
            <p className="text-slate-500">Facilities designed to support holistic development.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {infra.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl border border-slate-200 p-5 text-center hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon size={22} className="text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
                <p className="text-xs text-slate-500">{desc}</p>
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
