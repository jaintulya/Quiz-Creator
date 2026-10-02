import { useState, useEffect } from 'react';
import { Clock, AlertCircle, Timer as TimerIcon } from 'lucide-react';

export default function Timer({ mode = 'countup', totalSeconds = null, onTimeUp }) {
  const isCountdown = mode === 'countdown' && totalSeconds && totalSeconds > 0;

  // Countdown state starts from totalSeconds, countup starts from 0
  const [remaining, setRemaining] = useState(isCountdown ? totalSeconds : 0);

  useEffect(() => {
    if (isCountdown) {
      setRemaining(totalSeconds);
    } else {
      setRemaining(0);
    }
  }, [isCountdown, totalSeconds]);

  useEffect(() => {
    if (isCountdown) {
      if (remaining <= 0) {
        onTimeUp && onTimeUp();
        return;
      }
      const id = setInterval(() => {
        setRemaining((s) => {
          if (s <= 1) {
            clearInterval(id);
            onTimeUp && onTimeUp();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      return () => clearInterval(id);
    } else {
      // Count-up (Stopwatch) mode from 0 upwards
      const id = setInterval(() => {
        setRemaining((s) => s + 1);
      }, 1000);
      return () => clearInterval(id);
    }
  }, [isCountdown, onTimeUp]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Countdown urgency calculation
  let colorClasses = 'bg-amber-500/10 border-amber-500/30 text-amber-300';
  let isLow = false;

  if (isCountdown && totalSeconds) {
    const pct = (remaining / totalSeconds) * 100;
    isLow = pct <= 20;
    const isMed = pct <= 50 && pct > 20;

    if (isLow) {
      colorClasses = 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse shadow-rose-glow';
    } else if (isMed) {
      colorClasses = 'bg-amber-500/15 border-amber-500/30 text-[#f5ba72]';
    } else {
      colorClasses = 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300';
    }
  } else {
    // Stopwatch (Count-up)
    colorClasses = 'bg-white/[0.04] border-white/10 text-[#dedbd3]';
  }

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-mono font-bold tracking-wider transition-all duration-300 ${colorClasses}`}
      title={isCountdown ? `Time Remaining (${Math.ceil(totalSeconds / 60)} min limit)` : 'Time Elapsed (No limit)'}
    >
      {isLow ? (
        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
      ) : isCountdown ? (
        <TimerIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80 shrink-0" />
      ) : (
        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80 shrink-0" />
      )}
      <span>{formatted}</span>
      <span className="text-[9px] uppercase tracking-normal opacity-60 font-sans font-semibold ml-0.5">
        {isCountdown ? 'left' : 'elapsed'}
      </span>
    </div>
  );
}
