export default function StatCard({ icon: Icon, title, value, colorType = 'rose' }) {
  const colorConfigs = {
    rose: {
      bg: 'bg-[#2b1419]',
      border: 'border-rose-500/20',
      iconColor: 'text-rose-400',
      waveColor: '#f43f5e',
    },
    emerald: {
      bg: 'bg-[#12281d]',
      border: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
      waveColor: '#10b981',
    },
    amber: {
      bg: 'bg-[#2b2213]',
      border: 'border-amber-500/20',
      iconColor: 'text-amber-400',
      waveColor: '#f59e0b',
    },
    coral: {
      bg: 'bg-[#2e1814]',
      border: 'border-coral-500/20',
      iconColor: 'text-coral-500',
      waveColor: '#ff735c',
    },
  };

  const config = colorConfigs[colorType] || colorConfigs.rose;

  return (
    <div className="glass-panel p-4 sm:p-5 flex items-center justify-between gap-3 relative overflow-hidden group hover:border-white/15 transition-all duration-300">
      <div className="flex items-center gap-3.5 z-10">
        {/* Icon Square Tile */}
        <div className={`w-11 h-11 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center shrink-0 shadow-sm`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div>
          <p className="text-[11px] sm:text-xs text-[#a39e94] font-medium">{title}</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
            {value}
          </h3>
        </div>
      </div>

      {/* Wave Sparkline Graphic (From Reference Image) */}
      <div className="w-20 h-9 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
        <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
          <path
            d="M0 25 C 20 28, 30 12, 50 18 C 70 24, 80 8, 100 12"
            fill="none"
            stroke={config.waveColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
