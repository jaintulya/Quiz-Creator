import { useState } from 'react';
import { X, Copy, Check, Sparkles, MessageSquare, Bot, ArrowRight } from 'lucide-react';
import { buildAIPrompt } from '../utils/aiPrompt.js';

export default function AIPromptModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  const prompt = buildAIPrompt();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      const el = document.createElement('textarea');
      el.value = prompt;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-card w-full max-w-xl shadow-2xl border-white/15 animate-slide-up overflow-hidden my-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-glow-amber">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base sm:text-lg flex items-center gap-2">
                AI Format Prompt
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">Copy → Paste into ChatGPT or Gemini → Paste JSON back</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instruction banner */}
        <div className="mx-4 sm:mx-6 mt-4 sm:mt-5 p-3.5 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-start gap-3">
          <Bot className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-violet-200/90 leading-relaxed">
            Copy the prompt instructions below, paste them into your favorite AI tool alongside your questions, and copy the formatted JSON response back.
          </p>
        </div>

        {/* Prompt code preview */}
        <div className="p-4 sm:p-6">
          <div className="relative">
            <pre className="w-full h-44 sm:h-52 overflow-y-auto p-4 rounded-xl bg-slate-950/80 border border-white/10 text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-mono select-all">
              {prompt}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Steps roadmap */}
        <div className="px-4 sm:px-6 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">1</span>
            <span>Click <strong>Copy Prompt</strong></span>
          </div>
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">2</span>
            <span>Paste in <strong>ChatGPT / Gemini</strong></span>
          </div>
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">3</span>
            <span>Send your study material or raw Qs</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">4</span>
            <span>Paste AI JSON back & save quiz</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400 text-center sm:text-left">
            Ready to generate quiz JSON in seconds
          </span>
          <button
            id="copy-prompt-btn"
            onClick={handleCopy}
            className="btn-primary w-full sm:w-auto px-6 py-2.5 text-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
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

