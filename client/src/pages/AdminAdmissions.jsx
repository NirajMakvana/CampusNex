import { useState } from 'react';
import { ClipboardCheck, List, Trophy, Settings, MessageSquare } from 'lucide-react';
import ApplicationsTab from './admissions/ApplicationsTab';
import ApplicationDetailModal from './admissions/ApplicationDetailModal';
import MeritListTab from './admissions/MeritListTab';
import AdmissionSettingsTab from './admissions/AdmissionSettingsTab';
import ContactMessagesTab from './admissions/ContactMessagesTab';

const TABS = [
  { id: 'applications', label: 'Applications', icon: List },
  { id: 'merit', label: 'Merit List', icon: Trophy },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'contacts', label: 'Contact Messages', icon: MessageSquare },
];

export default function AdminAdmissions() {
  const [tab, setTab] = useState('applications');
  const [selectedApp, setSelectedApp] = useState(null);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <ClipboardCheck size={20} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admissions</h1>
          <p className="text-sm text-slate-500">Manage applications, merit list, and admission settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'applications' && <ApplicationsTab onView={setSelectedApp} />}
      {tab === 'merit' && <MeritListTab />}
      {tab === 'settings' && <AdmissionSettingsTab />}
      {tab === 'contacts' && <ContactMessagesTab />}

      {/* Detail modal */}
      {selectedApp && (
        <ApplicationDetailModal
          appId={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
}
