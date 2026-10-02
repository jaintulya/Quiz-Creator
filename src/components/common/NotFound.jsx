import { AlertTriangle, Home, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function NotFound({ currentPath, onNavigate }) {
  const { user, isGuest } = useAuth();
  const isLoggedIn = !!(user || isGuest);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 py-12 animate-fade-in text-center">
      <div className="w-full max-w-lg glass-card p-8 sm:p-10 border-white/10 shadow-2xl relative overflow-hidden space-y-6">
        {/* Ambient glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 shadow-lg">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-mono font-bold tracking-wide">
            Error 404 • Page Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Invalid Route
          </h1>
          <p className="text-xs sm:text-sm text-[#a39e94] max-w-sm mx-auto leading-relaxed">
            The page <code className="text-amber-300 font-mono bg-white/[0.06] px-1.5 py-0.5 rounded text-[11px] font-semibold">{currentPath}</code> does not exist or has been removed.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate(isLoggedIn ? 'dashboard' : 'home')}
            className="btn-primary w-full sm:w-auto py-2.5 px-5 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>{isLoggedIn ? 'Go to Dashboard' : 'Back to Home'}</span>
          </button>
          {isLoggedIn && (
            <button
              onClick={() => onNavigate('list')}
              className="btn-secondary w-full sm:w-auto py-2.5 px-5 text-xs font-bold flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse My Quizzes</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
