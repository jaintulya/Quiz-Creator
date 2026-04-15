import { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import CreateQuiz from './pages/CreateQuiz.jsx';
import QuizList from './pages/QuizList.jsx';
import QuizPlayer from './pages/QuizPlayer.jsx';
import ResultPage from './pages/ResultPage.jsx';
import { seedSampleQuiz } from './utils/sampleQuiz.js';

// Pages: 'list' | 'create' | 'edit' | 'play' | 'result'

export default function App() {
  const [page, setPage] = useState('list');
  const [activeQuiz, setActiveQuiz] = useState(null);   // quiz being played/edited
  const [quizResult, setQuizResult] = useState(null);   // result after finish
  const [darkMode, setDarkMode] = useState(true);

  // Seed sample quiz on first load
  useEffect(() => {
    seedSampleQuiz();
    // Apply dark mode class
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleNavigate = (target) => {
    setPage(target);
    setActiveQuiz(null);
    setQuizResult(null);
  };

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setQuizResult(null);
    setPage('play');
  };

  const handleEditQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setPage('edit');
  };

  const handleFinish = (result) => {
    setQuizResult(result);
    setPage('result');
  };

  const handleRestart = () => {
    setQuizResult(null);
    setPage('play');
    // Re-mount player with same quiz by keeping activeQuiz
  };

  const handleToggleDark = () => setDarkMode((d) => !d);

  // Determine if navbar should be shown
  const showNav = page !== 'play';

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950' : 'bg-slate-100'} transition-colors duration-300`}>
      {/* Background gradient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {showNav && (
          <Navbar
            currentPage={page === 'edit' ? 'create' : page}
            onNavigate={handleNavigate}
            darkMode={darkMode}
            onToggleDark={handleToggleDark}
          />
        )}

        <main>
          {page === 'list' && (
            <QuizList
              onNavigate={handleNavigate}
              onStartQuiz={handleStartQuiz}
              onEditQuiz={handleEditQuiz}
            />
          )}

          {page === 'create' && (
            <CreateQuiz onNavigate={handleNavigate} />
          )}

          {page === 'edit' && activeQuiz && (
            <CreateQuiz onNavigate={handleNavigate} editQuiz={activeQuiz} />
          )}

          {page === 'play' && activeQuiz && (
            <QuizPlayer
              quiz={activeQuiz}
              onFinish={handleFinish}
              onBack={() => handleNavigate('list')}
            />
          )}

          {page === 'result' && quizResult && (
            <ResultPage
              result={quizResult}
              onRestart={handleRestart}
              onBack={() => handleNavigate('list')}
            />
          )}
        </main>
      </div>
    </div>
  );
}
