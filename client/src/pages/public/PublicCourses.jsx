import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, IndianRupee, GraduationCap, ChevronRight } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import axios from '../../api/axios';

// Static enrichment data per program name
const PROGRAM_META = {
  BCA: {
    full: 'Bachelor of Computer Applications', stream: 'Science',
    color: 'border-blue-200', badge: 'bg-blue-100 text-blue-700',
    img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=280&fit=crop',
    subjects: ['Programming in C/C++', 'Data Structures', 'DBMS', 'Web Development', 'Python', 'Software Engineering'],
    careers: ['Software Developer', 'Web Developer', 'System Analyst', 'Database Admin'],
  },
  BBA: {
    full: 'Bachelor of Business Administration', stream: 'Commerce',
    color: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700',
    img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=280&fit=crop',
    subjects: ['Business Management', 'Marketing', 'Finance', 'HR Management', 'Entrepreneurship', 'Business Law'],
    careers: ['Business Manager', 'Marketing Executive', 'HR Manager', 'Entrepreneur'],
  },
  'BSc IT': {
    full: 'Bachelor of Science in Information Technology', stream: 'Science',
    color: 'border-purple-200', badge: 'bg-purple-100 text-purple-700',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=280&fit=crop',
    subjects: ['Networking', 'Cloud Computing', 'Cybersecurity', 'Mobile App Dev', 'AI/ML Basics', 'IoT'],
    careers: ['Network Engineer', 'Cloud Architect', 'Security Analyst', 'App Developer'],
  },
};

const DEFAULT_PROGRAMS = [
  { name: 'BCA', seats: 60, eligibilityPercent: 45, annualFees: 35000, duration: '3 Years' },
  { name: 'BBA', seats: 60, eligibilityPercent: 45, annualFees: 30000, duration: '3 Years' },
  { name: 'BSc IT', seats: 40, eligibilityPercent: 45, annualFees: 32000, duration: '3 Years' },
];

const streams = ['All', 'Science', 'Commerce', 'Arts'];

export default function PublicCourses() {
  const [activeStream, setActiveStream] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [programs, setPrograms] = useState(DEFAULT_PROGRAMS);

  useEffect(() => {
    axios.get('/api/public/admission-settings')
      .then(r => {
        if (r.data.data?.programs?.length) setPrograms(r.data.data.programs);
      })
      .catch(() => {});
  }, []);

  // Merge dynamic data with static meta
  const enriched = programs.map(p => ({
    ...p,
    ...(PROGRAM_META[p.name] || {
      full: p.name, stream: 'Other',
      color: 'border-slate-200', badge: 'bg-slate-100 text-slate-700',
      img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=280&fit=crop',
      subjects: [], careers: [],
    }),
  }));

  const filtered = activeStream === 'All' ? enriched : enriched.filter(p => p.stream === activeStream);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden h-64 flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&h=400&fit=crop"
          alt="Courses"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/60" />
        <div className="relative text-center px-6">
          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-white/20 text-white border border-white/30 rounded-full uppercase tracking-wide backdrop-blur-sm">Programs</span>
          <h1 className="text-4xl font-extrabold text-white mb-2">Our Courses</h1>
          <p className="text-slate-200">Industry-aligned undergraduate programs to kickstart your career.</p>
        </div>
      </section>

      <section className="py-10 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          {/* Stream filter */}
          <div className="flex gap-2 flex-wrap mb-8">
            {streams.map(s => (
              <button key={s} onClick={() => setActiveStream(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  activeStream === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}>
                {s}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {filtered.map(p => (
              <div key={p.name} className={`rounded-xl border overflow-hidden ${p.color}`}>
                <img src={p.img} alt={p.name} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.badge}`}>{p.name}</span>
                        <h3 className="font-semibold text-slate-800">{p.full}</h3>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Clock size={13} /> {p.duration}</span>
                        <span className="flex items-center gap-1"><Users size={13} /> {p.seats} Seats</span>
                        <span className="flex items-center gap-1"><GraduationCap size={13} /> 12th with {p.eligibilityPercent}%</span>
                        <span className="flex items-center gap-1"><IndianRupee size={13} /> ₹{p.annualFees?.toLocaleString('en-IN')}/year</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setExpanded(expanded === p.name ? null : p.name)}
                        className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                        {expanded === p.name ? 'Less' : 'Know More'}
                        <ChevronRight size={14} className={`transition-transform ${expanded === p.name ? 'rotate-90' : ''}`} />
                      </button>
                      <Link to="/admissions/apply" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                        Apply
                      </Link>
                    </div>
                  </div>

                  {expanded === p.name && p.subjects?.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Key Subjects</h4>
                        <ul className="space-y-1">
                          {p.subjects.map(s => (
                            <li key={s} className="text-sm text-slate-600 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Career Options</h4>
                        <ul className="space-y-1">
                          {p.careers.map(c => (
                            <li key={c} className="text-sm text-slate-600 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />{c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
