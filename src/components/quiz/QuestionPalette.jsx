import { Eye } from 'lucide-react';
import { useRef, useEffect } from 'react';

export default function QuestionPalette({ total, answers, marked, current, onJump }) {
  const answeredCount = Object.values(answers).filter((v) => v !== undefined && v !== null).length;
  const markedCount = marked.length;
  const unvisitedCount = total - answeredCount;
  const currentBtnRef = useRef(null);

  // Auto-scroll to active question if user navigates through a long list
  useEffect(() => {
    if (currentBtnRef.current) {
      currentBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [current]);

  return (
    <div className="glass-card p-4 sm:p-5 border-white/10">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-caramel-400" />
          Question Palette
        </h3>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
          {answeredCount}/{total} Done
        </span>
      </div>

      {/* Status Legend */}
      <div className="grid grid-cols-2 gap-1.5 mb-3 text-[11px] text-[#a39e94]">
        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-white/[0.03]">
          <span className="w-2.5 h-2.5 rounded-sm bg-caramel-500 shadow-caramel-glow" />
          <span>Answered ({answeredCount})</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-white/[0.03]">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
          <span>Review ({markedCount})</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-white/[0.03]">
          <span className="w-2.5 h-2.5 rounded-sm bg-white ring-1 ring-caramel-400" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-white/[0.03]">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#1c1a18] border border-white/10" />
          <span>Pending ({unvisitedCount})</span>
        </div>
      </div>

      {/* Grid of Question Buttons (Bounded height with scroll for large sets of questions) */}
      <div className="grid grid-cols-5 gap-2 max-h-48 sm:max-h-56 overflow-y-auto pr-1.5 py-1 scrollbar-thin">
        {Array.from({ length: total }).map((_, i) => {
          const isAnswered = answers[i] !== undefined && answers[i] !== null;
          const isMarked = marked.includes(i);
          const isCurrent = i === current;

          let btnClass = 'palette-btn-unanswered';
          if (isCurrent) btnClass = 'palette-btn-current';
          else if (isMarked) btnClass = 'palette-btn-marked';
          else if (isAnswered) btnClass = 'palette-btn-answered';

          return (
            <button
              key={i}
              ref={isCurrent ? currentBtnRef : null}
              onClick={() => onJump(i)}
              title={`Question ${i + 1}${isMarked ? ' (Marked for review)' : ''}${isAnswered ? ' (Answered)' : ''}`}
              className={`relative h-9 rounded-xl border text-xs font-bold transition-all duration-150 active:scale-90 flex items-center justify-center ${btnClass}`}
            >
              {i + 1}
              {isMarked && !isCurrent && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-slate-950 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Progress pill footer */}
      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#a39e94]">
        <span>Completion</span>
        <span className="font-bold text-caramel-400">
          {Math.round((answeredCount / total) * 100)}%
        </span>
      </div>
    </div>
  );
}
