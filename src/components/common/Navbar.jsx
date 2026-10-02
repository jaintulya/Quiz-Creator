import { Brain, BookOpen, Plus, LayoutDashboard, Trophy } from 'lucide-react';
import UserMenu from '../auth/UserMenu.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Navbar({ currentPage, onNavigate, onOpenAuth }) {
  const { user, isGuest } = useAuth();
  const hasAccess = !!(user || isGuest);

  const handleCreateClick = () => {
    if (!hasAccess) {
      if (onOpenAuth) onOpenAuth('Please sign in or continue as guest to create quizzes.');
    } else {
      onNavigate('create');
    }
  };

  const handleBrandClick = () => {
    onNavigate(hasAccess ? 'dashboard' : 'home');
  };

  const navLink = (page, label, Icon) => {
    const active = currentPage === page;
    return (
      <button
        key={page}
        onClick={() => onNavigate(page)}
        className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all duration-200 ${
          active
            ? 'text-[--amber] bg-[--amber]/8'
            : 'text-[--text-2] hover:text-white hover:bg-white/[0.05]'
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{label}</span>
        {active && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-[--amber]" />
        )}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07]" style={{ background: 'rgba(9,8,7,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Brand */}
        <button onClick={handleBrandClick} className="flex items-center gap-2.5 group focus:outline-none shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#f5ba72]/10 border border-[#f5ba72]/25 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-caramel-glow">
            <Brain className="w-4 h-4 text-[--amber] transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-black text-[15px] text-white tracking-tight group-hover:text-[--amber] transition-colors">QuizCraft</span>
            {isGuest && (
              <span className="text-[9px] font-bold text-[--text-3] uppercase tracking-widest border border-white/10 px-1.5 py-0.5 rounded-full">Guest</span>
            )}
          </div>
        </button>

        {/* Nav links + actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {hasAccess && (
            <>
              {navLink('dashboard', 'Home', LayoutDashboard)}
              {navLink('list', 'My Quizzes', BookOpen)}
              {navLink('results', 'Results', Trophy)}
            </>
          )}

          <UserMenu onOpenAuth={onOpenAuth} onNavigate={onNavigate} />

          {hasAccess && (
            <button
              id="nav-create-btn"
              onClick={handleCreateClick}
              className="btn-primary py-2 px-3 sm:px-4 text-[12px] sm:text-sm font-bold flex items-center gap-1.5 ml-1"
              title="Create a new quiz"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Create Quiz</span>
              <span className="sm:hidden">New</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
