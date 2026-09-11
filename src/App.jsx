import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/common/Navbar.jsx';
import CreateQuiz from './pages/CreateQuiz.jsx';
import QuizList from './pages/QuizList.jsx';
import QuizPlayer from './pages/QuizPlayer.jsx';
import ResultPage from './pages/ResultPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import EmailVerifiedPage from './pages/EmailVerifiedPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import AuthModal from './components/auth/AuthModal.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

function AppContent() {
  const { user, loading, lastAuthEvent } = useAuth();

  const getInitialPath = () => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p && p !== '/') return p.replace(/\/+$/, '');
    }
    return '/';
  };

  const [currentPath, setCurrentPath] = useState(getInitialPath);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');
  const [authModalMessage, setAuthModalMessage] = useState('');
  const [prefillEmail, setPrefillEmail] = useState('');

  const navigate = useCallback((target, options = {}) => {
    let path = target;
    if (target === 'home') path = '/';
    else if (target === 'dashboard') path = '/dashboard';
    else if (target === 'create' || target === 'create-quiz') path = '/create-quiz';
    else if (target === 'list' || target === 'my-quizzes' || target === 'quizzes') path = '/my-quizzes';
    else if (target === 'profile') path = '/profile';
    else if (target === 'play') path = '/play';
    else if (target === 'result') path = '/result';
    else if (target === 'login') path = '/login';
    else if (target === 'signup') path = '/signup';
    else if (target === 'forgot-password') path = '/forgot-password';
    else if (target === 'reset-password') path = '/reset-password';
    else if (target === 'email-verified') path = '/email-verified';

    if (options.prefillEmail) {
      setPrefillEmail(options.prefillEmail);
    }

    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Sync with browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname ? window.location.pathname.replace(/\/+$/, '') : '/';
      setCurrentPath(p || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Open authentication modal
  const handleOpenAuth = (msgOrMode = '', initialMode = 'signin') => {
    if (msgOrMode === 'signin' || msgOrMode === 'signup') {
      setAuthModalMode(msgOrMode);
      setAuthModalMessage('');
    } else {
      setAuthModalMode(initialMode);
      setAuthModalMessage(typeof msgOrMode === 'string' ? msgOrMode : '');
    }
    setAuthModalOpen(true);
  };

  useEffect(() => {
    if (currentPath === '/login') {
      if (user) {
        navigate('/dashboard');
      } else {
        handleOpenAuth('Please sign in to continue.', 'signin');
      }
    } else if (currentPath === '/signup') {
      if (user) {
        navigate('/dashboard');
      } else {
        handleOpenAuth('Create your QuizCraft account.', 'signup');
      }
    }
  }, [currentPath, user, navigate]);

  useEffect(() => {
    if (!user || !lastAuthEvent) return;
    if (lastAuthEvent === 'PASSWORD_RECOVERY') return;
    if (currentPath === '/email-verified') return;
    if (currentPath === '/reset-password') return;
    if (currentPath === '/forgot-password') return;
    if (currentPath === '/' || currentPath === '/login' || currentPath === '/signup') {
      navigate('/dashboard');
    }
  }, [user, currentPath, navigate, lastAuthEvent]);

  // On logout: if on protected page, redirect to home
  useEffect(() => {
    if (!user && !loading) {
      const protectedPaths = ['/dashboard', '/my-quizzes', '/create-quiz', '/profile', '/edit'];
      if (protectedPaths.includes(currentPath)) {
        navigate('/');
      }
    }
  }, [user, loading, currentPath, navigate]);

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setQuizResult(null);
    navigate('/play');
  };

  const handleEditQuiz = (quiz) => {
    setActiveQuiz(quiz);
    navigate('/create-quiz');
  };

  const handleFinish = (result) => {
    setQuizResult(result);
    navigate('/result');
  };

  const handleRestart = () => {
    setQuizResult(null);
    navigate('/play');
  };

  const showNav = currentPath !== '/play';

  // Determine current active page for Navbar highlights
  const getNavActivePage = () => {
    if (currentPath === '/create-quiz') return 'create';
    if (currentPath === '/my-quizzes') return 'list';
    if (currentPath === '/dashboard') return 'dashboard';
    if (currentPath === '/profile') return 'profile';
    return 'home';
  };

  // Loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0e0d] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2a2216] border border-[#f5ba72]/30 flex items-center justify-center shadow-caramel-glow">
            <div className="w-5 h-5 border-2 border-[#f5ba72]/30 border-t-[#f5ba72] rounded-full animate-spin" />
          </div>
          <p className="text-sm text-[#8d877c]">Loading QuizCraft…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0e0d] text-[#e8e4dc] flex flex-col relative overflow-x-clip font-sans selection:bg-[#f5ba72]/30 selection:text-[#f5ba72]">
      {/* Warm ambient gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[36rem] h-[36rem] bg-[#f5ba72]/[0.06] rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] bg-[#f09a3e]/[0.05] rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 w-[30rem] h-[30rem] bg-[#e27329]/[0.04] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {showNav && (
          <Navbar
            currentPage={getNavActivePage()}
            onNavigate={navigate}
            onOpenAuth={(msg) => handleOpenAuth(msg, 'signin')}
          />
        )}

        <main className="flex-1">
          {/* ── PUBLIC ROUTE: /email-verified ── */}
          {currentPath === '/email-verified' && (
            <EmailVerifiedPage
              onNavigate={navigate}
              onOpenLogin={() => handleOpenAuth('Please sign in with your verified credentials.', 'signin')}
            />
          )}

          {/* ── PUBLIC ROUTE: /forgot-password ── */}
          {currentPath === '/forgot-password' && (
            <ForgotPasswordPage
              onNavigate={navigate}
              onOpenLogin={() => handleOpenAuth('Please sign in with your credentials.', 'signin')}
              prefillEmail={prefillEmail}
            />
          )}

          {/* ── PUBLIC ROUTE: /reset-password ── */}
          {currentPath === '/reset-password' && (
            <ResetPasswordPage
              onNavigate={navigate}
              onOpenLogin={() => handleOpenAuth('Please sign in with your new password.', 'signin')}
            />
          )}

          {/* ── PUBLIC ROUTE: / (Landing Page for guests) ── */}
          {(currentPath === '/' || currentPath === '/login' || currentPath === '/signup') && !user && (
            <LandingPage onOpenAuth={(msg) => handleOpenAuth(msg, 'signup')} />
          )}

          {/* ── PROTECTED ROUTE: /dashboard ── */}
          {(currentPath === '/dashboard' || (currentPath === '/' && user)) && user && (
            <Dashboard
              onNavigate={navigate}
              onStartQuiz={handleStartQuiz}
              onEditQuiz={handleEditQuiz}
              onOpenAuth={handleOpenAuth}
            />
          )}

          {/* ── PROTECTED ROUTE: /my-quizzes ── */}
          {currentPath === '/my-quizzes' && user && (
            <QuizList
              onNavigate={navigate}
              onStartQuiz={handleStartQuiz}
              onEditQuiz={handleEditQuiz}
              onOpenAuth={handleOpenAuth}
            />
          )}

          {/* ── PROTECTED ROUTE: /create-quiz ── */}
          {currentPath === '/create-quiz' && user && (
            <CreateQuiz
              onNavigate={navigate}
              editQuiz={activeQuiz}
              onOpenAuth={handleOpenAuth}
            />
          )}

          {/* ── PROTECTED ROUTE: /profile ── */}
          {currentPath === '/profile' && user && (
            <ProfilePage onNavigate={navigate} />
          )}

          {/* ── QUIZ PLAYER: /play ── */}
          {currentPath === '/play' && activeQuiz && (
            <QuizPlayer
              quiz={activeQuiz}
              onFinish={handleFinish}
              onBack={() => navigate(user ? '/my-quizzes' : '/')}
            />
          )}

          {/* ── RESULTS: /result ── */}
          {currentPath === '/result' && quizResult && (
            <ResultPage
              result={quizResult}
              onRestart={handleRestart}
              onBack={() => navigate(user ? '/my-quizzes' : '/')}
            />
          )}
        </main>

        {showNav && (
          <footer className="border-t border-white/[0.07] bg-[#0c0b0a] py-6 px-4 text-center text-xs text-[#8d877c] mt-auto">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="font-semibold text-[#a39e94]">
                QuizCraft &copy; {new Date().getFullYear()} &mdash; AI Powered Interactive Learning
              </span>
              <div className="flex items-center gap-4 text-[#8d877c]">
                {user ? (
                  <>
                    <button onClick={() => navigate('/create-quiz')} className="hover:text-[#f5ba72] transition-colors">Create Quiz</button>
                    <span>&bull;</span>
                    <button onClick={() => navigate('/my-quizzes')} className="hover:text-[#f5ba72] transition-colors">My Quizzes</button>
                    <span>&bull;</span>
                    <button onClick={() => navigate('/profile')} className="hover:text-[#f5ba72] transition-colors">Profile</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleOpenAuth('signin')} className="hover:text-[#f5ba72] transition-colors">Sign In</button>
                    <span>&bull;</span>
                    <button onClick={() => handleOpenAuth('signup')} className="hover:text-[#f5ba72] transition-colors">Create Account</button>
                    <span>&bull;</span>
                    <button onClick={() => navigate('/forgot-password')} className="hover:text-[#f5ba72] transition-colors">Forgot Password</button>
                  </>
                )}
              </div>
            </div>
          </footer>
        )}
      </div>

      {/* Global Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          // If was on /login or /signup URL, return to root
          if (currentPath === '/login' || currentPath === '/signup') {
            if (typeof window !== 'undefined' && window.location.pathname !== '/') {
              window.history.pushState({}, '', '/');
            }
            setCurrentPath('/');
          }
        }}
        promptMessage={authModalMessage}
        initialMode={authModalMode}
        onNavigate={navigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
