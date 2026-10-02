import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/common/Navbar.jsx';
import CreateQuiz from './pages/CreateQuiz.jsx';
import QuizList from './pages/QuizList.jsx';
import QuizPlayer from './pages/QuizPlayer.jsx';
import ResultPage from './pages/ResultPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { fetchQuizById } from './services/quizService.js';

function AppContent() {
  const { user, loading, isGuest, lastAuthEvent } = useAuth();

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
  const [authPromptMessage, setAuthPromptMessage] = useState('');
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
    if (options.promptMessage !== undefined) {
      setAuthPromptMessage(options.promptMessage);
    }

    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Sync with browser back / forward navigation and normalize callback URLs
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname ? window.location.pathname.replace(/\/+$/, '') : '/';
      setCurrentPath(p || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dedicated auth navigation handler
  const handleOpenAuth = (msg = '') => {
    navigate('/login', { promptMessage: msg });
  };

  // Logged-in user redirection
  useEffect(() => {
    if (!user && !isGuest) return;

    // Normal login, Google OAuth, or logged-in user on root/login -> send to dashboard
    if (currentPath === '/' || currentPath === '/login') {
      navigate('/dashboard');
    }
  }, [user, isGuest, currentPath, navigate]);

  // Protected route guard: unauthenticated users redirect to /login
  useEffect(() => {
    if (!user && !isGuest && !loading) {
      const protectedPaths = ['/dashboard', '/my-quizzes', '/create-quiz', '/profile', '/edit'];
      if (protectedPaths.includes(currentPath)) {
        navigate('/login', { promptMessage: 'Please sign in or continue as guest to access.' });
      }
    }
  }, [user, isGuest, loading, currentPath, navigate]);

  // Direct launch via URL query parameter (e.g. /play?quizId=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const quizId = params.get('quizId');
    if (quizId && !activeQuiz) {
      fetchQuizById(quizId, user?.id).then((found) => {
        if (found) {
          setActiveQuiz(found);
          setQuizResult(null);
          navigate('/play');
        }
      });
    }
  }, [user, activeQuiz, navigate]);

  const handleStartQuiz = (quiz, mode = null) => {
    setActiveQuiz(mode ? { ...quiz, initialMode: mode } : quiz);
    setQuizResult(null);
    navigate('/play');
  };

  const handleReviewMistakes = (mistakesQuiz) => {
    setActiveQuiz({ ...mistakesQuiz, initialMode: 'instant' });
    setQuizResult(null);
    navigate('/play');
  };

  const handleStudyFlashcards = (targetQuiz) => {
    setActiveQuiz({ ...targetQuiz, initialMode: 'flashcards' });
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

  const handleRestart = (quiz) => {
    setQuizResult(null);
    if (quiz) {
      setActiveQuiz(quiz);
    }
    navigate('/play');
  };

  const showNav = currentPath !== '/play';

  // Determine current active page for Navbar highlights
  const getNavActivePage = () => {
    if (currentPath === '/create-quiz') return 'create';
    if (currentPath === '/my-quizzes') return 'list';
    if (currentPath === '/dashboard') return 'dashboard';
    if (currentPath === '/profile') return 'profile';
    if (currentPath === '/login') return 'login';
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
          {/* ── PUBLIC ROUTE: /login ── */}
          {currentPath === '/login' && !user && !isGuest && (
            <LoginPage
              onNavigate={navigate}
              promptMessage={authPromptMessage}
            />
          )}

          {/* ── PUBLIC ROUTE: / (Landing Page for guests/unauth) ── */}
          {currentPath === '/' && !user && !isGuest && (
            <LandingPage
              onNavigate={navigate}
              onOpenAuth={(msg) => handleOpenAuth(msg)}
            />
          )}

          {/* ── PROTECTED ROUTE: /dashboard ── */}
          {currentPath === '/dashboard' && (user || isGuest) && (
            <Dashboard
              onNavigate={navigate}
              onStartQuiz={handleStartQuiz}
              onEditQuiz={handleEditQuiz}
              onOpenAuth={handleOpenAuth}
            />
          )}

          {/* ── PROTECTED ROUTE: /my-quizzes ── */}
          {currentPath === '/my-quizzes' && (user || isGuest) && (
            <QuizList
              onNavigate={navigate}
              onStartQuiz={handleStartQuiz}
              onEditQuiz={handleEditQuiz}
              onOpenAuth={handleOpenAuth}
            />
          )}

          {/* ── PROTECTED ROUTE: /create-quiz ── */}
          {currentPath === '/create-quiz' && (user || isGuest) && (
            <CreateQuiz
              onNavigate={navigate}
              editQuiz={activeQuiz}
              onOpenAuth={handleOpenAuth}
            />
          )}

          {/* ── PROTECTED ROUTE: /profile ── */}
          {currentPath === '/profile' && (user || isGuest) && (
            <ProfilePage onNavigate={navigate} />
          )}

          {/* ── QUIZ PLAYER: /play ── */}
          {currentPath === '/play' && activeQuiz && (
            <QuizPlayer
              quiz={activeQuiz}
              initialMode={activeQuiz.initialMode || null}
              onFinish={handleFinish}
              onBack={() => navigate((user || isGuest) ? '/my-quizzes' : '/')}
            />
          )}

          {/* ── RESULTS: /result ── */}
          {currentPath === '/result' && quizResult && (
            <ResultPage
              result={quizResult}
              onRestart={(q) => handleRestart(q || quizResult.quiz)}
              onReviewMistakes={handleReviewMistakes}
              onStudyFlashcards={handleStudyFlashcards}
              onBack={() => navigate((user || isGuest) ? '/my-quizzes' : '/')}
            />
          )}

          {/* Fallback if directly accessed /play without an active quiz */}
          {currentPath === '/play' && !activeQuiz && (
            <div className="max-w-md mx-auto py-24 text-center px-4">
              <div className="glass-card p-8 border-white/10 space-y-4">
                <p className="text-sm text-[#a39e94]">No active quiz is currently selected.</p>
                <button
                  onClick={() => navigate((user || isGuest) ? '/my-quizzes' : '/')}
                  className="btn-primary py-2 px-6 text-xs font-bold"
                >
                  Browse Quizzes
                </button>
              </div>
            </div>
          )}

          {/* Fallback if directly accessed /result without a completed quiz */}
          {currentPath === '/result' && !quizResult && (
            <div className="max-w-md mx-auto py-24 text-center px-4">
              <div className="glass-card p-8 border-white/10 space-y-4">
                <p className="text-sm text-[#a39e94]">No quiz score summary available yet.</p>
                <button
                  onClick={() => navigate((user || isGuest) ? '/dashboard' : '/')}
                  className="btn-primary py-2 px-6 text-xs font-bold"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </main>

        {showNav && (
          <footer className="border-t border-white/[0.07] bg-[#0c0b0a] py-6 px-4 text-center text-xs text-[#8d877c] mt-auto">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="font-semibold text-[#a39e94]">
                QuizCraft &copy; {new Date().getFullYear()} &mdash; AI Powered Interactive Learning
              </span>
              <div className="flex items-center gap-4 text-[#8d877c]">
                {(user || isGuest) ? (
                  <>
                    <button onClick={() => navigate('/create-quiz')} className="hover:text-[#f5ba72] transition-colors">Create Quiz</button>
                    <span>&bull;</span>
                    <button onClick={() => navigate('/my-quizzes')} className="hover:text-[#f5ba72] transition-colors">My Quizzes</button>
                    <span>&bull;</span>
                    <button onClick={() => navigate('/profile')} className="hover:text-[#f5ba72] transition-colors">Profile</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => navigate('/login')} className="hover:text-[#f5ba72] transition-colors">Sign In</button>
                  </>
                )}
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
