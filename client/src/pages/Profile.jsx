import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Camera, Save, Lock, User, Mail, Shield, Clock, UserPlus, Trash2, RefreshCw } from 'lucide-react';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const fileRef = useRef();

  const [nameForm, setNameForm] = useState({ name: user?.name || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [adminList, setAdminList] = useState([]);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    api.get('/activity/me').then(r => setActivityLogs(r.data.data || [])).catch(() => {});
    if (user?.role === 'superadmin') fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/auth/admins');
      setAdminList(res.data.data || []);
    } catch { /* silent */ }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (adminForm.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setAdminLoading(true);
    try {
      await api.post('/auth/register', { ...adminForm, role: 'admin' });
      toast.success('Admin created');
      setAdminForm({ name: '', email: '', password: '' });
      fetchAdmins();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setAdminLoading(false); }
  };

  const handleDeleteAdmin = async (id) => {
    if (!confirm('Delete this admin?')) return;
    try {
      await api.delete(`/auth/admins/${id}`);
      toast.success('Admin deleted');
      fetchAdmins();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  // Update name
  const handleNameSave = async (e) => {
    e.preventDefault();
    if (!nameForm.name.trim()) { toast.error('Name cannot be empty'); return; }
    setNameLoading(true);
    try {
      await api.put('/auth/profile', { name: nameForm.name });
      toast.success('Name updated');
      await refreshUser();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setNameLoading(false); }
  };

  // Change password
  const handlePassChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setPassLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setPassLoading(false); }
  };

  // Avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Only image files allowed'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }

    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await api.put('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Avatar updated');
      await refreshUser();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setAvatarLoading(false); }
  };

  const roleColors = {
    superadmin: 'bg-red-100 text-red-700',
    admin: 'bg-purple-100 text-purple-700',
    faculty: 'bg-emerald-100 text-emerald-700',
    student: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
        <p className="text-sm text-slate-500">Manage your account settings</p>
      </div>

      {/* Avatar + Basic Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
          <div className="relative">
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-slate-200" />
              : <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold border-2 border-slate-200">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
            }
            <button
              onClick={() => fileRef.current?.click()}
              disabled={avatarLoading}
              className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-md"
            >
              {avatarLoading
                ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Camera size={13} className="text-white" />
              }
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roleColors[user?.role]}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Account Info */}
        <div className="space-y-3 text-sm">
          {[
            { icon: User, label: 'Full Name', value: user?.name },
            { icon: Mail, label: 'Email', value: user?.email },
            { icon: Shield, label: 'Role', value: user?.role },
            { icon: User, label: 'Last Login', value: user?.lastLogin ? new Date(user.lastLogin).toLocaleString('en-IN') : 'N/A' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
              <Icon size={15} className="text-slate-400 shrink-0" />
              <span className="text-slate-500 w-24 shrink-0">{label}</span>
              <span className="font-medium text-slate-800 capitalize">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Update Name */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <User size={16} className="text-indigo-500" /> Update Name
        </h2>
        <form onSubmit={handleNameSave} className="flex gap-3">
          <input
            type="text"
            value={nameForm.name}
            onChange={e => setNameForm({ name: e.target.value })}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" disabled={nameLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60">
            <Save size={14} /> {nameLoading ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Lock size={16} className="text-indigo-500" /> Change Password
        </h2>
        <form onSubmit={handlePassChange} className="space-y-4">
          {[
            { label: 'Current Password', key: 'currentPassword' },
            { label: 'New Password', key: 'newPassword' },
            { label: 'Confirm New Password', key: 'confirmPassword' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={passForm[key]}
                onChange={e => setPassForm(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
              <input type="checkbox" checked={showPass} onChange={e => setShowPass(e.target.checked)} className="rounded" />
              Show passwords
            </label>
            <button type="submit" disabled={passLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60">
              <Lock size={14} /> {passLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Admin Management — superadmin only */}
      {user?.role === 'superadmin' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <UserPlus size={16} className="text-red-500" /> Admin Management
          </h2>

          {/* Create Admin Form */}
          <form onSubmit={handleCreateAdmin} className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
              <input type="text" required value={adminForm.name}
                onChange={e => setAdminForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input type="email" required value={adminForm.email}
                onChange={e => setAdminForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
              <input type="password" required value={adminForm.password}
                onChange={e => setAdminForm(p => ({ ...p, password: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={adminLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60">
                <UserPlus size={14} /> {adminLoading ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </form>

          {/* Admin List */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Existing Admins</p>
            <button onClick={fetchAdmins} className="p-1 hover:bg-slate-100 rounded text-slate-400">
              <RefreshCw size={13} />
            </button>
          </div>
          {adminList.length === 0 ? (
            <p className="text-sm text-slate-400">No admins yet</p>
          ) : (
            <div className="space-y-2">
              {adminList.map(a => (
                <div key={a._id} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{a.name}</p>
                    <p className="text-xs text-slate-400">{a.email}</p>
                  </div>
                  <button onClick={() => handleDeleteAdmin(a._id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Activity Log */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Clock size={16} className="text-indigo-500" /> Recent Activity
        </h2>
        {activityLogs.length === 0 ? (
          <p className="text-sm text-slate-400">No activity recorded yet</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {activityLogs.map(log => (
              <div key={log._id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{log.action}</p>
                  {log.module && <span className="text-xs text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">{log.module}</span>}
                </div>
                <span className="text-xs text-slate-400 shrink-0">
                  {new Date(log.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
