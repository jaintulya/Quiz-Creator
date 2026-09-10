import { useState, useCallback, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Bookmark, BookmarkX,
  Flag, LayoutGrid, X, CheckCircle2, XCircle, HelpCircle,
  AlertTriangle, Sparkles, Zap, Trophy, BookOpen
} from 'lucide-react';
import QuestionPalette from '../components/quiz/QuestionPalette.jsx';
import Timer from '../components/quiz/Timer.jsx';

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

  // Solution Mode state: null (initial popup), 'instant' (after each question), 'at_end' (solutions at the end)
  const [solutionMode, setSolutionMode] = useState(null);

  // State
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // { [index]: selectedOption }
  const [marked, setMarked] = useState([]);    // indices
  const [showPalette, setShowPalette] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const q = shuffledQuestions[current];
  const selectedAnswer = answers[current];
  const isAnswered = selectedAnswer !== undefined && selectedAnswer !== null;
  const isMarked = marked.includes(current);

  // ── Select option ────────────────────────────────────────────────────────────
  const handleSelect = useCallback((option) => {
    if (!solutionMode) return;
    setAnswers((prev) => ({ ...prev, [current]: option }));
  }, [current, solutionMode]);

  // ── Navigation ───────────────────────────────────────────────────────────────
  const goTo = useCallback((idx) => {
    if (idx >= 0 && idx < total) {
      setCurrent(idx);
      setShowPalette(false);
    }
  }, [total]);

  // ── Keyboard navigation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (showHelp || showConfirmModal || !solutionMode || !q) return;
    const options = q.shuffledOptions;
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
      const keyPressed = e.key.toLowerCase();
      if (keyPressed === 'arrowright') {
        e.preventDefault();
        goTo(current + 1);
      } else if (keyPressed === 'arrowleft') {
        e.preventDefault();
        goTo(current - 1);
      } else if (solutionMode === 'at_end' || !isAnswered) {
        if (keyPressed === 'a' && options[0]) {
          e.preventDefault();
          handleSelect(options[0]);
        } else if (keyPressed === 'b' && options[1]) {
          e.preventDefault();
          handleSelect(options[1]);
        } else if (keyPressed === 'c' && options[2]) {
          e.preventDefault();
          handleSelect(options[2]);
        } else if (keyPressed === 'd' && options[3]) {
          e.preventDefault();
          handleSelect(options[3]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [current, showHelp, showConfirmModal, solutionMode, q, goTo, handleSelect, isAnswered]);

  // ── Mark for review ──────────────────────────────────────────────────────────
  const toggleMark = () => {
    setMarked((prev) =>
      prev.includes(current) ? prev.filter((i) => i !== current) : [...prev, current]
    );
  };

  // ── Submit quiz ──────────────────────────────────────────────────────────────
  const triggerSubmit = () => {
    const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined).length;
    if (answeredCount < total) {
      setShowConfirmModal(true);
      return;
    }
    finalizeSubmit();
  };

  const finalizeSubmit = () => {
    let correct = 0;
    shuffledQuestions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    onFinish({ answers, correct, total, quiz });
  };

  // ── Option styling ───────────────────────────────────────────────────────────
  const getOptionClass = (opt) => {
    const base =
      'w-full text-left px-4 py-3.5 sm:py-4 rounded-xl border text-sm sm:text-base font-medium transition-all duration-200 group flex items-center gap-3 relative';

    // Exam mode: Solution at end (No spoiler styling, just selected highlight)
    if (solutionMode === 'at_end') {
      if (opt === selectedAnswer) {
        return `${base} bg-[#2c2214] border-[#f5ba72] text-white shadow-caramel-glow ring-1 ring-[#f5ba72]/60 cursor-pointer`;
      }
      return `${base} bg-[#161412] border-white/10 text-[#dedbd3] hover:bg-white/[0.06] hover:border-caramel-500/40 hover:text-white cursor-pointer active:scale-[0.99]`;
    }

    // Instant Feedback Mode
    if (!isAnswered) {
      return `${base} bg-[#161412] border-white/10 text-[#dedbd3] hover:bg-white/[0.06] hover:border-caramel-500/40 hover:text-white cursor-pointer active:scale-[0.99]`;
    }

    if (opt === q.correctAnswer) {
      return `${base} option-correct cursor-default ring-1 ring-emerald-400/50`;
    }
    if (opt === selectedAnswer && opt !== q.correctAnswer) {
      return `${base} option-wrong cursor-default ring-1 ring-rose-400/50`;
    }
    return `${base} bg-[#100f0e] border-white/5 text-[#6c665d] cursor-not-allowed opacity-40`;
  };

  const getOptionPrefix = (opt, i) => {
    const letters = ['A', 'B', 'C', 'D'];
    const base = 'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200';

    if (solutionMode === 'at_end') {
      if (opt === selectedAnswer) {
        return (
          <span className={`${base} bg-[#f5ba72] text-[#1b1206] font-extrabold shadow-caramel-glow`}>
            {letters[i]}
          </span>
        );
      }
      return (
        <span className={`${base} bg-white/10 text-slate-300 group-hover:bg-caramel-500 group-hover:text-slate-950 group-hover:shadow-caramel-glow`}>
          {letters[i]}
        </span>
      );
    }

    if (!isAnswered) {
      return (
        <span className={`${base} bg-white/10 text-slate-300 group-hover:bg-caramel-500 group-hover:text-slate-950 group-hover:shadow-caramel-glow`}>
          {letters[i]}
        </span>
      );
    }
    if (opt === q.correctAnswer) {
      return (
        <span className={`${base} bg-emerald-500 text-slate-950 font-extrabold shadow-emerald-glow`}>
          {letters[i]}
        </span>
      );
    }
    if (opt === selectedAnswer) {
      return (
        <span className={`${base} bg-rose-500 text-white font-extrabold`}>
          {letters[i]}
        </span>
      );
    }
    return <span className={`${base} bg-white/5 text-slate-600`}>{letters[i]}</span>;
  };

  const progress = ((current + 1) / total) * 100;
  const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined).length;
  const unansweredCount = total - answeredCount;

  return (
    <div className="min-h-[calc(100vh-72px)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in flex flex-col justify-between relative">

      {/* ── Solution Mode Selector Popup (On Quiz Start) ── */}
      {!solutionMode && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-fade-in">
          <div
            className="w-full max-w-md bg-[#161412] border border-[#f5ba72]/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#f5ba72]/15 border border-[#f5ba72]/30 flex items-center justify-center mx-auto text-[#f5ba72] shadow-caramel-glow">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Choose Quiz Mode
              </h2>
              <p className="text-xs sm:text-sm text-[#a39e94] max-w-xs mx-auto">
                How would you like answers and explanations to be revealed?
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {/* Option 1: Solutions at the end */}
              <button
                onClick={() => setSolutionMode('at_end')}
                className="w-full text-left p-4 rounded-2xl bg-white/[0.03] hover:bg-[#f5ba72]/10 border border-white/10 hover:border-[#f5ba72]/50 transition-all duration-200 group flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 group-hover:scale-105 transition-transform mt-0.5">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white group-hover:text-[#f5ba72] transition-colors flex items-center gap-1.5">
                    <span>Solution at End</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Exam Mode
                    </span>
                  </h3>
                  <p className="text-xs text-[#8d877c] mt-1 leading-relaxed">
                    Select your answers without spoilers. Full score and complete solutions are revealed at the end.
                  </p>
                </div>
              </button>

              {/* Option 2: After every question */}
              <button
                onClick={() => setSolutionMode('instant')}
                className="w-full text-left p-4 rounded-2xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/50 transition-all duration-200 group flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-105 transition-transform mt-0.5">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <span>After Every Question</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Instant Feedback
                    </span>
                  </h3>
                  <p className="text-xs text-[#8d877c] mt-1 leading-relaxed">
                    See correct/incorrect feedback and detailed explanation immediately after each choice.
                  </p>
                </div>
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={onBack}
                className="btn-ghost text-xs text-[#8d877c] hover:text-white"
              >
                ← Cancel and go back
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Main Quiz Player ───────────────────────────────────────────── */}
        <div className="w-full flex-1 min-w-0 space-y-5">

          {/* Top Control Bar */}
          <div className="glass-card px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between gap-3 border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onBack}
                className="btn-secondary py-1.5 px-3 text-xs shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Exit</span>
              </button>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-xs md:max-w-md" title={quiz.title}>
                  {quiz.title}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[11px] text-[#a39e94] font-medium">
                    {answeredCount} of {total} answered
                  </p>
                  {solutionMode && (
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-white/[0.05] border border-white/10 text-caramel-400">
                      {solutionMode === 'at_end' ? 'Solution at End' : 'Instant Feedback'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {solutionMode && (
                <Timer totalSeconds={quiz.questions.length * 60} onTimeUp={finalizeSubmit} />
              )}

              <button
                onClick={() => setShowHelp((s) => !s)}
                className="btn-ghost p-2 text-[#a39e94] hover:text-white"
                title="Keyboard Shortcuts"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowPalette((s) => !s)}
                className="btn-secondary py-1.5 px-3 text-xs lg:hidden flex items-center gap-1.5"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-caramel-400" />
                <span className="hidden sm:inline">Palette</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="progress-bar mb-1.5">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#a39e94] px-1">
              <span>Question {current + 1} of {total}</span>
              <span className="text-caramel-400">{Math.round(progress)}% Complete</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="glass-card p-5 sm:p-8 animate-slide-up border-white/10" key={current}>
            {/* Header: Question tag + bookmark */}
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="badge bg-caramel-500/15 border border-caramel-500/30 text-caramel-300 text-xs py-1 px-3 font-bold">
                  Question {current + 1}
                </span>
                {isMarked && (
                  <span className="badge bg-amber-500/20 border border-amber-500/30 text-amber-300">
                    <Bookmark className="w-3 h-3 fill-amber-400 text-amber-400" />
                    Review Later
                  </span>
                )}
              </div>

              <button
                onClick={toggleMark}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200
                  ${isMarked
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm'
                    : 'bg-white/[0.04] border-white/10 text-[#a39e94] hover:text-amber-300 hover:bg-amber-500/10'
                  }`}
              >
                {isMarked ? <BookmarkX className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{isMarked ? 'Unmark' : 'Mark for Review'}</span>
              </button>
            </div>

            {/* Question Text */}
            <h3 className="text-white text-lg sm:text-xl font-bold leading-relaxed mb-6 sm:mb-8">
              {q.question}
            </h3>

            {/* Options List */}
            <div className="space-y-3">
              {q.shuffledOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(opt)}
                  className={getOptionClass(opt)}
                  disabled={solutionMode === 'instant' && isAnswered}
                >
                  {getOptionPrefix(opt, i)}
                  <span className="flex-1 text-left leading-relaxed">{opt}</span>

                  {/* Instant Mode correct/wrong badges */}
                  {solutionMode === 'instant' && isAnswered && opt === q.correctAnswer && (
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span className="hidden sm:inline">Correct</span>
                    </div>
                  )}
                  {solutionMode === 'instant' && isAnswered && opt === selectedAnswer && opt !== q.correctAnswer && (
                    <div className="flex items-center gap-1 text-xs font-bold text-rose-400">
                      <XCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="hidden sm:inline">Incorrect</span>
                    </div>
                  )}

                  {/* Solutions at end mode selected indicator */}
                  {solutionMode === 'at_end' && opt === selectedAnswer && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#f5ba72]">
                      <span className="w-2 h-2 rounded-full bg-[#f5ba72] shadow-caramel-glow" />
                      <span className="text-[11px] uppercase tracking-wide">Selected</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Instant Explanation Reveal (ONLY shown in instant feedback mode) */}
            {solutionMode === 'instant' && isAnswered && (
              <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-[#1e1b17] border border-caramel-500/25 animate-slide-up space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-caramel-400">
                  <Sparkles className="w-4 h-4 text-caramel-400" />
                  <span>Explanation</span>
                </div>
                <p className="text-[#dedbd3] text-xs sm:text-sm leading-relaxed">
                  {q.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Desktop & Tablet Bottom Navigation Bar */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              id="prev-btn"
              onClick={() => goTo(current - 1)}
              disabled={current === 0}
              className="btn-secondary py-2.5 px-4"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <button
              id="submit-btn"
              onClick={triggerSubmit}
              className="btn-primary py-2.5 px-5 sm:px-7 shadow-glow-sm"
            >
              <Flag className="w-4 h-4" />
              <span>Submit Quiz</span>
            </button>

            <button
              id="next-btn"
              onClick={() => goTo(current + 1)}
              disabled={current === total - 1}
              className="btn-secondary py-2.5 px-4"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* ── Sidebar Palette (Desktop 1024px+) ───────────────────────────── */}
        <div className="hidden lg:block w-72 shrink-0 sticky top-24">
          <QuestionPalette
            total={total}
            answers={answers}
            marked={marked}
            current={current}
            onJump={goTo}
          />
        </div>

      </div>

      {/* Mobile / Tablet Palette Drawer Modal */}
      {showPalette && (
        <div
          className="fixed inset-0 z-50 modal-backdrop flex items-end lg:hidden animate-fade-in"
          onClick={() => setShowPalette(false)}
        >
          <div
            className="w-full bg-[#141210] border-t border-white/15 p-5 rounded-t-3xl shadow-2xl animate-slide-up max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-caramel-400" />
                Question Palette
              </h3>
              <button
                onClick={() => setShowPalette(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
              >
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

      {/* Submit Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="w-full max-w-md bg-[#161412] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl animate-slide-up space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Ready to Submit?</h3>
                <p className="text-xs sm:text-sm text-[#a39e94] mt-1 leading-relaxed">
                  You still have <strong className="text-amber-300">{unansweredCount} unanswered</strong> question{unansweredCount > 1 ? 's' : ''}. Unanswered questions will be marked as incorrect.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs text-[#dedbd3]">
              <span>Answered: <strong className="text-emerald-400">{answeredCount}/{total}</strong></span>
              <span>Pending: <strong className="text-amber-400">{unansweredCount}</strong></span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary flex-1 py-2.5 text-sm"
              >
                Keep Playing
              </button>
              <button
                onClick={finalizeSubmit}
                className="btn-primary flex-1 py-2.5 text-sm font-bold"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Controls Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="w-full max-w-sm bg-[#161412] border border-white/15 rounded-3xl p-6 shadow-2xl animate-slide-up space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-caramel-400" />
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03]">
                <span className="text-slate-300">Next Question</span>
                <kbd className="px-2 py-1 rounded bg-white/10 text-slate-200 font-mono font-bold">→</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03]">
                <span className="text-slate-300">Previous Question</span>
                <kbd className="px-2 py-1 rounded bg-white/10 text-slate-200 font-mono font-bold">←</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03]">
                <span className="text-slate-300">Choose Option A</span>
                <kbd className="px-2 py-1 rounded bg-white/10 text-slate-200 font-mono font-bold">A</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03]">
                <span className="text-slate-300">Choose Option B</span>
                <kbd className="px-2 py-1 rounded bg-white/10 text-slate-200 font-mono font-bold">B</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03]">
                <span className="text-slate-300">Choose Option C</span>
                <kbd className="px-2 py-1 rounded bg-white/10 text-slate-200 font-mono font-bold">C</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03]">
                <span className="text-slate-300">Choose Option D</span>
                <kbd className="px-2 py-1 rounded bg-white/10 text-slate-200 font-mono font-bold">D</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
