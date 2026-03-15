import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notices, setNotices] = useState([]);
  const [showBell, setShowBell] = useState(false);
  const bellRef = useRef();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = ['admin', 'superadmin'].includes(user?.role);

  useEffect(() => {
    api.get('/notices').then(r => setNotices((r.data.data || []).slice(0, 5))).catch(() => {});
  }, []);

  // Close bell dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setShowBell(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (isAdmin) {
      navigate(`/students?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/notices?search=${encodeURIComponent(searchQuery.trim())}`);
    }
    setSearchQuery('');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-60'}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="relative">
            <form onSubmit={handleSearch}>
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isAdmin ? 'Search students...' : 'Search notices...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </form>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative" ref={bellRef}>
              <button onClick={() => setShowBell(v => !v)} className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <Bell size={18} className="text-slate-600" />
                {notices.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
              </button>
              {showBell && (
                <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-800">Recent Notices</span>
                    <button onClick={() => setShowBell(false)}><X size={14} className="text-slate-400" /></button>
                  </div>
                  {notices.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">No notices</p>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {notices.map(n => (
                        <div key={n._id} className="px-4 py-3 hover:bg-slate-50 cursor-pointer" onClick={() => { navigate('/notices'); setShowBell(false); }}>
                          <p className="text-sm font-medium text-slate-800 truncate">{n.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="px-4 py-2 border-t border-slate-100">
                    <button onClick={() => { navigate('/notices'); setShowBell(false); }} className="text-xs text-indigo-600 hover:underline w-full text-center">
                      View all notices →
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                  {user?.avatar
                    ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    : user?.name?.[0]?.toUpperCase()
                  }
                </div>
                <span className="text-sm font-medium text-slate-700">{user?.name}</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
