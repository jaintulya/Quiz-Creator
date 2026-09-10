import { Brain, BookOpen, Plus, LayoutDashboard } from 'lucide-react';
import UserMenu from '../auth/UserMenu.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Navbar({ currentPage, onNavigate, onOpenAuth }) {
  const { user } = useAuth();

  const handleCreateClick = () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth('Please sign in to create and save quizzes.');
    } else {
      onNavigate('create');
    }
  };

  const handleBrandClick = () => {
    onNavigate(user ? 'dashboard' : 'home');
  };

  const navLink = (page, label, Icon) => (
    <button
      onClick={() => onNavigate(page)}
      className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200
        ${currentPage === page
          ? 'bg-[#29241f] text-caramel-400 border border-white/10 shadow-sm'
          : 'text-[#9e988e] hover:text-white hover:bg-white/[0.04]'
        }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0f0e0d]/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Brand Logo */}
        <button
          onClick={handleBrandClick}
          className="flex items-center gap-2.5 group text-left focus:outline-none shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-[#2a2216] border border-[#f5ba72]/30 flex items-center justify-center shadow-caramel-glow group-hover:scale-105 transition-all duration-300">
            <Brain className="w-5 h-5 text-caramel-500 transform group-hover:rotate-6 transition-transform" />
          </div>
          <span className="font-bold text-lg text-white group-hover:text-caramel-400 transition-colors">
            QuizCraft
          </span>
        </button>

        {/* Nav Links + Actions */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Authenticated nav links */}
          {user && (
            <>
              {navLink('dashboard', 'Home', LayoutDashboard)}
              {navLink('list', 'My Quizzes', BookOpen)}
            </>
          )}

          {/* User Auth Menu */}
          <UserMenu onOpenAuth={onOpenAuth} onNavigate={onNavigate} />

          {/* Create Quiz — only for authenticated users */}
          {user && (
            <button
              id="nav-create-btn"
              onClick={handleCreateClick}
              className="btn-primary py-2 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0"
              title="Create a new quiz"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Quiz</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
