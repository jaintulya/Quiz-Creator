// ─── QuizCraft Gamification & Retention Engine ───────────────────────────────
// Manages streaks, 30-day activity heatmap, unlockable achievements, and stats

const GAMIFICATION_KEY_PREFIX = 'quizcraft_gamification_';

export const BADGES_CATALOG = [
  {
    id: 'first_quiz',
    title: 'First Step',
    description: 'Completed your first quiz challenge.',
    icon: 'Rocket',
    tier: 'bronze',
  },
  {
    id: 'streak_pioneer',
    title: 'Streak Pioneer',
    description: 'Studied 2 or more days in a row.',
    icon: 'Flame',
    tier: 'silver',
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Scored a perfect 100% on a quiz.',
    icon: 'Target',
    tier: 'gold',
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Answered questions with speed and precision (< 10s per question).',
    icon: 'Zap',
    tier: 'silver',
  },
  {
    id: 'quiz_architect',
    title: 'Quiz Architect',
    description: 'Created 3 or more custom or AI quizzes.',
    icon: 'Layers',
    tier: 'gold',
  },
  {
    id: 'mastermind',
    title: 'Mastermind',
    description: 'Successfully completed 5 total quizzes.',
    icon: 'Brain',
    tier: 'diamond',
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Completed a late-night study session after 10:00 PM.',
    icon: 'Moon',
    tier: 'bronze',
  },
  {
    id: 'survival_champion',
    title: 'Survival Champion',
    description: 'Completed a Survival challenge with remaining lives intact.',
    icon: 'ShieldCheck',
    tier: 'gold',
  },
  {
    id: 'flashcard_scholar',
    title: 'Flashcard Scholar',
    description: 'Reviewed all questions in Flashcards mode.',
    icon: 'RotateCw',
    tier: 'bronze',
  },
];

function getStorageKey(userId) {
  return `${GAMIFICATION_KEY_PREFIX}${userId || 'guest'}`;
}

export function getGamificationData(userId = null) {
  const key = getStorageKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    totalCompleted: 0,
    totalQuizzesCreated: 0,
    activityHistory: {}, // { 'YYYY-MM-DD': count }
    unlockedBadges: {},  // { badgeId: timestamp }
    modeCompletions: {
      classic: 0,
      survival: 0,
      flashcards: 0,
    },
  };
}

function saveGamificationData(userId, data) {
  const key = getStorageKey(userId);
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save gamification data:', err);
  }
}

/**
 * Format local date to YYYY-MM-DD
 */
function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Update daily streak
 */
function updateStreak(data, todayStr) {
  const lastDate = data.lastActiveDate;
  if (!lastDate) {
    data.currentStreak = 1;
    data.longestStreak = 1;
    data.lastActiveDate = todayStr;
    return;
  }

  if (lastDate === todayStr) {
    // Already counted today
    return;
  }

  const today = new Date(todayStr);
  const prev = new Date(lastDate);
  const diffDays = Math.round((today - prev) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day
    data.currentStreak += 1;
    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }
  } else {
    // Streak broken
    data.currentStreak = 1;
  }

  data.lastActiveDate = todayStr;
}

/**
 * Check and award badges
 */
function checkBadgeAwards(data, context = {}) {
  const newlyUnlocked = [];

  function award(badgeId) {
    if (!data.unlockedBadges[badgeId]) {
      data.unlockedBadges[badgeId] = new Date().toISOString();
      const badge = BADGES_CATALOG.find((b) => b.id === badgeId);
      if (badge) newlyUnlocked.push(badge);
    }
  }

  // 1. First Quiz
  if (data.totalCompleted >= 1) award('first_quiz');

  // 2. Streak Pioneer
  if (data.currentStreak >= 2) award('streak_pioneer');

  // 3. Centurion
  if (context.score === 100) award('centurion');

  // 4. Speed Demon (less than 10s per question)
  if (context.timeSeconds && context.totalQuestions && context.totalQuestions >= 3) {
    const pace = context.timeSeconds / context.totalQuestions;
    if (pace <= 10) award('speed_demon');
  }

  // 5. Quiz Architect
  if (data.totalQuizzesCreated >= 3) award('quiz_architect');

  // 6. Mastermind
  if (data.totalCompleted >= 5) award('mastermind');

  // 7. Night Owl (Attempted after 10 PM / 22:00)
  const currentHour = new Date().getHours();
  if (currentHour >= 22 || currentHour < 5) award('night_owl');

  // 8. Survival Champion
  if (context.mode === 'survival' && context.livesLeft > 0 && context.score >= 70) {
    award('survival_champion');
  }

  // 9. Flashcard Scholar
  if (context.mode === 'flashcards') {
    award('flashcard_scholar');
  }

  return newlyUnlocked;
}

/**
 * Record a completed quiz session
 */
export function recordQuizSession({
  userId = null,
  score = 0,
  totalQuestions = 1,
  timeSeconds = 0,
  mode = 'classic',
  livesLeft = 3,
}) {
  const data = getGamificationData(userId);
  const todayStr = getLocalDateString();

  // 1. Update activity heatmap
  data.activityHistory[todayStr] = (data.activityHistory[todayStr] || 0) + 1;

  // 2. Update completion count
  data.totalCompleted += 1;
  if (!data.modeCompletions) data.modeCompletions = { classic: 0, survival: 0, flashcards: 0 };
  data.modeCompletions[mode] = (data.modeCompletions[mode] || 0) + 1;

  // 3. Update streak
  updateStreak(data, todayStr);

  // 4. Check for badge unlocks
  const newlyUnlocked = checkBadgeAwards(data, {
    score,
    totalQuestions,
    timeSeconds,
    mode,
    livesLeft,
  });

  saveGamificationData(userId, data);
  return { data, newlyUnlocked };
}

/**
 * Record when user creates a quiz
 */
export function recordQuizCreated(userId = null) {
  const data = getGamificationData(userId);
  data.totalQuizzesCreated = (data.totalQuizzesCreated || 0) + 1;
  const newlyUnlocked = checkBadgeAwards(data);
  saveGamificationData(userId, data);
  return { data, newlyUnlocked };
}

/**
 * Generate 30-day activity map for the Heatmap component
 */
export function getPast30DaysActivity(userId = null) {
  const data = getGamificationData(userId);
  const days = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d);
    const count = data.activityHistory[dateStr] || 0;
    days.push({
      date: dateStr,
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
      level: count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3,
    });
  }

  return days;
}
