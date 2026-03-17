import { useEffect, useState } from 'react';
import { Save, Globe, Phone, Mail, MapPin, Share2, Info } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ManageWebsite() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    collegeName: '',
    collegeShortName: '',
    address: { street: '', city: '', state: '', pin: '' },
    contact: { phone: '', email: '', whatsapp: '' },
    socialLinks: { facebook: '', twitter: '', instagram: '', youtube: '', linkedin: '' },
    aboutCollege: '',
    affiliation: '',
  });

  useEffect(() => {
    api.get('/website/public')
      .then(res => {
        setSettings(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load settings');
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/website', settings);
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Loading settings...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Website Settings</h1>
          <p className="text-slate-500 text-sm">Manage global college information and social links</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm font-medium disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2 bg-slate-50/50">
            <Globe size={18} className="text-indigo-500" />
            <h2 className="font-semibold text-slate-800">Basic Branding</h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">College Full Name</label>
              <input
                type="text"
                value={settings.collegeName}
                onChange={e => setSettings({ ...settings, collegeName: e.target.value })}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Short/Abbreviated Name</label>
              <input
                type="text"
                value={settings.collegeShortName}
                onChange={e => setSettings({ ...settings, collegeShortName: e.target.value })}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Affiliation Text</label>
              <input
                type="text"
                value={settings.affiliation}
                onChange={e => setSettings({ ...settings, affiliation: e.target.value })}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                placeholder="e.g. Affiliated to VNSGU, Surat"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2 bg-slate-50/50">
            <Phone size={18} className="text-indigo-500" />
            <h2 className="font-semibold text-slate-800">Contact Details</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  value={settings.contact.phone}
                  onChange={e => setSettings({ ...settings, contact: { ...settings.contact, phone: e.target.value } })}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">WhatsApp (Optional)</label>
                <input
                  type="text"
                  value={settings.contact.whatsapp}
                  onChange={e => setSettings({ ...settings, contact: { ...settings.contact, whatsapp: e.target.value } })}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Official Email</label>
              <input
                type="email"
                value={settings.contact.email}
                onChange={e => setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2 bg-slate-50/50">
            <MapPin size={18} className="text-indigo-500" />
            <h2 className="font-semibold text-slate-800">Campus Address</h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Street / Locality</label>
              <input
                type="text"
                value={settings.address.street}
                onChange={e => setSettings({ ...settings, address: { ...settings.address, street: e.target.value } })}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  value={settings.address.city}
                  onChange={e => setSettings({ ...settings, address: { ...settings.address, city: e.target.value } })}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">State</label>
                <input
                  type="text"
                  value={settings.address.state}
                  onChange={e => setSettings({ ...settings, address: { ...settings.address, state: e.target.value } })}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Pincode</label>
                <input
                  type="text"
                  value={settings.address.pin}
                  onChange={e => setSettings({ ...settings, address: { ...settings.address, pin: e.target.value } })}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2 bg-slate-50/50">
            <Share2 size={18} className="text-indigo-500" />
            <h2 className="font-semibold text-slate-800">Social Media Links</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Facebook</label>
                <input
                  type="text"
                  value={settings.socialLinks.facebook}
                  onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, facebook: e.target.value } })}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Instagram</label>
                <input
                  type="text"
                  value={settings.socialLinks.instagram}
                  onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Twitter (X)</label>
                <input
                  type="text"
                  value={settings.socialLinks.twitter}
                  onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, twitter: e.target.value } })}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">YouTube</label>
                <input
                  type="text"
                  value={settings.socialLinks.youtube}
                  onChange={e => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, youtube: e.target.value } })}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Branding & Principal */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden md:col-span-2">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2 bg-slate-50/50">
            <Info size={18} className="text-indigo-500" />
            <h2 className="font-semibold text-slate-800">Branding & Principal's Message</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Logo URL</label>
                <input
                  type="text"
                  value={settings.logo || ''}
                  onChange={e => setSettings({ ...settings, logo: e.target.value })}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                  placeholder="Link to college logo image"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Principal Name</label>
                <input
                  type="text"
                  value={settings.principal?.name || ''}
                  onChange={e => setSettings({ ...settings, principal: { ...settings.principal, name: e.target.value } })}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Principal Designation</label>
                <input
                  type="text"
                  value={settings.principal?.designation || ''}
                  onChange={e => setSettings({ ...settings, principal: { ...settings.principal, designation: e.target.value } })}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Principal Image URL</label>
                <input
                  type="text"
                  value={settings.principal?.image || ''}
                  onChange={e => setSettings({ ...settings, principal: { ...settings.principal, image: e.target.value } })}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Principal's Message</label>
                <textarea
                  rows={4}
                  value={settings.principal?.message || ''}
                  onChange={e => setSettings({ ...settings, principal: { ...settings.principal, message: e.target.value } })}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 resize-none"
                  placeholder="Principal's message to students..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* About / Footer Text */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden md:col-span-2">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2 bg-slate-50/50">
            <Info size={18} className="text-indigo-500" />
            <h2 className="font-semibold text-slate-800">Footer Tagline / About Summary</h2>
          </div>
          <div className="p-5">
            <textarea
              rows={2}
              value={settings.aboutCollege}
              onChange={e => setSettings({ ...settings, aboutCollege: e.target.value })}
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 resize-none"
              placeholder="Enter a brief tagline or summary that appears in the footer..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
