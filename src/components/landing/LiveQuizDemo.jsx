import { useState, useMemo } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Trophy, ArrowRight, X, Sparkles } from 'lucide-react';

const GK_QUESTIONS = [
  {
    topic: 'World Geography',
    question: 'What is the official capital city of Australia?',
    options: ['Canberra', 'Sydney', 'Melbourne', 'Brisbane'],
    answerText: 'Canberra',
    explanation: 'Canberra was selected as a compromise between Sydney and Melbourne in 1908 and serves as the seat of the federal government.',
  },
  {
    topic: 'Science & Chemistry',
    question: 'Which chemical element has the atomic symbol "Au"?',
    options: ['Gold', 'Silver', 'Platinum', 'Argon'],
    answerText: 'Gold',
    explanation: 'The symbol "Au" originates from the Latin word "Aurum", which translates to shining dawn or gold.',
  },
  {
    topic: 'Astronomy & Space',
    question: 'What is the tallest known volcano & mountain in our Solar System?',
    options: ['Olympus Mons (Mars)', 'Mount Everest (Earth)', 'Mauna Kea (Hawaii)', 'Elysium Mons (Mars)'],
    answerText: 'Olympus Mons (Mars)',
    explanation: 'Olympus Mons on Mars towers over 21.9 km (nearly 72,000 ft) high — roughly 2.5 times the height of Mount Everest.',
  },
  {
    topic: 'Planetary Science',
    question: 'Which planet in our solar system has the highest number of recognized moons?',
    options: ['Saturn (146 moons)', 'Jupiter (95 moons)', 'Uranus (28 moons)', 'Neptune (16 moons)'],
    answerText: 'Saturn (146 moons)',
    explanation: 'Saturn leads with 146 confirmed moons recognized by the International Astronomical Union, surpassing Jupiter.',
  },
  {
    topic: 'Natural World',
    question: 'Which is the fastest land animal in the world, capable of speeds up to 110 km/h?',
    options: ['Cheetah', 'Pronghorn Antelope', 'African Lion', 'Springbok'],
    answerText: 'Cheetah',
    explanation: 'Cheetahs can accelerate from 0 to 97 km/h (60 mph) in under 3 seconds, making them the fastest terrestrial mammals.',
  },
  {
    topic: 'Oceanography',
    question: 'What is the deepest known location on Earth\'s seabed?',
    options: ['Mariana Trench (Challenger Deep)', 'Java Trench', 'Puerto Rico Trench', 'Tonga Trench'],
    answerText: 'Mariana Trench (Challenger Deep)',
    explanation: 'Challenger Deep in the Mariana Trench plunges nearly 10,994 meters (36,070 feet) below sea level.',
  },
  {
    topic: 'Earth Science',
    question: 'Which gas constitutes approximately 78% of Earth\'s atmosphere?',
    options: ['Nitrogen', 'Oxygen', 'Carbon Dioxide', 'Argon'],
    answerText: 'Nitrogen',
    explanation: 'Earth\'s dry atmosphere is roughly 78.08% nitrogen, 20.95% oxygen, 0.93% argon, and 0.04% carbon dioxide.',
  },
  {
    topic: 'World Geography',
    question: 'Which country in the world possesses the longest total coastline?',
    options: ['Canada', 'Indonesia', 'Norway', 'Australia'],
    answerText: 'Canada',
    explanation: 'Canada holds the world\'s longest coastline at over 202,080 kilometers (125,567 miles) bordered by three oceans.',
  },
];

// Fisher-Yates option shuffler
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function LiveQuizDemo({ onStartFree, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [streak, setStreak] = useState(0);
  const [seed, setSeed] = useState(0); // Triggers re-shuffle per question

  const currentQ = GK_QUESTIONS[currentIndex];

  // Shuffled options for the active question
  const shuffledOptions = useMemo(() => {
    return shuffleArray(currentQ.options);
  }, [currentIndex, seed]);

  const isAnswered = selectedOption !== null;
  const isCorrect = isAnswered && shuffledOptions[selectedOption] === currentQ.answerText;

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    if (shuffledOptions[idx] === currentQ.answerText) {
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setCurrentIndex((prev) => (prev + 1) % GK_QUESTIONS.length);
    setSeed((s) => s + 1);
  };

  return (
    <div className="w-full max-w-lg mx-auto glass-card p-5 sm:p-7 border-amber-500/20 shadow-2xl relative overflow-hidden space-y-5 rounded-3xl backdrop-blur-xl bg-[#141210]/95 animate-scale-in">
      {/* Top ambient highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold text-white uppercase tracking-wider">
            Live GK Practice
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#8d877c]">
            {currentQ.topic}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#f5ba72] text-[11px] font-bold">
            <Trophy className="w-3 h-3 text-[#f5ba72]" />
            <span>{streak} Streak</span>
          </div>

          {/* Close button if modal/drawer */}
          {onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-[#8d877c] hover:text-white flex items-center justify-center transition-colors"
              title="Close Demo"
              aria-label="Close demo"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Question Text */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-[#8d877c] font-semibold">
          <span>Question {currentIndex + 1} of {GK_QUESTIONS.length}</span>
          <span className="text-[10px] text-amber-400/75">Options randomized</span>
        </div>
        <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
          {currentQ.question}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {shuffledOptions.map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isThisSelected = selectedOption === idx;
          const isThisAnswerCorrect = opt === currentQ.answerText;

          let btnClasses = 'border-white/[0.08] bg-white/[0.02] text-[#dedbd3] hover:border-amber-400/30 hover:bg-white/[0.04]';
          if (isAnswered) {
            if (isThisAnswerCorrect) {
              btnClasses = 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.15)]';
            } else if (isThisSelected) {
              btnClasses = 'border-rose-500/60 bg-rose-500/15 text-rose-200 font-semibold';
            } else {
              btnClasses = 'border-white/[0.04] bg-transparent text-[#777064] opacity-45';
            }
          }

          return (
            <button
              key={`${currentIndex}-${opt}-${idx}`}
              onClick={() => handleSelect(idx)}
              disabled={isAnswered}
              className={`w-full p-3 sm:p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between gap-3 transition-all duration-200 ${btnClasses}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                  isAnswered && isThisAnswerCorrect
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : isAnswered && isThisSelected
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-white/5 border border-white/10 text-[#8d877c]'
                }`}>
                  {letter}
                </span>
                <span className="font-medium">{opt}</span>
              </div>

              {isAnswered && isThisAnswerCorrect && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {isAnswered && isThisSelected && !isThisAnswerCorrect && (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Box */}
      {isAnswered && (
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1.5 animate-slide-up">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            {isCorrect ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Correct Answer! (+100 XP)
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Nice attempt! Correct answer is: "{currentQ.answerText}"
              </span>
            )}
          </div>
          <p className="text-xs text-[#a39e94] leading-relaxed">
            {currentQ.explanation}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="pt-2 flex items-center justify-between gap-3">
        {isAnswered ? (
          <button
            onClick={handleNext}
            className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Next Question</span>
          </button>
        ) : (
          <span className="text-[11px] text-[#8d877c] italic flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400/80" /> Click an answer to test your GK
          </span>
        )}

        <button
          onClick={onStartFree}
          className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-caramel-glow"
        >
          <span>Create My Quiz</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
