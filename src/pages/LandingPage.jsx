import { useRef, useEffect, useState } from 'react';
import { Brain, Sparkles, Zap, Target, Users, ArrowRight, Star, Trophy, BookOpen, ChevronRight, CheckCircle2, Layers, Clock, BarChart2 } from 'lucide-react';
import { useScrollReveal } from '../utils/useScrollReveal.js';
import { useCountUp } from '../utils/useCountUp.js';

/* ── Tilt card hook ── */
function useTilt(strength = 12) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(700px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) scale(1.02)`;
    };
    const onLeave = () => { el.style.transform = ''; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, [strength]);
  return ref;
}

/* ── Animated stat card ── */
function StatCard({ value, suffix = '', label, delay = 0 }) {
  const [ref, visible] = useScrollReveal();
  const count = useCountUp(value, 1800, visible);
  return (
    <div ref={ref} className={`reveal text-center transition-all`} style={{ transitionDelay: `${delay}ms` }}>
      <div className={`reveal ${visible ? 'visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
        <p className="counter-display text-4xl sm:text-5xl font-black gradient-text-warm tabular-nums leading-none">
          {count}{suffix}
        </p>
        <p className="text-sm text-[--text-2] mt-2 font-medium">{label}</p>
      </div>
    </div>
  );
}

/* ── Feature card ── */
function FeatureCard({ icon: Icon, title, desc, tag, colorClass, delay = 0 }) {
  const tiltRef = useTilt(8);
  const [ref, visible] = useScrollReveal();
  return (
    <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <div ref={tiltRef} className="feature-card p-6 h-full space-y-4" style={{ transition: 'transform 0.2s ease, box-shadow 0.25s ease, border-color 0.25s ease' }}>
        <div className="flex items-start justify-between">
          <div className={`w-11 h-11 rounded-xl ${colorClass} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          {tag && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 text-[--text-3] uppercase tracking-wider">{tag}</span>
          )}
        </div>
        <div>
          <h3 className="font-bold text-white text-[15px] leading-snug">{title}</h3>
          <p className="text-[13px] text-[--text-2] mt-1.5 leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: Sparkles, title: 'AI Quiz Generation',
    desc: 'Copy our ready-made prompt. Paste into ChatGPT or Gemini with your notes. Get a perfect quiz in seconds.',
    tag: 'AI', colorClass: 'bg-[#f5ba72]/12 border border-[#f5ba72]/25 text-[#f5ba72]',
  },
  {
    icon: Target, title: 'Smart Analytics',
    desc: 'Per-question accuracy, time tracking, difficulty analysis. Know exactly what to revise.',
    tag: 'Analytics', colorClass: 'bg-[#ff6b35]/12 border border-[#ff6b35]/25 text-[#ff8c42]',
  },
  {
    icon: Zap, title: 'Instant Practice',
    desc: 'Shuffle questions, enable timed mode, bookmark tricky ones. Practice like the real exam.',
    tag: 'Practice', colorClass: 'bg-emerald-500/12 border border-emerald-500/25 text-emerald-400',
  },
  {
    icon: Users, title: 'Cloud Sync',
    desc: 'Your quizzes live in the cloud. Log in from any device, pick up right where you left off.',
    tag: 'Cloud', colorClass: 'bg-sky-500/12 border border-sky-500/25 text-sky-400',
  },
];

const MARQUEE_ITEMS = [
  'MCQ Format', 'AI Powered', 'Cloud Sync', 'Timed Mode', 'Smart Shuffle', 'JSON Import', 'Analytics', 'Multi-device', 'Study Streaks', 'Quick Review',
  'MCQ Format', 'AI Powered', 'Cloud Sync', 'Timed Mode', 'Smart Shuffle', 'JSON Import', 'Analytics', 'Multi-device', 'Study Streaks', 'Quick Review',
];

const TESTIMONIALS = [
  { name: 'Swati Vyas', role: 'BCA, 2nd Year', text: 'Paste notes → get quiz. That\'s it. I used QuizCraft for my entire OS semester and the results show.', avatar: 'S', score: '91%' },
  { name: 'Devarsh Jain', role: 'BCA, 3rd Year', text: 'The AI prompt is genuinely clever. I just paste my lecture notes and get exam-grade MCQs instantly.', avatar: 'D', score: '88%' },
  { name: 'Rishiraj Rathod', role: 'BECE, 2nd Year', text: 'Shuffle + timer mode changed how I prepare. I finish revision 3x faster now and score consistently.', avatar: 'R', score: '94%' },
];

const STEPS = [
  { n: '01', title: 'Get the Prompt', desc: 'Open Create Quiz, copy the pre-built AI prompt in one click.' },
  { n: '02', title: 'Generate with AI', desc: 'Paste into ChatGPT / Gemini along with your notes. Get JSON output.' },
  { n: '03', title: 'Paste & Play', desc: 'Paste the JSON into QuizCraft. Your quiz is live — instantly.' },
];

export default function LandingPage({ onOpenAuth, onNavigate }) {
  const [heroRef, heroVisible] = useScrollReveal({ threshold: 0.01 });
  const [stepsRef, stepsVisible] = useScrollReveal();
  const [testiRef, testiVisible] = useScrollReveal();

  return (
    <div className="relative overflow-x-hidden bg-[--bg]">

      {/* ── HERO ── */}
      <section className="relative min-h-[94vh] flex flex-col items-center justify-center px-4 sm:px-6 py-24 text-center overflow-hidden">

        {/* Dot grid bg */}
        <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />

        {/* Warm radial glow – top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(245,186,114,0.10) 0%, transparent 70%)' }} />

        {/* Floating decorative quiz card — top right */}
        <div className="absolute top-24 right-4 sm:right-16 lg:right-24 w-48 sm:w-56 hidden sm:block animate-float" style={{ animationDuration: '6s' }}>
          <div className="glass-card p-4 border-[--border-warm] space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#f5ba72]/20 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-[--amber]" />
              </div>
              <span className="text-[11px] font-bold text-white">Data Structures</span>
            </div>
            <p className="text-[10px] text-[--text-2] leading-snug">What is the time complexity of binary search?</p>
            <div className="space-y-1.5">
              {['O(n)', 'O(log n)', 'O(n²)', 'O(1)'].map((opt, i) => (
                <div key={opt} className={`text-[10px] px-2.5 py-1 rounded-lg border ${i === 1 ? 'border-[#f5ba72]/50 bg-[#f5ba72]/12 text-[--amber] font-semibold' : 'border-white/6 text-[--text-3]'}`}>
                  {String.fromCharCode(65+i)}. {opt}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating result card — bottom left */}
        <div className="absolute bottom-28 left-4 sm:left-12 lg:left-20 w-40 hidden sm:block animate-float" style={{ animationDuration: '8s', animationDelay: '2s' }}>
          <div className="glass-card p-3.5 border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white">Result</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 leading-none">18<span className="text-sm font-semibold text-[--text-3]">/20</span></div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: '90%' }} /></div>
            <p className="text-[9px] text-[--text-3]">Excellent performance!</p>
          </div>
        </div>

        {/* Hero content */}
        <div ref={heroRef} className="relative max-w-3xl mx-auto space-y-7">
          {/* Tag */}
          <div className={`flex justify-center animate-fade-up`}>
            <span className="section-tag">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[--amber] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[--amber]" />
              </span>
              AI-Powered Study Platform
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up delay-100 text-[2.8rem] sm:text-[4.2rem] lg:text-[5rem] font-black leading-[1.04] tracking-tight text-white">
            Study Smarter,{' '}
            <br className="hidden sm:block" />
            Score <span className="shimmer-text">Higher</span>
          </h1>

          <p className="animate-fade-up delay-200 text-base sm:text-lg text-[--text-2] max-w-xl mx-auto leading-relaxed font-light">
            Turn your lecture notes into perfect MCQ quizzes using AI. Practice with analytics, timed mode, and cloud sync — all in one place.
          </p>

          {/* CTA row */}
          <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate ? onNavigate('/login') : onOpenAuth?.()}
              className="btn-primary-lg gap-2.5 group"
              id="hero-cta"
            >
              <Sparkles className="w-5 h-5" />
              <span>Start for Free</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => onNavigate ? onNavigate('/login') : onOpenAuth?.()}
              className="btn-secondary py-3 px-6 text-sm font-semibold"
            >
              Continue as Guest
            </button>
          </div>

          <p className="animate-fade-up delay-400 text-xs text-[--text-3]">No credit card · Free forever · Google or Username login</p>
        </div>
      </section>

      {/* ── MARQUEE STRIP ── */}
      <div className="py-5 border-y border-white/[0.06] bg-[--surface] overflow-hidden">
        <div className="marquee-wrapper">
          <div className="flex gap-0 animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
            {MARQUEE_ITEMS.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3 px-6 text-[13px] font-semibold text-[--text-3]">
                <span className="w-1.5 h-1.5 rounded-full bg-[--amber] opacity-60 shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="py-20 px-4 sm:px-6 border-b border-white/[0.05]">
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12">
          <StatCard value={10000} suffix="+" label="Quizzes Created" delay={0} />
          <StatCard value={98} suffix="%" label="Accuracy Rate" delay={100} />
          <StatCard value={50} suffix="+" label="Topics Covered" delay={200} />
          <StatCard value={4} suffix=".9★" label="User Rating" delay={300} />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="section-tag mx-auto block w-fit">
            <Trophy className="w-3.5 h-3.5" /> Everything You Need
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Built for <span className="gradient-text-coral">Serious Learners</span>
          </h2>
          <p className="text-[--text-2] max-w-md mx-auto text-sm sm:text-base leading-relaxed">
            Every tool you need to go from raw notes to confident exam performance.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-4 sm:px-6 bg-[--surface] border-y border-white/[0.05]">
        <div ref={stepsRef} className="max-w-4xl mx-auto">
          <div className={`text-center mb-16 space-y-3 reveal ${stepsVisible ? 'visible' : ''}`}>
            <span className="section-tag mx-auto block w-fit">
              <Zap className="w-3.5 h-3.5" /> Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">3 Steps to Your Quiz</h2>
            <p className="text-[--text-2] text-sm max-w-xs mx-auto">From raw notes to practice-ready quiz in under 2 minutes.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="absolute top-10 left-[20%] right-[20%] h-px hidden sm:block"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(245,186,114,0.25), transparent)' }} />

            {STEPS.map((s, i) => (
              <div key={s.n} className={`reveal ${stepsVisible ? 'visible' : ''} flex flex-col items-center text-center gap-5`} style={{ transitionDelay: `${i * 120}ms` }}>
                {/* Number circle */}
                <div className="relative w-20 h-20 shrink-0">
                  <div className="absolute inset-0 rounded-2xl border border-[--border-warm] bg-[--card] flex items-center justify-center">
                    <span className="text-3xl font-black gradient-text-warm">{s.n}</span>
                  </div>
                  {/* Ambient glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-30 animate-glow-pulse"
                    style={{ background: 'radial-gradient(circle, rgba(245,186,114,0.4), transparent)', filter: 'blur(8px)' }} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-[15px]">{s.title}</h3>
                  <p className="text-[--text-2] text-[13px] mt-1.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section ref={testiRef} className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className={`text-center mb-14 space-y-3 reveal ${testiVisible ? 'visible' : ''}`}>
          <span className="section-tag mx-auto block w-fit">
            <Star className="w-3.5 h-3.5 fill-current" /> Student Reviews
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Loved by <span className="gradient-text">Students</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className={`reveal glass-card p-6 space-y-4 border-white/[0.08] ${testiVisible ? 'visible' : ''}`} style={{ transitionDelay: `${i * 100}ms` }}>
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-[--amber] text-[--amber]" />)}
              </div>
              <p className="text-[13px] text-[--text-1] leading-relaxed">"{t.text}"</p>
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f5ba72] to-[#e07820] text-[#1b1206] font-extrabold flex items-center justify-center text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-white">{t.name}</p>
                    <p className="text-[10px] text-[--text-3]">{t.role}</p>
                  </div>
                </div>
                <div className="badge-amber text-[11px]">{t.score}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 px-4 sm:px-6 max-w-3xl mx-auto">
        <div className="glass-card amber-border-glow p-10 sm:p-16 text-center relative overflow-hidden space-y-6">
          {/* Radial gradient inside */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(245,186,114,0.08) 0%, transparent 70%)' }} />
          {/* Dot grid inside */}
          <div className="absolute inset-0 dot-grid-faint pointer-events-none opacity-50" />

          <div className="relative space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#f5ba72]/12 border border-[--border-warm] flex items-center justify-center mx-auto shadow-caramel-glow">
              <Brain className="w-8 h-8 text-[--amber]" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Ready to Study <span className="gradient-text">Smarter?</span>
            </h2>
            <p className="text-sm text-[--text-2] max-w-sm mx-auto leading-relaxed">
              Create your free account. Build your first AI quiz in under 2 minutes. Start scoring higher.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onNavigate ? onNavigate('/login') : onOpenAuth?.()}
                className="btn-primary-lg gap-2 group"
                id="cta-banner-start"
              >
                <Sparkles className="w-5 h-5" />
                <span>Get Started Free</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            <p className="text-[11px] text-[--text-3]">No card required · Google login or Username/Password</p>
          </div>
        </div>
      </section>

    </div>
  );
}
