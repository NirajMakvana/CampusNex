import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, IndianRupee, GraduationCap, ChevronRight } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import axios from '../../api/axios';

// Static enrichment data per program name
const PROGRAM_META = {
  BCA: {
    full: 'Bachelor of Computer Applications', stream: 'Science',
    color: 'border-slate-200 hover:border-indigo-300', badge: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=280&fit=crop',
    subjects: ['Programming in C/C++', 'Data Structures', 'DBMS', 'Web Development', 'Python', 'Software Engineering'],
    careers: ['Software Developer', 'Web Developer', 'System Analyst', 'Database Admin'],
  },
  BBA: {
    full: 'Bachelor of Business Administration', stream: 'Commerce',
    color: 'border-slate-200 hover:border-indigo-300', badge: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=280&fit=crop',
    subjects: ['Business Management', 'Marketing', 'Finance', 'HR Management', 'Entrepreneurship', 'Business Law'],
    careers: ['Business Manager', 'Marketing Executive', 'HR Manager', 'Entrepreneur'],
  },
  'BSc IT': {
    full: 'Bachelor of Science in Information Technology', stream: 'Science',
    color: 'border-slate-200 hover:border-indigo-300', badge: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
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
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get programs from new API first, fallback to admission settings
    axios.get('/public/programs')
      .then(r => {
        console.log('Programs API response:', r.data);
        setPrograms(r.data.data || []);
      })
      .catch(() => {
        // Fallback to admission settings
        axios.get('/public/admission-settings')
          .then(r => {
            if (r.data.data?.programs?.length) {
              setPrograms(r.data.data.programs);
            } else {
              setPrograms(DEFAULT_PROGRAMS);
            }
          })
          .catch(() => {
            setPrograms(DEFAULT_PROGRAMS);
          });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Merge dynamic data with static meta
  const enriched = programs.map(p => {
    const meta = PROGRAM_META[p.name] || {
      full: p.fullName || p.name, 
      stream: 'Other',
      color: 'border-slate-200', 
      badge: 'bg-slate-100 text-slate-700',
      img: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&h=280&fit=crop',
      subjects: [], 
      careers: [],
    };
    
    return {
      ...p,
      full: p.fullName || meta.full, // Use API fullName if available
      ...meta,
    };
  });

  const filtered = activeStream === 'All' ? enriched : enriched.filter(p => p.stream === activeStream);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-28 flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1400&h=400&fit=crop"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500">Loading programs...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <GraduationCap size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No Programs Found</h3>
                <p className="text-slate-500">No programs match the selected stream.</p>
              </div>
            ) : (
              filtered.map(p => (
                <div key={p.name} className={`flex flex-col rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${p.color}`}>
                  {/* Card Image */}
                  <div className="relative h-44 overflow-hidden">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm backdrop-blur-md uppercase tracking-wider ${p.badge}`}>
                        {p.name}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-slate-900 mb-3 line-clamp-2 leading-tight min-h-[2.5rem]">
                      {p.full}
                    </h3>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <div className="p-1.5 bg-slate-50 rounded-md text-indigo-500">
                          <Clock size={14} />
                        </div>
                        <span className="text-xs font-medium">{p.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <div className="p-1.5 bg-slate-50 rounded-md text-indigo-500">
                          <Users size={14} />
                        </div>
                        <span className="text-xs font-medium">{p.seats} Seats</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <div className="p-1.5 bg-slate-50 rounded-md text-indigo-500">
                          <GraduationCap size={14} />
                        </div>
                        <span className="text-xs font-medium">{p.eligibilityPercent}% Eligibility</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <div className="p-1.5 bg-slate-50 rounded-md text-indigo-500">
                          <IndianRupee size={14} />
                        </div>
                        <span className="text-xs font-bold text-indigo-600">₹{p.annualFees?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="mt-auto space-y-3">
                      {/* Expansion Toggle */}
                      {p.subjects?.length > 0 && (
                        <button 
                          onClick={() => setExpanded(expanded === p.name ? null : p.name)}
                          className="w-full py-2 px-4 flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                        >
                          <span>{expanded === p.name ? 'Hide Details' : 'View Subjects & Careers'}</span>
                          <ChevronRight size={14} className={`transition-transform duration-300 ${expanded === p.name ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
                        </button>
                      )}

                      {expanded === p.name && (
                        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Key Subjects</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {p.subjects.map(s => (
                                <span key={s} className="px-2 py-0.5 bg-indigo-50/50 text-indigo-600 text-[10px] font-medium rounded-md border border-indigo-100/50">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Careers</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {p.careers.map(c => (
                                <span key={c} className="px-2 py-0.5 bg-emerald-50/50 text-emerald-600 text-[10px] font-medium rounded-md border border-emerald-100/50">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <Link 
                        to="/admissions/apply" 
                        className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-[0.98]"
                      >
                        Apply Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-slate-900 text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-3">Ready to Start Your Journey?</h2>
          <p className="text-slate-400 mb-6">Apply now and take the first step towards a successful career.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/admissions/apply" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
              Apply Now <ChevronRight size={16} />
            </Link>
            <Link to="/admissions" className="px-6 py-3 border border-slate-600 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors">
              Admission Info
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
