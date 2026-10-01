import { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Plus, Clock, Target, Trophy, Play, Pencil, TrendingUp, Layers, Flame, Brain, ArrowRight, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchAllQuizzes } from '../services/quizService.js';
import { useScrollReveal } from '../utils/useScrollReveal.js';
import { useCountUp } from '../utils/useCountUp.js';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Late night grind';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Night mode';
}

function TimeAgo({ dateStr }) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  let label = 'Just now';
  if (days > 0)  label = `${days}d ago`;
  else if (hours > 0) label = `${hours}h ago`;
  else if (mins > 0)  label = `${mins}m ago`;
  return <span className="text-[11px] text-[--text-3]">{label}</span>;
}

function AnimatedStat({ icon: Icon, label, value, color, delay = 0 }) {
  const [ref, visible] = useScrollReveal();
  const numValue = typeof value === 'number' ? value : 0;
  const count = useCountUp(numValue, 1400, visible && typeof value === 'number');
  const displayValue = typeof value === 'number' ? count : value;

  return (
    <div ref={ref} className={`stat-card p-5 reveal ${visible ? 'visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className={`w-10 h-10 rounded-xl ${color.bg} border ${color.border} flex items-center justify-center mb-4`}>
        <Icon className={`w-5 h-5 ${color.icon}`} />
      </div>
      <p className={`text-[11px] font-semibold text-[--text-3] uppercase tracking-wider mb-1.5`}>{label}</p>
      <p className="counter-display text-2xl sm:text-3xl font-black text-white">{displayValue}</p>
    </div>
  );
}

export default function Dashboard({ onNavigate, onStartQuiz, onEditQuiz, onOpenAuth }) {
  const { user, isGuest, getUserDisplayName, getUserCourse } = useAuth();
  const [quizzes, setQuizzes]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [headerRef, headerVisible] = useScrollReveal({ threshold: 0.01 });

  useEffect(() => {
    if (!user && !isGuest) { setQuizzes([]); setLoading(false); return; }
    setLoading(true); setQuizzes([]);
    fetchAllQuizzes(user?.id)
      .then(setQuizzes).catch(() => {}).finally(() => setLoading(false));
  }, [user, isGuest]);

  const name     = user ? getUserDisplayName() : 'Guest';
  const course   = user ? getUserCourse() : '';
  const greeting = getGreeting();
  const totalQ   = quizzes.reduce((a, q) => a + (q.questions?.length || 0), 0);
  const totalTime = Math.max(1, Math.round(totalQ * 1));
  const recent   = [...quizzes].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 3);

  const STATS = [
    { icon: BookOpen, label: 'My Quizzes',  value: loading ? '—' : quizzes.length, color: { bg: 'bg-[#f5ba72]/10', border: 'border-[#f5ba72]/20', icon: 'text-[--amber]' } },
    { icon: Layers,   label: 'Questions',   value: loading ? '—' : totalQ,         color: { bg: 'bg-[#ff6b35]/10', border: 'border-[#ff6b35]/20', icon: 'text-[#ff8c42]' } },
    { icon: Clock,    label: 'Study Time',  value: loading ? '—' : `~${totalTime}m`, color: { bg: 'bg-sky-500/10',  border: 'border-sky-500/20',  icon: 'text-sky-400' } },
    { icon: Flame,    label: 'Format',      value: 'MCQ',                            color: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400' } },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">

      {/* ── Header ── */}
      <div ref={headerRef} className={`reveal ${headerVisible ? 'visible' : ''} flex flex-col sm:flex-row sm:items-end justify-between gap-4`}>
        <div className="space-y-2">
          <p className="text-sm text-[--text-3] font-medium tracking-wide uppercase">{greeting},</p>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {name} <span className="wave-emoji">👋</span>
          </h1>
          <div className="flex flex-wrap gap-2">
            {isGuest && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[--text-3]">
                Guest Mode • Local Only
              </span>
            )}
            {course && (
              <span className="badge-amber text-[11px]">
                <BookOpen className="w-2.5 h-2.5" />
                {course}
              </span>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigate('list')} className="btn-secondary py-2 px-3 text-xs gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">My Quizzes</span>
          </button>
          <button onClick={() => onNavigate('create')} className="btn-primary py-2 px-4 text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Quiz</span>
          </button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {STATS.map((s, i) => (
          <AnimatedStat key={s.label} {...s} delay={i * 80} />
        ))}
      </div>

      {/* ── Main content: Recent quizzes + Tip ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Recent Quizzes — takes 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[--amber]" />
              Recent Quizzes
            </h2>
            {quizzes.length > 0 && (
              <button onClick={() => onNavigate('list')} className="text-[12px] text-[--amber] hover:text-[--amber-bright] font-semibold flex items-center gap-1 transition-colors">
                View all ({quizzes.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="glass-card p-4 border-white/[0.06] animate-pulse">
                  <div className="h-4 bg-white/8 rounded-lg w-2/5 mb-2.5" />
                  <div className="h-3 bg-white/[0.05] rounded-lg w-1/4" />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="glass-card p-10 text-center space-y-4 border-white/[0.07] dot-grid-faint">
              <div className="w-14 h-14 rounded-2xl bg-[--amber]/8 border border-[--amber]/18 flex items-center justify-center mx-auto">
                <Brain className="w-7 h-7 text-[--amber] opacity-70" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">No quizzes yet</h3>
                <p className="text-[12px] text-[--text-3] mt-1">Create your first AI-powered quiz to get started.</p>
              </div>
              <button onClick={() => onNavigate('create')} className="btn-primary py-2 px-5 text-sm mx-auto flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Create First Quiz</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recent.map((quiz, i) => (
                <div key={quiz.id}
                  className={`glass-card-hover p-4 border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3 reveal visible`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[--amber]/8 border border-[--amber]/18 flex items-center justify-center shrink-0">
                      <Target className="w-4 h-4 text-[--amber]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-[13px] truncate">{quiz.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-[--text-3]">{quiz.questions?.length || 0} questions</span>
                        <span className="text-white/20">·</span>
                        <TimeAgo dateStr={quiz.createdAt} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => onEditQuiz(quiz)} className="btn-secondary py-1.5 px-3 text-[11px] gap-1.5">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => onStartQuiz(quiz)} className="btn-primary py-1.5 px-3 text-[11px] gap-1.5">
                      <Play className="w-3 h-3 fill-current" /> Play
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">

          {/* Pro tip card */}
          <div className="glass-card p-5 border-[--border-warm] space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[--amber]/[0.07] blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[--amber]/12 border border-[--amber]/22 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-[--amber]" />
              </div>
              <span className="text-[11px] font-bold text-[--amber] uppercase tracking-wider">Pro Tip</span>
            </div>
            <p className="text-[12px] text-[--text-2] leading-relaxed">
              Use <strong className="text-[--amber]">Create Quiz</strong> to get the AI prompt. Paste it into <strong className="text-white">ChatGPT</strong> or <strong className="text-white">Gemini</strong> with your notes → get your quiz in 30 seconds.
            </p>
          </div>

          {/* Quick navigate */}
          <div className="glass-card p-4 space-y-2">
            <p className="text-[11px] font-bold text-[--text-3] uppercase tracking-wider mb-3">Quick Access</p>
            {[
              { label: 'Create New Quiz', icon: Plus, action: 'create' },
              { label: 'My Quizzes',      icon: BookOpen, action: 'list' },
              { label: 'My Profile',      icon: Trophy, action: 'profile' },
            ].map(item => (
              <button key={item.action} onClick={() => onNavigate(item.action)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-[--text-2] hover:text-white hover:bg-white/[0.05] transition-all group">
                <item.icon className="w-3.5 h-3.5 text-[--amber] group-hover:scale-110 transition-transform" />
                {item.label}
                <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          {/* Guest upgrade prompt */}
          {isGuest && (
            <div className="glass-card p-4 border-[--border-warm] space-y-3">
              <p className="text-[12px] font-bold text-white">Save your progress ☁️</p>
              <p className="text-[11px] text-[--text-3] leading-relaxed">Guest quizzes are local only. Sign up to sync across devices.</p>
              <button onClick={() => onNavigate('login')} className="btn-amber-outline w-full py-2 text-[12px] gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Create Account
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
