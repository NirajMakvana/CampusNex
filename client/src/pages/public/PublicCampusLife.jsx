import { Library, FlaskConical, Home, Trophy, Music, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/public/PublicLayout';

const sections = [
  {
    icon: Library, title: 'Central Library',
    img: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=200&fit=crop',
    points: ['10,000+ books and journals', 'Digital library access', 'Separate reading rooms', 'Open 8 AM – 8 PM on weekdays'],
  },
  {
    icon: FlaskConical, title: 'Computer Labs',
    img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=200&fit=crop',
    points: ['200+ computers with latest specs', 'High-speed internet (1 Gbps)', 'Licensed software suite', 'Open lab hours for projects'],
  },
  {
    icon: Home, title: 'Hostel',
    img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=200&fit=crop',
    points: ['Separate boys & girls hostels', '24/7 security & CCTV', 'Mess with nutritious meals', 'Wi-Fi enabled rooms'],
  },
  {
    icon: Trophy, title: 'Sports',
    img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=200&fit=crop',
    points: ['Cricket ground', 'Basketball & volleyball courts', 'Indoor games room', 'Annual sports meet'],
  },
  {
    icon: Music, title: 'Cultural Activities',
    img: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=200&fit=crop',
    points: ['Annual cultural fest', 'Music & dance clubs', 'Drama & theatre group', 'Photography club'],
  },
  {
    icon: Users, title: 'Student Clubs',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=200&fit=crop',
    points: ['Coding & tech club', 'Entrepreneurship cell', 'NSS & social service', 'Student council'],
  },
];

const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=400&fit=crop', alt: 'Campus building' },
  { src: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=400&fit=crop', alt: 'Graduation' },
  { src: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=400&fit=crop', alt: 'College' },
  { src: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop', alt: 'Computer lab' },
  { src: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=400&fit=crop', alt: 'Library' },
  { src: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop', alt: 'Sports' },
  { src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=400&fit=crop', alt: 'Students' },
  { src: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop', alt: 'Cultural fest' },
];

export default function PublicCampusLife() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-28 px-6 text-center">
        <img
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&h=500&fit=crop"
          alt="Campus life"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/70" />
        <div className="relative max-w-2xl mx-auto">
          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-white/20 text-white border border-white/30 rounded-full uppercase tracking-wide backdrop-blur-sm">Life at CampusNex</span>
          <h1 className="text-4xl font-extrabold text-white mb-3">Campus Life</h1>
          <p className="text-slate-300 text-lg">Beyond academics — a vibrant community that shapes well-rounded individuals.</p>
        </div>
      </section>

      {/* Sections — uniform indigo theme */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">Facilities & Activities</span>
            <h2 className="text-2xl font-bold text-slate-900">Everything You Need</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map(({ icon: Icon, title, img, points }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-300 group">
                <div className="overflow-hidden h-32">
                  <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mb-2">
                    <Icon size={16} className="text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2 text-sm">{title}</h3>
                  <ul className="space-y-1">
                    {points.map(p => (
                      <li key={p} className="text-xs text-slate-500 flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">Gallery</span>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Campus Gallery</h2>
            <p className="text-slate-500">A glimpse of life at CampusNex.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {galleryImages.map(({ src, alt }) => (
              <div key={alt} className="aspect-square rounded-xl overflow-hidden group cursor-pointer">
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-slate-900 text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-3">Be Part of Our Community</h2>
          <p className="text-slate-400 mb-6">Join CampusNex and experience a campus life that goes beyond the classroom.</p>
          <Link
            to="/admissions/apply"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Apply Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
