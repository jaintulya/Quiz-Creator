import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Layers, Clock, Flame, Search, ChevronDown,
  Sparkles, Code, Check, Copy, RefreshCw, X, AlertTriangle, Plus
} from 'lucide-react';
import StatCard from '../components/ui/StatCard.jsx';
import QuizCard from '../components/ui/QuizCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchAllQuizzes, deleteQuizRecord, updateExistingQuiz } from '../services/quizService.js';

export default function QuizList({ onNavigate, onStartQuiz, onEditQuiz, onOpenAuth }) {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [deleteModal, setDeleteModal] = useState(null);
  const [viewJson, setViewJson] = useState(null);
  const [copiedJson, setCopiedJson] = useState(false);

  // Load quizzes from Supabase (or local fallback)
  const loadQuizzes = async () => {
    if (!user) {
      setQuizzes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setQuizzes([]);
    try {
      const data = await fetchAllQuizzes(user.id);
      setQuizzes(data);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, [user]);

  // Calculations for Stats Bar
  const totalQuizzesCount = quizzes.length;
  const totalQuestionsCount = quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0);
  const totalEstTimeMins = Math.max(1, Math.round(totalQuestionsCount * 1));

  // Search & Sorting Filter
  const filteredQuizzes = useMemo(() => {
    let result = quizzes.filter((q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      (q.description && q.description.toLowerCase().includes(search.toLowerCase()))
    );

    if (sortBy === 'latest') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'questions') {
      result.sort((a, b) => (b.questions?.length || 0) - (a.questions?.length || 0));
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [quizzes, search, sortBy]);

  // Actions
  const handleCreateQuiz = () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth('Please sign in to create and save quizzes.');
    } else {
      onNavigate('create');
    }
  };

  const handleShuffle = async (quizId) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) return;

    const shuffledQuestions = [...quiz.questions]
      .map((q) => ({
        ...q,
        options: [...q.options].sort(() => Math.random() - 0.5),
      }))
      .sort(() => Math.random() - 0.5);

    await updateExistingQuiz(quiz.id, quiz.title, shuffledQuestions, user?.id);
    await loadQuizzes();

    if (viewJson && viewJson.id === quizId) {
      setViewJson({ ...quiz, questions: shuffledQuestions });
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteModal) {
      await deleteQuizRecord(deleteModal.id, user?.id);
      await loadQuizzes();
      setDeleteModal(null);
    }
  };

  const handleCopyJson = async () => {
    if (!viewJson) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(viewJson, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-7 animate-fade-in">

      {/* ── 1. Page Header ── */}
      <div className="pb-4 border-b border-white/[0.08]">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          My Quizzes
        </h1>
        <p className="text-xs sm:text-sm text-[#a39e94] mt-1">
          {quizzes.length === 0
            ? 'No quizzes yet — create your first quiz using the button above!'
            : `${quizzes.length} quiz${quizzes.length > 1 ? 'zes' : ''} available • Practice & test your knowledge`}
        </p>
      </div>

      {/* ── 2. Stat Cards Grid (Warm Luxury Theme) ───── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          title="Total Quizzes"
          value={totalQuizzesCount}
          colorType="rose"
        />
        <StatCard
          icon={Layers}
          title="Total Questions"
          value={totalQuestionsCount}
          colorType="emerald"
        />
        <StatCard
          icon={Clock}
          title="Est. Practice Time"
          value={`~${totalEstTimeMins}m`}
          colorType="amber"
        />
        <StatCard
          icon={Flame}
          title="Format"
          value="MCQ 4-Opt"
          colorType="coral"
        />
      </div>

      {/* ── 3. Search & Filter Bar ── */}
      <div id="quiz-explorer">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 sm:p-3 rounded-2xl bg-[#151311] border border-white/[0.08]">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8d877c]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quizzes by title, topic, or keyword..."
              className="w-full bg-transparent border-none pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-[#797368] focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
            <span className="text-xs text-[#8d877c] font-medium hidden md:inline">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#1f1c19] border border-white/10 text-xs font-semibold text-slate-200 py-2 pl-3.5 pr-8 rounded-xl focus:outline-none focus:border-caramel-500 cursor-pointer"
              >
                <option value="latest">Latest First</option>
                <option value="questions">Most Questions</option>
                <option value="title">Alphabetical</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Quiz Cards Grid (From Reference Screenshot) ──────────── */}
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredQuizzes.map((quiz, idx) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              index={idx}
              onStart={onStartQuiz}
              onEdit={onEditQuiz}
              onShuffle={handleShuffle}
              onViewJson={setViewJson}
              onDelete={setDeleteModal}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-card p-12 text-center max-w-lg mx-auto border-white/10 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-caramel-500/15 border border-caramel-500/30 flex items-center justify-center mx-auto text-caramel-400 shadow-caramel-glow">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {search ? 'No Matching Quizzes Found' : 'No Quizzes Created Yet'}
            </h3>
            <p className="text-xs text-[#a39e94] mt-1 max-w-xs mx-auto">
              {search
                ? `No quizzes match "${search}". Try searching another topic.`
                : 'Create your first quiz to get started!'}
            </p>
          </div>
          <div className="flex items-center justify-center pt-2">
            <button
              onClick={handleCreateQuiz}
              className="btn-primary text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Quiz</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 5. View JSON Modal ─────────────────────────────────────── */}
      {viewJson && (
        <div
          className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setViewJson(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] bg-[#151311] border border-white/15 rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-[#1c1916]">
              <div className="flex items-center gap-2.5">
                <Code className="w-5 h-5 text-caramel-400" />
                <div>
                  <h3 className="text-base font-bold text-white truncate max-w-sm sm:max-w-md">
                    {viewJson.title}
                  </h3>
                  <p className="text-xs text-[#8d877c]">
                    {viewJson.questions?.length} Questions &bull; Raw JSON Format
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJson}
                  className="btn-secondary py-1.5 px-3 text-xs"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setViewJson(null)}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 sm:p-5 bg-[#0f0e0d]">
              <pre className="text-xs text-[#dedbd3] font-mono whitespace-pre-wrap leading-relaxed select-all">
                {JSON.stringify(viewJson, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Delete Confirmation Modal ───────────────────────────── */}
      {deleteModal && (
        <div
          className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setDeleteModal(null)}
        >
          <div
            className="w-full max-w-md bg-[#151311] border border-white/15 rounded-2xl p-6 shadow-2xl animate-slide-up space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete this quiz?</h3>
                <p className="text-xs text-[#a39e94] mt-1 leading-relaxed">
                  This action will permanently delete <strong className="text-white">"{deleteModal.title}"</strong> from your database and local storage.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModal(null)}
                className="btn-secondary flex-1 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn-danger flex-1 py-2.5 text-sm"
              >
                Delete Quiz
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}