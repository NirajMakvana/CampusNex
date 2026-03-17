import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmColor = 'bg-red-600 hover:bg-red-700' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-600" />
            </div>
            <h2 className="text-base font-bold text-slate-800">{title}</h2>
          </div>
          <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
        </div>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className={`flex-1 py-2 text-sm text-white rounded-lg font-medium ${confirmColor}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
