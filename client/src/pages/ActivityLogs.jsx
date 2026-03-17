import { useState, useEffect } from 'react';
import { Activity, Search, Calendar, User } from 'lucide-react';
import api from '../api/axios';
import { usePageTitle } from '../hooks/usePageTitle';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  usePageTitle('Activity Logs');

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (searchTerm) params.search = searchTerm;
      if (filterModule) params.module = filterModule;
      if (filterUser) params.user = filterUser;

      const response = await api.get('/activity-logs', { params });
      setLogs(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [searchTerm, filterModule, filterUser]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchLogs(page);
    }
  };

  const getActionColor = (action) => {
    if (action.toLowerCase().includes('create')) return 'bg-green-100 text-green-800';
    if (action.toLowerCase().includes('update') || action.toLowerCase().includes('edit')) return 'bg-blue-100 text-blue-800';
    if (action.toLowerCase().includes('delete')) return 'bg-red-100 text-red-800';
    if (action.toLowerCase().includes('login')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const modules = ['Students', 'Faculty', 'Departments', 'Courses', 'Attendance', 'Fees', 'Library', 'Notices', 'Admissions', 'Exams'];

  if (loading && logs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Activity Logs</h1>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity size={20} className="text-indigo-500" />
            Activity Logs
          </h1>
          <p className="text-sm text-slate-500">System activity and user actions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Modules</option>
            {modules.map(module => (
              <option key={module} value={module}>{module}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Filter by user..."
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {(searchTerm || filterModule || filterUser) && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-500">Active filters:</span>
            {searchTerm && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                Search: {searchTerm}
              </span>
            )}
            {filterModule && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                Module: {filterModule}
              </span>
            )}
            {filterUser && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                User: {filterUser}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterModule('');
                setFilterUser('');
              }}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-xl border border-slate-200">
        {logs.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity logs found"
            description="No system activity matches your current filters."
          />
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {logs.map((log) => (
                <div key={log._id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                        {log.module && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                            {log.module}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-700">
                            {log.user?.name || 'Unknown User'}
                          </span>
                          <span className="text-slate-400">
                            ({log.user?.role || 'Unknown Role'})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="text-slate-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {log.details && (
                        <p className="text-sm text-slate-600 mt-2">{log.details}</p>
                      )}
                      {log.ip && (
                        <p className="text-xs text-slate-400 mt-1">IP: {log.ip}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}