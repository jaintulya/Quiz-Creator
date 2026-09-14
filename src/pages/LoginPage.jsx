import { useState, useEffect } from 'react';
import {
  Mail, Lock, User, BookOpen, ArrowRight, ArrowLeft,
  Sparkles, LogIn, UserPlus, AlertCircle, CheckCircle2,
  Eye, EyeOff, Send, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const COURSE_OPTIONS = [
  'BCA', 'MCA', 'BCS', 'BECE', 'B.Tech (CS)', 'B.Tech (EC)', 'B.Tech (IT)',
  'B.Sc (CS)', 'B.Sc (IT)', 'MBA', 'BBA', 'BA', 'B.Com', 'Other',
];

export default function LoginPage({
  mode = 'signin', // 'signin' | 'signup'
  onNavigate,
  promptMessage = '',
  prefillEmail = '',
}) {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resendSignupEmail,
  } = useAuth();

  const isSignUp = mode === 'signup';

  // Form fields
  const [email, setEmail] = useState(prefillEmail || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmNotice, setConfirmNotice] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail]);

  // Reset errors when mode changes
  useEffect(() => {
    setError('');
    setSuccess('');
    setConfirmNotice(false);
    setPassword('');
  }, [mode]);

  // Countdown timer for Resend email button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ── Google OAuth ──
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

  // ── Sign In ──
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(cleanEmail, password);
      // On success, navigate to dashboard
      if (onNavigate) {
        onNavigate('/dashboard');
      }
    } catch (err) {
      let msg = err.message || 'Authentication failed.';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Incorrect email or password.';
      } else if (msg.includes('Email not confirmed')) {
        msg = 'Please verify your email before logging in.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Sign Up ──
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanEmail = email.trim();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!course.trim()) {
      setError('Please select your course.');
      return;
    }
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await signUpWithEmail(cleanEmail, password, name, course);
      if (res?.requiresConfirmation) {
        setConfirmNotice(true);
        setResendCooldown(30);
      } else {
        // If email confirmation is disabled, logged in directly
        if (onNavigate) {
          onNavigate('/dashboard');
        }
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

  // ── Resend Confirmation ──
  const handleResendConfirmation = async () => {
    if (resendCooldown > 0 || !email) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await resendSignupEmail(email.trim());
      setSuccess('A fresh confirmation link has been sent to your email!');
      setResendCooldown(30);
    } catch (err) {
      setError(err.message || 'Failed to resend confirmation email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password click ──
  const handleForgotPasswordClick = () => {
    if (onNavigate) {
      onNavigate('/forgot-password', { prefillEmail: email.trim() });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12 animate-fade-in">
      <div className="w-full max-w-md glass-card p-6 sm:p-8 border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-caramel-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Back Link */}
        <button
          onClick={() => onNavigate && onNavigate('/')}
          className="btn-ghost text-xs -ml-2 flex items-center gap-1.5 text-[#8d877c] hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        {/* ── State: Confirm Email Notice ── */}
        {confirmNotice ? (
          <div className="text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto shadow-caramel-glow">
              <Mail className="w-8 h-8 text-amber-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">Check Your Email</h2>
              <p className="text-xs sm:text-sm text-[#dedbd3] leading-relaxed">
                We've sent a verification link to:
              </p>
              <p className="text-sm font-bold text-caramel-400 bg-white/[0.05] py-1.5 px-3 rounded-lg border border-white/10 break-all">
                {email}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#dedbd3] text-left space-y-1.5">
              <p className="font-semibold text-caramel-400">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#a39e94]">
                <li>Open the confirmation email on any device.</li>
                <li>Click the confirmation link to verify your account.</li>
                <li>Return here to log in with your credentials.</li>
              </ol>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={loading || resendCooldown > 0}
                className="btn-secondary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0
                    ? `Resend available in ${resendCooldown}s`
                    : 'Resend Confirmation Email'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfirmNotice(false);
                  if (onNavigate) onNavigate('/login');
                }}
                className="btn-primary w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2"
              >
                <span>Go to Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* ── Main Sign In / Sign Up Form ── */
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-caramel-500/15 border border-caramel-500/30 flex items-center justify-center mx-auto shadow-caramel-glow">
                {isSignUp ? (
                  <UserPlus className="w-7 h-7 text-caramel-400" />
                ) : (
                  <LogIn className="w-7 h-7 text-caramel-400" />
                )}
              </div>
              <h1 className="text-2xl font-extrabold text-white">
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </h1>
              <p className="text-xs sm:text-sm text-[#a39e94] max-w-xs mx-auto leading-relaxed">
                {promptMessage ||
                  (isSignUp
                    ? 'Join QuizCraft to generate AI-powered quizzes.'
                    : 'Sign in to access your quizzes and dashboard.')}
              </p>
            </div>

            {/* Error / Success banners */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fade-in leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-fade-in leading-relaxed">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-all hover:border-white/20 active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-semibold text-[#8d877c] uppercase tracking-wider">
                or with email
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Form */}
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-3.5">
              {/* Sign Up: Name & Course */}
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#a39e94] mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#797368]" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Swati Vyas"
                        required
                        className="input-field pl-10 text-sm"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#a39e94] mb-1.5">
                      Course / Program
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#797368]" />
                      <select
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        required
                        className="input-field pl-10 text-sm appearance-none cursor-pointer"
                      >
                        <option value="" disabled>
                          Select your course
                        </option>
                        {COURSE_OPTIONS.map((c) => (
                          <option key={c} value={c} className="bg-[#1b1713] text-white">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#a39e94] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#797368]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    className="input-field pl-10 text-sm"
                    autoFocus={!isSignUp}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#a39e94]">
                    Password
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={handleForgotPasswordClick}
                      className="text-xs text-caramel-400 hover:text-caramel-300 transition-colors font-medium"
                      id="login-forgot-password-link"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#797368]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    className="input-field pl-10 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d877c] hover:text-white transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2 shadow-caramel-glow mt-2"
                id={isSignUp ? 'signup-submit-btn' : 'login-submit-btn'}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Switch Mode Footer */}
            <div className="text-center pt-2 border-t border-white/5 text-xs text-[#8d877c]">
              {isSignUp ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('/login')}
                    className="text-caramel-400 font-semibold hover:text-caramel-300 transition-colors"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('/signup')}
                    className="text-caramel-400 font-semibold hover:text-caramel-300 transition-colors"
                  >
                    Create Account
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
