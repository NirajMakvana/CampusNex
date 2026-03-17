import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'No data found', message = 'There are no items to display.', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-4">{message}</p>
      {action && action}
    </div>
  );
}
