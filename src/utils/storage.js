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
export function saveQuiz(title, questions, userId = null) {
  const key = getStorageKey(userId);
  const quizzes = getAllQuizzes(userId);
  const code = generateQuizCode();
  const newQuiz = {
    id: code,
    code: code,
    title: title.trim(),
    questions,
    createdAt: new Date().toISOString(),
    userId: userId || null,
  };
  quizzes.push(newQuiz);
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
export function updateQuiz(id, title, questions, userId = null) {
  const key = getStorageKey(userId);
  const quizzes = getAllQuizzes(userId);
  const idx = quizzes.findIndex((q) => q.id === id || q.code === id);
  if (idx === -1) return null;
  quizzes[idx] = { ...quizzes[idx], title: title.trim(), questions, updatedAt: new Date().toISOString() };
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

// ─── Validate quiz JSON ────────────────────────────────────────────────────────
export function validateQuizJSON(jsonString, fallbackTitle = '') {
  try {
    const parsed = JSON.parse(jsonString);

    let rawQuestions = [];
    let detectedTitle = '';

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
      } else {
        return { valid: false, error: 'Questions must be formatted as a list of questions.' };
      }
    } else {
      return { valid: false, error: 'Questions must be formatted as a list with choices.' };
    }

    if (rawQuestions.length === 0) {
      return { valid: false, error: 'Quiz must contain at least 1 question.' };
    }

    const sanitizedQuestions = [];

    for (let i = 0; i < rawQuestions.length; i++) {
      const item = rawQuestions[i];
      if (!item || typeof item !== 'object') {
        return { valid: false, error: `Question #${i + 1} is not formatted properly.` };
      }

      const qText = item.question || item.title || item.prompt || item.text;
      if (!qText || typeof qText !== 'string' || !qText.trim()) {
        return { valid: false, error: `Question #${i + 1} is missing a "question" text.` };
      }

      const rawOpts = item.options || item.choices || item.answers;
      if (!Array.isArray(rawOpts) || rawOpts.length < 2) {
        return { valid: false, error: `Question #${i + 1} must have an "options" list with at least 2 choices.` };
      }

      const options = rawOpts.map((opt) => String(opt ?? '').trim());

      // Resolve correctAnswer whether it's index (0, 1, 2) or option string ("Pressable") or letter ("A", "B", etc.)
      let resolvedIndex = 0;
      const rawAns = item.correctAnswer !== undefined ? item.correctAnswer : item.answer;

      if (typeof rawAns === 'number' && rawAns >= 0 && rawAns < options.length) {
        resolvedIndex = Math.floor(rawAns);
      } else if (typeof rawAns === 'string') {
        const trimmedAns = rawAns.trim();
        // 1. Exact string match (e.g. "Pressable")
        const exactIdx = options.findIndex((opt) => opt === trimmedAns);
        if (exactIdx !== -1) {
          resolvedIndex = exactIdx;
        } else {
          // 2. Case-insensitive match
          const caseIdx = options.findIndex((opt) => opt.toLowerCase() === trimmedAns.toLowerCase());
          if (caseIdx !== -1) {
            resolvedIndex = caseIdx;
          } else {
            // 3. Letter match (e.g. "A", "B", "C", "D")
            const letterIdx = ['a', 'b', 'c', 'd', 'e', 'f'].indexOf(trimmedAns.toLowerCase());
            if (letterIdx !== -1 && letterIdx < options.length) {
              resolvedIndex = letterIdx;
            } else if (!isNaN(Number(trimmedAns))) {
              const numIdx = Number(trimmedAns);
              if (numIdx >= 0 && numIdx < options.length) {
                resolvedIndex = numIdx;
              }
            }
          }
        }
      }

      sanitizedQuestions.push({
        question: qText.trim(),
        options,
        correctAnswer: resolvedIndex,
        explanation: (item.explanation || item.reason || '').trim(),
      });
    }

    return {
      valid: true,
      data: sanitizedQuestions,
      extractedTitle: detectedTitle || fallbackTitle || '',
    };
  } catch {
    return { valid: false, error: 'Invalid question format. Please check for missing brackets, commas, or quotes.' };
  }
}
