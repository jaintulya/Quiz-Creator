import { useRef, useState, useEffect } from 'react';
import {
  Brain, Sparkles, Zap, Target, Users, ArrowRight,
  ChevronRight, Award, Check, Play, ArrowUp, ChevronDown
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Landing3DScene from '../components/landing/Landing3DScene.jsx';
import LiveQuizDemo from '../components/landing/LiveQuizDemo.jsx';
import StudyModesPreview from '../components/landing/StudyModesPreview.jsx';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Smart Question Generator',
    desc: 'Generate exam-grade questions across topics with customizable difficulty, count, and instant answers.',
    tag: 'Creator',
    colorClass: 'bg-[#f5ba72]/10 border border-[#f5ba72]/20 text-[#f5ba72]',
  },
  {
    icon: Target,
    title: 'Deep Learning Analytics',
    desc: 'Track per-question accuracy, pace per question, 30-day activity heatmaps, and retention streaks.',
    tag: 'Analytics',
    colorClass: 'bg-[#ff6b35]/10 border border-[#ff6b35]/20 text-[#ff8c42]',
  },
  {
    icon: Award,
    title: '3-Tier Progressive Badges',
    desc: 'Skill-based achievements with 3 progressive mastery tiers that reward high accuracy and speed.',
    tag: 'Mastery',
    colorClass: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400',
  },
  {
    icon: Users,
    title: 'Cloud Sync & Share',
    desc: 'Share quizzes with classmates using 6-character codes. Review peer submissions and study anywhere.',
    tag: 'Collaborative',
    colorClass: 'bg-sky-500/10 border border-sky-500/20 text-sky-400',
  },
];

const MARQUEE_ITEMS = [
  'Interactive Practice', 'Instant Explanations', 'Survival Mode', 'Flashcard Revision',
  '3-Tier Badges', 'Accuracy Analytics', 'Study Streaks', 'Cloud Sync', '30-Day Heatmap',
  'Interactive Practice', 'Instant Explanations', 'Survival Mode', 'Flashcard Revision',
  '3-Tier Badges', 'Accuracy Analytics', 'Study Streaks', 'Cloud Sync', '30-Day Heatmap',
];

const STEPS = [
  {
    n: '01',
    title: 'Pick Any Topic',
    desc: 'Select from computer science, science, general knowledge, or type custom notes.',
    highlight: 'Instant AI-Powered Curation',
  },
  {
    n: '02',
    title: 'Practice Interactively',
    desc: 'Choose Classic MCQ, high-intensity Survival Mode, or Spaced Repetition Flashcards.',
    highlight: 'Real-Time Pace & Hearts',
  },
  {
    n: '03',
    title: 'Track & Master',
    desc: 'Review mistakes, unlock 3-tier masteries, and watch your accuracy reach 90% and beyond.',
    highlight: '30-Day Study Heatmap',
  },
];

export default function LandingPage({ onOpenAuth, onNavigate }) {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const demoSectionRef = useRef(null);
  const stepsTrackRef = useRef(null);

  const [showDemo, setShowDemo] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const handleStart = () => {
    if (onNavigate) {
      onNavigate('/login');
    } else if (onOpenAuth) {
      onOpenAuth();
    }
  };

  const toggleLiveDemo = () => {
    setShowDemo((prev) => {
      const next = !prev;
      if (!prev) {
        setTimeout(() => {
          demoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
      return next;
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── GSAP ScrollTrigger Integration ── */
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      // 1. Global Page Scroll Tracker
      ScrollTrigger.create({
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          setScrollProgress(self.progress);
          setScrollY(window.scrollY || window.pageYOffset);
        },
      });

      if (!prefersReducedMotion) {
        // 2. Parallax on ambient background glow orbs
        gsap.to('.ambient-orb-1', {
          y: 280,
          ease: 'none',
          scrollTrigger: {
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.2,
          },
        });

        gsap.to('.ambient-orb-2', {
          y: -220,
          ease: 'none',
          scrollTrigger: {
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.6,
          },
        });

        // 3. Scroll-linked steps timeline line
        ScrollTrigger.create({
          trigger: '.steps-container',
          start: 'top 75%',
          end: 'bottom 60%',
          scrub: 0.3,
          onUpdate: (self) => {
            if (stepsTrackRef.current) {
              stepsTrackRef.current.style.height = `${Math.min(self.progress * 100, 100)}%`;
            }
            if (self.progress < 0.33) {
              setActiveStepIndex(0);
            } else if (self.progress < 0.66) {
              setActiveStepIndex(1);
            } else {
              setActiveStepIndex(2);
            }
          },
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative overflow-x-hidden bg-[#090807] text-[#f0ebe0]">

      {/* ── 1. GLOBAL TOP SCROLL PROGRESS BAR ── */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-white/[0.04] z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 transition-all duration-75 origin-left shadow-[0_0_10px_rgba(245,186,114,0.7)]"
          style={{ width: `${Math.round(scrollProgress * 100)}%` }}
        />
      </div>

      {/* ── 2. IMMERSIVE FULL-PAGE 3D WEBGL BACKGROUND ── */}
      {/* Continuously transforms in space as visitor scrolls through sections */}
      <Landing3DScene className="fixed inset-0 pointer-events-none opacity-60 z-0" />

      {/* ── 3. AMBIENT MULTI-PLANE PARALLAX GLOW ORBS ── */}
      <div
        className="ambient-orb-1 fixed top-10 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(245,186,114,0.08) 0%, transparent 70%)',
        }}
      />
      <div
        className="ambient-orb-2 fixed bottom-20 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Subtle dot grid pattern overlay */}
      <div className="fixed inset-0 dot-grid opacity-25 pointer-events-none z-0" />

      {/* ── 4. FLOATING BACK TO TOP & SCROLL % PILL ── */}
      <div
        className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${
          scrollY > 400
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <button
          onClick={scrollToTop}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full glass-card border-white/10 hover:border-amber-400/40 bg-[#161310]/90 text-xs font-bold text-[#dedbd3] hover:text-white shadow-2xl backdrop-blur-xl transition-all group"
          title="Scroll back to top"
          aria-label="Scroll to top"
        >
          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center group-hover:-translate-y-0.5 transition-transform">
            <ArrowUp className="w-3 h-3" />
          </div>
          <span className="font-mono text-[11px] text-amber-400/90">
            {Math.round(scrollProgress * 100)}%
          </span>
        </button>
      </div>

      {/* ── 5. HERO SECTION ── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 lg:py-24 z-10">

        {/* Main Hero Container */}
        <div
          ref={heroRef}
          className={`max-w-7xl mx-auto w-full transition-all duration-500 my-auto ${
            showDemo
              ? 'grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center'
              : 'flex flex-col items-center text-center'
          }`}
        >

          {/* Hero Copy & CTAs */}
          <div
            className={`space-y-6 ${
              showDemo
                ? 'lg:col-span-6 text-center lg:text-left'
                : 'max-w-3xl mx-auto'
            }`}
          >

            {/* Pill Tag */}
            <div
              className="flex items-center justify-center lg:justify-start animate-slide-up"
              style={{ animationDelay: '0.05s', animationFillMode: 'both' }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[#f5ba72] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Interactive Quiz & Practice Platform</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1
              className="text-3xl sm:text-5xl lg:text-[3.5rem] font-black text-white tracking-tight leading-[1.12] animate-slide-up"
              style={{ animationDelay: '0.12s', animationFillMode: 'both' }}
            >
              Study Faster.{' '}
              <br className="hidden sm:block" />
              Test Deeper.{' '}
              <span className="gradient-text block sm:inline">Score Higher.</span>
            </h1>

            {/* Subtext */}
            <p
              className="text-sm sm:text-base text-[#b5af9f] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal animate-slide-up"
              style={{ animationDelay: '0.18s', animationFillMode: 'both' }}
            >
              Turn lectures and topics into active MCQ practice, survival trials, and flashcard decks.
              Get instant explanations, real-time pace metrics, and earn progressive mastery badges.
            </p>

            {/* CTA Button Row */}
            <div
              className={`flex flex-col sm:flex-row items-center gap-3.5 pt-2 animate-slide-up ${
                showDemo ? 'justify-center lg:justify-start' : 'justify-center'
              }`}
              style={{ animationDelay: '0.24s', animationFillMode: 'both' }}
            >
              <button
                onClick={handleStart}
                className="btn-primary py-3.5 px-7 rounded-xl text-sm font-bold flex items-center justify-center gap-2 group w-full sm:w-auto shadow-caramel-glow"
                id="hero-start-btn"
              >
                <span>Start Practicing Free</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Try Live Demo Toggle Button */}
              <button
                onClick={toggleLiveDemo}
                className={`py-3.5 px-6 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 w-full sm:w-auto border ${
                  showDemo
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,186,114,0.15)]'
                    : 'bg-white/[0.03] text-[#dedbd3] hover:text-white border-white/10 hover:border-amber-400/30 hover:bg-white/[0.06]'
                }`}
                id="hero-toggle-demo-btn"
              >
                <Play className={`w-3.5 h-3.5 ${showDemo ? 'fill-amber-300 text-amber-300' : 'fill-current'}`} />
                <span>{showDemo ? 'Close Live Demo' : 'Try Live Demo'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              </button>
            </div>

            {/* Feature Checkpoints */}
            <div
              className={`flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs text-[#8d877c] animate-slide-up ${
                showDemo ? 'justify-center lg:justify-start' : 'justify-center'
              }`}
              style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
            >
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Free Forever
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Instant Explanations
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> No Card Needed
              </span>
            </div>

          </div>

          {/* When showDemo is true: side-by-side on desktop, below on mobile */}
          {showDemo && (
            <div
              ref={demoSectionRef}
              className="lg:col-span-6 w-full flex justify-center animate-slide-up pt-4 lg:pt-0"
              id="live-demo-container"
            >
              <LiveQuizDemo
                onStartFree={handleStart}
                onClose={() => setShowDemo(false)}
              />
            </div>
          )}

        </div>

        {/* Scroll Cue at bottom of hero */}
        <div
          className="pt-10 transition-opacity duration-300 flex flex-col items-center gap-1.5 text-[#8d877c]"
          style={{ opacity: Math.max(0, 1 - scrollY / 120) }}
        >
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#8d877c]">
            Scroll to explore
          </span>
          <div className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-amber-400 animate-bounce" />
          </div>
        </div>

      </section>

      {/* ── 6. MARQUEE STRIP ── */}
      <div className="py-3.5 border-y border-white/[0.07] bg-[#100f0d]/90 backdrop-blur-md relative z-10 overflow-hidden">
        <div className="marquee-wrapper">
          <div className="flex gap-0 animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
            {MARQUEE_ITEMS.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3 px-6 text-[11px] font-semibold text-[#8d877c] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 opacity-60 shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 7. THREE WAYS TO STUDY (Interactive Modes with Live Previews) ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-3.5 max-w-2xl mx-auto">
          {/* Centered pill */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[#f5ba72] text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Three Ways To Study</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Tailored Modes for <span className="gradient-text">Every Learning Style</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8d877c] max-w-lg mx-auto">
            Test and try all three modes right now below — Classic MCQ with pace stats, 3-heart Survival trials, and 3D flip flashcards!
          </p>
        </div>

        {/* Live Interactive Study Modes Showcase */}
        <StudyModesPreview onStartMode={handleStart} />
      </section>

      {/* ── 8. PLATFORM HIGHLIGHTS (Features Grid) ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-14 space-y-3.5 max-w-xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[#f5ba72] text-[11px] font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Platform Highlights</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Built for <span className="gradient-text">Serious Exam Success</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8d877c]">
            Everything students and learners need to absorb concepts and test under realistic pressure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => {
            const IconC = f.icon;
            return (
              <div
                key={f.title}
                className="glass-card p-6 rounded-2xl border-white/[0.08] hover:border-amber-400/30 hover:bg-[#161412] transition-all duration-300 space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div className={`w-11 h-11 rounded-xl ${f.colorClass} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                      <IconC className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 text-[#8d877c] uppercase tracking-wider">
                      {f.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base leading-snug group-hover:text-amber-300 transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-xs text-[#8d877c] mt-1.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 9. HOW IT WORKS (Connected Scroll-Driven Timeline) ── */}
      <section className="steps-container py-24 px-4 sm:px-6 lg:px-8 bg-[#0c0b0a]/90 backdrop-blur-md border-y border-white/[0.06] relative z-10">
        <div className="max-w-5xl mx-auto space-y-14">
          <div className="text-center space-y-3.5 max-w-md mx-auto">
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[#f5ba72] text-[11px] font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Simple 3-Step Process</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white">How QuizCraft Works</h2>
            <p className="text-xs sm:text-sm text-[#8d877c]">
              From concept to practice-ready quiz in under 2 minutes.
            </p>
          </div>

          {/* Interactive Steps Grid with Scroll Track */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {STEPS.map((s, idx) => {
              const isCurrentActive = activeStepIndex === idx;
              return (
                <div
                  key={s.n}
                  className={`glass-card p-6 sm:p-7 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-4 ${
                    isCurrentActive
                      ? 'border-amber-500/40 bg-[#191612] shadow-[0_0_20px_rgba(245,186,114,0.12)] scale-[1.02]'
                      : 'border-white/[0.08] hover:border-amber-400/25'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-black text-xl transition-all duration-300 ${
                      isCurrentActive
                        ? 'bg-amber-500/25 border border-amber-400/60 text-amber-300 shadow-[0_0_12px_rgba(245,186,114,0.3)]'
                        : 'bg-amber-500/10 border border-amber-500/20 text-amber-400/70'
                    }`}
                  >
                    {s.n}
                  </div>

                  <div className="space-y-1.5">
                    <h3 className={`text-base font-bold transition-colors ${isCurrentActive ? 'text-amber-300' : 'text-white'}`}>
                      {s.title}
                    </h3>
                    <p className="text-xs text-[#8d877c] leading-relaxed">{s.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] w-full">
                    <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider">
                      {s.highlight}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 10. FINAL CALL TO ACTION BANNER ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
        <div className="glass-card p-8 sm:p-14 text-center relative overflow-hidden space-y-6 rounded-3xl border-amber-500/25 bg-gradient-to-b from-[#1b1712] to-[#12100e] shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-sm">
            <Brain className="w-7 h-7" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Ready to Upgrade Your <span className="gradient-text">Study Sessions?</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#8d877c] leading-relaxed">
              Create your free account. Build your first quiz in seconds. Practice with smart analytics and 3-tier masteries.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleStart}
              className="btn-primary py-3.5 px-8 text-sm font-bold flex items-center justify-center gap-2 group shadow-caramel-glow"
              id="landing-cta-bottom"
            >
              <span>Get Started Free</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <p className="text-[10px] text-[#6c665d]">
            Free forever • Instant setup • No credit card required
          </p>
        </div>
      </section>

    </div>
  );
}
