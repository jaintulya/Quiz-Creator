// ─── localStorage Keys & Isolation ──────────────────────────────────────────
export function getStorageKey(userId = null) {
  if (userId) return `quizcraft_quizzes_${userId}`;
  try {
    const isGuest = localStorage.getItem('quizcraft_guest_mode') === 'true';
    if (isGuest) return 'quizcraft_quizzes_guest';
  } catch {}
  return 'quizcraft_quizzes';
}

// ─── Get all quizzes ───────────────────────────────────────────────────────────
export function getAllQuizzes(userId = null) {
  const key = getStorageKey(userId);
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
    // Legacy fallback only if generic key requested
    if (!userId && key === 'quizcraft_quizzes') {
      const fallback = localStorage.getItem('quizcraft_quizzes');
      return fallback ? JSON.parse(fallback) : [];
    }
    return [];
  } catch {
    return [];
  }
}

// ─── Generate clean unique 6-character Quiz Code (e.g. QC-7K2M) ───────────────
export function generateQuizCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `QC-${rand}`;
}

// ─── Get a single quiz by id or code ───────────────────────────────────────────
export function getQuizById(id, userId = null) {
  if (!id) return null;
  const clean = id.trim().toLowerCase();
  const quizzes = getAllQuizzes(userId);
  const found = quizzes.find((q) => q.id?.toLowerCase() === clean || q.code?.toLowerCase() === clean);
  if (found) return found;

  // Search across other quiz storage keys (e.g. guest or other account)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('quizcraft_quizzes')) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const match = list.find((q) => q.id?.toLowerCase() === clean || q.code?.toLowerCase() === clean);
            if (match) return match;
          }
        }
      }
    }
  } catch {}
  return null;
}

// ─── Save a new quiz ───────────────────────────────────────────────────────────
export function saveQuiz(title, questions, userId = null, category = 'General', description = '') {
  const key = getStorageKey(userId);
  const quizzes = getAllQuizzes(userId);
  const code = generateQuizCode();
  const newQuiz = {
    id: code,
    code: code,
    title: title.trim(),
    description: description ? description.trim() : '',
    category: category ? category.trim() : 'General',
    questions,
    createdAt: new Date().toISOString(),
    userId: userId || null,
  };
  quizzes.unshift(newQuiz);
  try {
    localStorage.setItem(key, JSON.stringify(quizzes));
  } catch (err) {
    console.warn('Storage save failed:', err);
  }
  return newQuiz;
}

// ─── Update Quiz ID / Unique Code ───────────────────────────────────────────
export function updateLocalQuizId(oldId, newId, userId = null) {
  const cleanOld = oldId?.trim().toLowerCase();
  const key = getStorageKey(userId);
  const quizzes = getAllQuizzes(userId);
  const idx = quizzes.findIndex((q) => q.id?.toLowerCase() === cleanOld || q.code?.toLowerCase() === cleanOld);
  if (idx !== -1) {
    quizzes[idx] = {
      ...quizzes[idx],
      id: newId,
      code: newId,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(key, JSON.stringify(quizzes));
    } catch (err) {
      console.warn('Storage update code failed:', err);
    }
    return quizzes[idx];
  }
  return null;
}

// ─── Update an existing quiz ───────────────────────────────────────────────────
export function updateQuiz(id, title, questions, userId = null, category = 'General', description = '') {
  const key = getStorageKey(userId);
  const quizzes = getAllQuizzes(userId);
  const idx = quizzes.findIndex((q) => q.id === id || q.code === id);
  if (idx === -1) return null;
  quizzes[idx] = {
    ...quizzes[idx],
    title: title.trim(),
    description: description !== undefined ? description.trim() : (quizzes[idx].description || ''),
    category: category !== undefined ? category.trim() : (quizzes[idx].category || 'General'),
    questions,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(key, JSON.stringify(quizzes));
  } catch (err) {
    console.warn('Storage update failed:', err);
  }
  return quizzes[idx];
}

// ─── Delete a quiz ─────────────────────────────────────────────────────────────
export function deleteQuiz(id, userId = null) {
  if (!id) return;
  const clean = id.trim().toLowerCase();
  const key = getStorageKey(userId);
  const quizzes = getAllQuizzes(userId).filter((q) => q.id?.toLowerCase() !== clean && q.code?.toLowerCase() !== clean);
  try {
    localStorage.setItem(key, JSON.stringify(quizzes));
  } catch (err) {
    console.warn('Storage delete failed:', err);
  }

  // Purge from any other storage keys as well so deleted quiz never revives
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('quizcraft_quizzes')) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const purged = list.filter((q) => q.id?.toLowerCase() !== clean && q.code?.toLowerCase() !== clean);
            if (purged.length !== list.length) {
              localStorage.setItem(k, JSON.stringify(purged));
            }
          }
        }
      }
    }
  } catch {}
}

// ─── Update only quiz title ─────────────────────────────────────────────────
export function updateQuizTitle(id, newTitle, userId = null) {
  const key = getStorageKey(userId);
  const quizzes = getAllQuizzes(userId);
  const idx = quizzes.findIndex((q) => q.id === id);
  if (idx === -1) return null;
  quizzes[idx] = { ...quizzes[idx], title: newTitle.trim(), updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(key, JSON.stringify(quizzes));
  } catch (err) {
    console.warn('Storage title update failed:', err);
  }
  return quizzes[idx];
}

// ─── Plain Text (Natural Q&A) Question Parser ──────────────────────────────
export function parsePlainTextQuestions(text) {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split(/\r?\n/);
  const questions = [];
  let currentQ = null;

  function commitCurrent() {
    if (currentQ && currentQ.question) {
      // Validate options count
      if (currentQ.options.length < 2) {
        currentQ.validationError = 'Question must have at least 2 options.';
        currentQ.hasValidAnswer = false;
        questions.push({ ...currentQ });
        currentQ = null;
        return;
      }

      // Validate answer was provided
      if (!currentQ.rawAnswer) {
        currentQ.validationError = 'Missing answer. Please specify "Answer: [A/B/C/D]".';
        currentQ.hasValidAnswer = false;
        questions.push({ ...currentQ });
        currentQ = null;
        return;
      }

      const rawAns = currentQ.rawAnswer.trim();
      let resolvedIndex = -1;

      // 1. Check letter match: "A", "B", "C", "D", "Option A", "(A)"
      const letterMatch = rawAns.match(/^(?:option\s*)?\(?([A-Za-z])\)?[\.\:\)]?$/i);
      if (letterMatch) {
        const letter = letterMatch[1].toUpperCase();
        const letterIndex = letter.charCodeAt(0) - 65; // 'A' -> 0, 'B' -> 1...
        if (letterIndex >= 0 && letterIndex < currentQ.options.length) {
          resolvedIndex = letterIndex;
        } else {
          const maxLetter = String.fromCharCode(65 + currentQ.options.length - 1);
          currentQ.validationError = `Answer "${rawAns}" is invalid. Options are only A to ${maxLetter}.`;
          currentQ.hasValidAnswer = false;
          questions.push({ ...currentQ });
          currentQ = null;
          return;
        }
      } else {
        // 2. Check full text match against options
        const matchIdx = currentQ.options.findIndex((o) => o.toLowerCase() === rawAns.toLowerCase());
        if (matchIdx !== -1) {
          resolvedIndex = matchIdx;
        } else if (!isNaN(Number(rawAns))) {
          const numIdx = Number(rawAns);
          if (numIdx >= 1 && numIdx <= currentQ.options.length) {
            resolvedIndex = numIdx - 1;
          } else if (numIdx === 0 && currentQ.options.length > 0) {
            resolvedIndex = 0;
          }
        }
      }

      if (resolvedIndex >= 0 && resolvedIndex < currentQ.options.length) {
        currentQ.correctAnswer = resolvedIndex;
        currentQ.hasValidAnswer = true;
        currentQ.validationError = null;
      } else {
        currentQ.validationError = `Answer "${rawAns}" does not match any of the provided options.`;
        currentQ.hasValidAnswer = false;
      }

      questions.push({ ...currentQ });
    }
    currentQ = null;
  }

  // Matches "1.", "1)", "Q1:", "Question 1.", "### 1."
  const qStartRegex = /^(?:(?:\d+[\.\)]|Q(?:uestion)?\s*\d+[\.\:\)]|\#+\s*\d+[\.\)])\s*)(.+)$/i;
  // Matches "A)", "A.", "A:", "1)", "(A)"
  const optRegex = /^(?:\(?\s*([A-Fa-f\d])\s*[\.\)\:\-]\s*|\(\s*([A-Fa-f])\s*\)\s*)(.+)$/;
  // Matches "Answer: C", "Ans: C", "Correct Answer: B", "Key: A"
  const ansRegex = /^(?:(?:Correct\s*)?Ans(?:wer)?|Key)[\s\:\-]+([A-Za-z\d]|\S.+)$/i;
  // Matches "Explanation: ...", "Reason: ..."
  const expRegex = /^(?:Explanation|Reason|Note)[\s\:\-]+(.+)$/i;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine || rawLine.startsWith('```')) continue;

    // Check Question Start
    const qMatch = rawLine.match(qStartRegex);
    if (qMatch) {
      commitCurrent();
      currentQ = {
        question: qMatch[1].trim(),
        options: [],
        rawAnswer: null,
        correctAnswer: null,
        hasValidAnswer: false,
        validationError: null,
        explanation: '',
      };
      continue;
    }

    if (!currentQ) continue;

    // Check Option
    const optMatch = rawLine.match(optRegex);
    if (optMatch) {
      const optText = (optMatch[3] || '').trim();
      if (optText) currentQ.options.push(optText);
      continue;
    }

    // Check Answer
    const ansMatch = rawLine.match(ansRegex);
    if (ansMatch) {
      currentQ.rawAnswer = ansMatch[1].trim();
      continue;
    }

    // Check Explanation
    const expMatch = rawLine.match(expRegex);
    if (expMatch) {
      currentQ.explanation = expMatch[1].trim();
      continue;
    }

    // Continuation line
    if (currentQ.options.length === 0) {
      currentQ.question += ' ' + rawLine;
    } else if (currentQ.explanation) {
      currentQ.explanation += ' ' + rawLine;
    }
  }

  commitCurrent();
  return questions;
}

// ─── Auto-Repairing JSON Parser (Handles Truncation & Code Brackets) ──────────
export function repairAndParseJSON(rawStr) {
  if (!rawStr || typeof rawStr !== 'string') return null;
  let text = rawStr.trim();

  // Strip Markdown code fences: ```json ... ``` or ``` ... ```
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // 1. Direct standard parse attempt
  try {
    return JSON.parse(text);
  } catch {}

  // 2. Bracket slice & syntax auto-repair (handles missing outer brackets)
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    let sliced = text.substring(firstBrace, lastBrace + 1);

    if (!sliced.startsWith('[') && !sliced.endsWith(']')) {
      sliced = '[' + sliced + ']';
    }

    // Clean illegal JSON escapes (like \<, \>, \', \=)
    let cleaned = sliced.replace(/\\([^"\\\/bfnrtu])/g, '$1');
    cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

    try {
      return JSON.parse(cleaned);
    } catch {}
  }

  // 3. Robust Balanced-Brace Object Extractor
  // Walks through text character-by-character, respecting string escapes and nested braces
  // Recovers every complete question object even if the response was truncated mid-way!
  const questions = [];
  let inString = false;
  let escape = false;
  let depth = 0;
  let startIdx = -1;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (char === '\\') {
      escape = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') {
        if (depth === 0) startIdx = i;
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0 && startIdx !== -1) {
          let objStr = text.substring(startIdx, i + 1);
          objStr = objStr.replace(/\\([^"\\\/bfnrtu])/g, '$1');
          objStr = objStr.replace(/,\s*([\]}])/g, '$1');
          try {
            const obj = JSON.parse(objStr);
            if (obj && (obj.question || obj.title || obj.prompt || obj.text)) {
              questions.push(obj);
            }
          } catch {}
          startIdx = -1;
        }
      }
    }
  }

  if (questions.length > 0) {
    return questions;
  }

  return null;
}

// ─── Universal Validate Quiz Input (JSON or Plain Text) ───────────────────────
export function validateQuizJSON(inputString, fallbackTitle = '') {
  if (!inputString || !inputString.trim()) {
    return { valid: false, error: 'Please enter or paste your quiz questions.' };
  }

  const rawText = inputString.trim();

  // 1. Attempt JSON parsing (with auto-repair)
  let parsed = repairAndParseJSON(rawText);
  let rawQuestions = [];
  let detectedTitle = '';

  if (parsed) {
    if (Array.isArray(parsed)) {
      rawQuestions = parsed;
    } else if (parsed && typeof parsed === 'object') {
      if (typeof parsed.title === 'string' && parsed.title.trim()) {
        detectedTitle = parsed.title.trim();
      }
      if (Array.isArray(parsed.questions)) {
        rawQuestions = parsed.questions;
      } else if (Array.isArray(parsed.items)) {
        rawQuestions = parsed.items;
      }
    }
  }

  // 2. If JSON yielded nothing, try Plain Text Q&A parsing
  if (rawQuestions.length === 0) {
    const plainQuestions = parsePlainTextQuestions(rawText);
    if (plainQuestions.length > 0) {
      // Validate every question strictly
      for (let i = 0; i < plainQuestions.length; i++) {
        const q = plainQuestions[i];
        const qNum = i + 1;
        if (q.validationError || !q.hasValidAnswer || q.correctAnswer === null || q.correctAnswer === undefined) {
          return {
            valid: false,
            error: `Question ${qNum}: ${q.validationError || 'Invalid or missing answer.'}`,
          };
        }
      }

      // All questions passed validation
      const cleanData = plainQuestions.map((q) => ({
        question: q.question.trim(),
        options: q.options.map((opt) => String(opt ?? '').trim()),
        correctAnswer: q.correctAnswer,
        explanation: (q.explanation || '').trim(),
      }));

      return {
        valid: true,
        data: cleanData,
        extractedTitle: detectedTitle || fallbackTitle || '',
      };
    }
  }

  // If still no questions found
  if (rawQuestions.length === 0) {
    return {
      valid: false,
      error: 'Could not detect valid questions. Please format questions as: 1. Question... A) ... B) ... Answer: A ... Explanation: ...',
    };
  }

  // 3. Sanitize and strictly validate extracted question objects
  const sanitizedQuestions = [];

  for (let i = 0; i < rawQuestions.length; i++) {
    const item = rawQuestions[i];
    const qNum = i + 1;
    if (!item || typeof item !== 'object') continue;

    const qText = item.question || item.title || item.prompt || item.text;
    if (!qText || typeof qText !== 'string' || !qText.trim()) {
      return {
        valid: false,
        error: `Question ${qNum} is missing a question title.`,
      };
    }

    const rawOpts = item.options || item.choices || item.answers;
    if (!Array.isArray(rawOpts) || rawOpts.length < 2) {
      return {
        valid: false,
        error: `Question ${qNum} must have at least 2 options.`,
      };
    }

    const options = rawOpts.map((opt) => String(opt ?? '').trim());

    // Strict Answer Validation
    const rawAns = item.correctAnswer !== undefined ? item.correctAnswer : item.answer;
    if (rawAns === undefined || rawAns === null || String(rawAns).trim() === '') {
      return {
        valid: false,
        error: `Question ${qNum}: Missing answer. Every question must have a correct answer.`,
      };
    }

    let resolvedIndex = -1;
    if (typeof rawAns === 'number') {
      if (rawAns >= 0 && rawAns < options.length) {
        resolvedIndex = Math.floor(rawAns);
      } else {
        const maxLetter = String.fromCharCode(65 + options.length - 1);
        return {
          valid: false,
          error: `Question ${qNum}: Answer index ${rawAns} is invalid. Options are only A to ${maxLetter}.`,
        };
      }
    } else if (typeof rawAns === 'string') {
      const trimmedAns = rawAns.trim();
      const letterMatch = trimmedAns.match(/^(?:option\s*)?\(?([A-Za-z])\)?[\.\:\)]?$/i);
      if (letterMatch) {
        const letter = letterMatch[1].toUpperCase();
        const letterIdx = letter.charCodeAt(0) - 65;
        if (letterIdx >= 0 && letterIdx < options.length) {
          resolvedIndex = letterIdx;
        } else {
          const maxLetter = String.fromCharCode(65 + options.length - 1);
          return {
            valid: false,
            error: `Question ${qNum}: Answer "${trimmedAns}" is invalid. Options are only A to ${maxLetter}.`,
          };
        }
      } else {
        const exactIdx = options.findIndex((opt) => opt.toLowerCase() === trimmedAns.toLowerCase());
        if (exactIdx !== -1) {
          resolvedIndex = exactIdx;
        } else if (!isNaN(Number(trimmedAns))) {
          const numIdx = Number(trimmedAns);
          if (numIdx >= 1 && numIdx <= options.length) {
            resolvedIndex = numIdx - 1;
          } else if (numIdx === 0 && options.length > 0) {
            resolvedIndex = 0;
          }
        }
      }
    }

    if (resolvedIndex === -1) {
      return {
        valid: false,
        error: `Question ${qNum}: Answer "${rawAns}" does not match any of the provided options.`,
      };
    }

    sanitizedQuestions.push({
      question: qText.trim(),
      options,
      correctAnswer: resolvedIndex,
      explanation: (item.explanation || item.reason || '').trim(),
    });
  }

  if (sanitizedQuestions.length === 0) {
    return {
      valid: false,
      error: 'Question format invalid. Check that each question has at least 2 options and a question title.',
    };
  }

  return {
    valid: true,
    data: sanitizedQuestions,
    extractedTitle: detectedTitle || fallbackTitle || '',
  };
}
