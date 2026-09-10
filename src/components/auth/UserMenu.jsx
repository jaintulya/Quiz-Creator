import { useState } from 'react';
import { User, LogOut, ChevronDown, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function UserMenu({ onOpenAuth, onNavigate }) {
  const { user, signOut, getUserDisplayName } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return (
      <button
        onClick={() => onOpenAuth && onOpenAuth()}
        className="btn-secondary py-1.5 px-3 sm:px-4 text-xs font-semibold flex items-center gap-1.5"
      >
        <User className="w-3.5 h-3.5 text-caramel-500" />
        <span>Sign In</span>
      </button>
    );
  }

  const name    = getUserDisplayName();
  const email   = user.email || '';
  const initial = name.charAt(0).toUpperCase() || email.charAt(0).toUpperCase() || 'U';

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  const handleProfile = () => {
    setIsOpen(false);
    if (onNavigate) onNavigate('profile');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs text-white transition-all"
      >
        <div className="w-6 h-6 rounded-lg bg-caramel-500 text-warm-950 font-extrabold flex items-center justify-center text-xs shadow-sm">
          {initial}
        </div>
        <span className="hidden md:inline max-w-[90px] truncate text-slate-200">{name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 glass-card p-2.5 rounded-2xl shadow-2xl border-white/15 z-50 animate-slide-up space-y-1">
            {/* User info */}
            <div className="px-2.5 py-2 border-b border-white/[0.08] mb-1">
              <p className="text-xs font-bold text-white truncate">{name}</p>
              <p className="text-[10px] text-slate-400 truncate">{email}</p>
            </div>

            {/* My Profile */}
            <button
              onClick={handleProfile}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/[0.07] transition-colors"
            >
              <UserCircle className="w-4 h-4 text-[#f5ba72]" />
              <span>My Profile</span>
            </button>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/15 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
