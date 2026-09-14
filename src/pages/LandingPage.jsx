import { Brain, Sparkles, Zap, Target, Users, ArrowRight, Star, Trophy, BookOpen, ChevronRight } from 'lucide-react';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-Powered Creation',
    desc: 'Generate professional quizzes with ChatGPT or Gemini. Paste your notes and let AI do the work.',
    color: 'caramel',
  },
  {
    icon: Target,
    title: 'Smart Analytics',
    desc: 'Detailed results with per-question breakdowns. Track accuracy, time, and improvement over sessions.',
    color: 'coral',
  },
  {
    icon: Zap,
    title: 'Instant Practice',
    desc: 'Start playing any quiz immediately. Shuffle questions, bookmark for review, and test your limits.',
    color: 'emerald',
  },
  {
    icon: Users,
    title: 'Cloud Sync',
    desc: 'Your quizzes are saved securely in the cloud. Access from any device, anytime.',
    color: 'amber',
  },
];

const STATS = [
  { value: '10K+', label: 'Quizzes Created' },
  { value: '98%', label: 'Accuracy Rate' },
  { value: '50+', label: 'Topics Covered' },
  { value: '4.9★', label: 'User Rating' },
];

const TESTIMONIALS = [
  {
    name: 'Swati Vyas',
    role: 'BCA Student',
    text: 'QuizCraft helped me ace my semester exams. I just paste my notes and it generates perfect MCQ questions instantly!',
    avatar: 'S',
  },
  {
    name: 'Devarsh Jain',
    role: 'BCA Student',
    text: 'The AI prompt feature is amazing! I copy the prompt, paste my notes into ChatGPT, and my quiz is ready in seconds.',
    avatar: 'D',
  },
  {
    name: 'Rishiraj Singh Rathod',
    role: 'BECE Student',
    text: 'The shuffle feature and timer make practice feel like the real exam. This platform is a must-have for any student!',
    avatar: 'R',
  },
];

export default function LandingPage({ onOpenAuth, onNavigate }) {
  return (
    <div className="relative overflow-x-hidden">
      {/* ── Hero Section ── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 sm:px-6 py-20 text-center">
        {/* Ambient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-[#f5ba72]/[0.07] rounded-full blur-[160px] animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-[#ff735c]/[0.05] rounded-full blur-[160px]" />
        </div>

        {/* Badge */}
        <div className="relative animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#f5ba72]/30 bg-[#f5ba72]/10 text-[#f5ba72] text-xs font-semibold mb-6 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Quiz Platform</span>
          </div>
        </div>

        {/* Headline */}
        <div className="relative space-y-4 max-w-4xl mx-auto animate-slide-up">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight">
            Create Quizzes{' '}
            <br className="hidden sm:block" />
            <span className="gradient-text">10x Faster</span>{' '}
            with AI
          </h1>
          <p className="text-base sm:text-xl text-[#a39e94] max-w-2xl mx-auto leading-relaxed font-light">
            Paste your notes, study material, or topic — and let AI instantly generate perfectly structured quizzes. Practice smarter, learn faster.
          </p>
        </div>

        {/* Single CTA */}
        <div className="relative mt-10 animate-slide-up">
          <button
            onClick={() => (onNavigate ? onNavigate('/signup') : onOpenAuth && onOpenAuth('Join QuizCraft and start creating AI-powered quizzes for free.'))}
            className="btn-primary-lg flex items-center gap-2 group"
            id="hero-cta-signup"
          >
            <Sparkles className="w-5 h-5" />
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="px-4 sm:px-6 py-8 border-y border-white/[0.06]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#f5ba72]">{s.value}</div>
              <div className="text-xs text-[#8d877c] font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="px-4 sm:px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[#a39e94] text-xs font-semibold mb-4">
            <Trophy className="w-3.5 h-3.5 text-[#f5ba72]" />
            <span>Everything you need</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Built for <span className="gradient-text-coral">Serious Learners</span>
          </h2>
          <p className="text-sm sm:text-base text-[#8d877c] mt-3 max-w-xl mx-auto">
            From AI-powered quiz creation to detailed performance analytics — QuizCraft has every tool you need.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            const colorMap = {
              caramel: { bg: 'bg-[#f5ba72]/10', border: 'border-[#f5ba72]/20', icon: 'text-[#f5ba72]' },
              coral: { bg: 'bg-[#ff735c]/10', border: 'border-[#ff735c]/20', icon: 'text-[#ff8a75]' },
              emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400' },
              amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: 'text-amber-400' },
            };
            const c = colorMap[feat.color];
            return (
              <div key={feat.title} className="glass-card-hover p-6 space-y-4">
                <div className={`w-12 h-12 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${c.icon}`} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base mb-1">{feat.title}</h3>
                  <p className="text-xs text-[#8d877c] leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="px-4 sm:px-6 py-20 bg-[#0c0b0a] border-y border-white/[0.05]">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How It Works</h2>
          <p className="text-sm text-[#8d877c] mt-3">Three simple steps to start learning smarter</p>
        </div>
        <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-8 relative">
          <div className="absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-[#f5ba72]/30 to-transparent hidden sm:block" />
          {[
            { step: '1', title: 'Copy AI Prompt', desc: 'Get our ready-to-use prompt from the Create Quiz page.' },
            { step: '2', title: 'Generate with AI', desc: 'Paste into ChatGPT or Gemini with your notes. Get JSON output.' },
            { step: '3', title: 'Paste and Play', desc: 'Paste the JSON into QuizCraft. Your quiz is live instantly.' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center gap-3">
              <div className="relative w-16 h-16 rounded-2xl bg-[#1e1a15] border border-[#f5ba72]/30 flex items-center justify-center shadow-caramel-glow">
                <span className="text-2xl font-extrabold text-[#f5ba72]">{item.step}</span>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{item.title}</h3>
                <p className="text-xs text-[#8d877c] mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="px-4 sm:px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Loved by <span className="gradient-text">Students and Teachers</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="glass-card p-6 space-y-4 border-white/10">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#f5ba72] text-[#f5ba72]" />
                ))}
              </div>
              <p className="text-sm text-[#c9c5bd] leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.07]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f5ba72] to-[#e59d4c] text-[#1b1206] font-extrabold flex items-center justify-center text-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{t.name}</p>
                  <p className="text-[11px] text-[#8d877c]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-4 sm:px-6 py-16 max-w-4xl mx-auto text-center">
        <div className="glass-card p-10 sm:p-14 border-[#f5ba72]/15 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f5ba72]/[0.06] via-transparent to-[#ff735c]/[0.04] pointer-events-none" />
          <div className="relative space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#f5ba72]/15 border border-[#f5ba72]/30 flex items-center justify-center mx-auto shadow-caramel-glow">
              <Brain className="w-8 h-8 text-[#f5ba72]" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Ready to Learn <span className="gradient-text">Smarter?</span>
            </h2>
            <p className="text-sm text-[#a39e94] max-w-lg mx-auto">
              Create your free account and start building AI-powered quizzes in under 2 minutes.
            </p>
            <button
              onClick={() => (onNavigate ? onNavigate('/signup') : onOpenAuth && onOpenAuth('Create a free account to start building your first AI quiz.'))}
              className="btn-primary-lg flex items-center gap-2 group mx-auto"
              id="cta-banner-signup"
            >
              <Sparkles className="w-5 h-5" />
              <span>Start For Free</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[11px] text-[#5a5549]">No credit card required · Free forever</p>
          </div>
        </div>
      </section>
    </div>
  );
}
