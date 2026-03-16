import { Library, FlaskConical, Home, Trophy, Music, Users } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';

const sections = [
  {
    icon: Library, title: 'Central Library', color: 'bg-blue-50 border-blue-200',
    iconColor: 'bg-blue-100 text-blue-600',
    img: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=200&fit=crop',
    points: ['10,000+ books and journals', 'Digital library access', 'Separate reading rooms', 'Open 8 AM – 8 PM on weekdays'],
  },
  {
    icon: FlaskConical, title: 'Computer Labs', color: 'bg-purple-50 border-purple-200',
    iconColor: 'bg-purple-100 text-purple-600',
    img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=200&fit=crop',
    points: ['200+ computers with latest specs', 'High-speed internet (1 Gbps)', 'Licensed software suite', 'Open lab hours for projects'],
  },
  {
    icon: Home, title: 'Hostel', color: 'bg-emerald-50 border-emerald-200',
    iconColor: 'bg-emerald-100 text-emerald-600',
    img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=200&fit=crop',
    points: ['Separate boys & girls hostels', '24/7 security & CCTV', 'Mess with nutritious meals', 'Wi-Fi enabled rooms'],
  },
  {
    icon: Trophy, title: 'Sports', color: 'bg-amber-50 border-amber-200',
    iconColor: 'bg-amber-100 text-amber-600',
    img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=200&fit=crop',
    points: ['Cricket ground', 'Basketball & volleyball courts', 'Indoor games room', 'Annual sports meet'],
  },
  {
    icon: Music, title: 'Cultural Activities', color: 'bg-pink-50 border-pink-200',
    iconColor: 'bg-pink-100 text-pink-600',
    img: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=200&fit=crop',
    points: ['Annual cultural fest', 'Music & dance clubs', 'Drama & theatre group', 'Photography club'],
  },
  {
    icon: Users, title: 'Student Clubs', color: 'bg-indigo-50 border-indigo-200',
    iconColor: 'bg-indigo-100 text-indigo-600',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=200&fit=crop',
    points: ['Coding & tech club', 'Entrepreneurship cell', 'NSS & social service', 'Student council'],
  },
];

const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=400&fit=crop', alt: 'Campus building' },
  { src: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=400&fit=crop', alt: 'Graduation' },
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
      {/* Hero with image */}
      <section className="relative overflow-hidden h-72 flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&h=500&fit=crop"
          alt="Campus life"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/60" />
        <div className="relative text-center px-6">
          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-white/20 text-white border border-white/30 rounded-full uppercase tracking-wide backdrop-blur-sm">Life at CampusNex</span>
          <h1 className="text-4xl font-extrabold text-white mb-3">Campus Life</h1>
          <p className="text-slate-200 text-lg">Beyond academics — a vibrant community that shapes well-rounded individuals.</p>
        </div>
      </section>

      {/* Sections with images */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map(({ icon: Icon, title, color, iconColor, img, points }) => (
            <div key={title} className={`rounded-xl border overflow-hidden ${color}`}>
              <img src={img} alt={title} className="w-full h-40 object-cover" />
              <div className="p-5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${iconColor}`}>
                  <Icon size={18} />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                <ul className="space-y-1.5">
                  {points.map(p => (
                    <li key={p} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />{p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery — real images */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
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
    </PublicLayout>
  );
}
