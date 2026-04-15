import { useState } from 'react';
import { X, Copy, Check, Sparkles, MessageSquare } from 'lucide-react';
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
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-card w-full max-w-xl shadow-2xl animate-slide-up overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-900/40">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base">AI Format Prompt</h2>
              <p className="text-xs text-slate-400">Copy → Paste in your AI chat → Get JSON</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instruction banner */}
        <div className="mx-5 mt-5 flex items-start gap-3 p-3.5 rounded-xl bg-violet-600/15 border border-violet-500/25">
          <MessageSquare className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-violet-200 leading-relaxed">
            <span className="font-semibold">Paste this into your AI chat</span> (Gemini / ChatGPT) along with your questions to get the required JSON format.
          </p>
        </div>

        {/* Prompt box */}
        <div className="p-5">
          <pre className="w-full h-52 overflow-y-auto p-4 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-mono select-all">
            {prompt}
          </pre>
        </div>

        {/* How to use steps */}
        <div className="px-5 pb-4 space-y-2">
          {[
            { n: '1', text: 'Click "Copy Prompt" below' },
            { n: '2', text: 'Open Gemini or ChatGPT → paste the prompt' },
            { n: '3', text: 'Then send your questions in the same chat' },
            { n: '4', text: 'Copy the JSON output → paste it back into the textarea → Create Quiz' },
          ].map(({ n, text }) => (
            <div key={n} className="flex items-start gap-2.5 text-xs text-slate-400">
              <span className="w-5 h-5 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center text-violet-400 flex-shrink-0 font-bold text-[10px]">
                {n}
              </span>
              {text}
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="px-5 pb-5 flex justify-center">
          <button
            id="copy-prompt-btn"
            onClick={handleCopy}
            className="btn-primary px-10 py-3"
          >
            {copied
              ? <><Check className="w-4 h-4 text-emerald-400" /> Copied!</>
              : <><Copy className="w-4 h-4" /> Copy Prompt</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
