import { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';

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

  const color =
    pct > 50 ? 'text-emerald-400' : pct > 20 ? 'text-amber-400' : 'text-red-400 animate-pulse';

  return (
    <div className={`flex items-center gap-2 font-mono font-bold text-sm ${color}`}>
      <Clock className="w-4 h-4" />
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  );
}
