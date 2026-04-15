import { useState } from 'react';
import {
  Trophy, CheckCircle, XCircle, RotateCcw,
  BookOpen, ChevronLeft, ChevronRight, Star,
  TrendingUp, Target
} from 'lucide-react';

function ScoreRing({ pct }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease-out', filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{pct}%</span>
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
    pct >= 90 ? { label: 'Excellent!', color: 'text-emerald-400', icon: '🏆' } :
    pct >= 75 ? { label: 'Great Job!', color: 'text-green-400', icon: '🎉' } :
    pct >= 50 ? { label: 'Good Effort!', color: 'text-amber-400', icon: '💪' } :
                { label: 'Keep Practicing!', color: 'text-red-400', icon: '📚' };

  if (reviewMode) {
    const q = quiz.questions[reviewIdx];
    const selected = answers[reviewIdx];
    const isCorrect = selected === q.correctAnswer;
    const letters = ['A', 'B', 'C', 'D'];

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold gradient-text">Review Answers</h1>
          <button onClick={() => setReviewMode(false)} className="btn-secondary py-2">
            <ChevronLeft className="w-4 h-4" /> Back to Results
          </button>
        </div>

        {/* Review question progress */}
        <div className="flex gap-1.5 mb-5 flex-wrap">
          {quiz.questions.map((_, i) => {
            const ans = answers[i];
            const correct = ans === quiz.questions[i].correctAnswer;
            return (
              <button
                key={i}
                onClick={() => setReviewIdx(i)}
                className={`w-8 h-8 rounded-lg border text-xs font-semibold transition-all duration-150 hover:scale-110
                  ${i === reviewIdx ? 'bg-white text-slate-900 border-white' :
                    correct ? 'bg-emerald-600/30 border-emerald-500/40 text-emerald-300' :
                    !ans ? 'bg-white/5 border-white/10 text-slate-400' :
                    'bg-red-600/30 border-red-500/40 text-red-300'
                  }`}
              >{i + 1}</button>
            );
          })}
        </div>

        <div className="glass-card p-6 space-y-5 animate-slide-up" key={reviewIdx}>
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className={`badge border ${isCorrect ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : !selected ? 'bg-slate-500/20 border-slate-500/30 text-slate-300' : 'bg-red-500/20 border-red-500/30 text-red-300'}`}>
              {isCorrect ? '✓ Correct' : !selected ? '⏭ Skipped' : '✗ Wrong'}
            </span>
            <span className="text-xs text-slate-500">Q{reviewIdx + 1} of {total}</span>
          </div>

          {/* Question */}
          <p className="text-slate-100 font-medium text-base leading-relaxed">{q.question}</p>

          {/* Options */}
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const isCorrectOpt = opt === q.correctAnswer;
              const isSelectedOpt = opt === selected;
              let cls = 'flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all duration-150 ';
              if (isCorrectOpt) cls += 'option-correct';
              else if (isSelectedOpt && !isCorrectOpt) cls += 'option-wrong';
              else cls += 'bg-white/5 border-white/10 text-slate-500';

              return (
                <div key={i} className={cls}>
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${isCorrectOpt ? 'bg-emerald-500/40 text-emerald-300' : isSelectedOpt ? 'bg-red-500/40 text-red-300' : 'bg-white/8 text-slate-500'}`}>
                    {letters[i]}
                  </span>
                  <span>{opt}</span>
                  {isCorrectOpt && <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto flex-shrink-0" />}
                  {isSelectedOpt && !isCorrectOpt && <XCircle className="w-4 h-4 text-red-400 ml-auto flex-shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/8">
            <p className="text-xs font-semibold text-violet-400 mb-1.5">💡 Explanation</p>
            <p className="text-slate-300 text-sm leading-relaxed">{q.explanation}</p>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setReviewIdx(Math.max(0, reviewIdx - 1))} disabled={reviewIdx === 0} className="btn-secondary flex-1 justify-center">
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <button onClick={() => setReviewIdx(Math.min(total - 1, reviewIdx + 1))} disabled={reviewIdx === total - 1} className="btn-secondary flex-1 justify-center">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">{grade.icon}</div>
        <h1 className={`text-3xl font-bold mb-1 ${grade.color}`}>{grade.label}</h1>
        <p className="text-slate-400 text-sm">{quiz.title}</p>
      </div>

      {/* Score ring + stats */}
      <div className="glass-card p-6 sm:p-8 mb-5 animate-slide-up">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">

          {/* Ring */}
          <div className="flex flex-col items-center gap-2">
            <ScoreRing pct={pct} />
            <p className="text-xs text-slate-400">Overall Score</p>
          </div>

          {/* Stats grid */}
          <div className="flex-1 grid grid-cols-2 gap-3 w-full">
            {[
              { icon: Target, label: 'Total Qs', value: total, color: 'text-slate-300', bg: 'bg-white/5', border: 'border-white/10' },
              { icon: TrendingUp, label: 'Score', value: `${correct}/${total}`, color: 'text-violet-300', bg: 'bg-violet-600/10', border: 'border-violet-500/20' },
              { icon: CheckCircle, label: 'Correct', value: correct, color: 'text-emerald-300', bg: 'bg-emerald-600/10', border: 'border-emerald-500/20' },
              { icon: XCircle, label: 'Wrong', value: wrong, color: 'text-red-300', bg: 'bg-red-600/10', border: 'border-red-500/20' },
            ].map(({ icon: Icon, label, value, color, bg, border }) => (
              <div key={label} className={`${bg} border ${border} rounded-xl px-4 py-3 text-center`}>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button id="review-btn" onClick={() => setReviewMode(true)} className="btn-secondary flex-1 justify-center py-3">
          <BookOpen className="w-4 h-4" /> Review Answers
        </button>
        <button id="retake-btn" onClick={onRestart} className="btn-primary flex-1 justify-center py-3">
          <RotateCcw className="w-4 h-4" /> Retake Quiz
        </button>
        <button id="back-to-list-btn" onClick={onBack} className="btn-secondary flex-1 justify-center py-3">
          <ChevronLeft className="w-4 h-4" /> All Quizzes
        </button>
      </div>
    </div>
  );
}
