import { Library, FlaskConical, Home, Trophy, Music, Users } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';

const sections = [
  {
    icon: Library, title: 'Central Library', color: 'bg-blue-50 border-blue-200',
    iconColor: 'bg-blue-100 text-blue-600',
    points: ['10,000+ books and journals', 'Digital library access', 'Separate reading rooms', 'Open 8 AM – 8 PM on weekdays'],
  },
  {
    icon: FlaskConical, title: 'Computer Labs', color: 'bg-purple-50 border-purple-200',
    iconColor: 'bg-purple-100 text-purple-600',
    points: ['200+ computers with latest specs', 'High-speed internet (1 Gbps)', 'Licensed software suite', 'Open lab hours for projects'],
  },
  {
    icon: Home, title: 'Hostel', color: 'bg-emerald-50 border-emerald-200',
    iconColor: 'bg-emerald-100 text-emerald-600',
    points: ['Separate boys & girls hostels', '24/7 security & CCTV', 'Mess with nutritious meals', 'Wi-Fi enabled rooms'],
  },
  {
    icon: Trophy, title: 'Sports', color: 'bg-amber-50 border-amber-200',
    iconColor: 'bg-amber-100 text-amber-600',
    points: ['Cricket ground', 'Basketball & volleyball courts', 'Indoor games room', 'Annual sports meet'],
  },
  {
    icon: Music, title: 'Cultural Activities', color: 'bg-pink-50 border-pink-200',
    iconColor: 'bg-pink-100 text-pink-600',
    points: ['Annual cultural fest', 'Music & dance clubs', 'Drama & theatre group', 'Photography club'],
  },
  {
    icon: Users, title: 'Student Clubs', color: 'bg-indigo-50 border-indigo-200',
    iconColor: 'bg-indigo-100 text-indigo-600',
    points: ['Coding & tech club', 'Entrepreneurship cell', 'NSS & social service', 'Student council'],
  },
];

export default function PublicCampusLife() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 to-white py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full uppercase tracking-wide">Life at CampusNex</span>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Campus Life</h1>
          <p className="text-slate-500 text-lg">Beyond academics — a vibrant community that shapes well-rounded individuals.</p>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map(({ icon: Icon, title, color, iconColor, points }) => (
            <div key={title} className={`rounded-xl border p-6 ${color}`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconColor}`}>
                <Icon size={22} />
              </div>
              <h3 className="font-semibold text-slate-800 mb-3">{title}</h3>
              <ul className="space-y-1.5">
                {points.map(p => (
                  <li key={p} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />{p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery placeholder */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Campus Gallery</h2>
          <p className="text-slate-500 mb-8">A glimpse of life at CampusNex.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`aspect-square rounded-xl ${['bg-indigo-100', 'bg-emerald-100', 'bg-amber-100', 'bg-purple-100', 'bg-blue-100', 'bg-pink-100', 'bg-teal-100', 'bg-orange-100'][i]} flex items-center justify-center text-slate-400 text-xs`}>
                Photo {i + 1}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
