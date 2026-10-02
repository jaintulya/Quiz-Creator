import { useState, useEffect } from 'react';
import {
  Trophy, CheckCircle2, XCircle, RotateCcw,
  BookOpen, ChevronLeft, ChevronRight, Star,
  TrendingUp, Target, Sparkles, Award, ArrowLeft,
  Check, HelpCircle, Layers, Printer, Share2, Copy,
  Zap, Heart, RotateCw
} from 'lucide-react';
import { launchConfetti } from '../utils/confetti.js';
import { sounds } from '../utils/soundEffects.js';
import { printQuizWorksheet } from '../services/aiQuizGenerator.js';

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

export default function ResultPage({ result, onRestart, onReviewMistakes, onStudyFlashcards, onBack }) {
  const { answers, correct, total, quiz, timeSeconds = 0, mode = 'classic', newlyUnlocked = [] } = result;
  const wrong = total - correct;
  const pct = Math.round((correct / total) * 100);

  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Compute missed questions for "Review Mistakes" mode
  const missedQuestions = quiz.questions.filter((q, i) => {
    const correctText = typeof q.correctAnswer === 'number' ? q.options[q.correctAnswer] : q.correctAnswer;
    return answers[i] !== correctText;
  });

  // Confetti on celebration
  useEffect(() => {
    if (pct >= 60) {
      launchConfetti();
      sounds.playFanfare();
    }
  }, [pct]);

  const grade =
    pct >= 90 ? { label: 'Outstanding Mastery!', desc: 'You nailed virtually every question. Exceptional knowledge!', color: 'text-emerald-400', icon: Trophy, bg: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/30' } :
    pct >= 75 ? { label: 'Great Performance!', desc: 'Solid grasp of the core principles. Well done!', color: 'text-[#f5ba72]', icon: Award, bg: 'from-[#f5ba72]/20 to-amber-500/10', border: 'border-[#f5ba72]/30' } :
    pct >= 50 ? { label: 'Good Effort!', desc: 'You passed! A bit more practice will turn this into complete mastery.', color: 'text-amber-400', icon: Zap, bg: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/30' } :
                { label: 'Keep Practicing!', desc: 'Review the explanations below to reinforce your understanding.', color: 'text-rose-400', icon: BookOpen, bg: 'from-rose-500/20 to-pink-500/10', border: 'border-rose-500/30' };

  // Copy shareable link
  const handleShareQuiz = async () => {
    try {
      const shareUrl = `${window.location.origin}/play?quizId=${quiz.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  // Launch review mistakes
  const handleStartReviewMistakes = () => {
    if (missedQuestions.length === 0) return;
    const mistakesQuiz = {
      ...quiz,
      title: `${quiz.title} (Mistakes Review)`,
      questions: missedQuestions,
    };
    if (onReviewMistakes) {
      onReviewMistakes(mistakesQuiz);
    }
  };

  if (reviewMode) {
    const q = quiz.questions[reviewIdx];
    const correctText = typeof q.correctAnswer === 'number' ? q.options[q.correctAnswer] : q.correctAnswer;
    const selected = answers[reviewIdx];
    const isCorrect = selected === correctText;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <button
              onClick={() => setReviewMode(false)}
              className="btn-ghost mb-2 -ml-2 text-xs flex items-center gap-1.5"
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
        <div className="glass-card p-4 border-white/10 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Question</span>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Correct</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> Wrong</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-700" /> Skipped</span>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
            {quiz.questions.map((item, i) => {
              const ans = answers[i];
              const itemCorrect = typeof item.correctAnswer === 'number' ? item.options[item.correctAnswer] : item.correctAnswer;
              const isQCorrect = ans === itemCorrect;
              const isCurrent = i === reviewIdx;

              let style = 'bg-slate-800 text-slate-400 border-white/5';
              if (isQCorrect) style = 'bg-emerald-600/30 border-emerald-500/40 text-emerald-300';
              else if (ans) style = 'bg-rose-600/30 border-rose-500/40 text-rose-300';

              return (
                <button
                  key={i}
                  onClick={() => setReviewIdx(i)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border text-xs sm:text-sm font-bold shrink-0 transition-all duration-150 flex items-center justify-center
                    ${isCurrent ? 'ring-2 ring-[#f5ba72] scale-105 font-extrabold text-white' : 'hover:scale-105'}
                    ${style}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Question Details */}
        <div className="glass-card p-6 sm:p-8 border-white/10 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <span className="text-xs font-bold text-[#f5ba72] uppercase tracking-wider">
              Question {reviewIdx + 1} of {total}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
              isCorrect ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
            }`}>
              {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {isCorrect ? 'Correct Answer' : selected ? 'Incorrect Answer' : 'Skipped Question'}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {q.question}
          </h2>

          <div className="space-y-2.5 pt-2">
            {q.options.map((opt, optIdx) => {
              const isOptionCorrect = opt === correctText;
              const isOptionSelected = opt === selected;

              let cardStyle = 'bg-white/[0.02] border-white/5 text-[#a39e94]';
              if (isOptionCorrect) {
                cardStyle = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold ring-1 ring-emerald-400/40';
              } else if (isOptionSelected) {
                cardStyle = 'bg-rose-500/15 border-rose-500/40 text-rose-300 ring-1 ring-rose-400/40';
              }

              return (
                <div
                  key={optIdx}
                  className={`p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 ${cardStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs shrink-0">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isOptionCorrect && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                      <Check className="w-3.5 h-3.5" /> Correct Choice
                    </span>
                  )}
                  {isOptionSelected && !isOptionCorrect && (
                    <span className="text-[11px] font-bold text-rose-400 shrink-0">
                      Your Answer
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {q.explanation && (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
              <span className="text-xs font-bold text-[#f5ba72] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Explanation
              </span>
              <p className="text-xs text-[#a39e94] leading-relaxed">{q.explanation}</p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setReviewIdx(Math.max(0, reviewIdx - 1))}
              disabled={reviewIdx === 0}
              className="btn-secondary py-2 px-4 text-xs font-bold disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setReviewIdx(Math.min(total - 1, reviewIdx + 1))}
              disabled={reviewIdx === total - 1}
              className="btn-primary py-2 px-4 text-xs font-bold disabled:opacity-40"
            >
              Next Question
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in space-y-8">

      {/* Newly Unlocked Badge Banner (Celebration) */}
      {newlyUnlocked.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#f5ba72]/20 to-amber-500/20 border border-[#f5ba72]/40 flex items-center gap-3.5 animate-slide-up shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-amber-500/25 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-extrabold text-white">
              Achievement Unlocked: {newlyUnlocked.map(b => b.title).join(', ')}!
            </h3>
            <p className="text-xs text-[#f5ba72]">
              {newlyUnlocked[0].description}
            </p>
          </div>
        </div>
      )}

      {/* Main Score Glass Card */}
      <div className={`glass-card p-6 sm:p-10 border ${grade.border} bg-gradient-to-br ${grade.bg} relative overflow-hidden space-y-8`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left">
          <div className="space-y-3">
            <div className={`w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 ${grade.color} shadow-lg mx-auto sm:mx-0`}>
              <grade.icon className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {grade.label}
            </h1>
            <p className="text-xs sm:text-sm text-[#dedbd3] max-w-md leading-relaxed">
              {grade.desc}
            </p>
            <p className="text-xs text-[#8d877c]">
              Quiz: <strong className="text-white">{quiz.title}</strong> • Completed in ~{timeSeconds}s
            </p>
          </div>

          <ScoreRing pct={pct} />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/[0.08]">
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-center">
            <span className="text-xs font-semibold text-[#8d877c] block">Total Questions</span>
            <span className="text-xl font-bold text-white">{total}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="text-xs font-semibold text-emerald-400 block">Correct Answers</span>
            <span className="text-xl font-bold text-emerald-300">{correct}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
            <span className="text-xs font-semibold text-rose-400 block">Incorrect</span>
            <span className="text-xl font-bold text-rose-300">{wrong}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-center">
            <span className="text-xs font-semibold text-sky-400 block">Speed / Pace</span>
            <span className="text-xl font-bold text-sky-300">{Math.round(timeSeconds / (total || 1))}s/Q</span>
          </div>
        </div>
      </div>

      {/* Action Hub */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider">
          Next Learning Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">

          {/* Action 1: Review Mistakes Only (If any missed) */}
          {missedQuestions.length > 0 ? (
            <button
              onClick={handleStartReviewMistakes}
              className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-amber-500/40 text-left space-y-1.5 transition-all group hover:scale-[1.01]"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#f5ba72] transition-colors">
                Re-attempt Mistakes
              </h3>
              <p className="text-xs text-[#a39e94]">
                Practice only the {missedQuestions.length} questions you missed to master this topic.
              </p>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-left space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-emerald-400">Zero Mistakes!</h3>
              <p className="text-xs text-[#a39e94]">You achieved 100% accuracy on this quiz.</p>
            </div>
          )}

          {/* Action 2: Detailed Answer Review */}
          <button
            onClick={() => { setReviewMode(true); setReviewIdx(0); }}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-left space-y-1.5 transition-all group hover:scale-[1.02]"
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4 text-[#f5ba72]" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-[#f5ba72] transition-colors">
              Detailed Explanations
            </h3>
            <p className="text-xs text-[#8d877c]">
              Step-by-step breakdown of every question and official answers.
            </p>
          </button>

          {/* Action 3: Flashcards Study Mode */}
          <button
            onClick={() => onStudyFlashcards && onStudyFlashcards(quiz)}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-left space-y-1.5 transition-all group hover:scale-[1.02]"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <RotateCw className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
              Study as Flashcards
            </h3>
            <p className="text-xs text-[#8d877c]">
              Interactive 3D flip card mode for rapid memory retention.
            </p>
          </button>

          {/* Action 4: Retake Full Quiz */}
          <button
            onClick={() => onRestart(quiz)}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-left space-y-1.5 transition-all group hover:scale-[1.02]"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <RotateCcw className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
              Retake Full Quiz
            </h3>
            <p className="text-xs text-[#8d877c]">
              Attempt all {total} questions again with reshuffled options.
            </p>
          </button>

          {/* Action 5: Print Worksheet / PDF */}
          <button
            onClick={() => printQuizWorksheet(quiz, true)}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-left space-y-1.5 transition-all group hover:scale-[1.02]"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Printer className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              Print / Save as PDF
            </h3>
            <p className="text-xs text-[#8d877c]">
              Generate printable exam worksheet with answer key.
            </p>
          </button>

          {/* Action 6: Share Quiz */}
          <button
            onClick={handleShareQuiz}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-left space-y-1.5 transition-all group hover:scale-[1.02]"
          >
            <div className="w-8 h-8 rounded-xl bg-[#f5ba72]/15 flex items-center justify-center text-[#f5ba72] group-hover:scale-110 transition-transform">
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-[#f5ba72] transition-colors">
              {copiedLink ? 'Link Copied!' : 'Share Quiz Link'}
            </h3>
            <p className="text-xs text-[#8d877c]">
              {copiedLink ? 'Direct quiz URL copied to clipboard!' : 'Send this quiz to classmates or friends.'}
            </p>
          </button>

        </div>
      </div>

      {/* Back button */}
      <div className="pt-2 text-center">
        <button
          onClick={onBack}
          className="btn-ghost text-xs text-[#8d877c] hover:text-white"
        >
          ← Return to Dashboard / Quizzes
        </button>
      </div>

    </div>
  );
}
