import { useRef, useEffect, useState } from 'react';
import {
  Brain, Sparkles, Zap, Target, Users, ArrowRight,
  BookOpen, ChevronRight, CheckCircle2, RotateCw,
  Play, Flame, Award, Check, X
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Landing3DScene from '../components/landing/Landing3DScene.jsx';
import LiveQuizDemo from '../components/landing/LiveQuizDemo.jsx';

gsap.registerPlugin(ScrollTrigger);

/* ── Interactive Study Modes Data ── */
const STUDY_MODES = [
  {
    id: 'classic',
    title: 'Classic MCQ Mode',
    badge: 'Comprehensive',
    icon: BookOpen,
    desc: 'Timed multiple choice questions with detailed line-by-line explanations, mistake tagging, and pace metrics.',
    features: ['Instant answer analysis & explanations', 'Timer with pace calculator per question', 'Mistake bookmarking & re-attempts'],
  },
  {
    id: 'survival',
    title: 'Survival Challenge',
    badge: 'High Stakes',
    icon: Flame,
    desc: '3 lives only! Each wrong answer costs a heart. Can you survive all questions and earn the Immortal badge?',
    features: ['3 hearts survival bar with live tension', 'Real-time adrenaline test under pressure', 'Unlock exclusive Survival Champion badges'],
  },
  {
    id: 'flashcards',
    title: 'Flashcards Review',
    badge: 'Spaced Repetition',
    icon: RotateCw,
    desc: 'Flip-to-reveal study cards for active recall. Perfect for quick exam revision and concept memorization.',
    features: ['3D flip interaction with front/back cards', 'Self-assessment ratings for tricky concepts', 'Master key formulas and definitions fast'],
  },
];

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
  },
  {
    n: '02',
    title: 'Practice Interactively',
    desc: 'Choose Classic MCQ, high-intensity Survival Mode, or Spaced Repetition Flashcards.',
  },
  {
    n: '03',
    title: 'Track & Master',
    desc: 'Review mistakes, unlock 3-tier masteries, and watch your accuracy reach 90% and beyond.',
  },
];

export default function LandingPage({ onOpenAuth, onNavigate }) {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const demoSectionRef = useRef(null);

  const [showDemo, setShowDemo] = useState(false);
  const [activeModeTab, setActiveModeTab] = useState('classic');

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

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Hero Content Entrance Stagger
      gsap.fromTo(
        '.gsap-hero-anim',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.1,
          ease: 'power3.out',
        }
      );

      // 2. Feature Cards 3D Staggered Batch Reveal
      ScrollTrigger.batch('.gsap-feature-card', {
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { y: 40, opacity: 0, scale: 0.97 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.65,
              stagger: 0.1,
              ease: 'power2.out',
              overwrite: true,
            }
          );
        },
        start: 'top 85%',
        once: true,
      });

      // 3. How It Works Steps Reveal
      ScrollTrigger.batch('.gsap-step-card', {
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { y: 35, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.12,
              ease: 'power2.out',
              overwrite: true,
            }
          );
        },
        start: 'top 85%',
        once: true,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const currentMode = STUDY_MODES.find((m) => m.id === activeModeTab) || STUDY_MODES[0];
  const ModeIcon = currentMode.icon;

  return (
    <div ref={containerRef} className="relative overflow-x-hidden bg-[#090807] text-[#f0ebe0]">

      {/* ── HERO SECTION WITH 3D WEBGL SCENE ── */}
      <section className="gsap-hero-section relative min-h-[88vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 lg:py-24 overflow-hidden">

        {/* Interactive Three.js 3D WebGL Canvas */}
        <Landing3DScene className="opacity-75" />

        {/* Subtle dot grid pattern overlay */}
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

        {/* Ambient Warm Radial Lighting */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[500px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(245,186,114,0.11) 0%, transparent 70%)',
          }}
        />

        {/* Main Hero Container — Dynamically transitions between centered view & side-by-side demo view */}
        <div
          ref={heroRef}
          className={`relative z-20 max-w-7xl mx-auto w-full transition-all duration-500 ${
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

            {/* Pill Tag — Perfectly centered with icon aligned */}
            <div className="gsap-hero-anim flex items-center justify-center lg:justify-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[#f5ba72] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Interactive Quiz & Practice Platform</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="gsap-hero-anim text-3xl sm:text-5xl lg:text-[3.5rem] font-black text-white tracking-tight leading-[1.12]">
              Study Faster.{' '}
              <br className="hidden sm:block" />
              Test Deeper.{' '}
              <span className="gradient-text block sm:inline">Score Higher.</span>
            </h1>

            {/* Subtext */}
            <p className="gsap-hero-anim text-sm sm:text-base text-[#b5af9f] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Turn lectures and topics into active MCQ practice, survival trials, and flashcard decks.
              Get instant explanations, real-time pace metrics, and earn progressive mastery badges.
            </p>

            {/* CTA Button Row */}
            <div
              className={`gsap-hero-anim flex flex-col sm:flex-row items-center gap-3.5 pt-2 ${
                showDemo ? 'justify-center lg:justify-start' : 'justify-center'
              }`}
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
              className={`gsap-hero-anim flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs text-[#8d877c] ${
                showDemo ? 'justify-center lg:justify-start' : 'justify-center'
              }`}
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

          {/* When showDemo is true:
              - On Desktop (lg): Appears side-by-side in right column
              - On Mobile: Appears directly below the hero buttons */}
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

      </section>

      {/* ── MARQUEE STRIP ── */}
      <div className="py-3.5 border-y border-white/[0.07] bg-[#100f0d] overflow-hidden">
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

      {/* ── THREE WAYS TO STUDY (Interactive Modes Showcase) ── */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3.5 max-w-2xl mx-auto">
          {/* Centered pill with icon aligned */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[#f5ba72] text-[11px] font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Three Ways To Study</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Tailored Modes for <span className="gradient-text">Every Learning Style</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8d877c] max-w-lg mx-auto">
            Switch seamlessly between in-depth practice, high-intensity exam challenges, and rapid flashcard reviews.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {STUDY_MODES.map((mode) => {
            const isTabActive = activeModeTab === mode.id;
            const IconComp = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveModeTab(mode.id)}
                className={`px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all duration-200 border ${
                  isTabActive
                    ? 'bg-[#1e1a15] border-amber-500/40 text-white shadow-lg'
                    : 'bg-white/[0.02] border-white/[0.06] text-[#8d877c] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <IconComp className={`w-4 h-4 shrink-0 ${isTabActive ? 'text-amber-400' : 'text-[#8d877c]'}`} />
                <span>{mode.title}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  isTabActive ? 'bg-amber-400/20 text-amber-300' : 'bg-white/5 text-[#6c665d]'
                }`}>
                  {mode.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Mode Showcase Card */}
        <div className="glass-card p-6 sm:p-10 rounded-3xl border-white/10 max-w-4xl mx-auto bg-gradient-to-br from-[#161412] to-[#100f0e] shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ModeIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">{currentMode.title}</h3>
                <p className="text-xs text-[#8d877c] mt-0.5">{currentMode.desc}</p>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="btn-primary py-2 px-4 text-xs font-bold shrink-0 self-start sm:self-auto gap-1.5 shadow-caramel-glow"
            >
              <span>Play {currentMode.title}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.07]">
            {currentMode.features.map((feat, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-[#dedbd3] font-medium">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM HIGHLIGHTS (Features Grid) ── */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14 space-y-3.5 max-w-xl mx-auto">
          {/* Centered pill with icon aligned */}
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
                className="gsap-feature-card glass-card p-6 rounded-2xl border-white/[0.08] hover:border-amber-400/30 hover:bg-[#161412] transition-all duration-300 space-y-4 flex flex-col justify-between group"
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

      {/* ── HOW IT WORKS (Timeline) ── */}
      <section className="gsap-steps-section py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#0c0b0a] border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto space-y-14">
          <div className="text-center space-y-3.5 max-w-md mx-auto">
            {/* Centered pill with icon aligned */}
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

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="gsap-step-card glass-card p-6 sm:p-7 rounded-2xl border-white/[0.08] hover:border-amber-400/25 flex flex-col items-center text-center gap-4 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 font-mono font-black text-xl shadow-sm">
                  {s.n}
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">{s.title}</h3>
                  <p className="text-xs text-[#8d877c] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CALL TO ACTION BANNER ── */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
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
