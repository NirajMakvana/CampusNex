import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, IndianRupee, GraduationCap, ChevronRight } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';

const programs = [
  {
    name: 'BCA', full: 'Bachelor of Computer Applications', stream: 'Science',
    duration: '3 Years (6 Semesters)', seats: 60, eligibility: '12th with 45%',
    fees: '₹35,000/year', color: 'border-blue-200 bg-blue-50', badge: 'bg-blue-100 text-blue-700',
    subjects: ['Programming in C/C++', 'Data Structures', 'DBMS', 'Web Development', 'Python', 'Software Engineering'],
    careers: ['Software Developer', 'Web Developer', 'System Analyst', 'Database Admin'],
  },
  {
    name: 'BBA', full: 'Bachelor of Business Administration', stream: 'Commerce',
    duration: '3 Years (6 Semesters)', seats: 60, eligibility: '12th with 45%',
    fees: '₹30,000/year', color: 'border-emerald-200 bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700',
    subjects: ['Business Management', 'Marketing', 'Finance', 'HR Management', 'Entrepreneurship', 'Business Law'],
    careers: ['Business Manager', 'Marketing Executive', 'HR Manager', 'Entrepreneur'],
  },
  {
    name: 'BSc IT', full: 'Bachelor of Science in Information Technology', stream: 'Science',
    duration: '3 Years (6 Semesters)', seats: 40, eligibility: '12th Science with 45%',
    fees: '₹32,000/year', color: 'border-purple-200 bg-purple-50', badge: 'bg-purple-100 text-purple-700',
    subjects: ['Networking', 'Cloud Computing', 'Cybersecurity', 'Mobile App Dev', 'AI/ML Basics', 'IoT'],
    careers: ['Network Engineer', 'Cloud Architect', 'Security Analyst', 'App Developer'],
  },
];

const streams = ['All', 'Science', 'Commerce', 'Arts'];

export default function PublicCourses() {
  const [activeStream, setActiveStream] = useState('All');
  const [expanded, setExpanded] = useState(null);

  const filtered = activeStream === 'All' ? programs : programs.filter(p => p.stream === activeStream);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 to-white py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full uppercase tracking-wide">Programs</span>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Our Courses</h1>
          <p className="text-slate-500 text-lg">Industry-aligned undergraduate programs to kickstart your career.</p>
        </div>
      </section>

      {/* Filter */}
      <section className="py-10 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-2 flex-wrap mb-8">
            {streams.map(s => (
              <button
                key={s}
                onClick={() => setActiveStream(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  activeStream === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="space-y-5">
            {filtered.map(p => (
              <div key={p.name} className={`rounded-xl border p-6 ${p.color}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.badge}`}>{p.name}</span>
                      <h3 className="font-semibold text-slate-800">{p.full}</h3>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={13} /> {p.duration}</span>
                      <span className="flex items-center gap-1"><Users size={13} /> {p.seats} Seats</span>
                      <span className="flex items-center gap-1"><GraduationCap size={13} /> {p.eligibility}</span>
                      <span className="flex items-center gap-1"><IndianRupee size={13} /> {p.fees}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExpanded(expanded === p.name ? null : p.name)}
                      className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      {expanded === p.name ? 'Less' : 'Know More'} <ChevronRight size={14} className={`transition-transform ${expanded === p.name ? 'rotate-90' : ''}`} />
                    </button>
                    <Link to="/admissions/apply" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                      Apply
                    </Link>
                  </div>
                </div>

                {expanded === p.name && (
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
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
