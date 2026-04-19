import { useState, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Bookmark, BookmarkX,
  Flag, LayoutGrid, X, CheckCircle2
} from 'lucide-react';
import QuestionPalette from '../components/QuestionPalette.jsx';
import Timer from '../components/Timer.jsx';

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function QuizPlayer({ quiz, onFinish, onBack }) {
  const total = quiz.questions.length;

  // Shuffle options on first render
  const [shuffledQuestions] = useState(() =>
    quiz.questions.map((q) => ({
      ...q,
      shuffledOptions: shuffleArray(q.options),
    }))
  );

  // State
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // { [index]: selectedOption }
  const [marked, setMarked] = useState([]);    // indices
  const [showPalette, setShowPalette] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const q = shuffledQuestions[current];
  const selectedAnswer = answers[current];
  const isAnswered = selectedAnswer !== undefined && selectedAnswer !== null;
  const isMarked = marked.includes(current);

  // ── Select option ────────────────────────────────────────────────────────────
  const handleSelect = (option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [current]: option }));
  };

  // ── Mark for review ──────────────────────────────────────────────────────────
  const toggleMark = () => {
    setMarked((prev) =>
      prev.includes(current) ? prev.filter((i) => i !== current) : [...prev, current]
    );
  };

  // ── Navigation ───────────────────────────────────────────────────────────────
  const goTo = useCallback((idx) => {
    if (idx >= 0 && idx < total) {
      setCurrent(idx);
      setShowPalette(false);
    }
  }, [total]);

  // ── Submit quiz ──────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!confirmSubmit) {
      const unanswered = total - Object.keys(answers).filter(k => answers[k] !== undefined).length;
      if (unanswered > 0) {
        setConfirmSubmit(true);
        return;
      }
    }
    // Calculate results
    let correct = 0;
    shuffledQuestions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    onFinish({ answers, correct, total, quiz });
  };

  // ── Option styling ───────────────────────────────────────────────────────────
  const getOptionClass = (opt) => {
    const base =
      'w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 group flex items-center gap-3';

    if (!isAnswered) {
      return `${base} bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-violet-500/40 cursor-pointer`;
    }

    // Answered state
    if (opt === q.correctAnswer) {
      return `${base} option-correct cursor-default`;
    }
    if (opt === selectedAnswer && opt !== q.correctAnswer) {
      return `${base} option-wrong cursor-default`;
    }
    return `${base} bg-white/5 border-white/10 text-slate-500 cursor-default`;
  };

  const getOptionPrefix = (opt, i) => {
    const letters = ['A', 'B', 'C', 'D'];
    const base = 'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200';

    if (!isAnswered) {
      return <span className={`${base} bg-white/10 text-slate-400 group-hover:bg-violet-500/30 group-hover:text-violet-300`}>{letters[i]}</span>;
    }
    if (opt === q.correctAnswer) {
      return <span className={`${base} bg-emerald-500/40 text-emerald-300`}>{letters[i]}</span>;
    }
    if (opt === selectedAnswer) {
      return <span className={`${base} bg-red-500/40 text-red-300`}>{letters[i]}</span>;
    }
    return <span className={`${base} bg-white/5 text-slate-500`}>{letters[i]}</span>;
  };

  const progress = ((current + 1) / total) * 100;
  const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined).length;

  return (
    <div className="min-h-[calc(100vh-64px)] max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex gap-6">

        {/* ── Main quiz area ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Top bar */}
          <div className="flex items-center justify-between glass-card px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="btn-secondary py-1.5 px-3 text-xs">
                <ChevronLeft className="w-3.5 h-3.5" /> Exit
              </button>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-200 truncate max-w-[160px]">{quiz.title}</p>
                <p className="text-[10px] text-slate-500">{answeredCount}/{total} answered</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Timer totalSeconds={quiz.questions.length * 60} onTimeUp={handleSubmit} />
              <button
                onClick={() => setShowPalette((s) => !s)}
                className="btn-secondary py-1.5 px-3 text-xs sm:hidden"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="progress-bar mb-1">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[10px] text-slate-500 text-right">
              Question {current + 1} of {total}
            </p>
          </div>

          {/* Question card */}
          <div className="glass-card p-5 sm:p-7 animate-slide-up" key={current}>
            {/* Question number + mark */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="badge bg-violet-600/25 border border-violet-500/30 text-violet-300">
                  Q {current + 1}
                </span>
                {isMarked && (
                  <span className="badge bg-amber-500/25 border border-amber-500/30 text-amber-300">
                    <Bookmark className="w-3 h-3 mr-1" /> Marked
                  </span>
                )}
              </div>
              <button
                onClick={toggleMark}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200
                  ${isMarked
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-300 hover:bg-amber-500/30'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/20'
                  }`}
              >
                {isMarked ? <BookmarkX className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                {isMarked ? 'Unmark' : 'Mark Review'}
              </button>
            </div>

            {/* Question text */}
            <p className="text-slate-100 text-base sm:text-lg font-medium leading-relaxed mb-6">
              {q.question}
            </p>

            {/* Options */}
            <div className="space-y-2.5">
              {q.shuffledOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(opt)}
                  className={getOptionClass(opt)}
                  disabled={isAnswered}
                >
                  {getOptionPrefix(opt, i)}
                  <span className="flex-1 text-left">{opt}</span>
                  {isAnswered && opt === q.correctAnswer && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Explanation */}
            {isAnswered && (
              <div className="mt-5 p-4 rounded-xl bg-slate-900/60 border border-white/8 animate-slide-up">
                <p className="text-xs font-semibold text-violet-400 mb-1.5">💡 Explanation</p>
                <p className="text-slate-300 text-sm leading-relaxed">{q.explanation}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <button
              id="prev-btn"
              onClick={() => goTo(current - 1)}
              disabled={current === 0}
              className="btn-secondary"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <button
              id="submit-btn"
              onClick={handleSubmit}
              className={`btn-primary px-5 py-2.5 ${confirmSubmit ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500' : ''}`}
            >
              <Flag className="w-4 h-4" />
              {confirmSubmit ? `Submit Anyway (${total - answeredCount} unanswered)` : 'Submit Quiz'}
            </button>

            <button
              id="next-btn"
              onClick={() => goTo(current + 1)}
              disabled={current === total - 1}
              className="btn-secondary"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Sidebar palette (desktop) ───────────────────────────────────── */}
        <div className="hidden sm:block w-56 flex-shrink-0 space-y-4">
          <QuestionPalette
            total={total}
            answers={answers}
            marked={marked}
            current={current}
            onJump={goTo}
          />
        </div>
      </div>

      {/* Mobile palette overlay */}
      {showPalette && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-end sm:hidden animate-fade-in" onClick={() => setShowPalette(false)}>
          <div className="w-full bg-slate-900 border-t border-white/10 p-4 rounded-t-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-200">Question Palette</h3>
              <button onClick={() => setShowPalette(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <QuestionPalette
              total={total}
              answers={answers}
              marked={marked}
              current={current}
              onJump={goTo}
            />
          </div>
        </div>
      )}
    </div>
  );
}
