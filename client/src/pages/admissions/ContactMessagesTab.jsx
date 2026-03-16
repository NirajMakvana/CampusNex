import { useEffect, useState } from 'react';
import { Mail, MailOpen, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ContactMessagesTab() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admissions/contacts');
      setMessages(res.data.data);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/admissions/contacts/${id}/read`);
      setMessages(m => m.map(msg => msg._id === id ? { ...msg, isRead: true } : msg));
    } catch { /* silent */ }
  };

  const handleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
    const msg = messages.find(m => m._id === id);
    if (msg && !msg.isRead) markRead(id);
  };

  const unread = messages.filter(m => !m.isRead).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">{messages.length} messages</span>
          {unread > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">{unread} unread</span>
          )}
        </div>
        <button onClick={fetchMessages} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
          <RefreshCw size={15} />
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-slate-400">Loading...</div>
      ) : messages.length === 0 ? (
        <div className="py-10 text-center text-slate-400">No contact messages yet</div>
      ) : (
        <div className="space-y-2">
          {messages.map(msg => (
            <div key={msg._id}
              className={`rounded-xl border transition-all cursor-pointer ${msg.isRead ? 'border-slate-200 bg-white' : 'border-indigo-200 bg-indigo-50'}`}
              onClick={() => handleExpand(msg._id)}>
              <div className="flex items-start gap-3 p-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isRead ? 'bg-slate-100' : 'bg-indigo-100'}`}>
                  {msg.isRead ? <MailOpen size={15} className="text-slate-400" /> : <Mail size={15} className="text-indigo-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium text-sm ${msg.isRead ? 'text-slate-700' : 'text-slate-900'}`}>{msg.name}</span>
                    <span className="text-xs text-slate-400">{msg.email}</span>
                    {!msg.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
                  </div>
                  <p className={`text-sm mt-0.5 ${msg.isRead ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>{msg.subject}</p>
                  {expanded === msg._id && (
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{msg.message}</p>
                  )}
                </div>
                <span className="text-xs text-slate-400 shrink-0">{new Date(msg.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
