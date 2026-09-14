import { useEffect } from 'react';
import { CheckCircle2, LogIn, ArrowRight, Laptop, Sparkles, Brain } from 'lucide-react';
import { supabase } from '../services/supabase.js';

export default function EmailVerifiedPage({ onNavigate, onOpenLogin }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash || '';
    const search = window.location.search || '';

    const hasCallbackParams = Boolean(
      hash.includes('type=signup') ||
      hash.includes('type=email_change') ||
      hash.includes('access_token') ||
      search.includes('type=signup') ||
      search.includes('type=email_change') ||
      search.includes('code=') ||
      search.includes('token_hash')
    );

    // If reached via confirmation callback, strip tokens from address bar immediately
    if (hasCallbackParams || hash || search) {
      try {
        window.history.replaceState({}, '', '/email-verified');
      } catch { /* history unavailable */ }
    }

    // Only process confirmation-session cleanup when reached through an actual confirmation callback
    if (hasCallbackParams) {
      const timer = setTimeout(async () => {
        try {
          await supabase.auth.signOut({ scope: 'local' });
        } catch {
          // Fallback: clear auth tokens from localStorage for this client if signOut threw
          try {
            Object.keys(localStorage).forEach((key) => {
              if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
                localStorage.removeItem(key);
              }
            });
          } catch { /* storage unavailable */ }
        }
      }, 400);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleGoToLogin = () => {
    if (onOpenLogin) {
      onOpenLogin();
    } else if (onNavigate) {
      onNavigate('/login');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-12 animate-fade-in">
      <div className="w-full max-w-md glass-card p-6 sm:p-8 border-white/10 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-caramel-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Success Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-emerald-glow">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 stroke-[2.5]" />
          </div>
          <div className="absolute top-0 right-1/3 translate-x-4 animate-bounce">
            <Sparkles className="w-5 h-5 text-caramel-400" />
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Account Verified!
          </h1>
          <p className="text-sm text-emerald-400 font-medium">
            Your email has been successfully verified.
          </p>
        </div>

        {/* Laptop / Cross-device guidance card */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Laptop className="w-4 h-4 text-caramel-400" />
            <span>Ready to Learn</span>
          </div>
          <p className="text-xs sm:text-sm text-[#dedbd3] font-medium leading-relaxed">
            You can now return to your laptop and log in.
          </p>
          <p className="text-[11px] text-[#8d877c] leading-relaxed border-t border-white/5 pt-2">
            Your QuizCraft account is activated. Use your registered email and password to access your dashboard from any device.
          </p>
        </div>

        {/* Go to Login Action */}
        <div className="pt-2">
          <button
            onClick={handleGoToLogin}
            className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-caramel-glow group"
            id="verified-go-to-login"
          >
            <LogIn className="w-4 h-4" />
            <span>Go to Login</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Brand footer */}
        <div className="pt-2 flex items-center justify-center gap-2 text-xs text-[#8d877c]">
          <Brain className="w-3.5 h-3.5 text-caramel-400" />
          <span>QuizCraft &mdash; AI Powered Learning</span>
        </div>
      </div>
    </div>
  );
}
