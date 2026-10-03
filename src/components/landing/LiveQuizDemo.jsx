import { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Sparkles, HelpCircle, Trophy, ArrowRight } from 'lucide-react';

const DEMO_QUESTIONS = [
  {
    topic: 'Computer Science',
    question: 'What is the time complexity of searching in a balanced Binary Search Tree (AVL/Red-Black)?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correct: 1,
    explanation: 'A balanced BST ensures the height remains O(log n), making search, insertion, and deletion O(log n) operations.',
  },
  {
    topic: 'Web Architecture',
    question: 'Which HTTP method is idempotent and primarily used to update an entire resource?',
    options: ['POST', 'PATCH', 'PUT', 'DELETE'],
    correct: 2,
    explanation: 'PUT replaces the resource entirely and is idempotent (calling it multiple times has the same effect).',
  },
  {
    topic: 'General Science',
    question: 'Which fundamental particle is responsible for carrying the electromagnetic force?',
    options: ['Gluon', 'Photon', 'Graviton', 'Higgs Boson'],
    correct: 1,
    explanation: 'The photon is the gauge boson that mediates electromagnetic interactions throughout the universe.',
  },
];

export default function LiveQuizDemo({ onStartFree }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [streak, setStreak] = useState(1);
  const [answeredCount, setAnsweredCount] = useState(0);

  const currentQ = DEMO_QUESTIONS[currentIndex];
  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === currentQ.correct;

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setAnsweredCount((prev) => prev + 1);
    if (idx === currentQ.correct) {
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setCurrentIndex((prev) => (prev + 1) % DEMO_QUESTIONS.length);
  };

  return (
    <div className="w-full max-w-lg mx-auto glass-card p-5 sm:p-7 border-white/10 shadow-2xl relative overflow-hidden space-y-5 rounded-3xl backdrop-blur-xl">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold text-white uppercase tracking-wider">
            Live Quiz Preview
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#8d877c]">
            {currentQ.topic}
          </span>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#f5ba72] text-[11px] font-bold">
          <Trophy className="w-3 h-3 text-[#f5ba72]" />
          <span>{streak} Streak</span>
        </div>
      </div>

      {/* Question Text */}
      <div className="space-y-1.5">
        <p className="text-xs text-[#8d877c] font-semibold">Question {currentIndex + 1} of {DEMO_QUESTIONS.length}</p>
        <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
          {currentQ.question}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {currentQ.options.map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isThisSelected = selectedOption === idx;
          const isThisCorrect = idx === currentQ.correct;

          let btnClasses = 'border-white/[0.08] bg-white/[0.02] text-[#dedbd3] hover:border-white/20 hover:bg-white/[0.05]';
          if (isAnswered) {
            if (isThisCorrect) {
              btnClasses = 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.15)]';
            } else if (isThisSelected) {
              btnClasses = 'border-rose-500/50 bg-rose-500/15 text-rose-200 font-semibold';
            } else {
              btnClasses = 'border-white/[0.04] bg-transparent text-[#777064] opacity-50';
            }
          }

          return (
            <button
              key={opt}
              onClick={() => handleSelect(idx)}
              disabled={isAnswered}
              className={`w-full p-3 sm:p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between gap-3 transition-all duration-200 ${btnClasses}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                  isAnswered && isThisCorrect
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : isAnswered && isThisSelected
                    ? 'bg-rose-500 text-white'
                    : 'bg-white/5 border border-white/10 text-[#8d877c]'
                }`}>
                  {letter}
                </span>
                <span>{opt}</span>
              </div>

              {isAnswered && isThisCorrect && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {isAnswered && isThisSelected && !isThisCorrect && (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Box */}
      {isAnswered && (
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5 animate-slide-up">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            {isCorrect ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer!
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Nice try! Correct is option {String.fromCharCode(65 + currentQ.correct)}
              </span>
            )}
          </div>
          <p className="text-xs text-[#a39e94] leading-relaxed">
            {currentQ.explanation}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="pt-2 flex items-center justify-between gap-3">
        {isAnswered ? (
          <button
            onClick={handleNext}
            className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Next Question</span>
          </button>
        ) : (
          <span className="text-[11px] text-[#8d877c] italic">
            Select an answer to test your knowledge
          </span>
        )}

        <button
          onClick={onStartFree}
          className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
        >
          <span>Create My Quiz</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
