import { useState, useEffect } from 'react';
import {
  X, Mail, Lock, Sparkles, LogIn, UserPlus, AlertCircle, CheckCircle2,
  ArrowLeft, User, BookOpen, MailCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { supabase } from '../../services/supabase.js';

const COURSE_OPTIONS = [
  'BCA', 'MCA', 'BCS', 'BECE', 'B.Tech (CS)', 'B.Tech (EC)', 'B.Tech (IT)',
  'B.Sc (CS)', 'B.Sc (IT)', 'MBA', 'BBA', 'BA', 'B.Com', 'Other',
];

export default function AuthModal({ isOpen, onClose, promptMessage = '', initialMode = 'signin', onNavigate }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  // mode: 'signin' | 'signup' | 'confirm_notice'
  const [mode, setMode] = useState(initialMode || 'signin');

  useEffect(() => {
    if (isOpen && initialMode) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Form fields
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [course, setCourse]     = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  // Countdown timer for Resend email
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const reset = () => {
    setEmail(''); setPassword(''); setName(''); setCourse('');
    setError(''); setSuccess('');
  };

  const switchMode = (newMode) => {
    reset();
    setMode(newMode);
  };

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign in failed. Please try email/password below.');
      setLoading(false);
    }
  };

  // ── Sign In ───────────────────────────────────────────────────────────────
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      onClose();
    } catch (err) {
      let msg = err.message || 'Authentication failed.';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Incorrect email or password. Please check your credentials or confirm your email.';
      } else if (msg.includes('Email not confirmed')) {
        msg = 'Your email is not confirmed yet. Please check your inbox and click the confirmation link.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Sign Up (Create Account with Email Confirmation) ──────────────────────
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (!course.trim()) { setError('Please select your course.'); return; }
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const res = await signUpWithEmail(email, password, name, course);
      if (res?.requiresConfirmation) {
        setMode('confirm_notice');
        setResendCooldown(30);
      } else {
        // Email confirmation is disabled in Supabase, logged in directly
        onClose();
      }
    } catch (err) {
      let msg = err.message || 'Sign up failed.';
      if (msg.includes('already registered') || msg.includes('already exists')) {
        msg = 'An account with this email already exists. Please sign in instead.';
      } else if (msg.includes('over_email_send_rate_limit')) {
        msg = 'Too many sign-up attempts. Please wait a few minutes before trying again.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend Confirmation Link ──────────────────────────────────────────────
  const handleResendConfirmation = async () => {
    if (resendCooldown > 0 || !email) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin },
      });
      if (resendError) throw resendError;
      setSuccess('A fresh confirmation link has been sent to your email!');
      setResendCooldown(30);
    } catch (err) {
      setError(err.message || 'Failed to resend confirmation email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isSignUp = mode === 'signup';
  const isConfirmNotice = mode === 'confirm_notice';

  return (
    <div
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-card w-full max-w-md p-6 sm:p-7 border-white/10 shadow-2xl relative animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-caramel-500/20 border border-caramel-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-caramel-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isConfirmNotice ? 'Check Your Email' : isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-[11px] text-[#8d877c]">
                QuizCraft — AI Quiz Platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt message */}
        {typeof promptMessage === 'string' && promptMessage.trim() && !isConfirmNotice && (
          <div className="p-3 mb-4 rounded-xl bg-caramel-500/10 border border-caramel-500/25 text-caramel-300 text-xs flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-caramel-400" />
            <span>{promptMessage}</span>
          </div>
        )}

        {/* Error / Success */}
        {error && (
          <div className="p-3 mb-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fade-in leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 mb-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* ── Email Confirmation Sent Screen ── */}
        {isConfirmNotice && (
          <div className="space-y-4 py-2">
            <div className="text-center py-3">
              <div className="w-16 h-16 rounded-2xl bg-[#f5ba72]/15 border border-[#f5ba72]/30 flex items-center justify-center mx-auto mb-3 shadow-caramel-glow">
                <MailCheck className="w-8 h-8 text-[#f5ba72]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Confirmation Email Sent!</h3>
              <p className="text-xs sm:text-sm text-[#a39e94] leading-relaxed max-w-xs mx-auto">
                We sent an account confirmation link to<br />
                <strong className="text-white font-semibold">{email}</strong>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#dedbd3] space-y-1.5">
              <p className="font-semibold text-[#f5ba72]">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#a39e94]">
                <li>Check your inbox (and spam folder) for the confirmation link.</li>
                <li>Click the link to verify your email.</li>
                <li>Sign in to your QuizCraft account.</li>
              </ol>
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-[#8d877c]">Didn't receive the link?</span>
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resendCooldown > 0 || loading}
                className="font-semibold text-caramel-400 hover:text-caramel-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Link'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
                setSuccess('After clicking the confirmation link in your email, enter your password to sign in.');
              }}
              className="btn-primary w-full py-2.5 font-bold text-sm flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Proceed to Sign In</span>
            </button>
          </div>
        )}

        {/* ── Sign In / Sign Up Mode ── */}
        {!isConfirmNotice && (
          <>
            {/* Google OAuth */}
            <button
              onClick={handleGoogleSignIn} disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-white font-semibold text-sm transition-all shadow-sm mb-4"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-semibold text-[#8d877c] uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Sign Up Form */}
            {isSignUp ? (
              <form onSubmit={handleSignUp} className="space-y-3">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#a39e94] mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#797368]" />
                    <input
                      type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Swati Vyas" required className="input-field pl-10 text-sm"
                    />
                  </div>
                </div>

                {/* Course */}
                <div>
                  <label className="block text-xs font-semibold text-[#a39e94] mb-1">Course / Program</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#797368]" />
                    <select
                      value={course} onChange={(e) => setCourse(e.target.value)}
                      required
                      className="input-field pl-10 text-sm appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select your course</option>
                      {COURSE_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#a39e94] mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#797368]" />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com" required className="input-field pl-10 text-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#a39e94] mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#797368]" />
                    <input
                      type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters" required className="input-field pl-10 text-sm"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 font-bold text-sm">
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Sign In Form */
              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#a39e94] mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#797368]" />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com" required className="input-field pl-10 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#a39e94]">Password</label>
                    <button
                      type="button"
                      disabled={!email.trim()}
                      onClick={() => {
                        if (!email.trim()) return;
                        onClose();
                        if (onNavigate) {
                          onNavigate('/forgot-password', { prefillEmail: email.trim() });
                        } else {
                          window.history.pushState({}, '', '/forgot-password');
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        }
                      }}
                      className="text-xs text-[#f5ba72] hover:text-[#e59d4c] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-[#f5ba72]"
                      id="auth-forgot-password-link"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#797368]" />
                    <input
                      type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" required className="input-field pl-10 text-sm"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-1 text-sm font-bold">
                  {loading ? <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" /> : <><LogIn className="w-4 h-4" /><span>Sign In</span></>}
                </button>
              </form>
            )}

            <div className="mt-4 text-center text-xs text-[#8d877c]">
              {isSignUp ? (
                <p>Already have an account?{' '}
                  <button type="button" onClick={() => switchMode('signin')} className="text-caramel-500 font-bold hover:underline">Sign In</button>
                </p>
              ) : (
                <div className="space-y-2">
                  <p>Don't have an account?{' '}
                    <button type="button" onClick={() => switchMode('signup')} className="text-caramel-500 font-bold hover:underline">Create Account</button>
                  </p>
                  {error && error.includes('Incorrect email or password') && (
                    <p className="text-[11px] text-[#a39e94]">
                      New here?{' '}
                      <button type="button" onClick={() => switchMode('signup')} className="text-emerald-400 font-semibold hover:underline">Create an account</button>
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
