import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Bookmark, BookmarkX,
  Flag, LayoutGrid, X, CheckCircle2, XCircle, HelpCircle,
  AlertTriangle, Sparkles, Zap, Trophy, BookOpen, Volume2, VolumeX,
  Heart, RotateCw, Check, ArrowRight, ArrowLeft, RefreshCw,
  Play, Clock, Timer as TimerIcon
} from 'lucide-react';
import QuestionPalette from '../components/quiz/QuestionPalette.jsx';
import Timer from '../components/quiz/Timer.jsx';
import { sounds } from '../utils/soundEffects.js';
import { recordQuizSession } from '../services/gamificationService.js';
import { saveQuizResult } from '../services/resultsService.js';
import { useAuth } from '../context/AuthContext.jsx';

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function QuizPlayer({ quiz, initialMode = null, onFinish, onBack }) {
  const { user } = useAuth();
  const total = quiz.questions.length;

  // Shuffle ONLY options on quiz start (Question order remains exact as created!)
  const [shuffledQuestions] = useState(() =>
    quiz.questions.map((q) => {
      // Find correct answer text robustly
      let correctText = '';
      if (typeof q.correctAnswer === 'number' && q.options[q.correctAnswer] !== undefined) {
        correctText = q.options[q.correctAnswer];
      } else if (typeof q.correctAnswer === 'string' && q.correctAnswer.trim()) {
        correctText = q.correctAnswer.trim();
      } else if (typeof q.correct === 'number' && q.options[q.correct] !== undefined) {
        correctText = q.options[q.correct];
      } else if (typeof q.correct === 'string' && q.correct.trim()) {
        correctText = q.correct.trim();
      } else if (typeof q.answer === 'number' && q.options[q.answer] !== undefined) {
        correctText = q.options[q.answer];
      } else if (typeof q.answer === 'string' && q.answer.trim()) {
        correctText = q.answer.trim();
      } else {
        correctText = q.options[0] || '';
      }

      // Shuffle ONLY the options (A, B, C, D)
      const shuffled = shuffleArray(q.options);
      const newCorrectIdx = shuffled.indexOf(correctText);

      return {
        ...q,
        shuffledOptions: shuffled,
        correctAnswerText: correctText,
        correctAnswerIndex: newCorrectIdx >= 0 ? newCorrectIdx : 0,
      };
    })
  );

  // Mode selection & Launch flow
  const [selectedMode, setSelectedMode] = useState(initialMode || quiz?.initialMode || 'at_end');
  const [isStarted, setIsStarted] = useState(Boolean(initialMode || quiz?.initialMode));
  const [solutionMode, setSolutionMode] = useState(initialMode || quiz?.initialMode || null);

  // Timer Configuration State: 'none' (Stopwatch from 00:00) | 'timed' (Countdown from limit to 00:00)
  const [timerType, setTimerType] = useState('none');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(10);
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState('10');

  useEffect(() => {
    if (initialMode || quiz?.initialMode) {
      const mode = initialMode || quiz?.initialMode;
      setSelectedMode(mode);
      setSolutionMode(mode);
      setIsStarted(true);
    }
  }, [initialMode, quiz?.initialMode]);

  // Audio mute state
  const [isMuted, setIsMuted] = useState(() => sounds.isMuted());

  // State
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // { [index]: selectedOption }
  const [marked, setMarked] = useState([]);    // indices
  const [showPalette, setShowPalette] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Survival Mode State
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);

  // Flashcards State
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState([]); // indices of cards marked as "Known"

  // Time tracking
  const startTimeRef = useRef(Date.now());

  const q = shuffledQuestions[current];
  const selectedAnswer = answers[current];
  const isAnswered = selectedAnswer !== undefined && selectedAnswer !== null;
  const isMarked = marked.includes(current);

  const toggleSound = () => {
    const newMuted = sounds.toggleMute();
    setIsMuted(newMuted);
  };

  // ── Select option ────────────────────────────────────────────────────────────
  const handleSelect = useCallback((option) => {
    if (!solutionMode || isGameOver) return;
    if (solutionMode === 'instant' && isAnswered) return; // Prevent changing in instant mode once answered
    if (solutionMode === 'survival' && isAnswered) return;

    const isCorrect = option === q.correctAnswerText;

    // Play synthesized sound
    if (solutionMode !== 'at_end') {
      if (isCorrect) {
        sounds.playCorrect();
      } else {
        sounds.playIncorrect();
        if (solutionMode === 'survival') {
          sounds.playHeartLost();
          setLives((prev) => {
            const nextLives = prev - 1;
            if (nextLives <= 0) {
              setIsGameOver(true);
            }
            return Math.max(0, nextLives);
          });
        }
      }
    }

    setAnswers((prev) => ({ ...prev, [current]: option }));
  }, [current, solutionMode, isAnswered, isGameOver, q]);

  // ── Navigation ───────────────────────────────────────────────────────────────
  const goTo = useCallback((idx) => {
    if (idx >= 0 && idx < total) {
      setCurrent(idx);
      setIsCardFlipped(false);
      setShowPalette(false);
    }
  }, [total]);

  // ── Keyboard navigation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (showHelp || showConfirmModal || !solutionMode || !q || isGameOver) return;
    const options = q.shuffledOptions;

    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
      const keyPressed = e.key.toLowerCase();

      if (solutionMode === 'flashcards') {
        if (e.code === 'Space') {
          e.preventDefault();
          sounds.playFlip();
          setIsCardFlipped((prev) => !prev);
        } else if (keyPressed === 'arrowright') {
          e.preventDefault();
          goTo(current + 1);
        } else if (keyPressed === 'arrowleft') {
          e.preventDefault();
          goTo(current - 1);
        }
        return;
      }

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
  }, [current, showHelp, showConfirmModal, solutionMode, q, goTo, handleSelect, isAnswered, isGameOver]);

  // ── Mark for review ──────────────────────────────────────────────────────────
  const toggleMark = () => {
    setMarked((prev) =>
      prev.includes(current) ? prev.filter((i) => i !== current) : [...prev, current]
    );
  };

  // ── Submit quiz ──────────────────────────────────────────────────────────────
  const triggerSubmit = () => {
    const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined).length;
    if (answeredCount < total && solutionMode !== 'survival') {
      setShowConfirmModal(true);
      return;
    }
    finalizeSubmit();
  };

  const finalizeSubmit = () => {
    let correct = 0;
    shuffledQuestions.forEach((item, i) => {
      if (answers[i] === item.correctAnswerText) correct++;
    });

    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const scorePct = Math.round((correct / total) * 100);

    // Record session for gamification, streak, and badges
    const { newlyUnlocked } = recordQuizSession({
      userId: user?.id,
      score: scorePct,
      totalQuestions: total,
      timeSeconds: elapsedSeconds,
      mode: solutionMode || 'classic',
      livesLeft: lives,
    });

    const isShared = Boolean(
      quiz.isShared ||
      (quiz.userId && user?.id && quiz.userId !== user.id)
    );

    const resultPayload = {
      answers,
      correct,
      total,
      quiz,
      timeSeconds: elapsedSeconds,
      mode: solutionMode,
      livesLeft: lives,
      newlyUnlocked,
      isShared,
      submittedAt: new Date().toISOString(),
    };

    // Automatically save to results history
    saveQuizResult(resultPayload, user?.id);

    onFinish(resultPayload);
  };

  // ── Option styling ───────────────────────────────────────────────────────────
  const getOptionClass = (opt) => {
    const base =
      'w-full text-left px-4 py-3.5 sm:py-4 rounded-xl border text-sm sm:text-base font-medium transition-all duration-200 group flex items-center gap-3 relative';

    // Exam mode: Solution at end (No spoiler styling, just selected highlight)
    if (solutionMode === 'at_end') {
      if (opt === selectedAnswer) {
        return `${base} bg-[#231b12] border-[#f5ba72] text-white ring-1 ring-[#f5ba72]/50 cursor-pointer`;
      }
      return `${base} bg-[#161412] border-white/10 text-[#dedbd3] hover:bg-white/[0.06] hover:border-caramel-500/40 hover:text-white cursor-pointer active:scale-[0.99]`;
    }

    // Instant & Survival Modes
    if (!isAnswered) {
      return `${base} bg-[#161412] border-white/10 text-[#dedbd3] hover:bg-white/[0.06] hover:border-caramel-500/40 hover:text-white cursor-pointer active:scale-[0.99]`;
    }

    if (opt === q.correctAnswerText) {
      return `${base} bg-emerald-500/15 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-400/50`;
    }
    if (opt === selectedAnswer && opt !== q.correctAnswerText) {
      return `${base} bg-rose-500/15 border-rose-500/40 text-rose-300 ring-1 ring-rose-400/50`;
    }
    return `${base} bg-[#100f0e] border-white/5 text-[#6c665d] opacity-40 cursor-not-allowed`;
  };

  const getOptionPrefix = (opt, i) => {
    const letters = ['A', 'B', 'C', 'D'];
    const base = 'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-200';

    if (solutionMode === 'at_end') {
      if (opt === selectedAnswer) {
        return (
          <span className={`${base} bg-[#f5ba72] text-[#1b1206] font-extrabold`}>
            {letters[i]}
          </span>
        );
      }
      return (
        <span className={`${base} bg-white/10 text-slate-300 group-hover:bg-[#f5ba72] group-hover:text-slate-950`}>
          {letters[i]}
        </span>
      );
    }

    if (!isAnswered) {
      return (
        <span className={`${base} bg-white/10 text-slate-300 group-hover:bg-[#f5ba72] group-hover:text-slate-950`}>
          {letters[i]}
        </span>
      );
    }
    if (opt === q.correctAnswerText) {
      return (
        <span className={`${base} bg-emerald-500 text-slate-950 font-extrabold`}>
          <Check className="w-4 h-4" />
        </span>
      );
    }
    if (opt === selectedAnswer) {
      return (
        <span className={`${base} bg-rose-500 text-white font-extrabold`}>
          <X className="w-4 h-4" />
        </span>
      );
    }
    return <span className={`${base} bg-white/5 text-slate-600`}>{letters[i]}</span>;
  };

  const progress = ((current + 1) / total) * 100;
  const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined).length;
  const unansweredCount = total - answeredCount;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in space-y-6 relative">

      {/* ── Mode & Timer Configuration Modal (Before Quiz Start) ── */}
      {!isStarted && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div
            className="w-full max-w-lg bg-[#161412] border border-[#f5ba72]/30 rounded-3xl p-6 sm:p-7 space-y-5 animate-slide-up shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close / Back button */}
            <button
              onClick={onBack}
              className="absolute top-5 right-5 text-[#8d877c] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-[#f5ba72]/15 border border-[#f5ba72]/30 flex items-center justify-center mx-auto text-[#f5ba72]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Configure Quiz Session
              </h2>
              <p className="text-xs text-[#a39e94] max-w-sm mx-auto">
                {quiz.title} • {total} Questions
              </p>
            </div>

            {/* 1. Select Study Mode */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider block">
                1. Select Challenge Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    id: 'at_end',
                    title: 'Standard Exam',
                    desc: 'Real exam conditions. Answers revealed at end.',
                    icon: BookOpen,
                    color: 'text-amber-400',
                    bg: 'bg-amber-500/15',
                  },
                  {
                    id: 'instant',
                    title: 'Instant Learning',
                    desc: 'Instant audio feedback & explanations.',
                    icon: Zap,
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/15',
                  },
                  {
                    id: 'survival',
                    title: 'Survival (3 Lives)',
                    desc: 'One wrong answer costs 1 life. Finish alive!',
                    icon: Heart,
                    color: 'text-rose-400',
                    bg: 'bg-rose-500/15',
                  },
                  {
                    id: 'flashcards',
                    title: 'Flashcard Flip',
                    desc: 'Flip questions & memorize key concepts.',
                    icon: RotateCw,
                    color: 'text-sky-400',
                    bg: 'bg-sky-500/15',
                  },
                ].map((mode) => {
                  const isSelected = selectedMode === mode.id;
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setSelectedMode(mode.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-[#f5ba72]/10 border-[#f5ba72]/60 ring-1 ring-[#f5ba72]/40'
                          : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl ${mode.bg} flex items-center justify-center shrink-0 ${mode.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#dedbd3]'}`}>
                            {mode.title}
                          </h4>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#f5ba72]" />}
                        </div>
                        <p className="text-[10px] text-[#8d877c] mt-0.5 leading-tight">
                          {mode.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Timer & Limit Configuration (Disabled for Flashcards) */}
            {selectedMode !== 'flashcards' && (
              <div className="space-y-2.5 pt-2 border-t border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#f5ba72]" />
                    <span>2. Time Limit Setting</span>
                  </label>
                  <span className="text-[11px] text-[#f5ba72] font-semibold">
                    {timerType === 'none' ? 'Stopwatch (00:00 ↑)' : `${timeLimitMinutes} min countdown (00:00 ↓)`}
                  </span>
                </div>

                {/* Segmented Controller: No Limit vs Timed Limit */}
                <div className="grid grid-cols-2 p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setTimerType('none')}
                    className={`py-2 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      timerType === 'none'
                        ? 'bg-[#f5ba72] text-[#1b1206] shadow-sm font-bold'
                        : 'text-[#a39e94] hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>No Limit (Start from 0)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimerType('timed')}
                    className={`py-2 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      timerType === 'timed'
                        ? 'bg-[#f5ba72] text-[#1b1206] shadow-sm font-bold'
                        : 'text-[#a39e94] hover:text-white'
                    }`}
                  >
                    <TimerIcon className="w-3.5 h-3.5" />
                    <span>Timed Countdown (to 0)</span>
                  </button>
                </div>

                {/* If Timed Countdown is selected */}
                {timerType === 'timed' && (
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2.5 animate-fade-in">
                    <div className="flex items-center justify-between text-[11px] text-[#a39e94]">
                      <span>Pick countdown duration:</span>
                      <span className="text-rose-400 font-medium">Auto-submits when time expires</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[3, 5, 10, 15, 20].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => {
                            setTimeLimitMinutes(mins);
                            setIsCustomTime(false);
                          }}
                          className={`py-1.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                            !isCustomTime && timeLimitMinutes === mins
                              ? 'bg-amber-500/20 border-[#f5ba72] text-[#f5ba72] font-bold'
                              : 'bg-white/[0.03] border-white/10 text-[#8d877c] hover:text-white'
                          }`}
                        >
                          {mins} mins
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => setIsCustomTime(true)}
                        className={`py-1.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                          isCustomTime
                            ? 'bg-amber-500/20 border-[#f5ba72] text-[#f5ba72] font-bold'
                            : 'bg-white/[0.03] border-white/10 text-[#8d877c] hover:text-white'
                        }`}
                      >
                        Custom
                      </button>
                    </div>

                    {isCustomTime && (
                      <div className="flex items-center gap-2 pt-1 animate-fade-in">
                        <label className="text-xs text-[#8d877c]">Minutes:</label>
                        <input
                          type="number"
                          min="1"
                          max="180"
                          value={customTimeInput}
                          onChange={(e) => {
                            setCustomTimeInput(e.target.value);
                            const val = parseInt(e.target.value, 10);
                            if (val > 0) setTimeLimitMinutes(val);
                          }}
                          className="input-field text-xs py-1.5 px-2.5 w-24 text-center font-bold"
                        />
                        <span className="text-xs text-[#8d877c]">
                          ({timeLimitMinutes * 60} seconds)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Launch CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSolutionMode(selectedMode);
                  startTimeRef.current = Date.now();
                  setIsStarted(true);
                }}
                className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  Start Quiz
                  {selectedMode === 'flashcards'
                    ? ' (Flashcard Mode)'
                    : timerType === 'timed'
                    ? ` (${timeLimitMinutes}m Countdown)`
                    : ' (Stopwatch Mode)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Game Over Screen for Survival Mode ── */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#161412] border border-rose-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-5 animate-slide-up shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <Heart className="w-8 h-8 fill-rose-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">GAME OVER</h2>
              <p className="text-xs sm:text-sm text-[#8d877c] mt-1">
                You ran out of lives on Question {current + 1} of {total}.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  setLives(3);
                  setIsGameOver(false);
                  setCurrent(0);
                  setAnswers({});
                }}
                className="btn-primary flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={triggerSubmit}
                className="btn-secondary flex-1 py-3 text-xs font-bold"
              >
                See Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Quiz Interface ── */}
      <div className="space-y-6">

        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              title="Exit Quiz"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {quiz.title}
              </h1>
              <span className="text-[11px] text-[#8d877c]">
                {solutionMode === 'survival' ? 'Survival Challenge' : solutionMode === 'flashcards' ? 'Flashcard Mode' : 'QuizCraft Assessment'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Lives counter for Survival mode */}
            {solutionMode === 'survival' && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 transition-transform ${
                      i < lives ? 'fill-rose-500 text-rose-500 scale-100' : 'text-slate-600 scale-75 opacity-30'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#f5ba72]" />}
            </button>

            {/* Timer (Classic, Instant & Survival modes) */}
            {solutionMode !== 'flashcards' && (
              <Timer
                mode={timerType === 'timed' && timeLimitMinutes > 0 ? 'countdown' : 'countup'}
                totalSeconds={timerType === 'timed' ? timeLimitMinutes * 60 : null}
                onTimeUp={triggerSubmit}
              />
            )}

            {/* Finish Quiz Button */}
            {solutionMode !== 'flashcards' && (
              <button
                onClick={triggerSubmit}
                className="btn-primary py-2 px-3.5 sm:px-4 text-xs font-bold"
              >
                Submit
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#8d877c] font-semibold">
            <span>Question {current + 1} of {total}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#f5ba72] to-[#ff9f1c] transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ── FLASHCARD MODE VIEW ── */}
        {solutionMode === 'flashcards' ? (
          <div className="py-6 max-w-2xl mx-auto space-y-6">
            <div
              onClick={() => {
                sounds.playFlip();
                setIsCardFlipped(!isCardFlipped);
              }}
              className="cursor-pointer min-h-[300px] p-8 rounded-3xl bg-gradient-to-br from-[#1a1714] to-[#12100e] border border-[#f5ba72]/30 shadow-2xl flex flex-col justify-between relative transition-transform hover:scale-[1.01] active:scale-[0.99] select-none"
            >
              <div className="flex items-center justify-between text-xs text-[#8d877c]">
                <span className="font-bold uppercase tracking-wider text-[#f5ba72] flex items-center gap-1.5">
                  {isCardFlipped ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Answer & Key Concept
                    </>
                  ) : (
                    <>
                      <HelpCircle className="w-3.5 h-3.5 text-[#f5ba72]" /> Question Card
                    </>
                  )}
                </span>
                <span className="text-[11px] flex items-center gap-1 text-[#a39e94]">
                  Click or Space to Flip <RotateCw className="w-3 h-3 text-[#f5ba72]" />
                </span>
              </div>

              <div className="my-auto text-center py-6">
                {!isCardFlipped ? (
                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                    {q.question}
                  </h2>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5" /> Correct: {q.correctAnswerText}
                    </span>
                    <p className="text-sm text-[#dedbd3] max-w-lg mx-auto leading-relaxed">
                      {q.explanation || 'Review the core principle above.'}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-center text-[11px] text-[#797368]">
                Card {current + 1} of {total}
              </div>
            </div>

            {/* Flashcard Navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => goTo(current - 1)}
                disabled={current === 0}
                className="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-2 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => {
                  sounds.playFlip();
                  setIsCardFlipped(!isCardFlipped);
                }}
                className="btn-secondary py-2.5 px-5 text-xs font-bold flex items-center gap-2"
              >
                <RotateCw className="w-4 h-4 text-[#f5ba72]" />
                <span>Flip Card</span>
              </button>

              {current === total - 1 ? (
                <button
                  onClick={onBack}
                  className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Finish Flashcards</span>
                </button>
              ) : (
                <button
                  onClick={() => goTo(current + 1)}
                  className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ── STANDARD / INSTANT / SURVIVAL QUIZ VIEW ── */
          <div className="grid lg:grid-cols-4 gap-6">

            {/* Question & Options Area */}
            <div className="lg:col-span-3 space-y-6">
              <div className="glass-card p-6 sm:p-8 border-white/10 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-bold text-[#f5ba72] uppercase tracking-wider">
                    Question {current + 1}
                  </span>
                  <button
                    onClick={toggleMark}
                    className={`btn-ghost py-1 px-2.5 text-xs flex items-center gap-1.5 ${
                      isMarked ? 'text-amber-400' : 'text-[#8d877c]'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{isMarked ? 'Bookmarked' : 'Review Later'}</span>
                  </button>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                  {q.question}
                </h2>

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  {q.shuffledOptions.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(opt)}
                      className={getOptionClass(opt)}
                    >
                      {getOptionPrefix(opt, i)}
                      <span className="flex-1">{opt}</span>
                    </button>
                  ))}
                </div>

                {/* Explanation in Instant & Survival mode */}
                {solutionMode !== 'at_end' && isAnswered && q.explanation && (
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#dedbd3] animate-fade-in space-y-1.5">
                    <span className="font-bold text-[#f5ba72] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Key Explanation:
                    </span>
                    <p className="leading-relaxed text-[#a39e94]">{q.explanation}</p>
                  </div>
                )}
              </div>

              {/* Prev / Next Bottom Controls */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => goTo(current - 1)}
                  disabled={current === 0}
                  className="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {current < total - 1 ? (
                  <button
                    onClick={() => goTo(current + 1)}
                    className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-1.5 shadow-caramel-glow"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={triggerSubmit}
                    className="btn-primary py-2.5 px-6 text-xs font-extrabold shadow-caramel-glow"
                  >
                    Finish & View Score
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar Palette */}
            <div className="hidden lg:block lg:col-span-1">
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

      {/* ── Unanswered Warning Modal ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#161412] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4 animate-slide-up text-center">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-white">Unanswered Questions</h3>
              <p className="text-xs text-[#8d877c] mt-1">
                You have {unansweredCount} unanswered questions remaining. Are you sure you want to finish?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary flex-1 py-2 text-xs font-bold"
              >
                Keep Answering
              </button>
              <button
                onClick={finalizeSubmit}
                className="btn-primary flex-1 py-2 text-xs font-bold"
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
