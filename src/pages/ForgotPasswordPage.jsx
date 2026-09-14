import { useState, useEffect } from 'react';
import { Mail, KeyRound, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function ForgotPasswordPage({ onNavigate, onOpenLogin, prefillEmail = '' }) {
  const { sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState(prefillEmail || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    // Standard email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(cleanEmail);
      setIsSuccess(true);
    } catch (err) {
      let msg = err.message || 'Failed to send password reset email. Please try again.';
      if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
        msg = 'Too many requests. Please wait a few minutes before trying again.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    if (onNavigate) {
      onNavigate('/login');
    } else if (onOpenLogin) {
      onOpenLogin();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-12 animate-fade-in">
      <div className="w-full max-w-md glass-card p-6 sm:p-8 border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-caramel-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Back Link */}
        <button
          onClick={handleBackToLogin}
          className="btn-ghost text-xs -ml-2 flex items-center gap-1.5 text-[#8d877c] hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </button>

        {isSuccess ? (
          /* Success State */
          <div className="text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-emerald-glow">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">Reset Link Sent!</h2>
              <p className="text-xs sm:text-sm text-[#dedbd3] leading-relaxed">
                If an account exists for this email, a password reset link has been sent.
              </p>
              <p className="text-xs text-[#a39e94] pt-1 leading-relaxed">
                Check your spam or junk folder if you don't see the email.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#dedbd3] text-left space-y-1.5">
              <p className="font-semibold text-caramel-400">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#a39e94]">
                <li>Open your email on any device.</li>
                <li>Click the reset link within 5 minutes.</li>
                <li>Set your new secure password.</li>
              </ol>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleBackToLogin}
                className="btn-primary w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2"
              >
                <span>Back to Login</span>
              </button>
            </div>
          </div>
        ) : (
          /* Input Form */
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-caramel-500/15 border border-caramel-500/30 flex items-center justify-center mx-auto shadow-caramel-glow">
                <KeyRound className="w-7 h-7 text-caramel-400" />
              </div>
              <h1 className="text-2xl font-extrabold text-white">Forgot Password?</h1>
              <p className="text-xs sm:text-sm text-[#a39e94] max-w-xs mx-auto leading-relaxed">
                Enter the email associated with your account and we'll send you a password reset link.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fade-in leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a39e94] mb-1.5">
                  Email
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
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2 shadow-caramel-glow"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-1 border-t border-white/5">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-xs text-caramel-400 hover:text-caramel-300 font-semibold"
              >
                Remember your password? Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
