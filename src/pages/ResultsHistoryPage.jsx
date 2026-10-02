import { useState, useEffect, useMemo } from 'react';
import {
  Trophy, Clock, CheckCircle2, Award, Zap, ArrowRight,
  Trash2, Search, Filter, Share2, BookOpen, RotateCcw,
  Sparkles, Check, ChevronRight, BarChart2, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getAllQuizResults, deleteQuizResult, clearAllQuizResults } from '../services/resultsService.js';
import { fetchQuizById } from '../services/quizService.js';

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '< 1 min';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ResultsHistoryPage({ onNavigate, onReviewResult, onRetakeQuiz }) {
  const { user, isGuest } = useAuth();
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'shared', 'owned'
  const [retakeLoading, setRetakeLoading] = useState(null);
  const [retakeError, setRetakeError] = useState('');

  // Load results
  const loadResults = () => {
    const list = getAllQuizResults(user?.id);
    setResults(list);
  };

  useEffect(() => {
    loadResults();
  }, [user]);

  // Filtered Results
  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const matchesSearch =
        item.quizTitle?.toLowerCase().includes(search.toLowerCase()) ||
        item.quizCode?.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType === 'shared') return item.isShared;
      if (filterType === 'owned') return !item.isShared;
      return true;
    });
  }, [results, search, filterType]);

  // Statistics
  const totalTaken = results.length;
  const avgAccuracy = totalTaken > 0
    ? Math.round(results.reduce((acc, r) => acc + (r.percentage || 0), 0) / totalTaken)
    : 0;
  const bestScore = totalTaken > 0
    ? Math.max(...results.map((r) => r.percentage || 0))
    : 0;
  const sharedCount = results.filter((r) => r.isShared).length;

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteQuizResult(id, user?.id);
    loadResults();
  };

  const handleRetake = async (item) => {
    setRetakeError('');
    setRetakeLoading(item.id);
    try {
      const code = item.quizCode || item.quizId;
      const liveQuiz = await fetchQuizById(code, user?.id);
      if (liveQuiz) {
        if (onRetakeQuiz) {
          onRetakeQuiz(liveQuiz);
        }
      } else {
        setRetakeError(`Quiz "${item.quizTitle}" (Code: ${code}) was deleted by its creator and is no longer available.`);
        setTimeout(() => setRetakeError(''), 4500);
      }
    } catch {
      setRetakeError('Failed to load quiz. Please verify the code.');
      setTimeout(() => setRetakeError(''), 4500);
    } finally {
      setRetakeLoading(null);
    }
  };

  const handleReview = (item) => {
    if (onReviewResult) {
      onReviewResult({
        quiz: {
          id: item.quizId,
          code: item.quizCode,
          title: item.quizTitle,
          description: item.description,
          category: item.category,
          questions: item.questions,
          isShared: item.isShared,
        },
        answers: item.answers,
        correct: item.score,
        total: item.total,
        timeSeconds: item.timeSeconds,
        mode: item.mode,
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Quiz <span className="gradient-text">Results & History</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8d877c] mt-1">
            Track your performance, review past attempts, and analyze shared quiz scores.
          </p>
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className="btn-secondary py-2 px-4 text-xs font-bold self-start sm:self-auto flex items-center gap-1.5"
        >
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Error alert if retake failed */}
      {retakeError && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fade-in">
          <Zap className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{retakeError}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-4 sm:p-5 border-white/10 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8d877c] uppercase tracking-wider">Quizzes Taken</span>
            <Layers className="w-4 h-4 text-[--amber]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{totalTaken}</p>
        </div>

        <div className="glass-card p-4 sm:p-5 border-white/10 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8d877c] uppercase tracking-wider">Avg. Accuracy</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{avgAccuracy}%</p>
        </div>

        <div className="glass-card p-4 sm:p-5 border-white/10 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8d877c] uppercase tracking-wider">Best Score</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{bestScore}%</p>
        </div>

        <div className="glass-card p-4 sm:p-5 border-white/10 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8d877c] uppercase tracking-wider">Shared Quizzes</span>
            <Share2 className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{sharedCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#8d877c] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by quiz title, code or category..."
            className="input-field text-xs pl-9 pr-3 py-2 w-full"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08] self-start sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-[#f5ba72] text-slate-950 shadow-sm'
                : 'text-[#8d877c] hover:text-white'
            }`}
          >
            All ({results.length})
          </button>
          <button
            onClick={() => setFilterType('shared')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filterType === 'shared'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-[#8d877c] hover:text-white'
            }`}
          >
            <Share2 className="w-3 h-3" />
            <span>Shared ({sharedCount})</span>
          </button>
          <button
            onClick={() => setFilterType('owned')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              filterType === 'owned'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-[#8d877c] hover:text-white'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>My Quizzes ({results.length - sharedCount})</span>
          </button>
        </div>
      </div>

      {/* Results List */}
      {filteredResults.length === 0 ? (
        <div className="glass-card p-12 text-center border-white/10 space-y-3">
          <Trophy className="w-10 h-10 text-white/20 mx-auto" />
          <h3 className="text-base font-bold text-white">No Results Found</h3>
          <p className="text-xs text-[#8d877c] max-w-sm mx-auto">
            {search
              ? 'No quiz results match your current search or filter query.'
              : 'You have not submitted any quizzes yet. Take a quiz or launch one using a code to see your results here.'}
          </p>
          <button
            onClick={() => onNavigate('dashboard')}
            className="btn-primary py-2 px-4 text-xs font-bold mt-2"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredResults.map((item) => {
            const isPassing = item.percentage >= 70;
            const isHigh = item.percentage >= 85;

            let scoreBadgeColor = 'bg-rose-500/15 border-rose-500/30 text-rose-300';
            if (isHigh) scoreBadgeColor = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
            else if (isPassing) scoreBadgeColor = 'bg-amber-500/15 border-amber-500/30 text-amber-300';

            return (
              <div
                key={item.id}
                className="glass-card p-4 sm:p-5 border-white/10 hover:border-white/20 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">
                        {item.quizTitle}
                      </h3>

                      {/* Shared Quiz vs My Quiz Badge */}
                      {item.isShared ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300">
                          <Share2 className="w-2.5 h-2.5" />
                          Shared Quiz
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                          <BookOpen className="w-2.5 h-2.5" />
                          My Quiz
                        </span>
                      )}

                      {/* Code Badge */}
                      {item.quizCode && (
                        <span className="font-mono text-[11px] font-semibold text-amber-300/80 px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/10">
                          {item.quizCode}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#8d877c]">
                      <span>{formatDate(item.submittedAt)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#f5ba72]" />
                        {formatDuration(item.timeSeconds)}
                      </span>
                      <span>•</span>
                      <span>{item.total} Questions</span>
                    </div>
                  </div>

                  {/* Score & Actions */}
                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <div className={`px-3 py-1.5 rounded-xl border font-bold text-center ${scoreBadgeColor}`}>
                      <div className="text-base font-black leading-none">{item.score}/{item.total}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{item.percentage}% Score</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleReview(item)}
                        className="btn-secondary py-2 px-3 text-xs font-bold flex items-center gap-1"
                        title="Review questions and your answers"
                      >
                        <span>Review</span>
                      </button>

                      <button
                        onClick={() => handleRetake(item)}
                        disabled={retakeLoading === item.id}
                        className="btn-primary py-2 px-3 text-xs font-bold flex items-center gap-1"
                        title="Retake this quiz"
                      >
                        {retakeLoading === item.id ? (
                          <span className="w-3 h-3 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                        ) : (
                          <RotateCcw className="w-3 h-3" />
                        )}
                        <span>Retake</span>
                      </button>

                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-2 rounded-xl bg-white/[0.03] hover:bg-rose-500/20 text-[#8d877c] hover:text-rose-400 transition-colors"
                        title="Remove result from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
