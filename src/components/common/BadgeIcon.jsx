import {
  Zap, Target, Brain, Flame, Layers, ShieldCheck, Award, Crown
} from 'lucide-react';

const BADGE_ICON_MAP = {
  speed_demon: { icon: Zap, label: 'Speed Demon' },
  marksman: { icon: Target, label: 'Precision Marksman' },
  centurion: { icon: Target, label: 'Precision Marksman' },
  mastermind: { icon: Brain, label: 'Grand Mastermind' },
  streak_pioneer: { icon: Flame, label: 'Streak Pioneer' },
  quiz_architect: { icon: Layers, label: 'Quiz Architect' },
  survival_champion: { icon: ShieldCheck, label: 'Survival Champion' },
};

export default function BadgeIcon({ id, isUnlocked = false, level = 0, size = 'md', className = '' }) {
  const meta = BADGE_ICON_MAP[id] || { icon: Award, label: 'Achievement' };
  const IconComponent = meta.icon;

  const currentLevel = level || (isUnlocked ? 1 : 0);
  const unlocked = isUnlocked || currentLevel > 0;

  const sizeClasses =
    size === 'lg' ? 'w-11 h-11 rounded-xl text-base' :
    size === 'sm' ? 'w-8 h-8 rounded-lg text-xs' :
                    'w-9 h-9 rounded-xl text-sm';

  const iconSizes =
    size === 'lg' ? 'w-5 h-5' :
    size === 'sm' ? 'w-3.5 h-3.5' :
                    'w-4 h-4';

  if (!unlocked) {
    return (
      <div
        className={`${sizeClasses} bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0 text-[#6c665d] relative ${className}`}
        title={`${meta.label} (Locked)`}
      >
        <IconComponent className={`${iconSizes} opacity-35`} />
      </div>
    );
  }

  // Tier 3: Gold / MAX Mastery
  if (currentLevel >= 3) {
    return (
      <div
        className={`${sizeClasses} bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-400/35 text-amber-300 shadow-sm flex items-center justify-center shrink-0 relative ${className}`}
        title={`${meta.label} — Level 3 (Mastered)`}
      >
        <IconComponent className={iconSizes} />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-black text-[8px] font-black rounded-full flex items-center justify-center shadow">
          ★
        </span>
      </div>
    );
  }

  // Tier 2: Silver / Skilled
  if (currentLevel === 2) {
    return (
      <div
        className={`${sizeClasses} bg-gradient-to-br from-sky-400/20 to-indigo-500/10 border border-sky-400/30 text-sky-300 shadow-sm flex items-center justify-center shrink-0 relative ${className}`}
        title={`${meta.label} — Level 2`}
      >
        <IconComponent className={iconSizes} />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-sky-400 text-black text-[8px] font-black rounded-full flex items-center justify-center shadow">
          2
        </span>
      </div>
    );
  }

  // Tier 1: Bronze / Novice
  return (
    <div
      className={`${sizeClasses} bg-amber-700/15 border border-amber-600/30 text-amber-400 flex items-center justify-center shrink-0 relative ${className}`}
      title={`${meta.label} — Level 1`}
    >
      <IconComponent className={iconSizes} />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-700 text-amber-100 text-[7px] font-bold rounded-full flex items-center justify-center shadow">
        1
      </span>
    </div>
  );
}
