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

// ─── Get a single quiz by id ───────────────────────────────────────────────────
export function getQuizById(id, userId = null) {
  const quizzes = getAllQuizzes(userId);
  return quizzes.find((q) => q.id === id) || null;
}

// ─── Save a new quiz ───────────────────────────────────────────────────────────
export function saveQuiz(title, questions, userId = null) {
  const key = getStorageKey(userId);
  const quizzes = getAllQuizzes(userId);
  const newQuiz = {
    id: `quiz_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
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

// ─── Update an existing quiz ───────────────────────────────────────────────────
export function updateQuiz(id, title, questions, userId = null) {
  const key = getStorageKey(userId);
  const quizzes = getAllQuizzes(userId);
  const idx = quizzes.findIndex((q) => q.id === id);
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
  const key = getStorageKey(userId);
  const quizzes = getAllQuizzes(userId).filter((q) => q.id !== id);
  try {
    localStorage.setItem(key, JSON.stringify(quizzes));
  } catch (err) {
    console.warn('Storage delete failed:', err);
  }
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
export function validateQuizJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);

    if (!data.title || typeof data.title !== 'string') {
      return { valid: false, error: 'Quiz must have a "title" string.' };
    }

    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      return { valid: false, error: 'Quiz must contain a non-empty "questions" array.' };
    }

    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];
      if (!q.question || typeof q.question !== 'string') {
        return { valid: false, error: `Question #${i + 1} is missing a "question" string.` };
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return { valid: false, error: `Question #${i + 1} must have at least 2 options.` };
      }
      if (
        typeof q.correctAnswer !== 'number' ||
        q.correctAnswer < 0 ||
        q.correctAnswer >= q.options.length
      ) {
        return {
          valid: false,
          error: `Question #${i + 1} "correctAnswer" must be a valid 0-based index of the options array.`,
        };
      }
    }

    return { valid: true, data };
  } catch {
    return { valid: false, error: 'Invalid JSON syntax. Please check formatting.' };
  }
}
