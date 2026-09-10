import { useState, useEffect } from 'react';
import {
  Lock, KeyRound, Eye, EyeOff, CheckCircle2, AlertTriangle,
  ArrowRight, ShieldCheck, RefreshCw, LogIn
} from 'lucide-react';
import { supabase } from '../services/supabase.js';

export default function ResetPasswordPage({ onNavigate, onOpenLogin }) {
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  // Form states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Check URL parameters and hash for recovery signatures
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const hasRecoveryInUrl =
      hash.includes('type=recovery') ||
      search.includes('type=recovery') ||
      search.includes('code=');

    // 1. Listen for Supabase auth state change events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'PASSWORD_RECOVERY') {
        setHasValidSession(true);
        setCheckingSession(false);
      } else if (session && hasRecoveryInUrl) {
        setHasValidSession(true);
        setCheckingSession(false);
      }
    });

    // 2. Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      // Valid recovery session requires either the recovery event/URL or an active recovery token session
      if (session && (hasRecoveryInUrl || hash.includes('access_token'))) {
        setHasValidSession(true);
      } else if (!hasRecoveryInUrl && !hash.includes('access_token')) {
        setHasValidSession(false);
      }
      setCheckingSession(false);
    }).catch(() => {
      if (isMounted) {
        setHasValidSession(false);
        setCheckingSession(false);
      }
    });

    // Safety timeout in case token parsing is asynchronous
    const timer = setTimeout(() => {
      if (isMounted && checkingSession) {
        setCheckingSession(false);
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      subscription?.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter a new password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password.trim(),
      });
      if (updateError) throw updateError;

      // Sign out of the temporary recovery session so user logs in cleanly with new credentials
      await supabase.auth.signOut().catch(() => {});

      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to update password. Your reset link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    if (onOpenLogin) {
      onOpenLogin();
    } else if (onNavigate) {
      onNavigate('/login');
    }
  };

  // ── Loading state while verifying recovery session ──
  if (checkingSession) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#2a2216] border border-[#f5ba72]/30 flex items-center justify-center shadow-caramel-glow">
            <div className="w-5 h-5 border-2 border-[#f5ba72]/30 border-t-[#f5ba72] rounded-full animate-spin" />
          </div>
          <p className="text-sm text-[#8d877c]">Verifying password reset link…</p>
        </div>
      </div>
    );
  }

  // ── Security Check Failed: Invalid or Expired Reset Link ──
  if (!hasValidSession && !isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-12 animate-fade-in">
        <div className="w-full max-w-md glass-card p-6 sm:p-8 border-white/10 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white">
              Invalid or Expired Reset Link
            </h1>
            <p className="text-xs sm:text-sm text-[#a39e94] leading-relaxed">
              This password reset link is invalid or has expired. Please request a new reset link.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => onNavigate && onNavigate('/forgot-password')}
              className="btn-primary w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2"
              id="request-new-reset-btn"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Request New Reset Link</span>
            </button>
            <button
              onClick={handleGoToLogin}
              className="btn-ghost w-full py-2 text-xs text-[#8d877c] hover:text-white"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Success State ──
  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-12 animate-fade-in">
        <div className="w-full max-w-md glass-card p-6 sm:p-8 border-white/10 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-emerald-glow">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white">
              Password Updated Successfully!
            </h1>
            <p className="text-xs sm:text-sm text-[#a39e94] leading-relaxed">
              Your password has been changed successfully.
            </p>
          </div>

          <p className="text-xs text-[#dedbd3] p-3 rounded-xl bg-white/[0.03] border border-white/10">
            You can now log in to your QuizCraft account using your new password.
          </p>

          <div className="pt-2">
            <button
              onClick={handleGoToLogin}
              className="btn-primary w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2 group shadow-caramel-glow"
              id="reset-success-go-to-login"
            >
              <LogIn className="w-4 h-4" />
              <span>Go to Login</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Valid Recovery Session: Reset Password Form ──
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-12 animate-fade-in">
      <div className="w-full max-w-md glass-card p-6 sm:p-8 border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-caramel-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-caramel-500/15 border border-caramel-500/30 flex items-center justify-center mx-auto shadow-caramel-glow">
            <KeyRound className="w-7 h-7 text-caramel-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Reset Password</h1>
          <p className="text-xs sm:text-sm text-[#a39e94] max-w-xs mx-auto leading-relaxed">
            Enter your new password below.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fade-in leading-relaxed">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-[#a39e94] mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#797368]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                className="input-field pl-10 pr-10 text-sm"
                autoFocus
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

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-[#a39e94] mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#797368]" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                className="input-field pl-10 pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d877c] hover:text-white transition-colors"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2 shadow-caramel-glow"
            id="update-password-submit-btn"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-1 border-t border-white/5">
          <button
            type="button"
            onClick={handleGoToLogin}
            className="text-xs text-[#8d877c] hover:text-white"
          >
            Cancel and return to Login
          </button>
        </div>
      </div>
    </div>
  );
}
