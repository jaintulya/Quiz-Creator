import { useState, useMemo } from 'react';
import { X, Copy, Check, Sparkles, Bot, ArrowRight, Lightbulb, RotateCcw } from 'lucide-react';
import { buildAIPrompt } from '../../utils/aiPrompt.js';

export default function AIPromptModal({ onClose, defaultTopic = '', quizTitle = '' }) {
  const [topic, setTopic] = useState(defaultTopic);
  const [count, setCount] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [copied, setCopied] = useState(false);

  // Check if user has made any customization away from initial empty defaults
  const isCustomized = Boolean(topic.trim()) || Boolean(difficulty) || Boolean(count);

  const handleClearCustomization = () => {
    setTopic('');
    setDifficulty('');
    setCount('');
  };

  const parsedCount = typeof count === 'number' ? count : (parseInt(count, 10) || null);

  const promptText = useMemo(() => {
    return buildAIPrompt(topic, parsedCount, difficulty);
  }, [topic, parsedCount, difficulty]);

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
                Get the exact prompt to feed into ChatGPT, Gemini, or Claude for ready-to-import questions.
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

          {/* 1. Normal, Clean Customization Controls Container */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] shadow-inner space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#f5ba72] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#f5ba72]" />
                Customize Prompt
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
              {/* 1. Quiz Topic / Notes Input */}
              <div className="sm:col-span-5">
                <label className="text-xs font-semibold text-[#a39e94] block mb-1">
                  Quiz Topic / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. React Native, Operating Systems, Physics..."
                  className="input-field text-xs sm:text-sm py-2 px-3 w-full"
                />
                {quizTitle && quizTitle.trim() && !topic && (
                  <button
                    type="button"
                    onClick={() => setTopic(quizTitle.trim())}
                    className="text-[11px] text-[#f5ba72] hover:underline flex items-center gap-1 mt-1 font-medium transition-colors"
                  >
                    <span>Use quiz title: "{quizTitle.length > 32 ? quizTitle.slice(0, 30) + '...' : quizTitle}"</span>
                  </button>
                )}
              </div>

              {/* 2. Difficulty Select */}
              <div className="sm:col-span-3">
                <label className="text-xs font-semibold text-[#a39e94] block mb-1">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="input-field text-xs sm:text-sm py-2 px-3 w-full appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1b1713] text-[#8d877c]">Select (Optional)</option>
                  <option value="Easy" className="bg-[#1b1713] text-white">Easy</option>
                  <option value="Medium" className="bg-[#1b1713] text-white">Medium</option>
                  <option value="Hard" className="bg-[#1b1713] text-white">Hard</option>
                  <option value="Exam Level" className="bg-[#1b1713] text-white">Exam Level</option>
                </select>
              </div>

              {/* 3. Question Count Input & Quick Presets */}
              <div className="sm:col-span-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#a39e94] block">
                    Question Count
                  </label>
                  <span className="text-[10px] text-[#716b60]">max 50</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={count}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setCount('');
                      } else {
                        const num = parseInt(val, 10);
                        if (!isNaN(num)) {
                          setCount(Math.max(1, Math.min(50, num)));
                        }
                      }
                    }}
                    placeholder="e.g. 10"
                    className="input-field text-xs sm:text-sm py-2 px-3 w-full pr-9 font-semibold font-mono"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#8d877c] pointer-events-none">
                    Qs
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 mt-2">
                  {[5, 10, 20, 30, 50].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCount(count === preset ? '' : preset)}
                      className={`text-[11px] py-1 px-1 rounded-lg font-semibold text-center transition-all duration-150 ${
                        count === preset
                          ? 'bg-gradient-to-b from-[#f5ba72]/25 to-[#f5ba72]/10 text-[#f5ba72] border border-[#f5ba72]/50 shadow-[0_0_8px_rgba(245,186,114,0.15)]'
                          : 'bg-white/[0.03] text-[#8d877c] border border-white/[0.06] hover:bg-white/[0.07] hover:text-white hover:border-white/[0.12]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Smart tip for large counts (30 or 50 questions) */}
            {parsedCount && parsedCount > 20 && (
              <div className="text-[11px] text-[#dedbd3] bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg flex items-start gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip for {parsedCount} questions:</strong> If the AI pauses mid-way due to message length limits, simply type <em>"continue"</em> in your chat and copy all parts here.
                </span>
              </div>
            )}
          </div>

          {/* Quick steps banner */}
          <div className="p-3 rounded-xl bg-[#241e16] border border-caramel-500/20 flex items-start gap-2.5 text-xs text-[#dedbd3]">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-white">How it works:</strong> Copy the prompt below <ArrowRight className="inline w-3 h-3 text-[#f5ba72]" /> Paste it into ChatGPT / Gemini / Claude <ArrowRight className="inline w-3 h-3 text-[#f5ba72]" /> Copy the returned questions directly back into QuizCraft.
            </div>
          </div>

          {/* 2. Prompt Preview Code Box */}
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
                  {parsedCount ? `${parsedCount} Questions` : 'All Questions'}
                  {difficulty ? ` • ${difficulty}` : ''}
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

            <pre className="w-full h-48 sm:h-56 overflow-y-auto p-3.5 rounded-xl bg-[#0d0c0b] border border-white/10 text-[#dedbd3] text-xs leading-relaxed whitespace-pre-wrap font-mono select-all">
              {promptText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#161412] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[#8d877c] text-center sm:text-left">
            Ready to generate {parsedCount ? `${parsedCount} ` : ''}quiz questions with AI.
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
