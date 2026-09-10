import { useState, useMemo } from 'react';
import {
  Wand2, Plus, CheckCircle2, AlertCircle, FileJson,
  Sparkles, ArrowLeft, Lock, LogIn
} from 'lucide-react';
import AIPromptModal from '../components/quiz/AIPromptModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { saveNewQuiz, updateExistingQuiz, updateTitleOnly } from '../services/quizService.js';
import { validateQuizJSON } from '../utils/storage.js';

export default function CreateQuiz({ onNavigate, editQuiz = null, onOpenAuth }) {
  const { user } = useAuth();
  const [title, setTitle]         = useState(editQuiz ? editQuiz.title : '');
  const [description, setDescription] = useState(editQuiz?.description || '');
  const [jsonText, setJsonText]   = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [loading, setLoading]     = useState(false);

  // Authentication gate: quiz creation requires login
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="glass-card p-8 border-white/10 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-caramel-500/15 border border-caramel-500/30 flex items-center justify-center mx-auto text-caramel-400 shadow-caramel-glow">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Sign In Required</h2>
            <p className="text-xs sm:text-sm text-[#a39e94]">
              Quiz creation is available for logged-in users. Please sign in to create and save quizzes to the database.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => onOpenAuth && onOpenAuth('Please sign in to create and save your quiz.')}
              className="btn-primary w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Continue</span>
            </button>
            <button
              onClick={() => onNavigate('list')}
              className="btn-secondary w-full py-2.5 text-xs flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Quizzes</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Live validator for the JSON text
  const jsonValidation = useMemo(() => {
    if (!jsonText.trim()) return null;
    return validateQuizJSON(jsonText);
  }, [jsonText]);


  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Please enter a quiz title.');
      return;
    }

    setLoading(true);
    try {
      if (editQuiz) {
        if (!jsonText.trim()) {
          await updateTitleOnly(editQuiz.id, title, user?.id);
          setSuccess('Quiz updated successfully!');
        } else {
          const result = validateQuizJSON(jsonText);
          if (!result.valid) {
            setError(result.error);
            setLoading(false);
            return;
          }
          await updateExistingQuiz(editQuiz.id, title, result.data, user?.id);
          setSuccess(`Quiz updated with ${result.data.length} questions!`);
        }
      } else {
        if (!jsonText.trim()) {
          setError('Please paste your questions in JSON format.');
          setLoading(false);
          return;
        }
        const result = validateQuizJSON(jsonText);
        if (!result.valid) {
          setError(result.error);
          setLoading(false);
          return;
        }

        await saveNewQuiz(title, result.data, user?.id, 'General', description);
        setSuccess(`Quiz created with ${result.data.length} questions! Saved to database.`);
      }

      setError('');
      setTimeout(() => onNavigate('list'), 1200);
    } catch (err) {
      setError(err.message || 'Failed to save quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <button
          onClick={() => onNavigate('list')}
          className="btn-ghost mb-2 -ml-2 text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Quizzes
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {editQuiz ? 'Edit Quiz' : 'Create New'}{' '}
          <span className="gradient-text-coral">Interactive Quiz</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#a39e94] mt-1">
          Build custom quizzes using AI prompts or paste JSON directly.
        </p>
      </div>

      {/* Form Card */}
      <div className="glass-card p-5 sm:p-8 space-y-6">

        {/* Step 1: Title & Description */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-caramel-500 text-slate-950 flex items-center justify-center font-bold text-[11px]">1</span>
              Quiz Details
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#a39e94] block mb-1">Quiz Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError(''); }}
                placeholder="e.g. JavaScript Basics, Web Development, General Knowledge..."
                className="input-field text-sm sm:text-base py-3 px-4"
              />
            </div>
            <div>
              <label className="text-xs text-[#a39e94] block mb-1">Short Description (optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Fundamental concepts of JavaScript"
                className="input-field text-xs sm:text-sm py-2 px-3"
              />
            </div>
          </div>
        </div>

        {/* Step 2: AI Prompt Helper */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-caramel-500 text-slate-950 flex items-center justify-center font-bold text-[11px]">2</span>
              Generate Questions with AI
            </label>
            <span className="text-[11px] text-caramel-400 font-semibold">ChatGPT / Gemini</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#241e16] border border-caramel-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-caramel-500/20 border border-caramel-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Wand2 className="w-4 h-4 text-caramel-400" />
              </div>
              <div className="text-xs sm:text-sm text-[#dedbd3] leading-relaxed">
                Need question format prompt? Copy our ready-to-use prompt and paste into ChatGPT or Gemini with your study notes.
              </div>
            </div>

            <button
              onClick={() => { setError(''); setShowModal(true); }}
              className="btn-primary shrink-0 py-2.5 px-4 text-xs font-bold"
            >
              <Sparkles className="w-4 h-4" />
              <span>Get AI Prompt</span>
            </button>
          </div>
        </div>

        {/* Step 3: Paste JSON */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-caramel-500 text-slate-950 flex items-center justify-center font-bold text-[11px]">3</span>
              Questions JSON Data
            </label>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => { setJsonText(e.target.value); setError(''); setSuccess(''); }}
            placeholder={`Paste the JSON array output from your AI chat here...\n\nExample:\n[\n  {\n    "question": "Which keyword declares a constant in JS?",\n    "options": ["var", "let", "const", "def"],\n    "correctAnswer": "const",\n    "explanation": "const declares block-scoped constants."\n  }\n]`}
            rows={10}
            className="textarea-field w-full p-4 font-mono text-xs sm:text-sm"
          />

          {/* Validation Feedback */}
          {jsonValidation && (
            <div className="animate-fade-in">
              {jsonValidation.valid ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Valid JSON detected: Ready to import <strong>{jsonValidation.data.length}</strong> questions!</span>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{jsonValidation.error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleCreate}
            disabled={loading}
            className="btn-primary w-full sm:flex-1 py-3 text-sm font-bold shadow-caramel-glow"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4 stroke-[3]" />
            )}
            <span>{loading ? 'Saving to Database...' : editQuiz ? 'Save Changes' : 'Create Quiz Now'}</span>
          </button>

          <button
            onClick={() => onNavigate('list')}
            className="btn-secondary w-full sm:w-auto px-6 py-3 text-sm"
          >
            Cancel
          </button>
        </div>

      </div>

      {/* AI Prompt Modal */}
      {showModal && <AIPromptModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
