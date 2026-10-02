import { useState, useEffect } from 'react';
import {
  Sparkles, BookOpen, Plus, Clock, Target, Trophy, Play,
  Pencil, TrendingUp, Layers, Flame, Brain, ArrowRight,
  BarChart2, Award, Lock, CheckCircle2, Zap, Share2, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchAllQuizzes, fetchQuizById } from '../services/quizService.js';
import { useScrollReveal } from '../utils/useScrollReveal.js';
import { useCountUp } from '../utils/useCountUp.js';
import {
  getGamificationData,
  getPast30DaysActivity,
  BADGES_CATALOG
} from '../services/gamificationService.js';
import BadgeIcon from '../components/common/BadgeIcon.jsx';

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
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [headerRef, headerVisible] = useScrollReveal({ threshold: 0.01 });

  // Gamification Data
  const [gamification, setGamification] = useState(() => getGamificationData(user?.id));
  const [activityDays, setActivityDays] = useState(() => getPast30DaysActivity(user?.id));
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    if (!user && !isGuest) { setQuizzes([]); setLoading(false); return; }
    setLoading(true); setQuizzes([]);
    fetchAllQuizzes(user?.id)
      .then((data) => {
        setQuizzes(data);
        setGamification(getGamificationData(user?.id));
        setActivityDays(getPast30DaysActivity(user?.id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, isGuest]);

  const name     = user ? getUserDisplayName() : 'Guest';
  const course   = user ? getUserCourse() : '';
  const greeting = getGreeting();
  const totalQ   = quizzes.reduce((a, q) => a + (q.questions?.length || 0), 0);
  const totalTime = Math.max(1, Math.round(totalQ * 1));
  const recent   = [...quizzes].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4);

  const streak = gamification.currentStreak || 0;
  const unlockedBadgesCount = Object.keys(gamification.unlockedBadges || {}).length;

  const STATS = [
    { icon: BookOpen, label: 'My Quizzes',  value: loading ? '—' : quizzes.length, color: { bg: 'bg-[#f5ba72]/10', border: 'border-[#f5ba72]/20', icon: 'text-[--amber]' } },
    { icon: Layers,   label: 'Questions',   value: loading ? '—' : totalQ,         color: { bg: 'bg-[#ff6b35]/10', border: 'border-[#ff6b35]/20', icon: 'text-[#ff8c42]' } },
    { icon: Flame,    label: 'Day Streak',  value: loading ? '—' : `${streak}d`,   color: { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  icon: 'text-amber-400' } },
    { icon: Award,    label: 'Badges Won',  value: loading ? '—' : `${unlockedBadgesCount}/${BADGES_CATALOG.length}`, color: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400' } },
  ];

  // Quick launch by ID or URL
  const handleJoinQuiz = async (e) => {
    e.preventDefault();
    setJoinError('');
    let raw = joinCodeInput.trim();
    if (!raw) return;

    // Strip wrapping quotation marks or spaces
    raw = raw.replace(/^["']|["']$/g, '').trim();

    let targetId = raw;
    if (raw.includes('quizId=')) {
      try {
        const dummyBase = window.location.origin;
        const url = new URL(raw.startsWith('http') ? raw : `${dummyBase}/${raw.replace(/^\/+/, '')}`);
        targetId = url.searchParams.get('quizId') || raw;
      } catch {
        const match = raw.match(/quizId=([^&/#?]+)/);
        if (match) targetId = match[1];
      }
    } else if (raw.includes('/play/')) {
      const match = raw.match(/\/play\/([^&/#?]+)/);
      if (match) targetId = match[1];
    }

    targetId = targetId.trim();

    // 1. Check loaded quizzes (case-insensitive ID or title match)
    let found = quizzes.find((q) =>
      q.id.toLowerCase() === targetId.toLowerCase() ||
      q.id.toLowerCase().includes(targetId.toLowerCase()) ||
      q.title.toLowerCase() === targetId.toLowerCase()
    );

    // 2. Fetch from storage/Supabase if not in active state
    if (!found) {
      found = await fetchQuizById(targetId, user?.id);
    }

    if (found) {
      setJoinError('');
      setJoinCodeInput('');
      onStartQuiz(found);
    } else {
      setJoinError('Quiz not found. Please verify the Quiz ID, short code, or link.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div ref={headerRef} className={`reveal ${headerVisible ? 'visible' : ''} flex flex-col sm:flex-row sm:items-end justify-between gap-4`}>
        <div className="space-y-2">
          <p className="text-sm text-[--text-3] font-medium tracking-wide uppercase">{greeting},</p>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {name}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
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
            {streak > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Flame className="w-3 h-3 fill-amber-500" />
                <span>{streak} Day Streak!</span>
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
          <button onClick={() => onNavigate('create')} className="btn-primary py-2 px-4 text-xs gap-1.5 shadow-caramel-glow">
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

      {/* ── 30-Day Activity Heatmap (GitHub-style Study Grid) ── */}
      <div className="glass-card p-5 sm:p-6 border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Daily Study Activity</h2>
              <p className="text-[11px] text-[#8d877c]">30-Day consistency heatmap</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-[#8d877c] self-end sm:self-auto">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-white/[0.04]" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#f5ba72]/30" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#f5ba72]/70" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#f5ba72] shadow-caramel-glow" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="pt-2 overflow-x-auto">
          <div className="flex gap-1.5 min-w-[580px] pb-1">
            {activityDays.map((d, i) => {
              let bg = 'bg-white/[0.04] border-white/5';
              if (d.level === 1) bg = 'bg-[#f5ba72]/30 border-[#f5ba72]/40';
              if (d.level === 2) bg = 'bg-[#f5ba72]/70 border-[#f5ba72]/80';
              if (d.level === 3) bg = 'bg-[#f5ba72] border-white/40 shadow-caramel-glow';

              return (
                <div
                  key={d.date}
                  className={`flex-1 h-8 rounded-md border flex items-center justify-center transition-transform hover:scale-110 cursor-pointer relative group ${bg}`}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-30 pointer-events-none">
                    <div className="bg-[#1a1714] border border-[#f5ba72]/30 text-white text-[10px] py-1 px-2 rounded-lg shadow-xl whitespace-nowrap">
                      <strong>{d.count}</strong> quizzes on {d.displayDate}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main content: Recent quizzes + Right Sidebar (Badges & Join) ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Recent Quizzes — takes 2 cols */}
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
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-4 border-white/[0.06] animate-pulse">
                  <div className="h-4 bg-white/8 rounded-lg w-2/5 mb-2.5" />
                  <div className="h-3 bg-white/5 rounded-lg w-3/5" />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="glass-card p-8 sm:p-10 border-white/10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#f5ba72]/10 border border-[#f5ba72]/20 flex items-center justify-center mx-auto text-[#f5ba72]">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">No quizzes created yet</h3>
                <p className="text-xs text-[#8d877c] max-w-xs mx-auto mt-1">
                  Generate your first interactive quiz with AI or create one manually.
                </p>
              </div>
              <button onClick={() => onNavigate('create')} className="btn-primary py-2 px-4 text-xs gap-1.5 shadow-caramel-glow">
                <Plus className="w-3.5 h-3.5" />
                <span>Create with AI</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((q) => (
                <div
                  key={q.id}
                  className="glass-card p-4 sm:p-5 border-white/10 hover:border-[#f5ba72]/30 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:scale-[1.005]"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-[#8d877c] border border-white/10">
                        {q.category || 'General'}
                      </span>
                      <TimeAgo dateStr={q.createdAt} />
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#f5ba72] transition-colors truncate">
                      {q.title}
                    </h3>
                    <p className="text-xs text-[#8d877c]">
                      {q.questions?.length || 0} Questions • ~{(q.questions?.length || 0) * 1} min study time
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onEditQuiz && onEditQuiz(q)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#8d877c] hover:text-white transition-colors"
                      title="Edit Quiz"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onStartQuiz && onStartQuiz(q)}
                      className="btn-primary py-1.5 px-3.5 text-xs font-bold gap-1.5 shadow-caramel-glow"
                    >
                      <Play className="w-3 h-3 fill-slate-950" />
                      <span>Start</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Badges & Quick Launch */}
        <div className="space-y-5">

          {/* Quick Launch by Quiz ID */}
          <div className="glass-card p-4 sm:p-5 border-white/10 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-[#f5ba72]" />
              Quick Launch by Code
            </h3>
            <form onSubmit={handleJoinQuiz} className="space-y-2">
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                placeholder="Paste Quiz ID or shared link"
                className="input-field text-xs py-2 px-3 w-full"
              />
              {joinError && <p className="text-[10px] text-rose-400">{joinError}</p>}
              <button
                type="submit"
                className="btn-secondary w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <span>Launch Quiz</span>
              </button>
            </form>
          </div>

          {/* Achievements & Badges Showcase */}
          <div className="glass-card p-4 sm:p-5 border-white/10 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Achievements ({unlockedBadgesCount}/{BADGES_CATALOG.length})
              </h3>
              <button
                onClick={() => onNavigate('profile')}
                className="text-[11px] text-[#f5ba72] hover:underline"
              >
                View Profile
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {BADGES_CATALOG.slice(0, 6).map((badge) => {
                const isUnlocked = Boolean(gamification.unlockedBadges?.[badge.id]);

                return (
                  <div
                    key={badge.id}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-colors ${
                      isUnlocked
                        ? 'bg-[#181512] border-white/[0.08] hover:border-white/20'
                        : 'bg-white/[0.015] border-white/[0.04]'
                    }`}
                  >
                    <BadgeIcon id={badge.id} isUnlocked={isUnlocked} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[11px] font-semibold leading-tight truncate ${isUnlocked ? 'text-[#f0ede6]' : 'text-[#8d877c]'}`}
                        title={badge.title}
                      >
                        {badge.title}
                      </p>
                      <div className="flex items-center gap-1 text-[9px] mt-0.5">
                        {isUnlocked ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Unlocked
                          </span>
                        ) : (
                          <span className="text-[#6c665d] flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> Locked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
