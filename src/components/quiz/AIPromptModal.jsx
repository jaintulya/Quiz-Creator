import { useState, useMemo } from 'react';
import { X, Copy, Check, Sparkles, Bot, ArrowRight, Lightbulb, RotateCcw } from 'lucide-react';
import { buildAIPrompt } from '../../utils/aiPrompt.js';

export default function AIPromptModal({ onClose, defaultTopic = '' }) {
  const [topic, setTopic] = useState(defaultTopic);
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [copied, setCopied] = useState(false);

  // Check if user has made any customization away from initial defaults
  const isCustomized = Boolean(topic.trim()) || difficulty !== 'Medium' || count !== 5;

  const handleClearCustomization = () => {
    setTopic('');
    setDifficulty('Medium');
    setCount(5);
  };

  const promptText = useMemo(() => {
    return buildAIPrompt(topic, count, difficulty);
  }, [topic, count, difficulty]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
    } catch {
      const el = document.createElement('textarea');
      el.value = promptText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass-card w-full max-w-2xl shadow-2xl border-white/10 animate-slide-up overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-[#1a1714]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-caramel-500/20 border border-caramel-500/30 flex items-center justify-center shadow-caramel-glow">
              <Sparkles className="w-5 h-5 text-caramel-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white text-base sm:text-lg">
                  AI Quiz Prompt Generator
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-caramel-500/20 text-caramel-300 border border-caramel-500/30">
                  Ready
                </span>
              </div>
              <p className="text-xs text-[#a39e94]">
                Get the exact prompt to feed into ChatGPT, Gemini, or Claude for ready-to-import JSON.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4">

          {/* 1. Customization Controls Container */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] shadow-inner space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#f5ba72] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#f5ba72]" />
                Customize Your Prompt
              </span>

              <div className="flex items-center gap-2">
                {isCustomized && (
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    Customized
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleClearCustomization}
                  disabled={!isCustomized}
                  className={`text-[11px] font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                    isCustomized
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20 cursor-pointer shadow-sm'
                      : 'bg-white/[0.02] border-white/[0.05] text-[#716b60] cursor-not-allowed opacity-60'
                  }`}
                  title="Clear customization back to default"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="text-xs font-semibold text-[#a39e94] block mb-1">
                  Quiz Topic / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Modern Physics, Python OOP, World History..."
                  className="input-field text-xs sm:text-sm py-2 px-3 w-full"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs font-semibold text-[#a39e94] block mb-1">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="input-field text-xs sm:text-sm py-2 px-3 w-full appearance-none cursor-pointer"
                >
                  <option value="Easy" className="bg-[#1b1713] text-white">Easy</option>
                  <option value="Medium" className="bg-[#1b1713] text-white">Medium</option>
                  <option value="Hard" className="bg-[#1b1713] text-white">Hard</option>
                  <option value="Exam Level" className="bg-[#1b1713] text-white">Exam Level</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs font-semibold text-[#a39e94] block mb-1">
                  Question Count
                </label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="input-field text-xs sm:text-sm py-2 px-3 w-full appearance-none cursor-pointer"
                >
                  <option value={3} className="bg-[#1b1713] text-white">3 Questions</option>
                  <option value={5} className="bg-[#1b1713] text-white">5 Questions</option>
                  <option value={10} className="bg-[#1b1713] text-white">10 Questions</option>
                  <option value={15} className="bg-[#1b1713] text-white">15 Questions</option>
                  <option value={20} className="bg-[#1b1713] text-white">20 Questions</option>
                  <option value={25} className="bg-[#1b1713] text-white">25 Questions</option>
                  <option value={30} className="bg-[#1b1713] text-white">30 Questions</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick steps banner */}
          <div className="p-3 rounded-xl bg-[#241e16] border border-caramel-500/20 flex items-start gap-2.5 text-xs text-[#dedbd3]">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-white">How it works:</strong> Copy the prompt below <ArrowRight className="inline w-3 h-3 text-[#f5ba72]" /> Paste it into ChatGPT / Gemini / Claude <ArrowRight className="inline w-3 h-3 text-[#f5ba72]" /> Copy the returned JSON directly into QuizCraft.
            </div>
          </div>

          {/* 2. Prompt Preview Code Box (Dynamically shows Default Prompt / Custom Prompt) */}
          <div className="relative">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Bot className="w-3.5 h-3.5 text-caramel-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  {isCustomized ? 'Custom Prompt' : 'Default Prompt'}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border transition-colors ${
                  isCustomized
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-white/5 text-[#a39e94] border-white/10'
                }`}>
                  {isCustomized ? 'Customized' : 'Default'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-caramel-400 hover:text-caramel-300 font-semibold flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied to clipboard!' : 'Copy prompt text'}</span>
              </button>
            </div>

            <pre className="w-full h-44 sm:h-52 overflow-y-auto p-3.5 rounded-xl bg-[#0d0c0b] border border-white/10 text-[#dedbd3] text-xs leading-relaxed whitespace-pre-wrap font-mono select-all">
              {promptText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#161412] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[#8d877c] text-center sm:text-left">
            Ready to generate quiz questions in 1-click.
          </span>
          <button
            type="button"
            id="copy-prompt-btn"
            onClick={handleCopy}
            className="btn-primary w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm font-bold shadow-caramel-glow flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Prompt Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Full Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
