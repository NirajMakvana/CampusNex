import { Link } from 'react-router-dom';
import { GraduationCap, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-6">
      <GraduationCap size={48} className="text-indigo-300 mb-4" />
      <h1 className="text-8xl font-bold text-indigo-100 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-slate-700 mb-2">Page not found</h2>
      <p className="text-slate-400 text-sm mb-8 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard"
        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
        <Home size={15} /> Back to Dashboard
      </Link>
    </div>
  );
}
