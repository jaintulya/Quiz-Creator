import { useRef, useEffect, useState } from 'react';
import {
  Brain, Sparkles, Zap, Target, Users, ArrowRight, Star, Trophy,
  BookOpen, ChevronRight, CheckCircle2, Layers, Clock, BarChart2,
  ShieldAlert, RotateCw, Play, Flame, Award, Check
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
    color: 'amber',
    desc: 'Timed multiple choice questions with detailed line-by-line explanations and mistake tagging.',
    features: ['Instant answer analysis', 'Timer with pace calculator', 'Mistake bookmarking & re-attempts'],
  },
  {
    id: 'survival',
    title: 'Survival Challenge',
    badge: 'High Stakes',
    icon: Flame,
    color: 'rose',
    desc: '3 lives only! Each wrong answer costs a heart. Can you survive all questions and earn the Immortal badge?',
    features: ['3 hearts survival bar', 'Real-time adrenaline test', 'Earn exclusive Survival Champion badges'],
  },
  {
    id: 'flashcards',
    title: 'Flashcards Review',
    badge: 'Spaced Repetition',
    icon: RotateCw,
    color: 'sky',
    desc: 'Flip-to-reveal study cards for active recall. Perfect for quick exam revision and concept memorization.',
    features: ['3D flip interaction', 'Self-assessment ratings', 'Master tricky formulas and concepts fast'],
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Smart Question Generator',
    desc: 'Generate exam-grade questions across 50+ topics with customizable difficulty, count, and instant answers.',
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
    desc: 'Share quizzes with classmates using 6-character codes. Review peer submissions and compete on speed.',
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

const TESTIMONIALS = [
  {
    name: 'Sarah Jenkins',
    role: 'Computer Science, 2nd Year',
    text: 'The instant explanation feature completely changed how I revise for exams. My test scores jumped from 72% to 91% in one semester.',
    avatar: 'S',
    score: '91% Score',
  },
  {
    name: 'David Chen',
    role: 'B.Tech IT, 3rd Year',
    text: 'Survival Mode is so addictive! You actually feel the pressure of the exam clock. It makes learning feel like an engaging game.',
    avatar: 'D',
    score: '88% Score',
  },
  {
    name: 'Marcus Vance',
    role: 'Engineering, 2nd Year',
    text: 'Being able to customize difficulty and share quizzes with my study group saved us dozens of hours before finals.',
    avatar: 'M',
    score: '95% Score',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Pick Any Topic',
    desc: 'Select from computer science, web architecture, science, or paste custom course notes.',
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
  const [activeModeTab, setActiveModeTab] = useState('classic');
  const [timelineProgress, setTimelineProgress] = useState(0);

  const handleStart = () => {
    if (onNavigate) {
      onNavigate('/login');
    } else if (onOpenAuth) {
      onOpenAuth();
    }
  };

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Hero Content Entrance Stagger
      gsap.fromTo(
        '.gsap-hero-anim',
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.12,
          ease: 'power3.out',
        }
      );

      // 2. Parallax Floating Cards in Hero
      gsap.to('.gsap-hero-float-1', {
        y: -90,
        rotation: -4,
        ease: 'none',
        scrollTrigger: {
          trigger: '.gsap-hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      gsap.to('.gsap-hero-float-2', {
        y: -130,
        rotation: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: '.gsap-hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.6,
        },
      });

      // 3. Stats Section Reveal
      gsap.fromTo(
        '.gsap-stat-card',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.gsap-stats-section',
            start: 'top 85%',
            once: true,
          },
        }
      );

      // 4. Feature Cards 3D Staggered Batch Reveal
      ScrollTrigger.batch('.gsap-feature-card', {
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { y: 45, opacity: 0, scale: 0.96 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.65,
              stagger: 0.12,
              ease: 'power2.out',
              overwrite: true,
            }
          );
        },
        start: 'top 85%',
        once: true,
      });

      // 5. Steps Timeline Progress
      ScrollTrigger.create({
        trigger: '.gsap-steps-section',
        start: 'top 75%',
        end: 'bottom 60%',
        scrub: 0.5,
        onUpdate: (self) => {
          setTimelineProgress(Math.round(self.progress * 100));
        },
      });

      // 6. Testimonials Stagger
      gsap.fromTo(
        '.gsap-testi-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.gsap-testi-section',
            start: 'top 80%',
            once: true,
          },
        }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  const currentMode = STUDY_MODES.find((m) => m.id === activeModeTab) || STUDY_MODES[0];
  const ModeIcon = currentMode.icon;

  return (
    <div ref={containerRef} className="relative overflow-x-hidden bg-[#090807] text-[#f0ebe0]">

      {/* ── HERO SECTION WITH 3D WEBGL SCENE ── */}
      <section className="gsap-hero-section relative min-h-[92vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 lg:py-28 overflow-hidden">

        {/* Interactive Three.js 3D WebGL Canvas */}
        <Landing3DScene className="opacity-75" />

        {/* Dot grid pattern overlay */}
        <div className="absolute inset-0 dot-grid opacity-35 pointer-events-none" />

        {/* Ambient Warm Radial Lighting */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(245,186,114,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Floating Decorative 3D Card 1 — Top Left Parallax */}
        <div className="gsap-hero-float-1 absolute top-20 left-4 sm:left-12 lg:left-16 w-52 hidden xl:block pointer-events-none z-10">
          <div className="glass-card p-4 border-amber-500/20 bg-[#161310]/90 space-y-2.5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Pace & Speed</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <p className="text-xs font-semibold text-white">4.2s / Question</p>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: '85%' }} />
            </div>
            <p className="text-[9px] text-[#8d877c]">Speed Demon (Level 2 Active)</p>
          </div>
        </div>

        {/* Floating Decorative 3D Card 2 — Bottom Right Parallax */}
        <div className="gsap-hero-float-2 absolute bottom-24 right-4 sm:right-12 lg:right-16 w-56 hidden xl:block pointer-events-none z-10">
          <div className="glass-card p-4 border-emerald-500/20 bg-[#161310]/90 space-y-2.5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Exam Mastery</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-400">96%</span>
              <span className="text-[11px] text-[#8d877c]">Avg Accuracy</span>
            </div>
            <p className="text-[9px] text-[#8d877c]">Top 5% student percentile</p>
          </div>
        </div>

        {/* Main Hero Container — Split 2 Columns */}
        <div ref={heroRef} className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column: Hero Text & CTAs */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-6">

            {/* Pill Tag */}
            <div className="gsap-hero-anim inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[#f5ba72] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Interactive Quiz & Practice Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="gsap-hero-anim text-3xl sm:text-5xl lg:text-[3.6rem] font-black text-white tracking-tight leading-[1.12]">
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
            <div className="gsap-hero-anim flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={handleStart}
                className="btn-primary py-3.5 px-7 rounded-xl text-sm font-bold flex items-center justify-center gap-2 group w-full sm:w-auto"
                id="hero-start-btn"
              >
                <span>Start Practicing Free</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <a
                href="#interactive-demo"
                className="btn-secondary py-3 px-5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 w-full sm:w-auto text-[#dedbd3] hover:text-white"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Try Live Demo Below</span>
              </a>
            </div>

            {/* Feature Checkpoints */}
            <div className="gsap-hero-anim flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 pt-2 text-xs text-[#8d877c]">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Free Forever
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Instant Explanations
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> No Card Needed
              </span>
            </div>

          </div>

          {/* Right Column: Live Interactive Quiz Preview Card */}
          <div id="interactive-demo" className="lg:col-span-6 flex justify-center gsap-hero-anim">
            <LiveQuizDemo onStartFree={handleStart} />
          </div>

        </div>

      </section>

      {/* ── MARQUEE STRIP ── */}
      <div className="py-4 border-y border-white/[0.07] bg-[#11100e] overflow-hidden">
        <div className="marquee-wrapper">
          <div className="flex gap-0 animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
            {MARQUEE_ITEMS.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-3 px-6 text-[12px] font-semibold text-[#8d877c] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 opacity-60 shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS COUNTER BAR ── */}
      <section className="gsap-stats-section py-16 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="gsap-stat-card glass-card p-5 text-center rounded-2xl border-white/[0.07]">
            <p className="text-3xl sm:text-4xl font-black text-white">10,000+</p>
            <p className="text-xs text-[#8d877c] font-medium mt-1">Quizzes Generated</p>
          </div>
          <div className="gsap-stat-card glass-card p-5 text-center rounded-2xl border-white/[0.07]">
            <p className="text-3xl sm:text-4xl font-black text-amber-300">98.4%</p>
            <p className="text-xs text-[#8d877c] font-medium mt-1">Concept Retention</p>
          </div>
          <div className="gsap-stat-card glass-card p-5 text-center rounded-2xl border-white/[0.07]">
            <p className="text-3xl sm:text-4xl font-black text-white">3 Modes</p>
            <p className="text-xs text-[#8d877c] font-medium mt-1">Classic, Survival, Flashcards</p>
          </div>
          <div className="gsap-stat-card glass-card p-5 text-center rounded-2xl border-white/[0.07]">
            <p className="text-3xl sm:text-4xl font-black text-emerald-400">4.9 / 5.0</p>
            <p className="text-xs text-[#8d877c] font-medium mt-1">Student Rating</p>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE STUDY MODES SHOWCASE (Tabs) ── */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="section-tag mx-auto block w-fit">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Three Ways To Study
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Tailored Modes for <span className="gradient-text">Every Learning Style</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8d877c]">
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
                <IconComp className={`w-4 h-4 ${isTabActive ? 'text-amber-400' : 'text-[#8d877c]'}`} />
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
                <p className="text-xs text-[#8d877c]">{currentMode.desc}</p>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="btn-primary py-2 px-4 text-xs font-bold shrink-0 self-start sm:self-auto gap-1.5"
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

      {/* ── FEATURES GRID ── */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14 space-y-3 max-w-xl mx-auto">
          <span className="section-tag mx-auto block w-fit">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Platform Highlights
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Built for <span className="gradient-text">Serious Exam Success</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8d877c]">
            Everything students and lifelong learners need to absorb concepts and test under realistic pressure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => {
            const IconC = f.icon;
            return (
              <div
                key={f.title}
                className="gsap-feature-card glass-card p-6 rounded-2xl border-white/[0.08] hover:border-white/20 transition-all duration-200 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div className={`w-11 h-11 rounded-xl ${f.colorClass} flex items-center justify-center shrink-0`}>
                      <IconC className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 text-[#8d877c] uppercase tracking-wider">
                      {f.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base leading-snug">{f.title}</h3>
                    <p className="text-xs text-[#8d877c] mt-1.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS (Timeline with Scroll Progress) ── */}
      <section className="gsap-steps-section py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#0c0b0a] border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto space-y-14">
          <div className="text-center space-y-3 max-w-md mx-auto">
            <span className="section-tag mx-auto block w-fit">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">How QuizCraft Works</h2>
            <p className="text-xs sm:text-sm text-[#8d877c]">
              From concept to practice-ready quiz in under 2 minutes.
            </p>
          </div>

          {/* Steps Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {STEPS.map((s, idx) => (
              <div
                key={s.n}
                className="glass-card p-6 sm:p-7 rounded-2xl border-white/[0.08] flex flex-col items-center text-center gap-4 relative"
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

      {/* ── TESTIMONIALS ── */}
      <section className="gsap-testi-section py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-md mx-auto">
          <span className="section-tag mx-auto block w-fit">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-current" /> Verified Student Reviews
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Loved by <span className="gradient-text">Top Performers</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="gsap-testi-card glass-card p-6 rounded-2xl border-white/[0.08] space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#dedbd3] leading-relaxed">
                  "{t.text}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f5ba72] to-[#c4731c] text-black font-extrabold flex items-center justify-center text-xs">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{t.name}</p>
                    <p className="text-[10px] text-[#8d877c]">{t.role}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  {t.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CALL TO ACTION BANNER ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="glass-card p-8 sm:p-14 text-center relative overflow-hidden space-y-6 rounded-3xl border-amber-500/25 bg-gradient-to-b from-[#1b1712] to-[#12100e]">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
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
              className="btn-primary py-3 px-8 text-sm font-bold flex items-center gap-2 group shadow-sm"
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
