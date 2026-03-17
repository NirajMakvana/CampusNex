import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Users, BookOpen, Award, Star, ChevronRight, Bell, ChevronLeft, MessageSquare, X, Clock, IndianRupee } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import axios from '../../api/axios';

const features = [
  { icon: GraduationCap, title: 'Smart Management', desc: 'Unified platform for all campus operations — attendance, exams, fees and more.' },
  { icon: BookOpen, title: 'Digital Learning', desc: 'Timetables, course materials, and results accessible anytime, anywhere.' },
  { icon: Users, title: 'Expert Faculty', desc: 'Experienced educators dedicated to student success and academic excellence.' },
  { icon: Award, title: 'Industry Connect', desc: 'Strong industry partnerships for internships, placements, and guest lectures.' },
];

// Fallback testimonials (used if API fails)
const fallbackTestimonials = [
  { name: 'Priya Shah', course: 'BCA 3rd Year', text: 'CampusNex made tracking my attendance and results so easy. The portal is super intuitive.', rating: 5, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face' },
  { name: 'Rahul Patel', course: 'BBA 2nd Year', text: 'The fee payment and hostel management features saved me so much time. Highly recommend.', rating: 5, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' },
  { name: 'Anjali Mehta', course: 'BSc IT 1st Year', text: 'Applying for admission was seamless. Got my application ID instantly and tracked everything online.', rating: 4, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face' },
];

// Static enrichment data per program — same as Courses page
const PROGRAM_META = {
  BCA: {
    full: 'Bachelor of Computer Applications',
    badge: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=280&fit=crop',
    subjects: ['Programming in C/C++', 'Data Structures', 'DBMS', 'Web Development', 'Python', 'Software Engineering'],
    careers: ['Software Developer', 'Web Developer', 'System Analyst', 'Database Admin'],
  },
  BBA: {
    full: 'Bachelor of Business Administration',
    badge: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=280&fit=crop',
    subjects: ['Business Management', 'Marketing', 'Finance', 'HR Management', 'Entrepreneurship', 'Business Law'],
    careers: ['Business Manager', 'Marketing Executive', 'HR Manager', 'Entrepreneur'],
  },
  'BSc IT': {
    full: 'Bachelor of Science in Information Technology',
    badge: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=280&fit=crop',
    subjects: ['Networking', 'Cloud Computing', 'Cybersecurity', 'Mobile App Dev', 'AI/ML Basics', 'IoT'],
    careers: ['Network Engineer', 'Cloud Architect', 'Security Analyst', 'App Developer'],
  },
};

export default function PublicHome() {
  const [stats, setStats] = useState({ students: 1200, faculty: 80, departments: 6, yearsEstablished: 15 });
  const [notices, setNotices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [allTestimonials, setAllTestimonials] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [expandedProgram, setExpandedProgram] = useState(null);
  const reviewsPerPage = 6;

  useEffect(() => {
    Promise.all([
      axios.get('/public/stats'),
      axios.get('/public/notices'),
      axios.get('/public/admission-settings'),
      axios.get('/website/public'),
      axios.get('/testimonials/public'),
      axios.get('/testimonials/public/all-testimonials')
    ]).then(([statsRes, noticesRes, admissionRes, websiteRes, testRes, allTestRes]) => {
      setStats(statsRes.data.data);
      setNotices(noticesRes.data.data || []);
      setSettings(admissionRes.data.data);
      setWebSettings(websiteRes.data.data);
      if (testRes.data.data?.length > 0) setTestimonials(testRes.data.data);
      setAllTestimonials(allTestRes.data.data || []);
    }).catch(() => {});

    // Fetch departments separately as it's for modal
    axios.get('/testimonials/public/departments')
      .then(r => setDepartments(r.data.data || []))
      .catch(() => {});
  }, []);

  const [webSettings, setWebSettings] = useState(null);
  const ws = webSettings || { collegeName: 'CampusNex', affiliation: 'VNSGU affiliated institution' };

  const lastDate = settings?.lastDateToApply
    ? new Date(settings.lastDateToApply).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'July 31, 2025';

  const programs = settings?.programs?.length
    ? settings.programs.map(p => {
        const meta = PROGRAM_META[p.name] || {
          full: p.name, badge: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
          img: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&h=280&fit=crop',
          subjects: [], careers: [],
        };
        return { ...meta, ...p, full: p.fullName || meta.full };
      })
    : [
        { name: 'BCA', duration: '3 Years', seats: 60, eligibilityPercent: 45, annualFees: 35000, ...PROGRAM_META.BCA },
        { name: 'BBA', duration: '3 Years', seats: 60, eligibilityPercent: 45, annualFees: 30000, ...PROGRAM_META.BBA },
        { name: 'BSc IT', duration: '3 Years', seats: 40, eligibilityPercent: 45, annualFees: 32000, ...PROGRAM_META['BSc IT'] },
      ];

  // Pagination logic
  const totalPages = Math.ceil(allTestimonials.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const currentReviews = allTestimonials.slice(startIndex, startIndex + reviewsPerPage);

  const handleViewAll = () => {
    setShowAllReviews(true);
    setCurrentPage(1);
    // Scroll to testimonials section
    setTimeout(() => {
      document.getElementById('testimonials-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <PublicLayout>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?w=1600&h=900&fit=crop"
          alt="Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark gradient overlay — left heavy so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/55 to-slate-900/20" />

        <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 py-24">
          <div className="max-w-2xl">
            {/* Admission status badge */}
            <span className={`inline-flex items-center gap-1.5 mb-5 px-3.5 py-1.5 text-xs font-semibold rounded-full border backdrop-blur-sm ${
              settings?.isOpen
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40'
                : 'bg-slate-500/20 text-slate-300 border-slate-400/40'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${settings?.isOpen ? 'bg-indigo-400' : 'bg-slate-400'}`} />
              {settings?.isOpen ? 'Admissions Open 2025–26' : 'Admissions 2025–26'}
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
              Shape Your Future<br />
              at <span className="text-indigo-400">{ws.collegeName}</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              {ws.affiliation} institution offering BCA, BBA, and BSc programs with world-class facilities and expert faculty.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to="/admissions/apply"
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/50 hover:shadow-indigo-900/70 hover:-translate-y-0.5"
              >
                Apply Now <ArrowRight size={16} />
              </Link>
              <Link
                to="/courses-info"
                className="px-6 py-3 border border-white/30 text-white font-medium rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm hover:-translate-y-0.5"
              >
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white py-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: `${stats.students}+`, label: 'Students Enrolled' },
            { value: `${stats.faculty}+`, label: 'Expert Faculty' },
            { value: `${stats.departments}`, label: 'Departments' },
            { value: `${stats.yearsEstablished}+`, label: 'Years of Excellence' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-extrabold">{value}</div>
              <div className="text-slate-400 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── OUR PROGRAMS ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">Programs</span>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Our Programs</h2>
            <p className="text-slate-500 max-w-md mx-auto">Industry-aligned undergraduate programs designed for the future.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {programs.map(c => (
              <div key={c.name} className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-indigo-300">
                {/* Card Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={c.img}
                    alt={c.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm backdrop-blur-md uppercase tracking-wider ${c.badge}`}>
                      {c.name}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-900 mb-3 line-clamp-2 leading-tight min-h-[2.5rem] text-sm">
                    {c.full}
                  </h3>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 mb-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="p-1.5 bg-slate-50 rounded-md text-indigo-500"><Clock size={13} /></div>
                      <span className="text-xs font-medium">{c.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="p-1.5 bg-slate-50 rounded-md text-indigo-500"><Users size={13} /></div>
                      <span className="text-xs font-medium">{c.seats} Seats</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="p-1.5 bg-slate-50 rounded-md text-indigo-500"><GraduationCap size={13} /></div>
                      <span className="text-xs font-medium">{c.eligibilityPercent || 45}% Eligibility</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="p-1.5 bg-slate-50 rounded-md text-indigo-500"><IndianRupee size={13} /></div>
                      <span className="text-xs font-bold text-indigo-600">₹{(c.annualFees || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="mt-auto space-y-2.5">
                    {/* Expand toggle */}
                    {c.subjects?.length > 0 && (
                      <button
                        onClick={() => setExpandedProgram(expandedProgram === c.name ? null : c.name)}
                        className="w-full py-2 px-3 flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                      >
                        <span>{expandedProgram === c.name ? 'Hide Details' : 'View Subjects & Careers'}</span>
                        <ChevronRight size={13} className={`transition-transform duration-300 ${expandedProgram === c.name ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
                      </button>
                    )}

                    {expandedProgram === c.name && (
                      <div className="space-y-3 pt-1">
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Key Subjects</h4>
                          <div className="flex flex-wrap gap-1">
                            {c.subjects.map(s => (
                              <span key={s} className="px-2 py-0.5 bg-indigo-50/50 text-indigo-600 text-[10px] font-medium rounded-md border border-indigo-100/50">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Careers</h4>
                          <div className="flex flex-wrap gap-1">
                            {c.careers.map(cr => (
                              <span key={cr} className="px-2 py-0.5 bg-emerald-50/50 text-emerald-600 text-[10px] font-medium rounded-md border border-emerald-100/50">{cr}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <Link
                      to="/admissions/apply"
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-[0.98]"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/courses-info" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors">
              View All Programs <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY CAMPUSNEX ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">Why Us</span>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Why Choose CampusNex?</h2>
            <p className="text-slate-500">We go beyond academics to prepare you for the real world.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300">
                <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={22} className="text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ADMISSION CTA BANNER ─────────────────────────────────────────── */}
      <section className="relative py-24 px-6 text-white text-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1400&h=500&fit=crop"
          alt="Admissions"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/80" />
        <div className="relative max-w-2xl mx-auto">
          {settings?.isOpen === true && (
            <span className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Applications Open Now
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            {settings?.isOpen === true ? 'Admissions Open for 2025–26' : 'Admissions Coming Soon'}
          </h2>
          <p className="text-indigo-200 mb-8 text-lg">
            {settings?.isOpen === true
              ? <>Last date to apply: <strong className="text-white">{lastDate}</strong>. Don't miss your chance.</>
              : 'Applications will open soon. Stay tuned for updates.'
            }
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            {settings?.isOpen === true && (
              <Link to="/admissions/apply" className="px-7 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
                Apply Now
              </Link>
            )}
            <Link to="/admissions/track" className="px-7 py-3 border border-white/40 text-white font-medium rounded-xl hover:bg-white/10 transition-colors">
              Track Application
            </Link>
            <Link to="/admissions" className="px-7 py-3 border border-white/40 text-white font-medium rounded-xl hover:bg-white/10 transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ── LATEST NOTICES ───────────────────────────────────────────────── */}
      {notices.length > 0 && (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">Updates</span>
              <h2 className="text-3xl font-bold text-slate-900">Latest News & Notices</h2>
            </div>
            <div className="space-y-3">
              {notices.map(n => (
                <div key={n._id} className="flex gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Bell size={14} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800">{n.title}</h4>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <span className="text-xs text-slate-400 mt-1 block">{new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section id="testimonials-section" className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">What Our Students Say</h2>
            <p className="text-slate-500 mb-6">Real experiences from our student community</p>
            
            {/* Submit Review Button */}
            <button
              onClick={() => setShowSubmitForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors mb-8"
            >
              <MessageSquare size={16} />
              Share Your Experience
            </button>
          </div>
          
          {/* Initial 3 Reviews */}
          {!showAllReviews && testimonials.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {testimonials.slice(0, 3).map(t => (
                  <TestimonialCard key={t._id || t.name} testimonial={t} />
                ))}
              </div>
              
              {/* View All Button */}
              <div className="text-center">
                <button
                  onClick={handleViewAll}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-indigo-200 text-indigo-600 font-medium rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  View All Reviews ({allTestimonials.length > 0 ? allTestimonials.length : 'Loading...'}) <ArrowRight size={14} />
                </button>
              </div>
            </>
          )}

          {/* All Reviews with Pagination */}
          {showAllReviews && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold text-slate-800">All Reviews ({allTestimonials.length})</h3>
                  <button
                    onClick={() => setShowAllReviews(false)}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Show Less
                  </button>
                </div>
                
                {/* Pagination Info */}
                {totalPages > 1 && (
                  <div className="text-sm text-slate-500">
                    Page {currentPage} of {totalPages}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {currentReviews.map(t => (
                  <TestimonialCard key={t._id} testimonial={t} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>
                  
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-medium ${
                          page === currentPage
                            ? 'bg-indigo-600 text-white'
                            : 'border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}

          {/* No Reviews State */}
          {testimonials.length === 0 && (
            <div className="text-center py-12">
              <Star size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No Reviews Yet</h3>
              <p className="text-slate-500 mb-6">Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </section>

      {/* Submit Review Modal */}
      {showSubmitForm && (
        <SubmitReviewModal
          onClose={() => setShowSubmitForm(false)}
        />
      )}

    </PublicLayout>
  );
}

// Testimonial Card Component
function TestimonialCard({ testimonial }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md hover:border-indigo-200 transition-all">
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={12} className={i < testimonial.rating ? 'text-indigo-400 fill-indigo-400' : 'text-slate-200 fill-slate-200'} />
        ))}
      </div>
      <p className="text-sm text-slate-600 mb-4 leading-relaxed italic line-clamp-3">"{testimonial.text}"</p>
      <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
        {testimonial.avatar ? (
          <img src={testimonial.avatar} alt={testimonial.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-100" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
            {testimonial.name[0]}
          </div>
        )}
        <div>
          <div className="font-semibold text-slate-800 text-sm">{testimonial.name}</div>
          <div className="text-xs text-indigo-500 mt-0.5">{testimonial.course}</div>
        </div>
      </div>
    </div>
  );
}

// Submit Review Modal Component
function SubmitReviewModal({ onClose }) {
  const [form, setForm] = useState({
    name: '', email: '', course: '', text: '', rating: 5
  });
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);

  const years = ['1st Year', '2nd Year', '3rd Year'];

  // Fetch departments when modal opens
  useEffect(() => {
    setDepartmentsLoading(true);
    axios.get('/testimonials/public/departments')
      .then(r => {
        console.log('Departments loaded:', r.data.data);
        setDepartments(r.data.data || []);
      })
      .catch(error => {
        console.error('Failed to load departments:', error);
        // Set fallback departments
        setDepartments([
          { code: 'BCA', name: 'Bachelor of Computer Applications' },
          { code: 'BBA', name: 'Bachelor of Business Administration' },
          { code: 'BSc IT', name: 'Bachelor of Science in Information Technology' },
          { code: 'BSc CS', name: 'Bachelor of Science in Computer Science' },
          { code: 'MCA', name: 'Master of Computer Applications' },
          { code: 'MBA', name: 'Master of Business Administration' }
        ]);
      })
      .finally(() => {
        setDepartmentsLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/testimonials/public/submit-review', form);
      console.log('Submit response:', response.data);
      alert('Review submitted successfully! It will be published after admin approval.');
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Share Your Experience</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Department & Year *</label>
            <div className="grid grid-cols-2 gap-3">
              <select
                required
                value={form.course.split(' ')[0] || ''}
                onChange={(e) => {
                  const year = form.course.split(' ').slice(1).join(' ') || '1st Year';
                  setForm({ ...form, course: `${e.target.value} ${year}` });
                }}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={departmentsLoading}
              >
                <option value="">
                  {departmentsLoading ? 'Loading Departments...' : 'Select Department'}
                </option>
                {departments.map(dept => (
                  <option key={dept.code} value={dept.code}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <select
                required
                value={form.course.split(' ').slice(1).join(' ') || ''}
                onChange={(e) => {
                  const course = form.course.split(' ')[0] || '';
                  setForm({ ...form, course: `${course} ${e.target.value}` });
                }}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setForm({ ...form, rating })}
                  className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Star
                    size={24}
                    className={rating <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-slate-600 self-center">
                {form.rating} star{form.rating !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Your Review *</label>
            <textarea
              required
              rows={4}
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Share your experience about the college, faculty, facilities..."
              maxLength={500}
            />
            <div className="text-right text-xs text-slate-400 mt-1">
              {form.text.length}/500 characters
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <MessageSquare size={16} />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-xs text-slate-500 text-center mt-4">
          Your review will be published after admin approval.
        </p>
      </div>
    </div>
  );
}
