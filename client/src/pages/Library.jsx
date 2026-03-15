import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Search, Plus, BookOpen, RotateCcw, X, BarChart2, Clock, AlertTriangle, BookMarked, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function Library() {
  const { user } = useAuth();
  const isAdmin = ['admin', 'superadmin'].includes(user?.role);
  const [tab, setTab] = useState(isAdmin ? 'Overview' : 'Books');
  const tabs = isAdmin ? ['Overview', 'Books', 'Issue / Return', 'Reservations'] : ['Books', 'My Books'];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Library</h1>
        <p className="text-sm text-slate-500">Book catalog and issue management</p>
      </div>
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'Overview' && <OverviewTab />}
      {tab === 'Books' && <BooksTab isAdmin={isAdmin} />}
      {tab === 'Issue / Return' && <IssueReturnTab />}
      {tab === 'Reservations' && <ReservationsTab />}
      {tab === 'My Books' && <MyBooksTab />}
    </div>
  );
}

// ─── Overview / Dashboard ─────────────────────────────────────────────────────
const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#14b8a6', '#8b5cf6'];

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value ?? '—'}</p>
      </div>
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/library/stats')
      .then(r => setStats(r.data.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-slate-400">Loading...</div>;
  if (!stats) return null;

  const utilizationData = [
    { name: 'Issued', value: stats.issuedCount },
    { name: 'Available', value: stats.availableCopies },
    { name: 'Overdue', value: stats.overdueCount },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen}    label="Total Books"      value={stats.totalBooks}      color="bg-indigo-500" />
        <StatCard icon={BookMarked}  label="Currently Issued" value={stats.issuedCount}     color="bg-blue-500" />
        <StatCard icon={AlertTriangle} label="Overdue"        value={stats.overdueCount}    color="bg-red-500" />
        <StatCard icon={Clock}       label="Reservations"     value={stats.reservations}    color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Breakdown Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-indigo-500" /> Books by Category
          </h3>
          {stats.categoryBreakdown.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.categoryBreakdown} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Utilization Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Copy Utilization</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={utilizationData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="value" paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}>
                {utilizationData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Issues */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Recent Active Issues</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Book', 'Student', 'Issue Date', 'Due Date', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stats.recentIssues.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-slate-400">No active issues</td></tr>
            ) : stats.recentIssues.map(issue => (
              <tr key={issue._id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{issue.book?.title}</p>
                  <p className="text-xs text-slate-400">{issue.book?.author}</p>
                </td>
                <td className="px-4 py-3 text-slate-700">{issue.student?.userId?.name}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(issue.issueDate).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3 text-xs">
                  <span className={new Date(issue.dueDate) < new Date() ? 'text-red-500 font-medium' : 'text-slate-500'}>
                    {new Date(issue.dueDate).toLocaleDateString('en-IN')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    issue.status === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'
                  }`}>{issue.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Books Catalog ────────────────────────────────────────────────────────────
function BooksTab({ isAdmin }) {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availFilter, setAvailFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', category: '', publisher: '', totalCopies: 1 });
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchBooks();
    if (!isAdmin) {
      api.get('/students/me').then(r => setStudents([r.data.data].filter(Boolean))).catch(() => {});
    }
  }, []);

  const fetchBooks = async (q = '') => {
    try {
      const res = await api.get('/library/books', { params: q ? { search: q } : {} });
      setBooks(res.data.data || []);
    } catch { toast.error('Failed to load books'); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    clearTimeout(window._libSearch);
    window._libSearch = setTimeout(() => fetchBooks(e.target.value), 400);
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/library/books', { ...form, availableCopies: form.totalCopies });
      setBooks(prev => [res.data.data, ...prev]);
      toast.success('Book added');
      setShowForm(false);
      setForm({ title: '', author: '', isbn: '', category: '', publisher: '', totalCopies: 1 });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleReserve = async (bookId) => {
    const myProfile = students[0];
    if (!myProfile) { toast.error('Student profile not found'); return; }
    try {
      await api.post('/library/reserve', { bookId, studentId: myProfile._id });
      toast.success('Book reserved successfully');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  // Derived KPIs
  const totalCopies = books.reduce((s, b) => s + (b.totalCopies || 0), 0);
  const availCopies = books.reduce((s, b) => s + (b.availableCopies || 0), 0);
  const issuedCopies = totalCopies - availCopies;
  const categories = [...new Set(books.map(b => b.category).filter(Boolean))];

  const filtered = books.filter(b => {
    const matchCat = !categoryFilter || b.category === categoryFilter;
    const matchAvail = availFilter === 'all' || (availFilter === 'available' ? b.availableCopies > 0 : b.availableCopies === 0);
    return matchCat && matchAvail;
  });

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      {!loading && books.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Books', value: books.length, sub: `${totalCopies} copies`, icon: BookOpen, color: 'bg-indigo-500' },
            { label: 'Available', value: availCopies, sub: 'copies ready to issue', icon: CheckCircle, color: 'bg-green-500' },
            { label: 'Issued', value: issuedCopies, sub: 'copies out', icon: BookMarked, color: 'bg-blue-500' },
            { label: 'Categories', value: categories.length, sub: 'unique genres', icon: BarChart2, color: 'bg-purple-500' },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                <Icon size={17} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-xl font-bold text-slate-800">{value}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by title, author or ISBN..." value={search} onChange={handleSearch}
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={availFilter} onChange={e => setAvailFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="unavailable">Not Available</option>
        </select>
        {(categoryFilter || availFilter !== 'all') && (
          <button onClick={() => { setCategoryFilter(''); setAvailFilter('all'); }}
            className="px-3 py-2 text-sm text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50">Clear</button>
        )}
        {isAdmin && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium ml-auto">
            <Plus size={16} /> Add Book
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-3 bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">
              <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
              <p>No books found</p>
            </div>
          ) : filtered.map(book => (
            <div key={book._id} className="bg-white rounded-xl border border-slate-200 p-5 flex gap-4">
              {book.coverImage
                ? <img src={book.coverImage} alt={book.title} className="w-14 h-20 object-cover rounded-lg shrink-0" />
                : <div className="w-14 h-20 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen size={22} className="text-indigo-300" />
                  </div>
              }
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 text-sm leading-tight truncate">{book.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{book.author}</p>
                {book.category && <p className="text-xs text-slate-400 mt-0.5">{book.category}</p>}
                {book.isbn && <p className="text-xs font-mono text-slate-400 mt-1">{book.isbn}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${book.availableCopies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {book.availableCopies > 0 ? `${book.availableCopies} available` : 'Not available'}
                  </span>
                  <span className="text-xs text-slate-400">{book.totalCopies} total</span>
                </div>
                {!isAdmin && book.availableCopies === 0 && (
                  <button onClick={() => handleReserve(book._id)}
                    className="mt-2 w-full text-xs py-1 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 font-medium">
                    Reserve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">Add Book</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddBook} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Author</label>
                <input type="text" required value={form.author} onChange={e => setForm({ ...form, author: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">ISBN</label>
                <input type="text" value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Programming"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Publisher</label>
                <input type="text" value={form.publisher} onChange={e => setForm({ ...form, publisher: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Total Copies</label>
                <input type="number" min={1} required value={form.totalCopies} onChange={e => setForm({ ...form, totalCopies: +e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Issue / Return ───────────────────────────────────────────────────────────
function IssueReturnTab() {
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [issueForm, setIssueForm] = useState({ bookId: '', studentId: '', dueDate: '' });
  const [issueLoading, setIssueLoading] = useState(false);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [issuedLoading, setIssuedLoading] = useState(true);
  const [returnLoading, setReturnLoading] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  const [search, setSearch] = useState('');

  const defaultDue = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  useEffect(() => {
    api.get('/library/books').then(r => setBooks(r.data.data || [])).catch(() => {});
    api.get('/students', { params: { limit: 1000 } }).then(r => setStudents(r.data.data || [])).catch(() => {});
    fetchIssuedBooks();
  }, []);

  const fetchIssuedBooks = async () => {
    setIssuedLoading(true);
    try {
      const res = await api.get('/library/issues');
      setIssuedBooks(res.data.data || []);
    } catch { toast.error('Failed to load issued books'); }
    finally { setIssuedLoading(false); }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    setIssueLoading(true);
    try {
      await api.post('/library/issue', { ...issueForm, dueDate: issueForm.dueDate || defaultDue });
      toast.success('Book issued successfully');
      setIssueForm({ bookId: '', studentId: '', dueDate: '' });
      api.get('/library/books').then(r => setBooks(r.data.data || [])).catch(() => {});
      fetchIssuedBooks();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setIssueLoading(false); }
  };

  const handleReturn = async (issueId) => {
    setReturnLoading(issueId);
    try {
      const res = await api.put(`/library/return/${issueId}`);
      if (res.data.fine > 0) {
        toast(`Book returned. Fine: ₹${res.data.fine}`, { icon: '⚠️', duration: 5000 });
      } else {
        toast.success('Book returned successfully');
      }
      api.get('/library/books').then(r => setBooks(r.data.data || [])).catch(() => {});
      fetchIssuedBooks();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setReturnLoading(''); }
  };

  const statusColor = (s) => ({
    issued:   'bg-blue-100 text-blue-700',
    returned: 'bg-green-100 text-green-700',
    overdue:  'bg-red-100 text-red-600',
  }[s] || 'bg-slate-100 text-slate-600');

  const filtered = issuedBooks.filter(i => {
    const matchStudent = !filterStudent || i.student?._id === filterStudent;
    const matchSearch = !search ||
      i.book?.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.student?.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.student?.enrollmentNo?.toLowerCase().includes(search.toLowerCase());
    return matchStudent && matchSearch;
  });

  const activeIssues = filtered.filter(i => i.status !== 'returned');

  // KPIs
  const allActive = issuedBooks.filter(i => i.status !== 'returned');
  const overdueCount = issuedBooks.filter(i => i.status === 'overdue').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const returnedToday = issuedBooks.filter(i => i.returnDate && new Date(i.returnDate).toISOString().split('T')[0] === todayStr).length;

  return (
    <div className="space-y-5">
      {/* Issue Book Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <BookOpen size={16} className="text-indigo-500" /> Issue Book
        </h2>
        <form onSubmit={handleIssue} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Book</label>
            <select required value={issueForm.bookId} onChange={e => setIssueForm({ ...issueForm, bookId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select book</option>
              {books.filter(b => b.availableCopies > 0).map(b => (
                <option key={b._id} value={b._id}>{b.title} ({b.availableCopies} left)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Student</label>
            <select required value={issueForm.studentId} onChange={e => setIssueForm({ ...issueForm, studentId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select student</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.userId?.name} ({s.enrollmentNo})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Due Date</label>
            <input type="date" value={issueForm.dueDate || defaultDue}
              onChange={e => setIssueForm({ ...issueForm, dueDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" disabled={issueLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
            {issueLoading ? 'Issuing...' : 'Issue Book'}
          </button>
        </form>
      </div>

      {/* KPI cards */}
      {!issuedLoading && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Issues', value: allActive.length, icon: BookMarked, color: 'bg-blue-500' },
            { label: 'Overdue', value: overdueCount, icon: AlertTriangle, color: overdueCount > 0 ? 'bg-red-500' : 'bg-emerald-500' },
            { label: 'Returned Today', value: returnedToday, icon: CheckCircle, color: 'bg-green-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                <Icon size={16} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-xl font-bold text-slate-800">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Currently Issued Books Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-slate-800">Issued Books</h2>
            <p className="text-xs text-slate-400 mt-0.5">{activeIssues.length} active issues</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search book or student..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44" />
            </div>
            <select value={filterStudent} onChange={e => setFilterStudent(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">All Students</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.userId?.name} ({s.enrollmentNo})</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Book', 'Student', 'Issue Date', 'Due Date', 'Status', 'Fine', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {issuedLoading ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : activeIssues.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">No active issues</td></tr>
              ) : activeIssues.map(issue => (
                <tr key={issue._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{issue.book?.title}</p>
                    <p className="text-xs text-slate-400">{issue.book?.author}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-700">{issue.student?.userId?.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{issue.student?.enrollmentNo}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(issue.issueDate).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className={new Date(issue.dueDate) < new Date() ? 'text-red-500 font-medium' : 'text-slate-500'}>
                      {new Date(issue.dueDate).toLocaleDateString('en-IN')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(issue.status)}`}>
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {issue.fine > 0
                      ? <span className="text-red-500 font-medium">₹{issue.fine}</span>
                      : <span className="text-slate-300">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleReturn(issue._id)} disabled={returnLoading === issue._id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 font-medium disabled:opacity-60">
                      <RotateCcw size={12} /> {returnLoading === issue._id ? '...' : 'Return'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Reservations Tab (Admin) ─────────────────────────────────────────────────
function ReservationsTab() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/library/reservations')
      .then(r => setReservations(r.data.data || []))
      .catch(() => toast.error('Failed to load reservations'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (id, status) => {
    try {
      await api.put(`/library/reservations/${id}`, { status });
      setReservations(prev => prev.filter(r => r._id !== id));
      toast.success(`Reservation ${status}`);
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200">
        <h2 className="font-semibold text-slate-800">Pending Reservations</h2>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {['Book', 'Student', 'Reserved On', 'Actions'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr><td colSpan={4} className="text-center py-10 text-slate-400">Loading...</td></tr>
          ) : reservations.length === 0 ? (
            <tr><td colSpan={4} className="text-center py-10 text-slate-400">No pending reservations</td></tr>
          ) : reservations.map(r => (
            <tr key={r._id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <p className="font-medium text-slate-800">{r.book?.title}</p>
                <p className="text-xs text-slate-400">{r.book?.author}</p>
              </td>
              <td className="px-4 py-3 text-slate-700">{r.student?.userId?.name}</td>
              <td className="px-4 py-3 text-slate-500 text-xs">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button onClick={() => handleUpdate(r._id, 'fulfilled')}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200">Fulfill</button>
                  <button onClick={() => handleUpdate(r._id, 'cancelled')}
                    className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Cancel</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── My Books (Student) ───────────────────────────────────────────────────────
function MyBooksTab() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | active | returned | overdue

  useEffect(() => {
    api.get('/library/my-issues')
      .then(r => setIssues(r.data.data || []))
      .catch(() => toast.error('Failed to load your books'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? issues : issues.filter(i => i.status === filter);

  const counts = {
    all: issues.length,
    issued: issues.filter(i => i.status === 'issued').length,
    overdue: issues.filter(i => i.status === 'overdue').length,
    returned: issues.filter(i => i.status === 'returned').length,
  };

  const statusStyle = {
    issued:   'bg-blue-100 text-blue-700',
    overdue:  'bg-red-100 text-red-600',
    returned: 'bg-green-100 text-green-700',
  };

  if (loading) return <div className="text-center py-16 text-slate-400">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Currently Issued', count: counts.issued, icon: BookMarked, color: 'bg-blue-500' },
          { label: 'Overdue', count: counts.overdue, icon: AlertTriangle, color: 'bg-red-500' },
          { label: 'Returned', count: counts.returned, icon: CheckCircle, color: 'bg-green-500' },
        ].map(({ label, count, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-800">{count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: `All (${counts.all})` },
          { key: 'issued', label: `Active (${counts.issued})` },
          { key: 'overdue', label: `Overdue (${counts.overdue})` },
          { key: 'returned', label: `Returned (${counts.returned})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filter === key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Books list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
            <p>No books found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(issue => {
              const isOverdue = issue.status === 'overdue' || (issue.status === 'issued' && new Date(issue.dueDate) < new Date());
              return (
                <div key={issue._id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                  {/* Book cover / icon */}
                  {issue.book?.coverImage
                    ? <img src={issue.book.coverImage} alt={issue.book.title} className="w-12 h-16 object-cover rounded-lg shrink-0" />
                    : <div className="w-12 h-16 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                        <BookOpen size={20} className="text-indigo-300" />
                      </div>
                  }
                  {/* Book info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{issue.book?.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{issue.book?.author}</p>
                    {issue.book?.category && (
                      <span className="inline-block mt-1 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{issue.book.category}</span>
                    )}
                  </div>
                  {/* Dates */}
                  <div className="text-right text-xs text-slate-500 shrink-0 space-y-1">
                    <p>Issued: <span className="font-medium text-slate-700">{new Date(issue.issueDate).toLocaleDateString('en-IN')}</span></p>
                    <p className={isOverdue && issue.status !== 'returned' ? 'text-red-500 font-semibold' : ''}>
                      Due: {new Date(issue.dueDate).toLocaleDateString('en-IN')}
                    </p>
                    {issue.returnDate && (
                      <p>Returned: <span className="text-green-600 font-medium">{new Date(issue.returnDate).toLocaleDateString('en-IN')}</span></p>
                    )}
                    {issue.fine > 0 && (
                      <p className="text-red-500 font-semibold">Fine: ₹{issue.fine}</p>
                    )}
                  </div>
                  {/* Status badge */}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusStyle[issue.status] || 'bg-slate-100 text-slate-600'}`}>
                    {isOverdue && issue.status === 'issued' ? 'overdue' : issue.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
