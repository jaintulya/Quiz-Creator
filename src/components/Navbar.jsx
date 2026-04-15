import { Brain, BookOpen, Plus } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'create', label: 'Create Quiz', icon: Plus },
  { key: 'list',   label: 'My Quizzes',  icon: BookOpen },
];

export default function Navbar({ currentPage, onNavigate }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <button
          onClick={() => onNavigate('list')}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/40 group-hover:shadow-violet-700/50 transition-all duration-300 group-hover:scale-105">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg gradient-text hidden sm:block">QuizCraft</span>
        </button>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${currentPage === key
                  ? 'bg-violet-600/25 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/10'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>

      </div>
    </header>
  );
}
