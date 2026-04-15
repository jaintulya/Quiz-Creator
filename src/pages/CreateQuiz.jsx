import { useState } from 'react';
import { Wand2, Plus, CheckCircle, AlertCircle, FileJson, Pencil, Info } from 'lucide-react';
import AIPromptModal from '../components/AIPromptModal.jsx';
import { saveQuiz, updateQuiz, validateQuizJSON } from '../utils/storage.js';

export default function CreateQuiz({ onNavigate, editQuiz = null }) {
  const [title, setTitle] = useState(editQuiz ? editQuiz.title : '');
  const [rawText, setRawText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState('input'); // 'input' | 'paste-json'

  const handleConvert = () => {
    if (!rawText.trim()) {
      setError('Please paste your questions in the textarea first.');
      return;
    }
    setError('');
    setShowModal(true);
  };

  const handleCreate = () => {
    if (!title.trim()) {
      setError('Please enter a quiz title.');
      return;
    }
    if (!rawText.trim()) {
      setError('Please paste the JSON output from the AI into the textarea.');
      return;
    }

    const result = validateQuizJSON(rawText);
    if (!result.valid) {
      setError(result.error);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        if (editQuiz) {
          updateQuiz(editQuiz.id, title, result.data);
          setSuccess(`Quiz updated! It now has ${result.data.length} questions.`);
        } else {
          saveQuiz(title, result.data);
          setSuccess(`Quiz created with ${result.data.length} questions! 🎉`);
        }
        setError('');
        setLoading(false);
        setTimeout(() => onNavigate('list'), 1500);
      } catch (e) {
        setError('Failed to save quiz. Please try again.');
        setLoading(false);
      }
    }, 400);
  };

  const exampleJSON = `[
  {
    "question": "What is 2 + 2?",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": "4",
    "explanation": "Basic arithmetic: 2 + 2 = 4."
  }
]`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">
          {editQuiz ? '✏️ Edit Quiz' : '✨ Create Quiz'}
        </h1>
        <p className="text-slate-400 text-sm">
          Paste raw questions, convert them to quiz format using AI, then save.
        </p>
      </div>

      {/* Card */}
      <div className="glass-card p-6 sm:p-8 space-y-6">

        {/* Step 1: Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Step 1 — Quiz Title
          </label>
          <input
            id="quiz-title"
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
            placeholder="e.g. JavaScript Fundamentals, General Science..."
            className="input-field"
          />
        </div>

        {/* Step 2: Raw questions */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Step 2 — Paste Raw Questions or AI JSON
          </label>
          <textarea
            id="quiz-textarea"
            value={rawText}
            onChange={(e) => { setRawText(e.target.value); setError(''); setSuccess(''); }}
            placeholder={`Paste your raw questions here (any format)...\n\nOR paste the JSON output from AI after converting.\n\nExample raw:\n1. What is photosynthesis?\n2. Name the planets in our solar system.`}
            rows={12}
            className="textarea-field"
          />
          <p className="text-xs text-slate-500 mt-1.5 flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            First paste raw questions → Convert via AI → Then paste the JSON back here → Create Quiz
          </p>
        </div>

        {/* JSON Example hint */}
        <details className="group">
          <summary className="cursor-pointer text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1.5 select-none">
            <FileJson className="w-3.5 h-3.5" />
            View expected JSON format
          </summary>
          <pre className="mt-2 p-3 rounded-xl bg-slate-900/80 border border-white/8 text-slate-400 text-xs leading-relaxed overflow-x-auto">
            {exampleJSON}
          </pre>
        </details>

        {/* Error / Success messages */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm animate-fade-in">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button id="convert-btn" onClick={handleConvert} className="btn-secondary flex-1 justify-center">
            <Wand2 className="w-4 h-4 text-amber-400" />
            Convert to Quiz Format
          </button>
          <button
            id="create-btn"
            onClick={handleCreate}
            disabled={loading}
            className="btn-primary flex-1 justify-center"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {loading ? 'Saving...' : editQuiz ? 'Update Quiz' : 'Create Quiz'}
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <AIPromptModal
          rawQuestions={rawText}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
