import { useState } from 'react';
import { BookOpen, Layers, Brain, Play, Edit3, RefreshCw, Code, Trash2, Cloud, Copy, Check, RotateCw } from 'lucide-react';

export default function QuizCard({
  quiz,
  index = 0,
  onStart,
  onEdit,
  onShuffle,
  onViewJson,
  onDelete,
  onRegenerateCode,
}) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [codeChangedMsg, setCodeChangedMsg] = useState(false);
  const qCount = quiz.questions?.length || 0;
  const quizCode = quiz.code || quiz.id;

  const handleCopyCode = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(quizCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleRegenerate = async (e) => {
    e.stopPropagation();
    if (!onRegenerateCode || regenerating) return;
    setRegenerating(true);
    try {
      await onRegenerateCode(quiz);
      setCodeChangedMsg(true);
      setTimeout(() => setCodeChangedMsg(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  // Themes with distinct accent colors
  const themes = [
    {
      icon: BookOpen,
      iconBg: 'bg-[#2b1419]',
      iconBorder: 'border-rose-500/30',
      iconColor: 'text-rose-400',
      badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
    },
    {
      icon: Layers,
      iconBg: 'bg-[#12281d]',
      iconBorder: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    },
    {
      icon: Brain,
      iconBg: 'bg-[#2b2213]',
      iconBorder: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
    },
  ];

  const currentTheme = themes[index % themes.length];
  const IconComponent = currentTheme.icon;

  return (
    <div className="glass-card-hover p-6 sm:p-7 flex flex-col justify-between gap-5 relative group min-h-[200px] overflow-hidden rounded-2xl border border-white/[0.08] hover:border-white/20 transition-all duration-200">
      {/* Top Details */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Clean Colored Icon Tile */}
            <div className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl ${currentTheme.iconBg} border ${currentTheme.iconBorder} flex items-center justify-center shrink-0 transition-colors duration-200`}>
              <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${currentTheme.iconColor}`} />
            </div>
            <div className="min-w-0 pt-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#f5ba72] transition-colors truncate">
                  {quiz.title}
                </h3>
                {quiz.isCloud && (
                  <span title="Saved to Cloud">
                    <Cloud className="w-4 h-4 text-caramel-400 shrink-0" />
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#a39e94] line-clamp-2 mt-1 leading-relaxed">
                {quiz.description || 'Interactive multiple choice quiz with detailed answers'}
              </p>

              {/* Unique Quiz Code Badge */}
              <div className="flex items-center gap-2 mt-2.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs">
                  <span className="text-[#8d877c] font-medium text-[11px]">Code:</span>
                  <span className="font-mono font-bold text-amber-300 text-[11px] tracking-wider">{quizCode}</span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    title="Copy Quiz Code"
                    aria-label="Copy Quiz Code"
                    className="p-0.5 rounded hover:bg-white/10 text-[#a39e94] hover:text-white transition-colors ml-0.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  {onRegenerateCode && (
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      disabled={regenerating}
                      title="Regenerate New Code (Old code will expire)"
                      aria-label="Regenerate Quiz Code"
                      className="p-0.5 rounded hover:bg-white/10 text-[#a39e94] hover:text-amber-400 transition-colors ml-0.5 disabled:opacity-50"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin text-amber-400' : ''}`} />
                    </button>
                  )}
                  {copied && <span className="text-[10px] text-emerald-400 font-semibold animate-fade-in">Copied!</span>}
                  {codeChangedMsg && <span className="text-[10px] text-amber-400 font-semibold animate-fade-in">New Code!</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Question Count Badge */}
          <span className={`badge ${currentTheme.badgeBg} text-xs shrink-0 font-bold px-3 py-1 rounded-full`}>
            {qCount} {qCount === 1 ? 'Question' : 'Questions'}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3">
        <button
          onClick={() => onStart(quiz)}
          className="btn-primary flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>Start Quiz</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(quiz)}
            title="Edit Quiz"
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-[#a39e94] hover:text-white transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onShuffle(quiz.id)}
            title="Shuffle Questions"
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-[#a39e94] hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewJson(quiz)}
            title="View Questions Content"
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-[#a39e94] hover:text-white transition-colors"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(quiz)}
            title="Delete Quiz"
            className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
