import { useRef, useEffect, useState } from 'react';
import {
  Brain, Sparkles, Zap, Target, Users, ArrowRight,
  Award, Check, Play, Heart, Flame, Clock, BookOpen,
  RotateCcw, CheckCircle2, ChevronDown, Layers
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Landing3DScene from '../components/landing/Landing3DScene.jsx';

gsap.registerPlugin(ScrollTrigger);

const EDITORIAL_FEATURES = [
  {
    num: '01',
    category: 'INTELLIGENT CREATION',
    title: 'Smart Question Generator',
    headline: 'Exam-Grade Questions Built for Real Conceptual Retention',
    desc: 'Generate curated, syllabus-accurate questions across technical, academic, and custom lecture topics with full control over difficulty and problem counts.',
    tags: ['Custom Syllabus', 'Multiple Difficulties', 'Curated Distractors'],
    stat: '100% Concept-Aligned',
  },
  {
    num: '02',
    category: 'DIAGNOSTIC METRICS',
    title: 'Deep Learning Analytics',
    headline: 'Diagnose Misconceptions Before You Ever Sit for an Exam',
    desc: 'Track per-question pace, accuracy rates, and 30-day retention heatmaps. Identify whether mistakes stem from conceptual gaps or time-pressure fatigue.',
    tags: ['Pace Distribution', '30-Day Heatmap', 'Misconception Tags'],
    stat: 'Sub-Second Accuracy Feedback',
  },
  {
    num: '03',
    category: 'TIERED PROGRESSION',
    title: 'Progressive Mastery Badges',
    headline: 'Skill Tiers That Actually Reflect Deep Material Competence',
    desc: 'Earn progressive mastery tiers across Bronze Scholar, Silver Specialist, and Gold Master as accuracy thresholds and review consistency compound.',
    tags: ['Bronze • Silver • Gold', 'Streak Multipliers', 'Verified Milestones'],
    stat: '3-Tier Achievement Ladder',
  },
  {
    num: '04',
    category: 'PEER COLLABORATION',
    title: 'Cloud Sync & Class Sharing',
    headline: 'Study Anywhere. Collaborate with Classmates in Real Time.',
    desc: 'Access your revision decks and quiz history seamlessly across desktop and mobile. Share custom practice sets instantly using clean 6-character room codes.',
    tags: ['6-Digit Room Codes', 'Instant Multi-Device Sync', 'Peer Review'],
    stat: 'Instant Cloud Sync',
  },
];

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Select or Prompt Any Topic',
    summary: 'Pick from academic categories or paste raw lecture notes to generate target practice sets.',
    detail: 'From Operating Systems and Organic Chemistry to custom syllabi, QuizCraft structures questions with precise difficulty gradations.',
  },
  {
    step: '02',
    title: 'Practice with Active Recall',
    summary: 'Engage with Timed Classic MCQs, high-stakes 3-Heart Survival trials, or Spaced Flashcards.',
    detail: 'Every wrong answer generates instant rationale and pace feedback so you never repeat the same misconception.',
  },
  {
    step: '03',
    title: 'Lock In Long-Term Mastery',
    summary: 'Review flagged mistakes, track your 30-day consistency heatmap, and claim tier badges.',
    detail: 'Visual telemetry highlights your fastest-improving topics and pinpoints the exact concepts needing review before test day.',
  },
];

export default function LandingPage({ onOpenAuth, onNavigate }) {
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);

  // Scene Refs
  const heroRef = useRef(null);
  const heroContentRef = useRef(null);
  const heroCueRef = useRef(null);
  const modesPinRef = useRef(null);
  const journeyPinRef = useRef(null);
  const analyticsRef = useRef(null);
  const workflowPinRef = useRef(null);
  const featuresRef = useRef(null);
  const finalCtaRef = useRef(null);

  // Interactive state tracking for pinned scenes (driven smoothly by GSAP scrub)
  const [activeStudyMode, setActiveStudyMode] = useState(0); // 0: MCQ, 1: Survival, 2: Flashcards
  const [journeyPhase, setJourneyPhase] = useState(1);       // 1 to 5
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0); // 0, 1, 2
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  const handleStart = () => {
    if (onNavigate) {
      onNavigate('/login');
    } else if (onOpenAuth) {
      onOpenAuth();
    }
  };

  const scrollToScene = (elementRef) => {
    if (elementRef?.current) {
      elementRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /* ─────────────────────────────────────────────────────────────────────────────
     GSAP SCROLLTRIGGER ORCHESTRATION
     All major layer transformations scrubbed continuously to scroll position.
  ───────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      // 1. GLOBAL TOP SCROLL PROGRESS BAR (GPU Accelerated scaleX)
      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.15,
          },
        });
      }

      if (prefersReducedMotion) return;

      // ─────────────────────────────────────────────────────────────
      // SCENE 01: HERO SCROLL SCRUB
      // Typography shifts in 3D perspective rather than simply fading.
      // ─────────────────────────────────────────────────────────────
      if (heroContentRef.current) {
        gsap.to(heroContentRef.current, {
          y: -110,
          scale: 0.94,
          opacity: 0.15,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      if (heroCueRef.current) {
        gsap.to(heroCueRef.current, {
          opacity: 0,
          y: 16,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: '140px top',
            scrub: true,
          },
        });
      }

      // ─────────────────────────────────────────────────────────────
      // SCENE 02: THREE STUDY MODES (PINNED SCROLL SCENE)
      // Viewport remains stable while Classic MCQ -> Survival -> Flashcards
      // morph continuously into each other!
      // ─────────────────────────────────────────────────────────────
      if (modesPinRef.current) {
        const modesTl = gsap.timeline({
          scrollTrigger: {
            trigger: modesPinRef.current,
            start: 'top top',
            end: '+=2400',
            pin: true,
            scrub: 1,
            onUpdate: (self) => {
              const p = self.progress;
              if (p < 0.35) {
                setActiveStudyMode(0);
                setFlashcardFlipped(false);
              } else if (p < 0.70) {
                setActiveStudyMode(1);
                setFlashcardFlipped(false);
              } else {
                setActiveStudyMode(2);
                setFlashcardFlipped(p > 0.85);
              }
            },
          },
        });

        // Layer transitions between the 3 modes inside the pinned viewport
        modesTl
          .to('.modes-stage-mcq', { opacity: 1, scale: 1, duration: 1 })
          .to('.modes-stage-mcq', { opacity: 0, scale: 0.92, y: -30, duration: 0.8 })
          .fromTo('.modes-stage-survival', { opacity: 0, scale: 0.92, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 1 })
          .to('.modes-stage-survival', { opacity: 0, scale: 0.92, y: -30, duration: 0.8 })
          .fromTo('.modes-stage-flashcards', { opacity: 0, scale: 0.92, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 1 });
      }

      // ─────────────────────────────────────────────────────────────
      // SCENE 03: INTERACTIVE QUIZ JOURNEY (PINNED SCROLL SCENE)
      // Moving the scroll wheel simulates solving a problem step-by-step!
      // ─────────────────────────────────────────────────────────────
      if (journeyPinRef.current) {
        ScrollTrigger.create({
          trigger: journeyPinRef.current,
          start: 'top top',
          end: '+=2200',
          pin: true,
          scrub: 0.8,
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.22) {
              setJourneyPhase(1); // Question arrives
            } else if (p < 0.44) {
              setJourneyPhase(2); // Options assemble
            } else if (p < 0.66) {
              setJourneyPhase(3); // Answer selected
            } else if (p < 0.88) {
              setJourneyPhase(4); // Instant verification & explanation
            } else {
              setJourneyPhase(5); // Score HUD & XP advancement
            }
          },
        });
      }

      // ─────────────────────────────────────────────────────────────
      // SCENE 04: ANALYTICS & MASTERY DATA STORY
      // Circular accuracy ring fills up and mastery badge locks in.
      // ─────────────────────────────────────────────────────────────
      if (analyticsRef.current) {
        gsap.fromTo(
          '.analytics-dial-circle',
          { strokeDashoffset: 440 },
          {
            strokeDashoffset: 44, // 90% fill
            ease: 'none',
            scrollTrigger: {
              trigger: analyticsRef.current,
              start: 'top 75%',
              end: 'center center',
              scrub: 1,
            },
          }
        );

        gsap.fromTo(
          '.mastery-badge-gold',
          { scale: 0.85, opacity: 0.4 },
          {
            scale: 1,
            opacity: 1,
            boxShadow: '0 0 40px rgba(245,186,114,0.4)',
            ease: 'power2.out',
            scrollTrigger: {
              trigger: analyticsRef.current,
              start: 'center center',
              end: 'bottom 85%',
              scrub: 1,
            },
          }
        );
      }

      // ─────────────────────────────────────────────────────────────
      // SCENE 05: HOW QUIZCRAFT WORKS (PINNED 3-STEP PROCESS)
      // 01 Topic -> 02 Practice -> 03 Master
      // ─────────────────────────────────────────────────────────────
      if (workflowPinRef.current) {
        ScrollTrigger.create({
          trigger: workflowPinRef.current,
          start: 'top top',
          end: '+=2000',
          pin: true,
          scrub: 0.8,
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.38) {
              setActiveWorkflowStep(0);
            } else if (p < 0.72) {
              setActiveWorkflowStep(1);
            } else {
              setActiveWorkflowStep(2);
            }
          },
        });
      }

      // ─────────────────────────────────────────────────────────────
      // SCENE 06: EDITORIAL FEATURE ROWS EXPANSION
      // Active row illuminates while inactive rows maintain restraint.
      // ─────────────────────────────────────────────────────────────
      const featureRows = gsap.utils.toArray('.feature-editorial-row');
      featureRows.forEach((row) => {
        ScrollTrigger.create({
          trigger: row,
          start: 'top 70%',
          end: 'bottom 35%',
          toggleClass: { targets: row, className: 'feature-row-active' },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-x-clip bg-[#090807] text-[#f0ebe0] font-sans selection:bg-[#f5ba72]/30 selection:text-[#f5ba72]"
      style={{ touchAction: 'pan-y' }}
    >
      {/* ── CONTINUOUS FULL-PAGE 3D KNOWLEDGE WORLD ── */}
      <Landing3DScene scrollContainerRef={containerRef} />

      {/* ── TOP SCROLL PROGRESS BAR (GPU-Accelerated) ── */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-white/[0.04] z-50 pointer-events-none">
        <div
          ref={progressBarRef}
          className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 origin-left shadow-[0_0_12px_rgba(245,186,114,0.7)]"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* Ambient warm radial backlight for upper atmosphere */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(245,186,114,0.12) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* ═════════════════════════════════════════════════════════════
          SCENE 01: HERO / ENTRY
          Cinematic opening: Typography floats through space on scroll.
          ═════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        id="scene-hero"
        className="relative min-h-[125vh] flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 lg:pt-44 z-10"
      >
        <div
          ref={heroContentRef}
          className="max-w-4xl mx-auto w-full text-center space-y-7 pointer-events-auto"
        >
          {/* Category Pill Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[#f5ba72] text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Interactive Quiz & Practice Platform</span>
          </div>

          {/* Core Cinematic Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-[4.25rem] font-black text-white tracking-tight leading-[1.08]">
            Study Faster.{' '}
            <br />
            Test Deeper.{' '}
            <span className="gradient-text block sm:inline">Score Higher.</span>
          </h1>

          {/* Subtext with real product context */}
          <p className="text-sm sm:text-lg text-[#b5af9f] max-w-2xl mx-auto leading-relaxed font-normal">
            Turn syllabus topics and lecture notes into active MCQ practice, survival trials,
            and flashcard decks. Get instant rationale, live pace metrics, and earn progressive mastery badges.
          </p>

          {/* Primary Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <button
              onClick={handleStart}
              id="hero-start-btn"
              className="btn-primary py-3.5 px-8 rounded-full text-sm font-bold flex items-center justify-center gap-2 group w-full sm:w-auto shadow-caramel-glow hover:scale-[1.02] transition-transform"
            >
              <span>Start Practicing Free</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => scrollToScene(modesPinRef)}
              id="hero-explore-modes-btn"
              className="py-3.5 px-7 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-[#dedbd3] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/30 transition-all w-full sm:w-auto"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Explore Study Modes</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>

          {/* Trust Checkpoints */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs text-[#8d877c]">
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

        {/* Scroll cue at hero bottom */}
        <div
          ref={heroCueRef}
          className="absolute bottom-12 flex flex-col items-center gap-2 text-[#8d877c] pointer-events-none select-none transition-opacity"
        >
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#8d877c]">
            Scroll to enter experience
          </span>
          <div className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-amber-400 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          SCENE 02: THREE STUDY MODES (PINNED SCROLL SCENE)
          The viewport remains visually locked while the 3 modes transform.
          ═════════════════════════════════════════════════════════════ */}
      <section
        ref={modesPinRef}
        id="study-modes"
        className="relative h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 z-20 overflow-hidden"
      >
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left Column: Mode Navigator & Context */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[#f5ba72] text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Three Ways To Study</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              One Concept. <br />
              <span className="gradient-text">Three Cognitive Rhythms.</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#a59f93] leading-relaxed">
              Switch seamlessly between timed standard practice, adrenaline-fueled survival trials,
              and tactile flashcard recall as you scroll.
            </p>

            {/* Mode Switcher Nav Pills (Scrubbed Indicator) */}
            <div className="flex flex-wrap lg:flex-col gap-2 pt-2 justify-center lg:justify-start">
              {[
                { id: 0, label: 'Classic MCQ', sub: 'Pace & Accuracy Telemetry', icon: Target },
                { id: 1, label: 'Survival Challenge', sub: '3-Heart High-Stakes Trial', icon: Heart },
                { id: 2, label: 'Flashcard Revision', sub: '3D Tactile Active Recall', icon: RotateCcw },
              ].map((m) => {
                const IconComp = m.icon;
                const isActive = activeStudyMode === m.id;
                return (
                  <div
                    key={m.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 text-left ${
                      isActive
                        ? 'bg-[#1b1713] border-[#f5ba72]/40 shadow-caramel-glow scale-[1.02]'
                        : 'bg-white/[0.02] border-white/[0.06] opacity-60'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-[#f5ba72]/20 text-[#f5ba72]' : 'bg-white/[0.04] text-[#8d877c]'
                    }`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`text-xs sm:text-sm font-bold ${isActive ? 'text-white' : 'text-[#8d877c]'}`}>
                        {m.label}
                      </div>
                      <div className="text-[10px] text-[#8d877c]">{m.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Transforming Product UI Cockpit */}
          <div className="lg:col-span-7 relative min-h-[460px] flex items-center justify-center">

            {/* ── STATE 1: CLASSIC MCQ ── */}
            <div
              className={`modes-stage-mcq w-full max-w-lg glass-card p-6 sm:p-7 rounded-3xl border-white/[0.12] shadow-2xl transition-all duration-500 absolute ${
                activeStudyMode === 0 ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-bold text-[#f5ba72] uppercase tracking-wider">Mode 01 • Classic MCQ</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#8d877c] bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Avg Pace: 18s</span>
                </div>
              </div>

              <div className="py-4 space-y-3">
                <p className="text-sm sm:text-base font-semibold text-white leading-snug">
                  Which data structure operates on a strict First-In, First-Out (FIFO) principle?
                </p>

                <div className="space-y-2 pt-1">
                  {[
                    { key: 'A', text: 'Stack (LIFO)', isCorrect: false },
                    { key: 'B', text: 'Queue (FIFO)', isCorrect: true, selected: true },
                    { key: 'C', text: 'Binary Search Tree', isCorrect: false },
                    { key: 'D', text: 'Hash Map with Chaining', isCorrect: false },
                  ].map((opt) => (
                    <div
                      key={opt.key}
                      className={`p-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between transition-all ${
                        opt.selected
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-sm'
                          : 'bg-white/[0.03] border-white/[0.06] text-[#dedbd3]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          opt.selected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/[0.06] text-[#8d877c]'
                        }`}>
                          {opt.key}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                      {opt.selected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                  ))}
                </div>

                {/* Instant Explanation Card */}
                <div className="p-3.5 rounded-xl bg-[#171410] border border-[#f5ba72]/25 space-y-1 text-xs">
                  <div className="font-bold text-[#f5ba72] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Instant Explanation</span>
                  </div>
                  <p className="text-[#a59f93] leading-relaxed">
                    A Queue preserves insertion order: elements enter from the rear (enqueue) and leave from the front (dequeue).
                  </p>
                </div>
              </div>
            </div>

            {/* ── STATE 2: SURVIVAL CHALLENGE ── */}
            <div
              className={`modes-stage-survival w-full max-w-lg glass-card p-6 sm:p-7 rounded-3xl border-orange-500/25 shadow-2xl transition-all duration-500 absolute ${
                activeStudyMode === 1 ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Mode 02 • Survival Trial</span>
                </div>
                {/* 3 Hearts Indicator */}
                <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span className="font-bold ml-1 text-white">3 / 3</span>
                </div>
              </div>

              <div className="py-4 space-y-3.5">
                {/* Timer Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-[#8d877c] font-semibold">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-orange-400" /> Time Remaining</span>
                    <span className="text-orange-400 font-mono">14s</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 w-3/4 animate-pulse rounded-full" />
                  </div>
                </div>

                <p className="text-sm sm:text-base font-semibold text-white leading-snug">
                  In a binary Min-Heap structure, where is the smallest element always located?
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { key: 'A', text: 'At the root node', correct: true },
                    { key: 'B', text: 'At any leaf node' },
                    { key: 'C', text: 'At index (n - 1)' },
                    { key: 'D', text: 'In the left subtree' },
                  ].map((opt) => (
                    <div
                      key={opt.key}
                      className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                        opt.correct
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                          : 'bg-white/[0.03] border-white/[0.06] text-[#dedbd3]'
                      }`}
                    >
                      <span className="w-4 h-4 rounded bg-white/[0.06] flex items-center justify-center text-[10px] font-bold">
                        {opt.key}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-orange-950/20 border border-orange-500/20 text-xs">
                  <div className="flex items-center gap-1.5 text-orange-300 font-bold">
                    <Flame className="w-4 h-4 fill-orange-400 text-orange-400" />
                    <span>Active Streak: 7 in a Row</span>
                  </div>
                  <span className="font-mono text-white font-bold">+140 XP</span>
                </div>
              </div>
            </div>

            {/* ── STATE 3: FLASHCARD REVISION (3D FLIP) ── */}
            <div
              className={`modes-stage-flashcards w-full max-w-lg glass-card p-6 sm:p-7 rounded-3xl border-amber-500/25 shadow-2xl transition-all duration-500 absolute ${
                activeStudyMode === 2 ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-bold text-[#f5ba72] uppercase tracking-wider">Mode 03 • Spaced Flashcards</span>
                </div>
                <span className="text-[11px] text-[#8d877c] font-semibold">Card 4 of 20</span>
              </div>

              {/* 3D Flip Card Container */}
              <div
                className="py-5 perspective-[1000px] cursor-pointer"
                onClick={() => setFlashcardFlipped((prev) => !prev)}
                title="Click or scroll to flip card"
              >
                <div
                  className="w-full min-h-[190px] rounded-2xl p-6 border transition-transform duration-700 flex flex-col justify-between"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: flashcardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    backgroundColor: flashcardFlipped ? '#1c1712' : '#14120f',
                    borderColor: flashcardFlipped ? 'rgba(245,186,114,0.3)' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  {!flashcardFlipped ? (
                    /* Front side */
                    <div className="space-y-3">
                      <div className="text-[10px] uppercase font-bold tracking-widest text-[#8d877c]">
                        Concept Prompt
                      </div>
                      <p className="text-sm sm:text-base font-semibold text-white">
                        What is the average and worst-case time complexity of searching in a Balanced Binary Search Tree?
                      </p>
                      <div className="pt-2 text-[11px] text-[#f5ba72] flex items-center gap-1.5">
                        <RotateCcw className="w-3 h-3" />
                        <span>Flip card to verify solution</span>
                      </div>
                    </div>
                  ) : (
                    /* Back side (Flipped) */
                    <div className="space-y-3" style={{ transform: 'rotateY(180deg)' }}>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                        Verified Answer
                      </div>
                      <div className="text-2xl font-black text-amber-300 font-mono">
                        O(log n)
                      </div>
                      <p className="text-xs text-[#b5af9f] leading-relaxed">
                        Because each binary comparison halves the remaining search subspace evenly.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleStart}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-[#dedbd3] border border-white/10 transition-all text-center"
                >
                  Needs Review
                </button>
                <button
                  onClick={handleStart}
                  className="btn-primary py-2.5 px-4 rounded-xl text-xs font-bold text-center"
                >
                  Got It Mastered
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          SCENE 03: INTERACTIVE QUIZ JOURNEY (PINNED SCROLL DEMO)
          "SCROLLING = MOVING THROUGH A QUIZ SESSION"
          The user scrolls and watches a complete problem breakdown.
          ═════════════════════════════════════════════════════════════ */}
      <section
        ref={journeyPinRef}
        id="scene-journey"
        className="relative h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 z-20 overflow-hidden"
      >
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left: Journey Timeline Track */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[#f5ba72] text-[11px] font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Scroll-Driven Demonstration</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              From Question <br />
              to <span className="gradient-text">Comprehension.</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#a59f93] leading-relaxed">
              Every turn of the scroll wheel moves you through an actual quiz step:
              question ingress, distractor evaluation, selection, verified explanation, and telemetry lock-in.
            </p>

            {/* Step Milestones */}
            <div className="space-y-3 pt-2 text-left max-w-sm mx-auto lg:mx-0">
              {[
                { step: 1, label: 'Question Materializes', detail: 'Curated problem metadata sets the scope' },
                { step: 2, label: 'Options Assemble', detail: '4 balanced distractors enter the field' },
                { step: 3, label: 'Active Selection', detail: 'Learner locks in choice under pressure' },
                { step: 4, label: 'Instant Explanation', detail: 'Rationale reveals why answer is correct' },
                { step: 5, label: 'Score & XP Progress', detail: 'Telemetry syncs to 30-day mastery record' },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-300 ${
                    journeyPhase >= s.step
                      ? 'bg-[#1b1713] border-[#f5ba72]/30 text-white'
                      : 'bg-transparent border-transparent opacity-40 text-[#8d877c]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                    journeyPhase >= s.step ? 'bg-[#f5ba72] text-[#090807]' : 'bg-white/10 text-white'
                  }`}>
                    {s.step}
                  </div>
                  <div>
                    <div className="text-xs font-bold">{s.label}</div>
                    <div className="text-[10px] text-[#8d877c]">{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: The Interactive Quiz Card Cockpit */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-lg glass-card p-6 sm:p-8 rounded-3xl border-white/[0.12] shadow-2xl space-y-5">

              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-[#f5ba72] border border-amber-500/20">
                    Operating Systems
                  </span>
                  <span className="text-[10px] text-[#8d877c]">Question 3 of 10</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-emerald-400 font-bold">Score: 3/3</span>
                  <span className="text-[#8d877c]">•</span>
                  <span className="text-amber-400">+25 XP</span>
                </div>
              </div>

              {/* Phase 1: Question Text */}
              <div className={`transition-all duration-500 ${journeyPhase >= 1 ? 'opacity-100' : 'opacity-20'}`}>
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                  Which CPU scheduling algorithm assigns a fixed time quantum to each ready process in circular sequence?
                </h3>
              </div>

              {/* Phase 2 & 3: Options Assemble & Choice Highlight */}
              <div className="space-y-2.5">
                {[
                  { id: 'A', text: 'Round Robin (RR)', isAnswer: true },
                  { id: 'B', text: 'Shortest Job First (SJF)' },
                  { id: 'C', text: 'Priority Preemptive Scheduling' },
                  { id: 'D', text: 'Multilevel Feedback Queue' },
                ].map((opt) => {
                  const isChosen = opt.isAnswer && journeyPhase >= 3;
                  const isVerified = opt.isAnswer && journeyPhase >= 4;

                  return (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between transition-all duration-400 ${
                        isVerified
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 shadow-sm'
                          : isChosen
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-sm'
                            : journeyPhase >= 2
                              ? 'bg-white/[0.03] border-white/[0.07] text-[#dedbd3]'
                              : 'bg-white/[0.01] border-transparent opacity-30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          isVerified
                            ? 'bg-emerald-500/30 text-emerald-300'
                            : isChosen
                              ? 'bg-amber-500/30 text-amber-300'
                              : 'bg-white/[0.06] text-[#8d877c]'
                        }`}>
                          {opt.id}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                      {isVerified && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {/* Phase 4: Instant Explanation */}
              <div className={`transition-all duration-500 ${journeyPhase >= 4 ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                <div className="p-3.5 rounded-xl bg-[#181512] border border-[#f5ba72]/30 space-y-1 text-xs">
                  <div className="font-bold text-[#f5ba72] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Verified Solution</span>
                  </div>
                  <p className="text-[#a59f93] leading-relaxed">
                    Round Robin cycles through processes using a dedicated time quantum, preventing indefinite starvation and providing deterministic response times.
                  </p>
                </div>
              </div>

              {/* Phase 5: Telemetry Footer */}
              <div className={`flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs text-[#8d877c] transition-opacity duration-500 ${
                journeyPhase >= 5 ? 'opacity-100' : 'opacity-40'
              }`}>
                <span>Accuracy: <strong className="text-white">100%</strong></span>
                <span>Pace: <strong className="text-white">22s</strong></span>
                <span className="text-amber-400 font-bold">Next Question Ready →</span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          SCENE 04: ANALYTICS → PROGRESS → MASTERY
          One continuous visual data story (not separate disconnected cards).
          ═════════════════════════════════════════════════════════════ */}
      <section
        ref={analyticsRef}
        id="analytics"
        className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20 space-y-16"
      >
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[#f5ba72] text-[11px] font-bold uppercase tracking-wider">
            <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Telemetry To Mastery</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Every Mistake Becomes <br />
            <span className="gradient-text">Measurable Progress.</span>
          </h2>

          <p className="text-xs sm:text-sm text-[#8d877c] max-w-lg mx-auto">
            Real data structures turn repetition into confidence: per-question pace, 30-day streak heatmaps, and 3-tier verifiable badges.
          </p>
        </div>

        {/* Continuous Data Grid Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">

          {/* Panel 1: Precision Accuracy Dial & Pace Telemetry */}
          <div className="md:col-span-4 glass-card p-6 sm:p-7 rounded-3xl border-white/[0.08] flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <span className="text-xs font-bold uppercase text-[#8d877c]">Session Telemetry</span>
                <span className="text-xs font-bold text-emerald-400">+14% vs Baseline</span>
              </div>

              {/* Circular SVG Accuracy Gauge */}
              <div className="py-6 flex flex-col items-center justify-center relative">
                <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    className="stroke-white/[0.06]"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    className="analytics-dial-circle stroke-[#f5ba72]"
                    strokeWidth="12"
                    strokeDasharray="440"
                    strokeDashoffset="88"
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white tracking-tight">92%</span>
                  <span className="text-[10px] text-[#8d877c] uppercase font-bold tracking-wider mt-0.5">Accuracy</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.06]">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                <div className="text-[10px] text-[#8d877c] uppercase">Avg Pace</div>
                <div className="text-base font-bold text-white mt-0.5">26s / q</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                <div className="text-[10px] text-[#8d877c] uppercase">Retention</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">High</div>
              </div>
            </div>
          </div>

          {/* Panel 2: 30-Day Activity Heatmap & Streaks */}
          <div className="md:col-span-4 glass-card p-6 sm:p-7 rounded-3xl border-white/[0.08] flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <span className="text-xs font-bold uppercase text-[#8d877c]">Consistency Rhythm</span>
                <span className="text-xs font-bold text-[#f5ba72] flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  14 Days
                </span>
              </div>

              {/* 30-Day Heatmap Grid */}
              <div className="py-6 space-y-3">
                <div className="text-xs font-semibold text-white">30-Day Practice Heatmap</div>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const intensity = (i * 7 + 13) % 4;
                    const bgClass =
                      intensity === 3
                        ? 'bg-[#f5ba72] shadow-[0_0_8px_rgba(245,186,114,0.4)]'
                        : intensity === 2
                          ? 'bg-[#f5ba72]/60'
                          : intensity === 1
                            ? 'bg-[#f5ba72]/25'
                            : 'bg-white/[0.06]';
                    return (
                      <div
                        key={i}
                        className={`h-6 rounded-md ${bgClass} transition-transform hover:scale-110`}
                        title={`Day ${i + 1}: Active Revision`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
              <span className="text-[#f5ba72] font-semibold">Active Study Streak</span>
              <span className="font-bold text-white font-mono">14 Days Consecutive</span>
            </div>
          </div>

          {/* Panel 3: Progressive 3-Tier Mastery Badges */}
          <div className="md:col-span-4 glass-card p-6 sm:p-7 rounded-3xl border-white/[0.08] flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <span className="text-xs font-bold uppercase text-[#8d877c]">Skill Progression</span>
                <span className="text-xs font-bold text-amber-400">3 Tiers</span>
              </div>

              {/* 3 Tier Badges Stack */}
              <div className="py-4 space-y-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="font-bold text-white">Bronze Scholar</div>
                      <div className="text-[10px] text-[#8d877c]">50+ Questions Completed</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400">Unlocked</span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-slate-300" />
                    <div>
                      <div className="font-bold text-white">Silver Specialist</div>
                      <div className="text-[10px] text-[#8d877c]">80%+ Accuracy Maintained</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400">Unlocked</span>
                </div>

                <div className="mastery-badge-gold p-3.5 rounded-xl bg-[#1e1913] border border-[#f5ba72]/40 flex items-center justify-between text-xs transition-all">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-5 h-5 text-amber-400 animate-pulse" />
                    <div>
                      <div className="font-bold text-amber-300">Gold Master</div>
                      <div className="text-[10px] text-[#a59f93]">90%+ Retention on 100+ Topics</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Mastered
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full btn-primary py-2.5 px-4 rounded-xl text-xs font-bold text-center"
            >
              Start Earning Badges
            </button>
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          SCENE 05: HOW QUIZCRAFT WORKS (PINNED 3-STEP PROCESS)
          01 Topic -> 02 Practice -> 03 Master
          ═════════════════════════════════════════════════════════════ */}
      <section
        ref={workflowPinRef}
        id="how-it-works"
        className="relative h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 z-20 overflow-hidden bg-[#0c0b09]/80 border-y border-white/[0.06]"
      >
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          {/* Left Column: 3 Steps Timeline Track */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[#f5ba72] text-[11px] font-bold uppercase tracking-wider">
              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Simple 3-Step Process</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              From Topic to <br />
              <span className="gradient-text">Mastery in Minutes.</span>
            </h2>

            {/* 3 Step Indicators */}
            <div className="space-y-4 pt-2 text-left max-w-sm mx-auto lg:mx-0">
              {WORKFLOW_STEPS.map((s, idx) => {
                const isActive = activeWorkflowStep === idx;
                return (
                  <div
                    key={s.step}
                    className={`p-4 rounded-2xl border transition-all duration-300 ${
                      isActive
                        ? 'bg-[#1b1713] border-[#f5ba72]/40 shadow-caramel-glow scale-[1.02]'
                        : 'bg-white/[0.02] border-white/[0.05] opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-base font-black font-mono ${isActive ? 'text-[#f5ba72]' : 'text-[#8d877c]'}`}>
                        {s.step}
                      </span>
                      <h3 className={`text-sm font-bold ${isActive ? 'text-white' : 'text-[#8d877c]'}`}>
                        {s.title}
                      </h3>
                    </div>
                    <p className="text-xs text-[#a59f93] mt-2 leading-relaxed">
                      {s.summary}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Transforming Workflow Visual Stage */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-lg glass-card p-6 sm:p-8 rounded-3xl border-white/[0.12] shadow-2xl relative min-h-[380px] flex items-center justify-center">

              {/* Stage 0: Topic Selector Interface */}
              <div className={`w-full space-y-4 transition-all duration-500 absolute ${
                activeWorkflowStep === 0 ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <span className="text-xs font-bold text-[#f5ba72]">Step 01 • Topic Selection</span>
                  <span className="text-[10px] text-[#8d877c]">Prompt or Pick</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-[#a59f93]">
                  Enter topic: <strong className="text-white">Computer Architecture & Cache Mapping</strong>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['Computer Science', 'Biology', 'Data Structures', 'History', 'Custom Notes'].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#dedbd3]">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-[#f5ba72] flex items-center justify-between">
                  <span>Questions generated: 10 curated problems</span>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              {/* Stage 1: Active Practice Interface */}
              <div className={`w-full space-y-4 transition-all duration-500 absolute ${
                activeWorkflowStep === 1 ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <span className="text-xs font-bold text-orange-400">Step 02 • Active Practice</span>
                  <span className="text-[10px] text-[#8d877c]">Live Pace Feedback</span>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                  <div className="flex justify-between text-xs text-[#8d877c]">
                    <span>Problem 4 of 10</span>
                    <span className="text-amber-400 font-mono">18s Remaining</span>
                  </div>
                  <p className="text-sm font-bold text-white">Direct-Mapped vs 2-Way Set Associative Cache hit latency?</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct-mapped has lower hit latency due to single comparison path.</span>
                </div>
              </div>

              {/* Stage 2: Track & Master Interface */}
              <div className={`w-full space-y-4 transition-all duration-500 absolute ${
                activeWorkflowStep === 2 ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <span className="text-xs font-bold text-emerald-400">Step 03 • Telemetry & Mastery</span>
                  <span className="text-[10px] text-[#8d877c]">Progress Saved</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                    <div className="text-[10px] text-[#8d877c]">Score</div>
                    <div className="text-base font-bold text-white">9 / 10</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                    <div className="text-[10px] text-[#8d877c]">Avg Pace</div>
                    <div className="text-base font-bold text-amber-400">22s</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                    <div className="text-[10px] text-[#8d877c]">Streak</div>
                    <div className="text-base font-bold text-emerald-400">+1 Day</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-[#f5ba72] flex items-center justify-between">
                  <span>Silver Specialist Tier Achieved</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          SCENE 06: PLATFORM CAPABILITIES (EDITORIAL FEATURE ROWS)
          Large horizontal editorial rows that expand on scroll.
          ═════════════════════════════════════════════════════════════ */}
      <section
        ref={featuresRef}
        id="features"
        className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-20 space-y-16"
      >
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[#f5ba72] text-[11px] font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Platform Capabilities</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Engineered for <br />
            <span className="gradient-text">Serious Learners.</span>
          </h2>
        </div>

        {/* Editorial Rows */}
        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {EDITORIAL_FEATURES.map((item) => (
            <div
              key={item.num}
              className="feature-editorial-row py-10 sm:py-14 transition-all duration-300 group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Number & Category */}
                <div className="lg:col-span-3 space-y-1">
                  <span className="font-mono text-2xl font-black text-[#f5ba72]/40 group-hover:text-[#f5ba72] transition-colors">
                    {item.num}
                  </span>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-[#8d877c]">
                    {item.category}
                  </div>
                </div>

                {/* Middle Content */}
                <div className="lg:col-span-6 space-y-3">
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#a59f93] leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#8d877c]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Badge Metric */}
                <div className="lg:col-span-3 flex lg:justify-end">
                  <div className="px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/[0.08] text-xs font-semibold text-[#f5ba72] group-hover:border-[#f5ba72]/40 transition-colors">
                    {item.stat}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          SCENE 07: FINAL CTA (THE GATEWAY)
          The 3D orbital rings converge into an amber gateway portal.
          ═════════════════════════════════════════════════════════════ */}
      <section
        ref={finalCtaRef}
        id="scene-cta"
        className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 z-20 text-center"
      >
        <div className="max-w-3xl mx-auto space-y-8 pointer-events-auto">

          {/* Glowing Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[#f5ba72] text-xs font-semibold backdrop-blur-md">
            <Brain className="w-4 h-4 text-amber-400" />
            <span>Ready When You Are</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Master Any Subject. <br />
            <span className="gradient-text">One Session at a Time.</span>
          </h2>

          <p className="text-sm sm:text-base text-[#b5af9f] max-w-xl mx-auto leading-relaxed">
            Join students and lifelong learners who replace passive reading with active,
            adaptive recall on QuizCraft.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handleStart}
              id="final-cta-start-btn"
              className="btn-primary py-4 px-9 rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-caramel-glow hover:scale-[1.03] transition-transform w-full sm:w-auto"
            >
              <span>Start Practicing Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleStart}
              id="final-cta-guest-btn"
              className="py-4 px-8 rounded-full text-xs sm:text-sm font-semibold text-[#dedbd3] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/30 transition-all w-full sm:w-auto"
            >
              <span>Explore as Guest</span>
            </button>
          </div>

          <div className="text-xs text-[#8d877c] pt-2">
            No credit card required • Instant access to all three modes
          </div>

        </div>
      </section>

    </div>
  );
}
