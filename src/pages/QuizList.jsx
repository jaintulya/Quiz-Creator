import { useState, useEffect } from 'react';
import {
  BookOpen, Play, Trash2, Plus, Search, FileEdit,
  HelpCircle, Calendar, Sparkles, RefreshCw, X, Code
} from 'lucide-react';
import { getAllQuizzes, deleteQuiz, updateQuiz } from '../utils/storage.js';

export default function QuizList({ onNavigate, onStartQuiz, onEditQuiz }) {
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewJson, setViewJson] = useState(null);

  useEffect(() => {
    setQuizzes(getAllQuizzes());
  }, []);

  const filtered = quizzes.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    if (deleteConfirm === id) {
      deleteQuiz(id);
      setQuizzes(getAllQuizzes());
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const shuffleQuiz = (quizId) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;
    quiz.questions.forEach((q) => {
      const opts = [...q.options].sort(() => Math.random() - 0.5);
      q.options = opts;
    });
    const shuffledQuestions = [...quiz.questions].sort(() => Math.random() - 0.5);
    quiz.questions = shuffledQuestions;
    updateQuiz(quiz.id, quiz.title, quiz.questions);
    setQuizzes(getAllQuizzes());
    if (viewJson && viewJson.id === quizId) {
      const updated = getAllQuizzes().find(q => q.id === quizId);
      setViewJson(updated);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-1">My Quizzes</h1>
          <p className="text-slate-400 text-sm">
            {quizzes.length === 0 ? 'No quizzes yet — create your first one!' : `${quizzes.length} quiz${quizzes.length > 1 ? 'zes' : ''} saved`}
          </p>
        </div>
        <button id="new-quiz-btn" onClick={() => onNavigate('create')} className="btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          New Quiz
        </button>
      </div>

      {/* Search */}
      {quizzes.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes..."
            className="input-field pl-10"
          />
        </div>
      )}

      {/* Empty state */}
      {quizzes.length === 0 && (
        <div className="glass-card p-12 text-center animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-violet-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200 mb-2">No quizzes yet</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
            Create your first quiz by pasting raw questions and converting them with AI.
          </p>
          <button onClick={() => onNavigate('create')} className="btn-primary mx-auto">
            <Plus className="w-4 h-4" />
            Create First Quiz
          </button>
        </div>
      )}

      {/* Quiz grid */}
      {filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((quiz, i) => (
            <div
              key={quiz.id}
              className="glass-card-hover p-5 flex flex-col gap-4 animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Quiz info */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/40 to-indigo-600/40 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-violet-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-slate-100 text-base truncate" title={quiz.title}>
                    {quiz.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <HelpCircle className="w-3 h-3" />
                      {quiz.questions.length} Questions
                    </span>
                    {quiz.createdAt && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(quiz.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Question preview chips */}
              <div className="flex flex-wrap gap-1.5">
                {quiz.questions.slice(0, 3).map((q, qi) => (
                  <span key={qi} className="badge bg-white/5 border border-white/8 text-slate-400 max-w-[150px] truncate" title={q.question}>
                    Q{qi + 1}: {q.question.slice(0, 28)}{q.question.length > 28 ? '…' : ''}
                  </span>
                ))}
                {quiz.questions.length > 3 && (
                  <span className="badge bg-violet-600/20 border border-violet-500/20 text-violet-400">
                    +{quiz.questions.length - 3} more
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-white/8">
                <button
                  id={`start-quiz-${quiz.id}`}
                  onClick={() => onStartQuiz(quiz)}
                  className="btn-primary flex-1 justify-center py-2"
                >
                  <Play className="w-3.5 h-3.5" />
                  Start Quiz
                </button>
                <button
                  onClick={() => onEditQuiz(quiz)}
                  className="btn-secondary py-2 px-3"
                  title="Edit quiz"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => shuffleQuiz(quiz.id)}
                  className="btn-secondary py-2 px-3"
                  title="Shuffle Questions"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewJson(quiz)}
                  className="btn-secondary py-2 px-3"
                  title="View JSON"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(quiz.id)}
                  className={`py-2 px-3 rounded-xl text-sm font-semibold border transition-all duration-200 active:scale-95
                    ${deleteConfirm === quiz.id
                      ? 'bg-red-500 border-red-400 text-white'
                      : 'btn-danger'
                    }`}
                  title={deleteConfirm === quiz.id ? 'Click again to confirm delete' : 'Delete quiz'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {quizzes.length > 0 && filtered.length === 0 && (
        <div className="glass-card p-10 text-center text-slate-400">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p>No quizzes match "<span className="text-slate-300">{search}</span>"</p>
        </div>
      )}

      {/* JSON Modal */}
      {viewJson && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4" onClick={() => setViewJson(null)}>
          <div className="w-full max-w-2xl max-h-[80vh] bg-slate-900 border border-white/10 rounded-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-slate-200">{viewJson.title}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => shuffleQuiz(viewJson.id)} className="btn-secondary py-1.5 px-3 text-xs" title="Shuffle Questions">
                  <RefreshCw className="w-3.5 h-3.5" /> Shuffle
                </button>
                <button onClick={() => setViewJson(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                {JSON.stringify(viewJson, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}