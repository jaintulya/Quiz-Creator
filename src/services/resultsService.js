// ─── QuizCraft Results & Submission History Service ─────────────────────────
// Persists all submitted quiz results with timestamps, scores, elapsed times,
// and 'Shared Quiz' vs 'My Quiz' flags.

const RESULTS_KEY_PREFIX = 'quizcraft_results_';

export function getResultsStorageKey(userId = null) {
  return `${RESULTS_KEY_PREFIX}${userId || 'guest'}`;
}

/**
 * Get all submitted quiz results for the user (latest first)
 */
export function getAllQuizResults(userId = null) {
  const key = getResultsStorageKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)) : [];
  } catch {
    return [];
  }
}

/**
 * Save a newly submitted quiz result
 */
export function saveQuizResult(resultPayload, userId = null) {
  if (!resultPayload || !resultPayload.quiz) return null;

  const key = getResultsStorageKey(userId);
  const existing = getAllQuizResults(userId);

  const quiz = resultPayload.quiz;
  const isShared = Boolean(
    resultPayload.isShared ||
    quiz.isShared ||
    (quiz.userId && userId && quiz.userId !== userId)
  );

  const entry = {
    id: `res_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    quizId: quiz.id,
    quizCode: quiz.code || quiz.id,
    quizTitle: quiz.title,
    category: quiz.category || 'General',
    description: quiz.description || '',
    score: resultPayload.correct ?? 0,
    total: resultPayload.total ?? (quiz.questions?.length || 0),
    percentage: Math.round(((resultPayload.correct ?? 0) / Math.max(1, resultPayload.total ?? 1)) * 100),
    timeSeconds: resultPayload.timeSeconds || 0,
    mode: resultPayload.mode || 'classic',
    isShared: isShared,
    submittedAt: resultPayload.submittedAt || new Date().toISOString(),
    answers: resultPayload.answers || {},
    questions: quiz.questions || [],
  };

  existing.unshift(entry);

  // Keep up to 100 recent results
  const trimmed = existing.slice(0, 100);

  try {
    localStorage.setItem(key, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('Failed to save quiz result:', err);
  }

  return entry;
}

/**
 * Delete a specific result from history
 */
export function deleteQuizResult(resultId, userId = null) {
  if (!resultId) return;
  const key = getResultsStorageKey(userId);
  const existing = getAllQuizResults(userId);
  const filtered = existing.filter((r) => r.id !== resultId);
  try {
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Failed to delete quiz result:', err);
  }
}

/**
 * Clear all quiz results history for user
 */
export function clearAllQuizResults(userId = null) {
  const key = getResultsStorageKey(userId);
  try {
    localStorage.removeItem(key);
  } catch {}
}
