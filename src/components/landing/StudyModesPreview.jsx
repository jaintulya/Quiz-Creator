import { useState, useEffect } from 'react';
import {
  BookOpen, Flame, RotateCw, Heart, HeartCrack, CheckCircle2,
  XCircle, Clock, Bookmark, Sparkles, ArrowRight, RotateCcw,
  Zap, Award, HelpCircle, X, ThumbsUp, Check
} from 'lucide-react';

/* ── Classic Mode Sample Questions ── */
const CLASSIC_SAMPLES = [
  {
    q: 'Which data structure operates on a Last-In, First-Out (LIFO) order?',
    options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
    correct: 1,
    explanation: 'A Stack strictly inserts and removes elements from the same end (top), adhering to LIFO principle.',
    paceAvg: '3.2s',
  },
  {
    q: 'What is the worst-case time complexity of QuickSort?',
    options: ['O(n log n)', 'O(n²)', 'O(log n)', 'O(n)'],
    correct: 1,
    explanation: 'When the chosen pivot is consistently the smallest or largest element, QuickSort degrades to O(n²).',
    paceAvg: '4.1s',
  },
];

/* ── Survival Mode Sample Questions ── */
const SURVIVAL_SAMPLES = [
  {
    q: 'What is the hardest naturally occurring mineral on Earth?',
    options: ['Titanium', 'Diamond', 'Graphene', 'Tungsten'],
    correct: 1,
    hint: 'Made of pure carbon under extreme mantle pressure.',
  },
  {
    q: 'Which human organ uses approximately 20% of the body\'s total oxygen and energy?',
    options: ['Heart', 'Brain', 'Liver', 'Lungs'],
    correct: 1,
    hint: 'Though it accounts for only ~2% of body mass, its neural networks consume vast ATP.',
  },
  {
    q: 'How many planets in our solar system have planetary ring systems?',
    options: ['1 (Saturn only)', '2', '4 (Jupiter, Saturn, Uranus, Neptune)', '8'],
    correct: 2,
    hint: 'All four giant outer gas and ice planets possess ring systems.',
  },
];

/* ── Flashcard Sample Decks ── */
const FLASHCARD_SAMPLES = [
  {
    term: 'Mitochondria',
    category: 'Cell Biology',
    prompt: 'What is the primary role of mitochondria in eukaryotic cells?',
    back: 'Known as the "Powerhouse of the Cell". Synthesizes ATP (adenosine triphosphate) via oxidative phosphorylation to fuel cellular biochemical processes.',
  },
  {
    term: 'HTTP 429 Status Code',
    category: 'Web Networking',
    prompt: 'What does an HTTP 429 response code signify to a client?',
    back: 'Too Many Requests (Rate Limiting). Indicates the user or client application has sent too many requests in a given amount of time.',
  },
  {
    term: 'Heisenberg Uncertainty Principle',
    category: 'Quantum Physics',
    prompt: 'State the core concept behind Heisenberg\'s uncertainty relation.',
    back: 'It is impossible to simultaneously measure both the exact position (x) and exact momentum (p) of a quantum particle with arbitrary precision (Δx · Δp ≥ ℏ/2).',
  },
];

export default function StudyModesPreview({ onStartMode }) {
  const [activeTab, setActiveTab] = useState('classic');

  /* Classic Mode State */
  const [classicIdx, setClassicIdx] = useState(0);
  const [classicSelected, setClassicSelected] = useState(null);
  const [classicBookmarked, setClassicBookmarked] = useState(false);
  const [classicTimer, setClassicTimer] = useState(0);

  /* Survival Mode State */
  const [survivalIdx, setSurvivalIdx] = useState(0);
  const [survivalLives, setSurvivalLives] = useState(3);
  const [survivalSelected, setSurvivalSelected] = useState(null);
  const [survivalStreak, setSurvivalStreak] = useState(0);

  /* Flashcards State */
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratedFeedback, setRatedFeedback] = useState(null);

  // Timer simulation for Classic Mode
  useEffect(() => {
    if (activeTab !== 'classic' || classicSelected !== null) return;
    const interval = setInterval(() => {
      setClassicTimer((t) => (t < 15 ? +(t + 0.1).toFixed(1) : t));
    }, 100);
    return () => clearInterval(interval);
  }, [activeTab, classicSelected, classicIdx]);

  /* Reset functions */
  const handleClassicOption = (idx) => {
    if (classicSelected !== null) return;
    setClassicSelected(idx);
  };

  const handleNextClassic = () => {
    setClassicSelected(null);
    setClassicBookmarked(false);
    setClassicTimer(0);
    setClassicIdx((prev) => (prev + 1) % CLASSIC_SAMPLES.length);
  };

  const handleSurvivalOption = (idx) => {
    if (survivalSelected !== null || survivalLives <= 0) return;
    setSurvivalSelected(idx);
    const isCorrect = idx === SURVIVAL_SAMPLES[survivalIdx].correct;
    if (isCorrect) {
      setSurvivalStreak((s) => s + 1);
    } else {
      setSurvivalLives((l) => Math.max(0, l - 1));
      setSurvivalStreak(0);
    }
  };

  const handleResetSurvival = () => {
    setSurvivalLives(3);
    setSurvivalStreak(0);
    setSurvivalSelected(null);
    setSurvivalIdx(0);
  };

  const handleNextSurvival = () => {
    setSurvivalSelected(null);
    setSurvivalIdx((prev) => (prev + 1) % SURVIVAL_SAMPLES.length);
  };

  const handleRateFlashcard = (rating) => {
    setRatedFeedback(rating);
    setTimeout(() => {
      setIsFlipped(false);
      setRatedFeedback(null);
      setFlashcardIdx((prev) => (prev + 1) % FLASHCARD_SAMPLES.length);
    }, 350);
  };

  const currentClassic = CLASSIC_SAMPLES[classicIdx];
  const currentSurvival = SURVIVAL_SAMPLES[survivalIdx];
  const currentFlashcard = FLASHCARD_SAMPLES[flashcardIdx];

  return (
    <div className="space-y-8">
      {/* ── Mode Selection Tabs ── */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => setActiveTab('classic')}
          className={`px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all duration-200 border ${
            activeTab === 'classic'
              ? 'bg-[#1e1a15] border-amber-500/40 text-white shadow-lg'
              : 'bg-white/[0.02] border-white/[0.06] text-[#8d877c] hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <BookOpen className={`w-4 h-4 shrink-0 ${activeTab === 'classic' ? 'text-amber-400' : 'text-[#8d877c]'}`} />
          <span>Classic MCQ</span>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
            activeTab === 'classic' ? 'bg-amber-400/20 text-amber-300' : 'bg-white/5 text-[#6c665d]'
          }`}>
            Timed
          </span>
        </button>

        <button
          onClick={() => setActiveTab('survival')}
          className={`px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all duration-200 border ${
            activeTab === 'survival'
              ? 'bg-[#1e1a15] border-rose-500/40 text-white shadow-lg'
              : 'bg-white/[0.02] border-white/[0.06] text-[#8d877c] hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Flame className={`w-4 h-4 shrink-0 ${activeTab === 'survival' ? 'text-rose-400' : 'text-[#8d877c]'}`} />
          <span>Survival Challenge</span>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
            activeTab === 'survival' ? 'bg-rose-500/20 text-rose-300' : 'bg-white/5 text-[#6c665d]'
          }`}>
            3 Hearts
          </span>
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all duration-200 border ${
            activeTab === 'flashcards'
              ? 'bg-[#1e1a15] border-sky-500/40 text-white shadow-lg'
              : 'bg-white/[0.02] border-white/[0.06] text-[#8d877c] hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <RotateCw className={`w-4 h-4 shrink-0 ${activeTab === 'flashcards' ? 'text-sky-400' : 'text-[#8d877c]'}`} />
          <span>Flashcards Review</span>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
            activeTab === 'flashcards' ? 'bg-sky-500/20 text-sky-300' : 'bg-white/5 text-[#6c665d]'
          }`}>
            3D Flip
          </span>
        </button>
      </div>

      {/* ── Main Showcase Container with Live Mini-Preview ── */}
      <div className="glass-card p-5 sm:p-8 rounded-3xl border-white/10 max-w-4xl mx-auto bg-gradient-to-br from-[#161412] to-[#100f0e] shadow-2xl space-y-6">

        {/* ══════════════════════════════════════════════════════════════════════════
            1. CLASSIC MCQ LIVE MINI-PREVIEW
           ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'classic' && (
          <div className="space-y-5 animate-fade-in">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Classic MCQ Mode</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Live Interactive Preview
                    </span>
                  </div>
                  <p className="text-xs text-[#8d877c]">Detailed explanations, mistake tags, and real-time pace metrics.</p>
                </div>
              </div>

              {/* Real-time pace pill */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#dedbd3]">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{classicSelected !== null ? `${classicTimer}s` : `${classicTimer}s`}</span>
                </div>

                <button
                  onClick={() => setClassicBookmarked((b) => !b)}
                  className={`p-2 rounded-xl border text-xs transition-colors flex items-center gap-1 ${
                    classicBookmarked
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-white/5 border-white/10 text-[#8d877c] hover:text-white'
                  }`}
                  title={classicBookmarked ? 'Bookmarked' : 'Bookmark this question'}
                >
                  <Bookmark className="w-3.5 h-3.5" fill={classicBookmarked ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            {/* Question body */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#8d877c]">
                <span>Question {classicIdx + 1} of {CLASSIC_SAMPLES.length}</span>
                {classicSelected !== null && (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Pace: {currentClassic.paceAvg} per question
                  </span>
                )}
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                {currentClassic.q}
              </h4>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {currentClassic.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isChosen = classicSelected === idx;
                  const isRight = idx === currentClassic.correct;

                  let style = 'bg-white/[0.02] border-white/[0.08] text-[#dedbd3] hover:border-amber-400/30 hover:bg-white/[0.04]';
                  if (classicSelected !== null) {
                    if (isRight) {
                      style = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 font-bold';
                    } else if (isChosen) {
                      style = 'bg-rose-500/15 border-rose-500/50 text-rose-200 font-bold';
                    } else {
                      style = 'bg-transparent border-white/[0.04] text-[#6c665d] opacity-40';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleClassicOption(idx)}
                      disabled={classicSelected !== null}
                      className={`p-3 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between gap-2.5 transition-all duration-150 ${style}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 ${
                          classicSelected !== null && isRight
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-white/5 border border-white/10 text-[#8d877c]'
                        }`}>
                          {letter}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {classicSelected !== null && isRight && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation popup */}
              {classicSelected !== null && (
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1 animate-slide-up mt-2">
                  <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Instant Explanation:
                  </p>
                  <p className="text-xs text-[#b5af9f] leading-relaxed">
                    {currentClassic.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom action row */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
              {classicSelected !== null ? (
                <button
                  onClick={handleNextClassic}
                  className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Next Question</span>
                </button>
              ) : (
                <span className="text-[11px] text-[#8d877c] italic">
                  Select an answer above to see live pace and explanations
                </span>
              )}

              <button
                onClick={() => onStartMode && onStartMode('classic')}
                className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-caramel-glow"
              >
                <span>Launch Classic Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            2. SURVIVAL CHALLENGE LIVE MINI-PREVIEW
           ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'survival' && (
          <div className="space-y-5 animate-fade-in">
            {/* Header with 3 Hearts */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Survival Challenge</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/25">
                      High Stakes
                    </span>
                  </div>
                  <p className="text-xs text-[#8d877c]">3 lives only! Each wrong answer costs a heart.</p>
                </div>
              </div>

              {/* 3 Hearts Indicator */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25">
                  {[1, 2, 3].map((heartNum) => {
                    const isAlive = heartNum <= survivalLives;
                    return (
                      <span key={heartNum} className="transition-transform duration-300">
                        {isAlive ? (
                          <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
                        ) : (
                          <HeartCrack className="w-4 h-4 text-zinc-600 opacity-60" />
                        )}
                      </span>
                    );
                  })}
                  <span className="text-[11px] font-mono font-bold text-rose-300 ml-1">
                    {survivalLives} / 3 Lives
                  </span>
                </div>

                <div className="text-[11px] font-bold text-amber-400 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                  {survivalStreak} Streak
                </div>
              </div>
            </div>

            {/* Survival Question */}
            <div className="space-y-3">
              {survivalLives <= 0 ? (
                /* Game Over state */
                <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3">
                  <HeartCrack className="w-8 h-8 text-rose-400 mx-auto" />
                  <h4 className="text-base font-black text-white">Challenge Over! You ran out of hearts.</h4>
                  <p className="text-xs text-[#8d877c]">
                    Survival mode tests pure precision under exam pressure.
                  </p>
                  <button
                    onClick={handleResetSurvival}
                    className="btn-secondary py-2 px-5 text-xs font-bold inline-flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset 3 Lives & Try Again</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-[#8d877c]">
                    <span>Survival Question {survivalIdx + 1} of {SURVIVAL_SAMPLES.length}</span>
                    <span className="text-[11px] text-rose-300/80">Careful: 1 wrong choice loses a life</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {currentSurvival.q}
                  </h4>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {currentSurvival.options.map((opt, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      const isChosen = survivalSelected === idx;
                      const isRight = idx === currentSurvival.correct;

                      let style = 'bg-white/[0.02] border-white/[0.08] text-[#dedbd3] hover:border-rose-400/40 hover:bg-white/[0.04]';
                      if (survivalSelected !== null) {
                        if (isRight) {
                          style = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 font-bold';
                        } else if (isChosen) {
                          style = 'bg-rose-500/20 border-rose-500/60 text-rose-200 font-bold animate-shake';
                        } else {
                          style = 'bg-transparent border-white/[0.04] text-[#6c665d] opacity-40';
                        }
                      }

                      return (
                        <button
                          key={opt}
                          onClick={() => handleSurvivalOption(idx)}
                          disabled={survivalSelected !== null}
                          className={`p-3 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between gap-2.5 transition-all duration-150 ${style}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 ${
                              survivalSelected !== null && isRight
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-white/5 border border-white/10 text-[#8d877c]'
                            }`}>
                              {letter}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {survivalSelected !== null && isRight && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          {survivalSelected !== null && isChosen && !isRight && (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback bar */}
                  {survivalSelected !== null && (
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs flex items-center justify-between gap-2 animate-slide-up mt-2">
                      <span className={survivalSelected === currentSurvival.correct ? 'text-emerald-300 font-bold flex items-center gap-1.5' : 'text-rose-300 font-bold flex items-center gap-1.5'}>
                        {survivalSelected === currentSurvival.correct ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Excellent! Heart protected (+100 Survival XP)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>Heart broken! You lost 1 life.</span>
                          </>
                        )}
                      </span>
                      <button
                        onClick={handleNextSurvival}
                        className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1"
                      >
                        Next Question <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom action row */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
              <span className="text-[11px] text-[#8d877c]">
                Unlock exclusive Immortal & Survivor Champion Badges
              </span>

              <button
                onClick={() => onStartMode && onStartMode('survival')}
                className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-caramel-glow"
              >
                <span>Launch Survival Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            3. FLASHCARDS REVIEW LIVE 3D FLIP MINI-PREVIEW
           ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'flashcards' && (
          <div className="space-y-5 animate-fade-in">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  <RotateCw className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Flashcards Review</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/25">
                      3D Flip Spaced Repetition
                    </span>
                  </div>
                  <p className="text-xs text-[#8d877c]">Active recall flip cards for fast memorization of tricky concepts.</p>
                </div>
              </div>

              <div className="text-xs text-[#8d877c] font-mono">
                Card {flashcardIdx + 1} of {FLASHCARD_SAMPLES.length}
              </div>
            </div>

            {/* Interactive 3D Flip Card */}
            <div
              className="relative w-full h-56 cursor-pointer select-none group [perspective:1000px]"
              style={{ touchAction: 'pan-y' }}
              onClick={() => setIsFlipped((f) => !f)}
              role="button"
              tabIndex={0}
              aria-label="Click to flip flashcard"
            >
              <div
                className="w-full h-full transition-transform duration-500 [transform-style:preserve-3d] relative rounded-2xl"
                style={{
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* ── CARD FRONT ── */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-2xl p-6 border border-white/10 bg-[#191613] flex flex-col justify-between shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#8d877c]">
                      {currentFlashcard.category}
                    </span>
                    <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                      <RotateCw className="w-3 h-3" /> Click to Flip
                    </span>
                  </div>

                  <div className="space-y-2 text-center my-auto">
                    <span className="text-xs text-[#8d877c] uppercase tracking-wider font-semibold">Prompt:</span>
                    <h4 className="text-base sm:text-lg font-bold text-white">
                      {currentFlashcard.prompt}
                    </h4>
                  </div>

                  <div className="text-center text-[11px] text-[#6c665d]">
                    Tap anywhere on card to reveal answer
                  </div>
                </div>

                {/* ── CARD BACK (Flipped) ── */}
                <div
                  className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-2xl p-6 border border-amber-500/30 bg-[#1c1813] flex flex-col justify-between shadow-xl [transform:rotateY(180deg)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                      {currentFlashcard.term}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      Answer Revealed
                    </span>
                  </div>

                  <div className="my-auto space-y-1.5 text-center px-2">
                    <p className="text-xs sm:text-sm text-[#dedbd3] leading-relaxed">
                      {currentFlashcard.back}
                    </p>
                  </div>

                  {/* Recall self-rating buttons */}
                  <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/[0.08]" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] text-[#8d877c] mr-1 hidden sm:inline">Recall confidence:</span>
                    <button
                      onClick={() => handleRateFlashcard('hard')}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-500/25 transition-colors flex items-center gap-1.5"
                    >
                      <span>Hard</span>
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRateFlashcard('good')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/25 transition-colors flex items-center gap-1.5"
                    >
                      <span>Good</span>
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRateFlashcard('easy')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition-colors flex items-center gap-1.5"
                    >
                      <span>Easy</span>
                      <Zap className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom action row */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
              <span className="text-[11px] text-[#8d877c]">
                Active recall & spaced repetition for 3x faster exam prep
              </span>

              <button
                onClick={() => onStartMode && onStartMode('flashcards')}
                className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-caramel-glow"
              >
                <span>Launch Flashcards</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
