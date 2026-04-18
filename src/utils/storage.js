// ─── localStorage Key ──────────────────────────────────────────────────────────
const STORAGE_KEY = 'quizcraft_quizzes';

// ─── Get all quizzes ───────────────────────────────────────────────────────────
export function getAllQuizzes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// ─── Get a single quiz by id ───────────────────────────────────────────────────
export function getQuizById(id) {
  const quizzes = getAllQuizzes();
  return quizzes.find((q) => q.id === id) || null;
}

// ─── Save a new quiz ───────────────────────────────────────────────────────────
export function saveQuiz(title, questions) {
  const quizzes = getAllQuizzes();
  const newQuiz = {
    id: `quiz_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: title.trim(),
    questions,
    createdAt: new Date().toISOString(),
  };
  quizzes.push(newQuiz);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
  return newQuiz;
}

// ─── Update an existing quiz ───────────────────────────────────────────────────
export function updateQuiz(id, title, questions) {
  const quizzes = getAllQuizzes();
  const idx = quizzes.findIndex((q) => q.id === id);
  if (idx === -1) return null;
  quizzes[idx] = { ...quizzes[idx], title: title.trim(), questions, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
  return quizzes[idx];
}

// ─── Delete a quiz ─────────────────────────────────────────────────────────────
export function deleteQuiz(id) {
  const quizzes = getAllQuizzes().filter((q) => q.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
}

// ─── Update only quiz title ─────────────────────────────────────────────────
export function updateQuizTitle(id, newTitle) {
  const quizzes = getAllQuizzes();
  const idx = quizzes.findIndex((q) => q.id === id);
  if (idx === -1) return null;
  quizzes[idx] = { ...quizzes[idx], title: newTitle.trim(), updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
  return quizzes[idx];
}

// ─── Validate quiz JSON ────────────────────────────────────────────────────────
export function validateQuizJSON(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { valid: false, error: 'Invalid JSON format. Make sure to paste the raw JSON output from AI.' };
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { valid: false, error: 'JSON must be a non-empty array of questions.' };
  }

  for (let i = 0; i < parsed.length; i++) {
    const q = parsed[i];
    if (!q.question || typeof q.question !== 'string') {
      return { valid: false, error: `Question ${i + 1}: "question" field is missing or not a string.` };
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      return { valid: false, error: `Question ${i + 1}: "options" must be an array of exactly 4 items.` };
    }
    if (!q.correctAnswer || typeof q.correctAnswer !== 'string') {
      return { valid: false, error: `Question ${i + 1}: "correctAnswer" field is missing.` };
    }
    if (!q.explanation || typeof q.explanation !== 'string') {
      return { valid: false, error: `Question ${i + 1}: "explanation" field is missing.` };
    }
  }

  return { valid: true, data: parsed };
}
