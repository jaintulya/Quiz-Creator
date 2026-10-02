import {
  Rocket, Flame, Target, Zap, Layers, Brain,
  Moon, ShieldCheck, RotateCw, Award, Trophy, Star
} from 'lucide-react';

const BADGE_ICON_MAP = {
  first_quiz: { icon: Rocket, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  streak_pioneer: { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
  centurion: { icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  speed_demon: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  quiz_architect: { icon: Layers, color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20' },
  mastermind: { icon: Brain, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  night_owl: { icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/20' },
  survival_champion: { icon: ShieldCheck, color: 'text-rose-400', bg: 'bg-rose-400/10 border-rose-400/20' },
  flashcard_scholar: { icon: RotateCw, color: 'text-teal-400', bg: 'bg-teal-400/10 border-teal-400/20' },
};

export default function BadgeIcon({ id, isUnlocked = false, size = 'md', className = '' }) {
  const meta = BADGE_ICON_MAP[id] || { icon: Award, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' };
  const IconComponent = meta.icon;

  const sizeClasses =
    size === 'lg' ? 'w-10 h-10 rounded-xl' :
    size === 'sm' ? 'w-7 h-7 rounded-lg' :
                    'w-8 h-8 rounded-lg';

  const iconSizes =
    size === 'lg' ? 'w-5 h-5' :
    size === 'sm' ? 'w-3.5 h-3.5' :
                    'w-4 h-4';

  if (!isUnlocked) {
    return (
      <div className={`${sizeClasses} bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0 text-[#6c665d] ${className}`}>
        <IconComponent className={`${iconSizes} opacity-40`} />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} ${meta.bg} border flex items-center justify-center shrink-0 ${meta.color} shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${className}`}>
      <IconComponent className={iconSizes} />
    </div>
  );
}
