import { useState } from 'react';
import { X, Copy, Check, Sparkles, ExternalLink } from 'lucide-react';
import { buildAIPrompt } from '../utils/aiPrompt.js';

export default function AIPromptModal({ rawQuestions, onClose }) {
  const [copied, setCopied] = useState(false);
  const prompt = buildAIPrompt(rawQuestions);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = prompt;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-card w-full max-w-2xl shadow-2xl animate-slide-up overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-900/40">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-100 text-base">AI Prompt</h2>
              <p className="text-xs text-slate-400">Copy and use in Gemini / ChatGPT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt box */}
        <div className="p-5">
          <div className="relative">
            <pre className="w-full h-64 overflow-y-auto p-4 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-mono">
              {prompt}
            </pre>
          </div>

          {/* Steps */}
          <div className="mt-4 space-y-2">
            {[
              { step: '1', text: 'Click "Copy Prompt" below' },
              { step: '2', text: 'Paste into Gemini or ChatGPT and run it' },
              { step: '3', text: 'Copy the JSON output from the AI' },
              { step: '4', text: 'Come back and paste JSON into the textarea, then click "Create Quiz"' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-2.5 text-xs text-slate-400">
                <span className="w-5 h-5 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center text-violet-400 flex-shrink-0 font-semibold text-[10px]">
                  {step}
                </span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex flex-wrap gap-3">
          <button onClick={handleCopy} className="btn-primary flex-1 justify-center">
            {copied ? (
              <><Check className="w-4 h-4 text-emerald-400" /> Copied!</>
            ) : (
              <><Copy className="w-4 h-4" /> Copy Prompt</>
            )}
          </button>

          <a
            href="https://gemini.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <ExternalLink className="w-4 h-4" />
            Open Gemini
          </a>

          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
