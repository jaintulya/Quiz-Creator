import { CheckCircle, Circle, Bookmark } from 'lucide-react';

export default function QuestionPalette({ total, answers, marked, current, onJump }) {
  return (
    <div className="glass-card p-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Question Palette</h3>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-5 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-violet-600 inline-block" /> Answered
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" /> Marked
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-white inline-block" /> Current
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-white/10 inline-block" /> Not visited
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-2.5">
        {Array.from({ length: total }).map((_, i) => {
          const isAnswered = answers[i] !== undefined && answers[i] !== null;
          const isMarked = marked.includes(i);
          const isCurrent = i === current;

          let cls = 'palette-btn-unanswered';
          if (isCurrent) cls = 'palette-btn-current';
          else if (isMarked) cls = 'palette-btn-marked';
          else if (isAnswered) cls = 'palette-btn-answered';

          return (
            <button
              key={i}
              onClick={() => onJump(i)}
              title={`Q${i + 1}${isMarked ? ' (Marked)' : ''}${isAnswered ? ' (Answered)' : ''}`}
              className={`relative w-8 h-8 rounded-lg border text-xs font-semibold transition-all duration-150 hover:scale-110 ${cls}`}
            >
              {i + 1}
              {isMarked && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-slate-900" />
              )}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-violet-600/15 border border-violet-500/20 rounded-lg px-3 py-2 text-center">
          <div className="font-bold text-violet-300 text-lg leading-none">
            {Object.values(answers).filter((v) => v !== undefined && v !== null).length}
          </div>
          <div className="text-slate-400 mt-0.5">Answered</div>
        </div>
        <div className="bg-amber-500/15 border border-amber-500/20 rounded-lg px-3 py-2 text-center">
          <div className="font-bold text-amber-300 text-lg leading-none">{marked.length}</div>
          <div className="text-slate-400 mt-0.5">Marked</div>
        </div>
      </div>
    </div>
  );
}
