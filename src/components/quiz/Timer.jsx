import { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

export default function Timer({ totalSeconds, onTimeUp }) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    if (remaining <= 0) {
      onTimeUp && onTimeUp();
      return;
    }
    const id = setInterval(() => setRemaining((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [remaining, onTimeUp]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = (remaining / totalSeconds) * 100;

  const isLow = pct <= 20;
  const isMed = pct <= 50 && pct > 20;

  let colorClasses = 'bg-caramel-500/10 border-caramel-500/30 text-caramel-300';
  if (isLow) {
    colorClasses = 'bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse shadow-rose-glow';
  } else if (isMed) {
    colorClasses = 'bg-amber-500/10 border-amber-500/30 text-amber-300';
  }

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-mono font-bold tracking-wider transition-all duration-300 ${colorClasses}`}>
      {isLow ? (
        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
      ) : (
        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" />
      )}
      <span>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
    </div>
  );
}
