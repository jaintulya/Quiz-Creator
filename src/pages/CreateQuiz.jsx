import { useState, useEffect } from 'react';
import {
  Plus, CheckCircle2, AlertCircle, FileJson,
  Sparkles, ArrowLeft, Lock, LogIn, Check, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { saveNewQuiz, updateExistingQuiz } from '../services/quizService.js';
import { validateQuizJSON } from '../utils/storage.js';
import { recordQuizCreated } from '../services/gamificationService.js';
import AIPromptModal from '../components/quiz/AIPromptModal.jsx';

export default function CreateQuiz({ onNavigate, editQuiz = null, onOpenAuth }) {
  const { user, isGuest } = useAuth();

  // Common Quiz Fields
  const [title, setTitle] = useState(editQuiz ? editQuiz.title : '');
  const [description, setDescription] = useState(editQuiz?.description || '');
  const [category, setCategory] = useState(editQuiz?.category || 'General');
  const [questions, setQuestions] = useState(editQuiz?.questions || []);

  // Questions JSON Editor State
  const [jsonText, setJsonText] = useState(editQuiz ? JSON.stringify(editQuiz.questions, null, 2) : '');

  // Status
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(Boolean(editQuiz));
  const [showPromptModal, setShowPromptModal] = useState(false);

  // Sync state whenever editQuiz prop changes (prevents leftover data when creating new quiz)
  useEffect(() => {
    if (editQuiz) {
      setTitle(editQuiz.title || '');
      setDescription(editQuiz.description || '');
      setCategory(editQuiz.category || 'General');
      setQuestions(editQuiz.questions || []);
      setJsonText(editQuiz.questions ? JSON.stringify(editQuiz.questions, null, 2) : '');
      setShowPreview(true);
    } else {
      setTitle('');
      setDescription('');
      setCategory('General');
      setQuestions([]);
      setJsonText('');
      setShowPreview(false);
      setError('');
      setSuccess('');
    }
  }, [editQuiz]);

  // Authentication check
  if (!user && !isGuest) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="glass-card p-8 border-white/10 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-caramel-500/15 border border-caramel-500/30 flex items-center justify-center mx-auto text-caramel-400 shadow-caramel-glow">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
            <p className="text-xs sm:text-sm text-[#a39e94]">
              Quiz creation is available for logged-in users and guests. Please sign in or continue as a guest to create and save quizzes.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => onOpenAuth && onOpenAuth('Please sign in or continue as a guest to create your quiz.')}
              className="btn-primary w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Guest</span>
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

  // ── Preview Questions on Demand ──────────────────────────────────────────
  const handlePreviewQuestions = () => {
    setError('');
    if (!jsonText.trim()) {
      setError('Please enter your questions first before previewing.');
      setShowPreview(false);
      return;
    }
    const res = validateQuizJSON(jsonText, title);
    if (res.valid) {
      setQuestions(res.data);
      if (res.extractedTitle && !title.trim()) {
        setTitle(res.extractedTitle);
      }
      setShowPreview(true);
      setError('');
      setTimeout(() => {
        document.getElementById('questions-preview-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setError(res.error);
      setShowPreview(false);
    }
  };

  // ── Instant Create / Save Quiz Directly from JSON ──────────────────────────
  const handleSaveQuiz = async () => {
    setError('');
    setSuccess('');

    // If jsonText is empty and questions are also empty, notify user
    if (!jsonText.trim() && (!questions || questions.length === 0)) {
      setError('Please enter or paste your quiz questions (JSON format) before creating.');
      return;
    }

    let finalQuestions = questions;
    let detectedTitle = '';

    // Directly parse and validate whatever JSON text is in the box
    if (jsonText.trim()) {
      const res = validateQuizJSON(jsonText, title);
      if (!res.valid) {
        setError(res.error);
        return;
      }
      finalQuestions = res.data;
      setQuestions(res.data);
      if (res.extractedTitle) {
        detectedTitle = res.extractedTitle;
        if (!title.trim()) {
          setTitle(res.extractedTitle);
        }
      }
    }

    if (!finalQuestions || finalQuestions.length === 0) {
      setError('Your quiz must contain at least one question before saving.');
      return;
    }

    // Determine final title: input field > extracted from JSON > first question preview > default
    let finalTitle = title.trim();
    if (!finalTitle && detectedTitle) {
      finalTitle = detectedTitle;
    }
    if (!finalTitle) {
      const firstQ = finalQuestions[0]?.question || 'Custom Assessment';
      finalTitle = firstQ.length > 45 ? `${firstQ.slice(0, 42)}...` : firstQ;
      setTitle(finalTitle);
    }

    setSaving(true);
    try {
      if (editQuiz) {
        await updateExistingQuiz(editQuiz.id, finalTitle, finalQuestions, user?.id);
        setSuccess('Quiz updated successfully!');
      } else {
        await saveNewQuiz(finalTitle, finalQuestions, user?.id, category, description);
        recordQuizCreated(user?.id);
        setSuccess(`Quiz "${finalTitle}" created with ${finalQuestions.length} questions! Saved to your library.`);
      }

      setTimeout(() => {
        onNavigate('list');
      }, 900);
    } catch (err) {
      setError(err.message || 'Failed to save quiz.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('list')}
            className="btn-ghost text-xs -ml-2 mb-2 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Quizzes</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {editQuiz ? 'Edit' : 'Create New'} <span className="gradient-text">Quiz</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8d877c] mt-1">
            Build custom exams and assessments with questions, options, and answer keys.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Quiz Details Card (Always Visible at Top) */}
      <div className="glass-card p-4 sm:p-5 border-white/10 space-y-3">
        <div>
          <label className="text-xs font-semibold text-[#a39e94] block mb-1">
            Quiz Title <span className="text-[#f5ba72]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. React Native Components, Operating Systems, Modern Physics..."
            className="input-field text-xs sm:text-sm py-2.5 px-3.5 w-full font-semibold"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#8d877c] block mb-1">
            Short Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Comprehensive practice quiz with explanations"
            className="input-field text-xs py-2 px-3 w-full"
          />
        </div>
      </div>

      {/* Questions Payload Editor */}
      <div className="glass-card p-5 sm:p-7 border-white/10 space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Quiz Questions & Answers
            </label>
            <p className="text-[11px] text-[#8d877c] mt-0.5">
              Enter or paste your multiple-choice questions below with their options and correct answers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowPromptModal(true)}
            className="btn-secondary py-2 px-3.5 text-xs font-semibold flex items-center gap-2 border-[#f5ba72]/30 text-[#f5ba72] hover:bg-[#f5ba72]/10 transition-all shrink-0 self-start sm:self-auto shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#f5ba72]" />
            <span>Get AI Prompt</span>
          </button>
        </div>

        <textarea
          rows={10}
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            if (error) setError('');
          }}
          placeholder={`[\n  {\n    "question": "Which component is recommended in React Native for handling tap interactions?",\n    "options": ["TouchableHighlight", "View", "Pressable", "TouchableOpacity"],\n    "correctAnswer": "Pressable",\n    "explanation": "Pressable provides extensive touch feedback."\n  }\n]`}
          className="input-field text-xs font-mono p-4 w-full resize-y"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <span className="text-[11px] text-[#8d877c] flex items-center gap-1.5 flex-wrap">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Need questions? Click <button type="button" onClick={() => setShowPromptModal(true)} className="text-[#f5ba72] underline font-semibold hover:text-[#f7cb93]">"Get AI Prompt"</button> to generate with ChatGPT/Gemini.</span>
          </span>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={handlePreviewQuestions}
              className="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-[#f5ba72]" />
              <span>Preview Questions</span>
            </button>

            <button
              type="button"
              onClick={handleSaveQuiz}
              disabled={saving}
              className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center justify-center gap-2 shadow-caramel-glow"
            >
              {saving ? (
                <span className="w-3.5 h-3.5 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>Create Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Quiz Metadata & Preview (shown ONLY when user clicks Preview Questions) */}
      {showPreview && questions.length > 0 && (
        <div id="questions-preview-section" className="glass-card p-5 sm:p-7 border-white/10 space-y-6 animate-fade-in scroll-mt-6">
          <div className="pb-4 border-b border-white/[0.08]">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Generated Quiz Preview ({questions.length} Questions)</span>
            </h2>
            <p className="text-xs text-[#8d877c] mt-0.5">
              Review questions and answers below before saving to your library.
            </p>
          </div>

          {/* Metadata preview strip */}
          <div className="flex flex-wrap items-center gap-2.5 py-2.5 px-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs">
            <span className="text-[#8d877c]">Title:</span>
            <span className="font-bold text-white">{title || 'Untitled Quiz'}</span>
            <span className="text-white/20">•</span>
            <span className="text-[#8d877c]">Questions:</span>
            <span className="font-semibold text-emerald-400">{questions.length} Questions</span>
            {description && (
              <>
                <span className="text-white/20">•</span>
                <span className="text-[#8d877c] truncate max-w-xs">{description}</span>
              </>
            )}
          </div>

          {/* Questions Review List */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Questions & Answer Key
            </span>

            {questions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    <span className="text-[#f5ba72] font-mono mr-1.5">{idx + 1}.</span>
                    {q.question}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = optIdx === q.correctAnswer || opt === q.correctAnswer;
                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                          isCorrect
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 font-semibold'
                            : 'bg-white/[0.02] border-white/[0.05] text-[#dedbd3]'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                          isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="truncate">{opt}</span>
                        {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-[#8d877c] border-t border-white/[0.04] pt-2 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong className="font-semibold text-[#a39e94]">Explanation:</strong> {q.explanation}</span>
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Save to Library CTA */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
            <p className="text-xs text-[#8d877c]">
              All questions validated. Ready to save to your library.
            </p>
            <button
              type="button"
              onClick={handleSaveQuiz}
              disabled={saving}
              className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2 shadow-caramel-glow"
            >
              {saving ? (
                <span className="w-3.5 h-3.5 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Save to Library</span>
            </button>
          </div>
        </div>
      )}

      {/* AI Prompt Generator Modal */}
      {showPromptModal && (
        <AIPromptModal
          defaultTopic={title}
          onClose={() => setShowPromptModal(false)}
        />
      )}

    </div>
  );
}
