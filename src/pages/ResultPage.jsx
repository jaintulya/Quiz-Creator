import { useState } from 'react';
import {
  Trophy, CheckCircle2, XCircle, RotateCcw,
  BookOpen, ChevronLeft, ChevronRight, Star,
  TrendingUp, Target, Sparkles, Award, ArrowLeft,
  Check, HelpCircle, Layers
} from 'lucide-react';

function ScoreRing({ pct }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
      <svg viewBox="0 0 110 110" className="w-full h-full -rotate-90">
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="10"
        />
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: `drop-shadow(0 0 10px ${color}60)`
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {pct}%
        </span>
        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
          Accuracy
        </span>
      </div>
    </div>
  );
}

export default function ResultPage({ result, onRestart, onBack }) {
  const { answers, correct, total, quiz } = result;
  const wrong = total - correct;
  const pct = Math.round((correct / total) * 100);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);

  const grade =
    pct >= 90 ? { label: 'Outstanding Mastery!', desc: 'You nailed virtually every question. Exceptional knowledge!', color: 'text-emerald-400', icon: '🏆', bg: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/30' } :
    pct >= 75 ? { label: 'Great Performance!', desc: 'Solid grasp of the core principles. Well done!', color: 'text-caramel-400', icon: '🎉', bg: 'from-caramel-500/20 to-amber-500/10', border: 'border-caramel-500/30' } :
    pct >= 50 ? { label: 'Good Effort!', desc: 'You passed! A bit more practice will turn this into mastery.', color: 'text-amber-400', icon: '⚡', bg: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/30' } :
                { label: 'Keep Practicing!', desc: 'Review the explanations below to reinforce your understanding.', color: 'text-rose-400', icon: '💡', bg: 'from-rose-500/20 to-pink-500/10', border: 'border-rose-500/30' };


  if (reviewMode) {
    const q = quiz.questions[reviewIdx];
    const selected = answers[reviewIdx];
    const isCorrect = selected === q.correctAnswer;
    const letters = ['A', 'B', 'C', 'D'];

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <button
              onClick={() => setReviewMode(false)}
              className="btn-ghost mb-2 -ml-2 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Score Summary
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Answer <span className="gradient-text">Detailed Review</span>
            </h1>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
            {correct} / {total} Correct
          </span>
        </div>

        {/* Question Selector Pills Grid */}
        <div className="glass-card p-3 sm:p-4 border-white/10">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Question</span>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Correct</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> Wrong</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-700" /> Skipped</span>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
            {quiz.questions.map((_, i) => {
              const ans = answers[i];
              const isQCorrect = ans === quiz.questions[i].correctAnswer;
              const isCurrent = i === reviewIdx;

              let style = 'bg-slate-800 text-slate-400 border-white/5';
              if (isQCorrect) style = 'bg-emerald-600/30 border-emerald-500/40 text-emerald-300';
              else if (ans) style = 'bg-rose-600/30 border-rose-500/40 text-rose-300';

              return (
                <button
                  key={i}
                  onClick={() => setReviewIdx(i)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border text-xs sm:text-sm font-bold shrink-0 transition-all duration-150 flex items-center justify-center
                    ${isCurrent ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-slate-950 scale-105 font-extrabold text-white' : 'hover:scale-105'}
                    ${style}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Review Question Card */}
        <div className="glass-card p-5 sm:p-8 space-y-5 sm:space-y-6 animate-slide-up border-white/10" key={reviewIdx}>
          {/* Status Badge */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`badge border px-3 py-1 text-xs font-bold ${
                isCorrect
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-glow-emerald'
                  : !selected
                    ? 'bg-slate-700/40 border-slate-600 text-slate-300'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              }`}>
                {isCorrect ? '✓ Correct Answer' : !selected ? '⏭ Skipped Question' : '✗ Incorrect Answer'}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Question {reviewIdx + 1} of {total}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-slate-100 font-bold text-lg sm:text-xl leading-relaxed">
            {q.question}
          </h2>

          {/* Option Items */}
          <div className="space-y-2.5">
            {q.options.map((opt, i) => {
              const isCorrectOpt = opt === q.correctAnswer;
              const isSelectedOpt = opt === selected;

              let optionClasses = 'p-3.5 sm:p-4 rounded-xl border text-sm sm:text-base font-medium flex items-center gap-3 transition-all ';
              if (isCorrectOpt) {
                optionClasses += 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30';
              } else if (isSelectedOpt && !isCorrectOpt) {
                optionClasses += 'border-rose-500/50 bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/30';
              } else {
                optionClasses += 'bg-white/[0.02] border-white/5 text-slate-400 opacity-60';
              }

              return (
                <div key={i} className={optionClasses}>
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0
                    ${isCorrectOpt ? 'bg-emerald-500 text-slate-950 font-extrabold' : isSelectedOpt ? 'bg-rose-500 text-white font-extrabold' : 'bg-white/10 text-slate-400'}`}>
                    {letters[i]}
                  </span>
                  <span className="flex-1 text-left leading-relaxed">{opt}</span>
                  {isCorrectOpt && (
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Correct Choice</span>
                    </div>
                  )}
                  {isSelectedOpt && !isCorrectOpt && (
                    <div className="flex items-center gap-1 text-xs font-bold text-rose-400 shrink-0">
                      <XCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Your Pick</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 to-slate-900/60 border border-violet-500/25 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-300">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Explanation & Key Takeaway</span>
            </div>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-normal">
              {q.explanation}
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => setReviewIdx(Math.max(0, reviewIdx - 1))}
              disabled={reviewIdx === 0}
              className="btn-secondary flex-1 sm:flex-initial py-2.5 px-5"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => setReviewIdx(Math.min(total - 1, reviewIdx + 1))}
              disabled={reviewIdx === total - 1}
              className="btn-secondary flex-1 sm:flex-initial py-2.5 px-5"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in space-y-8">

      {/* Hero Celebration Card */}
      <div className={`glass-card p-6 sm:p-10 border rounded-3xl bg-gradient-to-br ${grade.bg} ${grade.border} shadow-2xl relative overflow-hidden text-center sm:text-left`}>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-3xl sm:text-4xl mb-1">
              <span>{grade.icon}</span>
              <span className={`text-2xl sm:text-3xl font-extrabold ${grade.color}`}>
                {grade.label}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {quiz.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-lg">
              {grade.desc}
            </p>
          </div>

          {/* Radial Score Ring */}
          <div className="shrink-0">
            <ScoreRing pct={pct} />
          </div>
        </div>
      </div>

      {/* 4-Card Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-panel p-4 sm:p-5 text-center border-white/10">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
            <Target className="w-4 h-4 text-violet-400" />
            <span>Questions</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Total count</div>
        </div>

        <div className="glass-panel p-4 sm:p-5 text-center border-white/10">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Score Ratio</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-300">{correct}/{total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{pct}% efficiency</div>
        </div>

        <div className="glass-panel p-4 sm:p-5 text-center border-white/10">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Correct</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">{correct}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Correct answers</div>
        </div>

        <div className="glass-panel p-4 sm:p-5 text-center border-white/10">
          <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xs font-semibold mb-1">
            <XCircle className="w-4 h-4" />
            <span>Incorrect</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-300">{wrong}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Missed or skipped</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
        <button
          id="review-btn"
          onClick={() => setReviewMode(true)}
          className="btn-primary-lg w-full sm:flex-1 py-3.5 text-sm sm:text-base shadow-glow-sm"
        >
          <BookOpen className="w-5 h-5" />
          <span>Review Detailed Answers</span>
        </button>

        <button
          id="retake-btn"
          onClick={onRestart}
          className="btn-secondary w-full sm:w-auto px-6 py-3.5 text-sm sm:text-base"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Quiz</span>
        </button>

        <button
          id="back-to-list-btn"
          onClick={onBack}
          className="btn-secondary w-full sm:w-auto px-6 py-3.5 text-sm sm:text-base"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>All Quizzes</span>
        </button>
      </div>

    </div>
  );
}

