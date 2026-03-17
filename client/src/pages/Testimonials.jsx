import { useEffect, useState } from 'react';
import { Plus, Search, Eye, Trash2, CheckCircle2, X, Star, ToggleLeft, ToggleRight, Upload } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const STATUSES = ['all', 'approved', 'pending', 'active', 'inactive'];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTestimonial, setEditTestimonial] = useState(null);
  const [form, setForm] = useState({
    name: '', course: '', text: '', rating: 5, order: 0, avatar: null
  });

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (status !== 'all') params.status = status;
      const res = await api.get('/testimonials', { params });
      setTestimonials(res.data.data);
    } catch {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTestimonials(); }, [status]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null) formData.append(key, value);
      });

      await api.post('/testimonials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Testimonial created');
      setShowForm(false);
      setForm({ name: '', course: '', text: '', rating: 5, order: 0, avatar: null });
      fetchTestimonials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating testimonial');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(editTestimonial).forEach(([key, value]) => {
        if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && value !== null) {
          formData.append(key, value);
        }
      });

      await api.put(`/testimonials/${editTestimonial._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Testimonial updated');
      setEditTestimonial(null);
      fetchTestimonials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating testimonial');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await api.delete(`/testimonials/${id}`);
      toast.success('Testimonial deleted');
      setTestimonials(prev => prev.filter(t => t._id !== id));
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/testimonials/${id}/approve`);
      toast.success('Testimonial approved');
      fetchTestimonials();
    } catch {
      toast.error('Approval failed');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.put(`/testimonials/${id}/toggle-status`);
      setTestimonials(prev => prev.map(t => t._id === id ? { ...t, isActive: res.data.isActive } : t));
      toast.success(`Testimonial ${res.data.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Status update failed');
    }
  };

  const filtered = testimonials.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.course?.toLowerCase().includes(search.toLowerCase()) ||
    t.text?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: testimonials.length,
    approved: testimonials.filter(t => t.isApproved).length,
    pending: testimonials.filter(t => !t.isApproved).length,
    active: testimonials.filter(t => t.isActive).length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Testimonials</h1>
          <p className="text-sm text-slate-500">{testimonials.length} testimonials</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-indigo-500' },
          { label: 'Approved', value: stats.approved, color: 'bg-green-500' },
          { label: 'Pending', value: stats.pending, color: 'bg-amber-500' },
          { label: 'Active', value: stats.active, color: 'bg-emerald-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
              <Star size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-800">{loading ? '—' : value}</p>
              {label === 'Pending' && value > 0 && (
                <p className="text-xs text-amber-600 font-medium">Needs approval</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search testimonials..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Student', 'Course', 'Review', 'Rating', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">No testimonials found</td></tr>
            ) : filtered.map(t => (
              <tr key={t._id} className={`hover:bg-slate-50 ${!t.isActive ? 'opacity-60' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {t.avatar ? (
                      <img src={t.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                        {t.name?.[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-800">{t.name}</p>
                      <div className="flex items-center gap-2">
                        {!t.isApproved && <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">Pending</span>}
                        {!t.isActive && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Inactive</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{t.course}</td>
                <td className="px-4 py-3">
                  <p className="text-slate-600 line-clamp-2 max-w-xs">{t.text}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${t.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {t.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {!t.isApproved && (
                      <button onClick={() => handleApprove(t._id)} className="p-1.5 hover:bg-green-50 rounded-lg text-green-500" title="Approve">
                        <CheckCircle2 size={15} />
                      </button>
                    )}
                    <button onClick={() => setEditTestimonial(t)} className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-400" title="Edit">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => handleToggleStatus(t._id)} title={t.isActive ? 'Deactivate' : 'Activate'}
                      className={`p-1.5 rounded-lg ${t.isActive ? 'hover:bg-amber-50 text-amber-500' : 'hover:bg-green-50 text-green-500'}`}>
                      {t.isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                    </button>
                    <button onClick={() => handleDelete(t._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showForm && (
        <TestimonialModal
          title="Add Testimonial"
          data={form}
          onChange={setForm}
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Edit Modal */}
      {editTestimonial && (
        <TestimonialModal
          title="Edit Testimonial"
          data={editTestimonial}
          onChange={setEditTestimonial}
          onSubmit={handleUpdate}
          onClose={() => setEditTestimonial(null)}
        />
      )}
    </div>
  );
}

function TestimonialModal({ title, data, onChange, onSubmit, onClose }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    onChange({ ...data, avatar: file });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose}><X size={18} className="text-slate-500" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Student Name</label>
              <input required value={data.name} onChange={e => onChange({ ...data, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Course</label>
              <input required value={data.course} onChange={e => onChange({ ...data, course: e.target.value })}
                placeholder="e.g. BCA 3rd Year"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Review Text</label>
            <textarea required rows={3} value={data.text} onChange={e => onChange({ ...data, text: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Rating</label>
              <select value={data.rating} onChange={e => onChange({ ...data, rating: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Display Order</label>
              <input type="number" value={data.order} onChange={e => onChange({ ...data, order: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Avatar Photo</label>
            <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors text-sm text-slate-500">
              <Upload size={14} />
              {data.avatar ? (typeof data.avatar === 'string' ? 'Current photo' : data.avatar.name) : 'Choose photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}