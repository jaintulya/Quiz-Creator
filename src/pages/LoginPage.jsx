import { useState } from 'react';
import { Sparkles, ArrowLeft, Brain, User, AlertCircle, CheckCircle2, Eye, EyeOff, BookOpen, Lock, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const COURSE_OPTIONS = [
  'BCA', 'MCA', 'BCS', 'BECE', 'B.Tech (CS)', 'B.Tech (EC)', 'B.Tech (IT)',
  'B.Sc (CS)', 'B.Sc (IT)', 'MBA', 'BBA', 'BA', 'B.Com', 'Other',
];

export default function LoginPage({ onNavigate, promptMessage = '' }) {
  const { signInWithGoogle, loginAsGuest, signInWithUsername, signUpWithUsername } = useAuth();
  
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [course, setCourse] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Validation ──
  const validateUsername = (u) => {
    if (u.length < 8) return 'Username must be at least 8 characters long.';
    if (!/[a-zA-Z]/.test(u)) return 'Username must contain at least one letter.';
    if (!/\d/.test(u)) return 'Username must contain at least one digit.';
    if (!/[^a-zA-Z0-9]/.test(u)) return 'Username must contain at least one special character.';
    return null;
  };

  // ── Handlers ──
  const handleGoogleSignIn = async () => {
    setError(''); setSuccess(''); setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign in failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGuestSignIn = () => {
    loginAsGuest();
    if (onNavigate) onNavigate('/dashboard');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'register') {
      const usernameError = validateUsername(username);
      if (usernameError) {
        setError(usernameError);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!course) {
        setError('Please select a course.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      
      setLoading(true);
      try {
        await signUpWithUsername(username, password, course);
        setSuccess('Account created successfully! Logging you in...');
        if (onNavigate) onNavigate('/dashboard');
      } catch (err) {
        setError(err.message || 'Registration failed.');
      } finally {
        setLoading(false);
      }
    } else {
      // Login
      if (!username || !password) {
        setError('Please enter both username and password.');
        return;
      }
      setLoading(true);
      try {
        await signInWithUsername(username, password);
        if (onNavigate) onNavigate('/dashboard');
      } catch (err) {
        setError(err.message || 'Login failed.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12 animate-fade-in">
      <div className="w-full max-w-md glass-card p-6 sm:p-8 lg:p-10 border-white/10 shadow-2xl relative overflow-hidden transition-all">
        {/* Ambient glow */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-caramel-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Back Link */}
        <button
          onClick={() => onNavigate && onNavigate('/')}
          className="btn-ghost text-xs -ml-2 mb-6 flex items-center gap-1.5 text-[#8d877c] hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#1a1612] border border-caramel-500/30 flex items-center justify-center mx-auto shadow-caramel-glow mb-2">
              <Brain className="w-7 h-7 text-caramel-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-xs sm:text-sm text-[#a39e94] max-w-[260px] mx-auto leading-relaxed">
              {promptMessage || (mode === 'login' ? 'Sign in to access your quizzes.' : 'Join to start creating quizzes.')}
            </p>
          </div>

          {/* Feedback */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fade-in leading-relaxed">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* User/Pass Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#a39e94] mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#797368]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. rahul@007"
                  className="input-field pl-10 text-sm"
                  required
                />
              </div>
              {mode === 'register' && (
                <p className="text-[10px] text-[#8d877c] mt-1.5 ml-1">Min 8 chars, 1 letter, 1 digit, 1 special char.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#a39e94] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#797368]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-10 pr-10 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d877c] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#a39e94] mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#797368]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="input-field pl-10 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a39e94] mb-1.5">Course / Program</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#797368]" />
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      required
                      className="input-field pl-10 text-sm appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select your course</option>
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2 shadow-caramel-glow mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'register' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  <span>{mode === 'register' ? 'Create Account' : 'Sign In'}</span>
                </>
              )}
            </button>
          </form>

          {/* Mode Switch */}
          <div className="text-center pt-2 text-xs text-[#8d877c]">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button type="button" onClick={() => { setMode('register'); setError(''); setSuccess(''); }} className="text-caramel-400 font-semibold hover:text-white">
                  Create Account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="text-caramel-400 font-semibold hover:text-white">
                  Sign In
                </button>
              </span>
            )}
          </div>

          <div className="space-y-4 pt-2 border-t border-white/5">
            <div className="text-center">
              <span className="text-[10px] font-semibold text-[#8d877c] uppercase tracking-wider bg-[#0f0e0d] px-3 relative -top-[22px]">
                Or Continue With
              </span>
            </div>
            
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-3 transition-all hover:border-white/20 active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
              </svg>
              <span>Google Account</span>
            </button>

            {/* Guest Button */}
            <button
              type="button"
              onClick={handleGuestSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-3 transition-all hover:border-white/20 active:scale-[0.99] disabled:opacity-50"
            >
              <User className="w-4 h-4 text-caramel-400" />
              <span>Continue as Guest</span>
            </button>
            <p className="text-center text-[10px] text-[#8d877c] pt-1 px-4 leading-relaxed">
              Guest progress is saved only on this device and won't appear on another device or browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
