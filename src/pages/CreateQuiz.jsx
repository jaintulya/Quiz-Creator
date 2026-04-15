import { useState } from 'react';
import { Wand2, Plus, CheckCircle, AlertCircle, FileJson, Info } from 'lucide-react';
import AIPromptModal from '../components/AIPromptModal.jsx';
import { saveQuiz, updateQuiz, validateQuizJSON } from '../utils/storage.js';

export default function CreateQuiz({ onNavigate, editQuiz = null }) {
  const [title, setTitle]           = useState(editQuiz ? editQuiz.title : '');
  const [jsonText, setJsonText]     = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [loading, setLoading]       = useState(false);

  const handleCreate = () => {
    if (!title.trim()) {
      setError('Please enter a quiz title.');
      return;
    }
    if (!jsonText.trim()) {
      setError('Please paste the JSON output from your AI chat into the box below.');
      return;
    }

    const result = validateQuizJSON(jsonText);
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
      } catch {
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

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">
          {editQuiz ? '✏️ Edit Quiz' : '✨ Create Quiz'}
        </h1>
        <p className="text-slate-400 text-sm">
          Get the format prompt → paste in AI chat → paste JSON back here → save.
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 space-y-6">

        {/* ── Step 1: Title ───────────────────────────────────── */}
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

        {/* ── Step 2: Get format prompt ─────────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Step 2 — Get the AI Format Prompt
          </label>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Wand2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-200 leading-relaxed">
                Click the button below to get a prompt. Copy it and paste into{' '}
                <strong>Gemini or ChatGPT</strong> along with your questions.
                The AI will return properly formatted JSON.
              </p>
            </div>
          </div>
          <button
            id="convert-btn"
            onClick={() => { setError(''); setShowModal(true); }}
            className="btn-secondary mt-3 w-full justify-center py-3"
          >
            <Wand2 className="w-4 h-4 text-amber-400" />
            Get Format Prompt (for AI Chat)
          </button>
        </div>

        {/* ── Step 3: Paste JSON ───────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Step 3 — Paste JSON Output from AI
          </label>
          <textarea
            id="quiz-json-textarea"
            value={jsonText}
            onChange={(e) => { setJsonText(e.target.value); setError(''); setSuccess(''); }}
            placeholder={`Paste the JSON output from your AI chat here...\n\nExample:\n[\n  {\n    "question": "What is 2 + 2?",\n    "options": ["3", "4", "5", "6"],\n    "correctAnswer": "4",\n    "explanation": "2 + 2 = 4."\n  }\n]`}
            rows={12}
            className="textarea-field font-mono text-xs"
          />
          <p className="text-xs text-slate-500 mt-1.5 flex items-start gap-1.5">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            Must be a valid JSON array. Use the format prompt above to get this from AI.
          </p>
        </div>

        {/* JSON format hint */}
        <details className="group">
          <summary className="cursor-pointer text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1.5 select-none">
            <FileJson className="w-3.5 h-3.5" />
            View expected JSON format
          </summary>
          <pre className="mt-2 p-3 rounded-xl bg-slate-900/80 border border-white/10 text-slate-400 text-xs leading-relaxed overflow-x-auto">
            {exampleJSON}
          </pre>
        </details>

        {/* Messages */}
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

        {/* Save */}
        <button
          id="create-btn"
          onClick={handleCreate}
          disabled={loading}
          className="btn-primary w-full justify-center py-3.5 text-base"
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Plus className="w-5 h-5" />
          }
          {loading ? 'Saving...' : editQuiz ? 'Update Quiz' : 'Create Quiz'}
        </button>
      </div>

      {/* Modal */}
      {showModal && <AIPromptModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
