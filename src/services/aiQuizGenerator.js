// ─── QuizCraft AI Question Generation & Export Engine ───────────────────────
// Generates intelligent, contextual MCQs from Topics or Raw Study Notes,
// with explanations and printable exam worksheet support.

// Curated domain templates for instant ultra-high-quality generation
const DOMAIN_KNOWLEDGE = {
  react: [
    {
      q: 'Which React Hook is primarily used for managing component side effects like data fetching or timers?',
      options: ['useMemo', 'useEffect', 'useCallback', 'useRef'],
      correct: 1,
      explanation: 'useEffect runs after rendering and handles side-effects like subscriptions, timers, and API calls.'
    },
    {
      q: 'What is the key benefit of React\'s Virtual DOM?',
      options: ['Direct GPU hardware acceleration', 'Minimizing expensive direct manipulations of the real browser DOM', 'Eliminating all JavaScript execution', 'Bypassing CSS rendering engines'],
      correct: 1,
      explanation: 'The Virtual DOM diffs memory representations and computes minimal batch updates to the real DOM.'
    },
    {
      q: 'What is the purpose of React.memo()?',
      options: ['Memoizing custom Hook return values', 'Preventing functional components from re-rendering when props do not change', 'Storing state across page reloads', 'Creating global application context'],
      correct: 1,
      explanation: 'React.memo is a higher-order component that skips re-rendering if props are shallowly equal.'
    },
    {
      q: 'In React 18, which API allows you to mark a state update as non-urgent / interruptible?',
      options: ['startTransition', 'useDeferredProps', 'useSuspense', 'asyncRender'],
      correct: 0,
      explanation: 'startTransition allows React to keep user inputs responsive while rendering heavy background updates.'
    },
    {
      q: 'Why should Hook calls never be placed inside loops, conditions, or nested functions?',
      options: ['To conserve browser memory', 'Because React relies on Hook call order consistency between renders', 'Because JavaScript will throw a syntax error', 'Because props cannot be passed to conditional Hooks'],
      correct: 1,
      explanation: 'React tracks Hook states via an internal linked list that depends strictly on the exact execution order.'
    }
  ],
  javascript: [
    {
      q: 'What is the output of `typeof null` in standard JavaScript?',
      options: ['"null"', '"undefined"', '"object"', '"boolean"'],
      correct: 2,
      explanation: 'Due to a historical legacy bug in JS type tag bitmasks, typeof null returns "object".'
    },
    {
      q: 'Which mechanism enables asynchronous code in JavaScript\'s single-threaded runtime?',
      options: ['Multi-core Thread Pool', 'The Event Loop and Microtask Queue', 'Direct kernel interrupts', 'WebAssembly runtime bypass'],
      correct: 1,
      explanation: 'The Event Loop coordinates the call stack with task and microtask queues (Promise callbacks).'
    },
    {
      q: 'What distinguishes `const` from `Object.freeze()`?',
      options: ['const prevents variable reassignment; Object.freeze prevents property mutation', 'Object.freeze only works on arrays', 'const deeply freezes all nested properties', 'They are completely identical'],
      correct: 0,
      explanation: '`const` fixes the identifier reference, whereas `Object.freeze()` makes the object\'s own properties immutable.'
    },
    {
      q: 'What is a Closure in JavaScript?',
      options: ['A function bundled with references to its surrounding lexical environment', 'A method that immediately terminates execution', 'A syntax error in recursive functions', 'A private class field syntax'],
      correct: 0,
      explanation: 'A closure gives a function access to its outer scope even after the outer function has returned.'
    }
  ],
  python: [
    {
      q: 'What is the Global Interpreter Lock (GIL) in standard CPython?',
      options: ['A memory security sandbox', 'A mutex preventing multiple native threads from executing Python bytecodes simultaneously', 'A compiler optimization pass', 'A file locking protocol'],
      correct: 1,
      explanation: 'The GIL ensures thread-safety for CPython\'s reference counting memory management.'
    },
    {
      q: 'In Python, what is the key distinction between a List and a Tuple?',
      options: ['Lists are immutable; Tuples are mutable', 'Lists are mutable; Tuples are immutable', 'Tuples only store numbers', 'Lists have O(1) membership search'],
      correct: 1,
      explanation: 'Tuples cannot be modified after creation, making them hashable and safer for dictionary keys.'
    },
    {
      q: 'What does a Python Generator function yield compared to a standard function?',
      options: ['An array of computed values', 'An iterator object producing values lazily on-demand', 'A background multi-process worker', 'A static byte stream'],
      correct: 1,
      explanation: 'Generators use `yield` to pause execution and stream values lazily, conserving memory.'
    }
  ],
  mba: [
    {
      q: 'Which of the following describes the "4 Ps" of Marketing in classical management?',
      options: ['People, Process, Profit, Production', 'Product, Price, Place, Promotion', 'Planning, Performance, Position, Public', 'Purchasing, Pipeline, Packaging, Pricing'],
      correct: 1,
      explanation: 'The marketing mix framework introduced by E. Jerome McCarthy centers on Product, Price, Place, and Promotion.'
    },
    {
      q: 'What does EBITDA stand for in financial statement analysis?',
      options: ['Earnings Before Interest, Taxes, Depreciation, and Amortization', 'Equity Base Investment Through Dividend Assets', 'Estimated Balance Including Total Debit Accounts', 'Economic Benefits In Trade Development Acts'],
      correct: 0,
      explanation: 'EBITDA measures a company\'s operating performance by stripping out financing, tax, and accounting decisions.'
    },
    {
      q: 'In Porter\'s Five Forces framework, which force assesses the ease with which competitors can enter a market?',
      options: ['Threat of Substitutes', 'Threat of New Entrants', 'Bargaining Power of Buyers', 'Competitive Rivalry'],
      correct: 1,
      explanation: 'Threat of New Entrants analyzes barriers to entry such as economies of scale, capital requirements, and patents.'
    },
    {
      q: 'What is the primary objective of Six Sigma methodology in operations management?',
      options: ['Maximizing short-term sales commissions', 'Minimizing defects and variation in manufacturing and business processes', 'Replacing human workers with automated scripts', 'Increasing product packaging weight'],
      correct: 1,
      explanation: 'Six Sigma seeks to improve quality by identifying and removing defect causes, aiming for 3.4 defects per million opportunities.'
    }
  ],
  database: [
    {
      q: 'What does the "ACID" acronym represent in relational database transaction management?',
      options: ['Atomicity, Consistency, Isolation, Durability', 'Access, Control, Indexing, Delivery', 'Allocation, Compression, Integrity, Directory', 'Asynchronous, Clustered, Integrated, Decentralized'],
      correct: 0,
      explanation: 'ACID guarantees that database transactions are processed reliably and maintain state integrity.'
    },
    {
      q: 'What is the main advantage of creating a B-Tree Index on a database column?',
      options: ['Accelerating SELECT query lookup speeds from O(N) to O(log N)', 'Encrypting column values on disk', 'Compressing column storage size to zero', 'Automatically backing up table data'],
      correct: 0,
      explanation: 'B-Tree indexes sort and structure column data into balanced trees, drastically reducing I/O search times.'
    }
  ]
};

/**
 * Intelligent topic-based procedural generator
 */
export function generateAIQuizByTopic({
  topic = '',
  questionCount = 5,
  difficulty = 'Medium',
  course = 'General',
}) {
  const cleanTopic = topic.trim();
  const lowerTopic = cleanTopic.toLowerCase();

  // Find matching domain pool if available
  let pool = [];
  for (const [key, questions] of Object.entries(DOMAIN_KNOWLEDGE)) {
    if (lowerTopic.includes(key) || key.includes(lowerTopic)) {
      pool = [...pool, ...questions];
    }
  }

  // Generate customized questions
  const generatedQuestions = [];
  const targetCount = Math.max(3, Math.min(25, Number(questionCount) || 5));

  // 1. Add questions from matched domain knowledge
  if (pool.length > 0) {
    // Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    shuffled.forEach((q) => {
      if (generatedQuestions.length < targetCount) {
        generatedQuestions.push({
          question: q.q,
          options: q.options,
          correctAnswer: q.correct,
          explanation: q.explanation || `Core fundamental concept of ${cleanTopic}.`,
        });
      }
    });
  }

  // 2. Synthesize contextual questions if more are required
  const conceptualTemplates = [
    {
      q: `What is the primary objective or principle behind "${cleanTopic}"?`,
      correct: `To solve fundamental workflow and performance challenges in ${cleanTopic}`,
      distractors: [
        `To deprecate all earlier legacy systems without replacement`,
        `To introduce unnecessary complexity to standard protocols`,
        `To eliminate all testing requirements across the stack`
      ],
      explanation: `${cleanTopic} was engineered to optimize standard practices and ensure reliable execution.`
    },
    {
      q: `Which of the following is considered an industry best practice when working with ${cleanTopic}?`,
      correct: `Following modular architecture and adhering to verified design conventions`,
      distractors: [
        `Ignoring error handling and edge cases during early implementation`,
        `Hardcoding sensitive configuration keys directly in client files`,
        `Bypassing documentation and testing stages entirely`
      ],
      explanation: `Industry standards for ${cleanTopic} emphasize modularity, maintainability, and clean separation of concerns.`
    },
    {
      q: `In the context of ${cleanTopic}, what is the main trade-off of choosing high optimization over simplicity?`,
      correct: `Increased architectural complexity and higher maintenance overhead`,
      distractors: [
        `Complete loss of data persistence`,
        `Incompatibility with all modern operating systems`,
        `Infinite compilation loops`
      ],
      explanation: `Premature or extreme optimization often increases codebase complexity and team onboarding time.`
    },
    {
      q: `Which factor is most critical to evaluate before deploying a solution based on ${cleanTopic}?`,
      correct: `Scalability, security posture, and benchmark performance under load`,
      distractors: [
        `The font style used in code comments`,
        `The physical weight of development machines`,
        `The number of spaces used instead of tabs`
      ],
      explanation: `Production readiness for ${cleanTopic} requires verifying system stability and security resilience.`
    },
    {
      q: `How does ${cleanTopic} handle unexpected runtime exceptions or error states?`,
      correct: `By raising structured error events and allowing graceful fallback handling`,
      distractors: [
        `By silently discarding state and terminating the host system`,
        `By deleting all application logs`,
        `By freezing the entire network socket`
      ],
      explanation: `Robust implementations of ${cleanTopic} isolate exceptions and preserve operational integrity.`
    },
    {
      q: `What is a common misconception regarding ${cleanTopic}?`,
      correct: `Assuming it replaces the need for foundational algorithmic understanding`,
      distractors: [
        `Believing that computers execute binary code`,
        `Thinking that memory management is important in software`,
        `Assuming networks use packet switching`
      ],
      explanation: `Even advanced paradigms like ${cleanTopic} rely fundamentally on sound underlying principles.`
    },
    {
      q: `When scaling ${cleanTopic} for enterprise-grade workloads, what strategy is most effective?`,
      correct: `Horizontal scaling, caching layers, and decoupled asynchronous processing`,
      distractors: [
        `Running all operations synchronously on a single thread`,
        `Disabling all database indexing`,
        `Preventing multiple users from accessing the system`
      ],
      explanation: `Enterprise scale demands distributed architecture and decoupled event handling.`
    }
  ];

  let templateIdx = 0;
  while (generatedQuestions.length < targetCount && templateIdx < conceptualTemplates.length) {
    const t = conceptualTemplates[templateIdx % conceptualTemplates.length];
    
    // Shuffle options so correct is at random index
    const allOpts = [t.correct, ...t.distractors];
    const shuffledOpts = [...allOpts].sort(() => Math.random() - 0.5);
    const correctIdx = shuffledOpts.indexOf(t.correct);

    generatedQuestions.push({
      question: t.q,
      options: shuffledOpts,
      correctAnswer: correctIdx,
      explanation: t.explanation,
    });

    templateIdx++;
  }

  return {
    title: `${cleanTopic} Master Quiz`,
    category: course && course !== 'Other' ? course : 'AI Generated',
    description: `A comprehensive ${difficulty} assessment exploring core principles, real-world scenarios, and best practices in ${cleanTopic}.`,
    questions: generatedQuestions,
  };
}

/**
 * Intelligent Notes to Quiz Extractor
 * Parses raw text/study notes and creates targeted MCQs
 */
export function generateQuizFromNotes(notesText, course = 'General') {
  if (!notesText || notesText.trim().length < 20) {
    throw new Error('Please provide at least a couple of sentences of notes or study text.');
  }

  const cleanText = notesText.trim();
  // Split into sentences
  const sentences = cleanText
    .split(/(?<=[.?!])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 250);

  if (sentences.length === 0) {
    throw new Error('Could not identify sufficient structured sentences in the provided text.');
  }

  const questions = [];
  const maxQ = Math.min(10, Math.max(3, sentences.length));

  for (let i = 0; i < maxQ; i++) {
    const sentence = sentences[i % sentences.length];
    const words = sentence.split(/\s+/).filter((w) => w.length > 4);

    if (words.length < 3) continue;

    // Pick a prominent word to blank out
    const targetWord = words[Math.floor(words.length / 2)].replace(/[^a-zA-Z0-9]/g, '');
    const blanked = sentence.replace(new RegExp(`\\b${targetWord}\\b`, 'i'), '_______');

    const distractors = [
      'Inversely', 'Independently', 'Redundancy', 'Configuration', 'Deprecation', 'Automation'
    ].filter((w) => w.toLowerCase() !== targetWord.toLowerCase()).slice(0, 3);

    const options = [targetWord, ...distractors].sort(() => Math.random() - 0.5);
    const correctIdx = options.indexOf(targetWord);

    questions.push({
      question: `Complete the concept from your notes: "${blanked}"`,
      options: options,
      correctAnswer: correctIdx,
      explanation: `Derived directly from your study material: "${sentence}"`,
    });
  }

  // Fallback if blanking yielded too few
  if (questions.length < 3) {
    return generateAIQuizByTopic({
      topic: cleanText.slice(0, 40),
      questionCount: 5,
      difficulty: 'Medium',
      course,
    });
  }

  return {
    title: `Study Notes Quiz (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
    category: course || 'Study Notes',
    description: `Auto-generated test crafted from ${sentences.length} core concepts in your provided study materials.`,
    questions,
  };
}

/**
 * Print / Export Worksheet Window
 */
export function printQuizWorksheet(quiz, includeAnswerKey = false) {
  if (typeof window === 'undefined') return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to open the printable worksheet.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${quiz.title} — Printable Worksheet</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #111;
          margin: 40px;
          line-height: 1.5;
        }
        .header {
          border-bottom: 2px solid #222;
          padding-bottom: 12px;
          margin-bottom: 24px;
        }
        .header h1 {
          margin: 0 0 6px 0;
          font-size: 22px;
        }
        .meta-grid {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #555;
          margin-top: 10px;
        }
        .student-fields {
          display: flex;
          gap: 24px;
          margin: 16px 0;
          font-size: 13px;
        }
        .field-line {
          border-bottom: 1px dotted #666;
          display: inline-block;
          width: 160px;
        }
        .question-card {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .q-title {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .options-list {
          list-style: none;
          padding-left: 0;
          margin: 0;
        }
        .option-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          margin-bottom: 6px;
        }
        .checkbox-box {
          width: 14px;
          height: 14px;
          border: 1px solid #444;
          border-radius: 3px;
          display: inline-block;
        }
        .answer-key-page {
          page-break-before: always;
          margin-top: 50px;
          border-top: 2px dashed #999;
          padding-top: 24px;
        }
        @media print {
          body { margin: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px;">
        <button onclick="window.print()" style="padding: 8px 16px; background: #000; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
          Print Exam / Save as PDF
        </button>
      </div>

      <div class="header">
        <h1>${quiz.title}</h1>
        <p style="margin: 0; font-size: 13px; color: #555;">${quiz.description || 'Interactive Knowledge Assessment'}</p>
        <div class="meta-grid">
          <span>Category: <strong>${quiz.category || 'General'}</strong></span>
          <span>Questions: <strong>${quiz.questions.length}</strong></span>
          <span>Max Score: <strong>${quiz.questions.length * 10} pts</strong></span>
        </div>
      </div>

      <div class="student-fields">
        <div>Student Name: <span class="field-line"></span></div>
        <div>Roll / ID: <span class="field-line"></span></div>
        <div>Date: <span class="field-line"></span></div>
      </div>

      <div style="margin-top: 24px;">
        ${quiz.questions
          .map(
            (q, idx) => `
          <div class="question-card">
            <div class="q-title">${idx + 1}. ${q.question}</div>
            <ul class="options-list">
              ${q.options
                .map(
                  (opt, optIdx) => `
                <li class="option-item">
                  <span class="checkbox-box"></span>
                  <span>(${String.fromCharCode(65 + optIdx)}) ${opt}</span>
                </li>
              `
                )
                .join('')}
            </ul>
          </div>
        `
          )
          .join('')}
      </div>

      ${
        includeAnswerKey
          ? `
        <div class="answer-key-page">
          <h2>Official Answer Key & Explanations</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 16px;">
            <thead>
              <tr style="border-bottom: 2px solid #333; text-align: left;">
                <th style="padding: 6px;">#</th>
                <th style="padding: 6px;">Correct Option</th>
                <th style="padding: 6px;">Explanation</th>
              </tr>
            </thead>
            <tbody>
              ${quiz.questions
                .map(
                  (q, idx) => `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 6px; font-weight: bold;">Q${idx + 1}</td>
                  <td style="padding: 6px; color: #0a7a3b; font-weight: bold;">
                    (${String.fromCharCode(65 + q.correctAnswer)}) ${q.options[q.correctAnswer]}
                  </td>
                  <td style="padding: 6px; color: #444;">
                    ${q.explanation || 'Standard verified answer.'}
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `
          : ''
      }
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
