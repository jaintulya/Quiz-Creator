import { BookOpen, Database, Brain, Play, Edit3, RefreshCw, Code, Trash2, Cloud } from 'lucide-react';

export default function QuizCard({
  quiz,
  index = 0,
  onStart,
  onEdit,
  onShuffle,
  onViewJson,
  onDelete,
}) {
  const qCount = quiz.questions?.length || 0;

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
      icon: Database,
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
    <div className="glass-card-hover p-6 sm:p-7 flex flex-col justify-between gap-5 relative group min-h-[200px]">
      {/* Top Details */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Larger Colored Icon Tile */}
            <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl ${currentTheme.iconBg} border ${currentTheme.iconBorder} flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300`}>
              <IconComponent className={`w-6 h-6 ${currentTheme.iconColor}`} />
            </div>
            <div className="min-w-0 pt-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-caramel-300 transition-colors truncate">
                  {quiz.title}
                </h3>
                {quiz.isCloud && (
                  <span title="Synced to Supabase Cloud">
                    <Cloud className="w-4 h-4 text-caramel-400 shrink-0" />
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#a39e94] line-clamp-2 mt-1 leading-relaxed">
                {quiz.description || 'Interactive multiple choice quiz with detailed answers'}
              </p>
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
          className="btn-primary flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-2"
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
            title="View JSON"
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
