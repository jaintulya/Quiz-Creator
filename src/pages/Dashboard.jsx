import { useState, useEffect } from 'react';
import {
  Sparkles, BookOpen, Plus, Clock, Target, Trophy, Play,
  Pencil, TrendingUp, Layers, Flame, Brain
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchAllQuizzes } from '../services/quizService.js';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function TimeAgo({ dateStr }) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  let label = 'Just now';
  if (days > 0) label = `${days}d ago`;
  else if (hours > 0) label = `${hours}h ago`;
  else if (mins > 0) label = `${mins}m ago`;
  return <span className="text-[11px] text-[#8d877c]">{label}</span>;
}

export default function Dashboard({ onNavigate, onStartQuiz, onEditQuiz, onOpenAuth }) {
  const { user, getUserDisplayName, getUserCourse } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchAllQuizzes(user.id).then((data) => {
      setQuizzes(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const name     = getUserDisplayName();
  const course   = getUserCourse();
  const greeting = getGreeting();

  const totalQuestions = quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0);
  const totalTime      = Math.max(1, Math.round(totalQuestions * 1));
  const recentQuizzes  = [...quizzes].sort((a, b) =>
    new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  ).slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fade-in">

      {/* ── Welcome Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-[#a39e94] font-medium">{greeting},</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {name} 👋
          </h1>
          {course && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f5ba72]/15 border border-[#f5ba72]/25 text-[#f5ba72]">
              <BookOpen className="w-3 h-3" />
              {course}
            </span>
          )}
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: 'My Quizzes', value: loading ? '…' : quizzes.length, color: 'caramel' },
          { icon: Layers,   label: 'Questions',  value: loading ? '…' : totalQuestions, color: 'coral' },
          { icon: Clock,    label: 'Study Time',  value: loading ? '…' : `~${totalTime}m`, color: 'emerald' },
          { icon: Flame,    label: 'Format',      value: 'MCQ 4-Opt', color: 'amber' },
        ].map((stat) => {
          const Icon = stat.icon;
          const palette = {
            caramel: { bg: 'bg-[#f5ba72]/10', border: 'border-[#f5ba72]/20', icon: 'text-[#f5ba72]' },
            coral:   { bg: 'bg-[#ff735c]/10', border: 'border-[#ff735c]/20', icon: 'text-[#ff8a75]' },
            emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400' },
            amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   icon: 'text-amber-400' },
          }[stat.color];
          return (
            <div key={stat.label} className="glass-card p-4 sm:p-5 border-white/10 space-y-3">
              <div className={`w-10 h-10 rounded-xl ${palette.bg} border ${palette.border} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${palette.icon}`} />
              </div>
              <div>
                <p className="text-[11px] text-[#8d877c] font-medium uppercase tracking-wide">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Recent Quizzes ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#f5ba72]" />
            Recent Quizzes
          </h2>
          {quizzes.length > 0 && (
            <button
              onClick={() => onNavigate('list')}
              className="text-xs text-[#f5ba72] hover:text-[#f7c587] font-semibold flex items-center gap-1 transition-colors"
            >
              View all ({quizzes.length})
              <span className="text-base leading-none">›</span>
            </button>
          )}
        </div>

        {loading ? (
          /* Loading skeletons */
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-4 border-white/10 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
                <div className="h-3 bg-white/[0.06] rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : recentQuizzes.length === 0 ? (
          /* Empty state */
          <div className="glass-card p-10 border-white/10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#f5ba72]/10 border border-[#f5ba72]/20 flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-[#f5ba72]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No quizzes yet</h3>
              <p className="text-xs text-[#8d877c] mt-1">Create your first AI-powered quiz to get started!</p>
            </div>
            <button
              onClick={() => onNavigate('create')}
              className="btn-primary py-2 px-5 text-sm font-bold mx-auto flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create First Quiz</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="glass-card-hover p-4 sm:p-5 border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#f5ba72]/10 border border-[#f5ba72]/20 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-[#f5ba72]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">{quiz.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[#8d877c]">{quiz.questions?.length || 0} questions</span>
                      <span className="text-[#3d3830]">•</span>
                      <TimeAgo dateStr={quiz.createdAt} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onEditQuiz(quiz)}
                    className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onStartQuiz(quiz)}
                    className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick Tips ── */}
      <div className="glass-card p-5 sm:p-6 border-[#f5ba72]/15 bg-gradient-to-r from-[#f5ba72]/[0.05] to-transparent">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#f5ba72]/15 border border-[#f5ba72]/25 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-[#f5ba72]" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Pro Tip</h3>
            <p className="text-xs text-[#a39e94] mt-1 leading-relaxed">
              Use the <strong className="text-[#f5ba72]">Create Quiz</strong> button to get an AI prompt, paste it into ChatGPT or Gemini with your study notes, then paste the JSON output back. Your quiz will be ready in under a minute!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
