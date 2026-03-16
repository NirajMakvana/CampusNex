import { useEffect, useState } from 'react';
import { Search, GraduationCap } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import axios from '../../api/axios';

export default function PublicFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeDept, setActiveDept] = useState('All');

  useEffect(() => {
    axios.get('/api/public/faculty')
      .then(r => setFaculty(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const depts = ['All', ...new Set(faculty.map(f => f.department?.name).filter(Boolean))];
  const filtered = faculty.filter(f => {
    const matchDept = activeDept === 'All' || f.department?.name === activeDept;
    const matchSearch = !search || f.userId?.name?.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 to-white py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full uppercase tracking-wide">Our Team</span>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Expert Faculty</h1>
          <p className="text-slate-500 text-lg">Experienced educators dedicated to your academic success.</p>
        </div>
      </section>

      <section className="py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {depts.map(d => (
                <button
                  key={d}
                  onClick={() => setActiveDept(d)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    activeDept === d ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search faculty..."
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 w-52"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400">Loading faculty...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">No faculty found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(f => (
                <div key={f._id} className="bg-white rounded-xl border border-slate-200 p-5 text-center hover:shadow-md hover:border-indigo-200 transition-all">
                  {f.userId?.avatar ? (
                    <img src={f.userId.avatar} alt={f.userId.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-3" />
                  ) : (
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <GraduationCap size={24} className="text-indigo-600" />
                    </div>
                  )}
                  <h3 className="font-semibold text-slate-800 text-sm">{f.userId?.name}</h3>
                  <p className="text-xs text-indigo-600 mt-0.5">{f.designation || 'Faculty'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{f.department?.name}</p>
                  {f.qualification && <p className="text-xs text-slate-500 mt-1">{f.qualification}</p>}
                  {f.experience && <p className="text-xs text-slate-400 mt-0.5">{f.experience} yrs exp</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
