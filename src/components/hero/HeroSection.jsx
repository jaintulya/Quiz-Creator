import { useState } from 'react';
import {
  Sparkles, Plus, BookOpen, CheckCircle2, ChevronRight,
  Clock, Lightbulb, BarChart2, Check
} from 'lucide-react';

export default function HeroSection({ onCreateQuiz, onExploreQuizzes }) {
  const [selectedMockOption, setSelectedMockOption] = useState('React');

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#181614]/90 via-[#141210]/95 to-[#0e0d0c] border border-white/[0.08] p-6 sm:p-10 lg:p-12 shadow-2xl">
      {/* Ambient background warm glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-caramel-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

        {/* ── Left Column: Value Prop & CTAs ──────────────────────── */}
        <div className="lg:col-span-7 space-y-6">

          {/* AI Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#241e16] border border-caramel-500/30 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-caramel-400" />
            <span className="text-xs font-bold text-caramel-300 tracking-wide">
              AI Powered Quiz Engine
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Test Your Knowledge with{' '}
            <span className="gradient-text-coral block sm:inline">
              Interactive Quizzes
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#b5af9f] font-normal leading-relaxed max-w-xl">
            Create, customize, and play interactive multiple-choice quizzes generated from any text or topic using AI.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
            <button
              onClick={onCreateQuiz}
              className="btn-primary py-3.5 px-6 rounded-xl text-sm font-bold shadow-caramel-glow flex items-center justify-center gap-2 group"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create New Quiz</span>
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExploreQuizzes}
              className="btn-secondary py-3.5 px-6 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-caramel-400" />
              <span>Explore Quizzes</span>
            </button>
          </div>

          {/* Trust Checkmarks */}
          <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#cfc9bc] font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-caramel-400 fill-caramel-500/20" />
              <span>AI Generated</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
              <span>Multiple Formats</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-rose-400 fill-rose-500/20" />
              <span>Track Progress</span>
            </div>
          </div>

        </div>

        {/* ── Right Column: Interactive Mockup & Floating Badges ───── */}
        <div className="lg:col-span-5 relative flex justify-center items-center">

          {/* Handwritten Cursive Note (Top) */}
          <div className="absolute -top-7 sm:-top-9 right-8 sm:right-16 z-20 pointer-events-none hidden sm:block">
            <div className="font-handwriting text-2xl sm:text-3xl text-caramel-300 font-bold -rotate-6 flex items-center gap-2 select-none">
              <span>Knowledge Looks Better Here!</span>
              <span className="text-xl text-coral-400">✦</span>
            </div>
          </div>

          {/* Floating Card Left: Learn Faster */}
          <div className="absolute -left-3 sm:-left-6 top-1/3 z-20 animate-float hidden sm:flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#291316]/90 border border-rose-500/40 shadow-rose-glow backdrop-blur-md">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-rose-300" />
            </div>
            <div className="text-left">
              <div className="text-[11px] font-bold text-white leading-tight">Learn</div>
              <div className="text-[10px] text-rose-300 font-medium">Faster</div>
            </div>
          </div>

          {/* Floating Card Right: Track Progress */}
          <div className="absolute -right-2 sm:-right-4 top-1/2 z-20 animate-float hidden sm:flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#0f241a]/90 border border-emerald-500/40 shadow-emerald-glow backdrop-blur-md" style={{ animationDelay: '1.5s' }}>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="text-left">
              <div className="text-[11px] font-bold text-white leading-tight">Track</div>
              <div className="text-[10px] text-emerald-300 font-medium">Progress</div>
            </div>
          </div>

          {/* The Quiz Mockup Tablet Card (From Image) */}
          <div className="w-full max-w-sm rounded-2xl bg-[#1c1916]/95 border border-white/10 p-5 shadow-2xl relative z-10">
            {/* Mockup Topbar */}
            <div className="flex items-center justify-between text-xs text-[#a39e94] mb-3">
              <span className="font-semibold text-slate-300">Question 1/10</span>
              <div className="flex items-center gap-1 font-mono font-bold text-caramel-400">
                <Clock className="w-3.5 h-3.5" />
                <span>00:14</span>
              </div>
            </div>

            {/* Mockup Progress Bar */}
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-coral-500 to-caramel-500 w-1/3 rounded-full" />
            </div>

            {/* Mockup Question */}
            <h4 className="text-sm font-bold text-white leading-snug mb-4">
              Which of the following is a JavaScript framework?
            </h4>

            {/* Mockup Options */}
            <div className="space-y-2">
              {[
                { letter: 'A', text: 'Python' },
                { letter: 'B', text: 'React', isCorrect: true },
                { letter: 'C', text: 'MySQL' },
                { letter: 'D', text: 'Photoshop' },
              ].map(({ letter, text, isCorrect }) => {
                const isSelected = selectedMockOption === text;
                return (
                  <button
                    key={letter}
                    onClick={() => setSelectedMockOption(text)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border
                      ${isSelected
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-emerald-glow'
                        : 'bg-white/[0.03] border-white/5 text-[#b5af9f] hover:bg-white/[0.07] hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-[#a39e94]'}`}>
                        {letter}
                      </span>
                      <span>{text}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Handwritten Cursive Note (Bottom Right) */}
          <div className="absolute -bottom-7 sm:-bottom-8 -right-2 sm:-right-4 z-20 pointer-events-none hidden sm:block">
            <div className="font-handwriting text-xl sm:text-2xl text-caramel-300 font-bold rotate-3 select-none">
              Small Quizzes, Big Progress ✍️
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
