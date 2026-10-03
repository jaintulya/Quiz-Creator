// ─── QuizCraft Gamification & Retention Engine ───────────────────────────────
// High-value, progressive 3-tier achievements system.
// Strict quality requirement: All test-performance badges strictly require >= 80% accuracy.
// Trivial / low-value participation badges are removed.

import { getAllQuizResults } from './resultsService.js';

const GAMIFICATION_KEY_PREFIX = 'quizcraft_gamification_';

export const BADGES_CATALOG = [
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    category: 'Speed & Precision',
    icon: 'Zap',
    maxLevel: 3,
    levels: [
      {
        level: 1,
        name: 'Swift Thinker',
        tier: 'bronze',
        description: 'Completed a quiz with < 15s/Q average pace and ≥ 80% accuracy.',
        reqSummary: '< 15s/Q pace • ≥ 80% accuracy',
      },
      {
        level: 2,
        name: 'Speed Demon',
        tier: 'silver',
        description: 'Completed a quiz with < 10s/Q average pace and ≥ 80% accuracy.',
        reqSummary: '< 10s/Q pace • ≥ 80% accuracy',
      },
      {
        level: 3,
        name: 'Hyper Velocity',
        tier: 'gold',
        description: 'Completed a quiz with < 5s/Q lightning pace and ≥ 85% accuracy.',
        reqSummary: '< 5s/Q pace • ≥ 85% accuracy',
      },
    ],
  },
  {
    id: 'marksman',
    title: 'Precision Marksman',
    category: 'Accuracy & Mastery',
    icon: 'Target',
    maxLevel: 3,
    levels: [
      {
        level: 1,
        name: 'Sharp Shooter',
        tier: 'bronze',
        description: 'Scored ≥ 80% accuracy on at least 3 completed quizzes.',
        reqSummary: '3 quizzes with ≥ 80% score',
      },
      {
        level: 2,
        name: 'Elite Marksman',
        tier: 'silver',
        description: 'Scored ≥ 90% accuracy on at least 5 completed quizzes.',
        reqSummary: '5 quizzes with ≥ 90% score',
      },
      {
        level: 3,
        name: 'Flawless Centurion',
        tier: 'gold',
        description: 'Scored a perfect 100% on at least 3 quizzes (min 3 questions).',
        reqSummary: '3 quizzes with 100% perfect score',
      },
    ],
  },
  {
    id: 'mastermind',
    title: 'Grand Mastermind',
    category: 'Knowledge Depth',
    icon: 'Brain',
    maxLevel: 3,
    levels: [
      {
        level: 1,
        name: 'Knowledge Scholar',
        tier: 'bronze',
        description: 'Successfully passed 5 quizzes with ≥ 80% accuracy.',
        reqSummary: '5 quizzes passed (≥ 80%)',
      },
      {
        level: 2,
        name: 'Quiz Virtuoso',
        tier: 'silver',
        description: 'Successfully passed 15 quizzes with ≥ 80% accuracy.',
        reqSummary: '15 quizzes passed (≥ 80%)',
      },
      {
        level: 3,
        name: 'Grand Mastermind',
        tier: 'gold',
        description: 'Successfully passed 30 quizzes with ≥ 80% accuracy.',
        reqSummary: '30 quizzes passed (≥ 80%)',
      },
    ],
  },
  {
    id: 'streak_pioneer',
    title: 'Streak Pioneer',
    category: 'Dedication & Habit',
    icon: 'Flame',
    maxLevel: 3,
    levels: [
      {
        level: 1,
        name: 'Dedicated Learner',
        tier: 'bronze',
        description: 'Maintained an active daily quiz study streak of 3 consecutive days.',
        reqSummary: '3-day consecutive study streak',
      },
      {
        level: 2,
        name: 'Habit Champion',
        tier: 'silver',
        description: 'Maintained an active daily quiz study streak of 7 consecutive days.',
        reqSummary: '7-day consecutive study streak',
      },
      {
        level: 3,
        name: 'Unstoppable Dynamo',
        tier: 'gold',
        description: 'Maintained an active daily quiz study streak of 14 consecutive days.',
        reqSummary: '14-day consecutive study streak',
      },
    ],
  },
  {
    id: 'quiz_architect',
    title: 'Quiz Architect',
    category: 'Creator & Educator',
    icon: 'Layers',
    maxLevel: 3,
    levels: [
      {
        level: 1,
        name: 'Quiz Creator',
        tier: 'bronze',
        description: 'Created 3 custom or AI-generated quizzes with full question sets.',
        reqSummary: '3 quizzes created',
      },
      {
        level: 2,
        name: 'Curriculum Designer',
        tier: 'silver',
        description: 'Created 8 custom or AI-generated quizzes.',
        reqSummary: '8 quizzes created',
      },
      {
        level: 3,
        name: 'Master Architect',
        tier: 'gold',
        description: 'Created 15 custom or AI-generated quizzes.',
        reqSummary: '15 quizzes created',
      },
    ],
  },
  {
    id: 'survival_champion',
    title: 'Survival Champion',
    category: 'High Pressure Endurance',
    icon: 'ShieldCheck',
    maxLevel: 3,
    levels: [
      {
        level: 1,
        name: 'Iron Survivor',
        tier: 'bronze',
        description: 'Completed Survival Mode with at least 80% accuracy.',
        reqSummary: 'Survival Mode • ≥ 80% score',
      },
      {
        level: 2,
        name: 'Battle Hardened',
        tier: 'silver',
        description: 'Completed Survival Mode with ≥ 2 lives remaining and ≥ 85% accuracy.',
        reqSummary: 'Survival • 2+ lives • ≥ 85% score',
      },
      {
        level: 3,
        name: 'Flawless Immortal',
        tier: 'gold',
        description: 'Completed Survival Mode with all 3 lives intact and ≥ 90% accuracy.',
        reqSummary: 'Survival • All 3 lives • ≥ 90% score',
      },
    ],
  },
];

function getStorageKey(userId) {
  return `${GAMIFICATION_KEY_PREFIX}${userId || 'guest'}`;
}

/**
 * Get numerical level (0 to 3) for a badge
 */
export function getBadgeLevel(unlockedBadges = {}, badgeId) {
  if (!unlockedBadges) return 0;
  const val = unlockedBadges[badgeId];
  if (!val) return 0;
  if (typeof val === 'number') return Math.min(3, Math.max(0, val));
  return 1;
}

/**
 * Get level details and next progression target for a badge
 */
export function getBadgeDetails(badgeDef, currentLevel = 0) {
  const maxLevel = badgeDef.maxLevel || 3;
  const isUnlocked = currentLevel > 0;
  const isMaxLevel = currentLevel >= maxLevel;

  const currentLevelDef = isUnlocked
    ? badgeDef.levels.find((l) => l.level === currentLevel)
    : null;

  const nextLevelDef = !isMaxLevel
    ? badgeDef.levels.find((l) => l.level === currentLevel + 1)
    : null;

  return {
    isUnlocked,
    isMaxLevel,
    currentLevel,
    currentLevelDef,
    nextLevelDef,
  };
}

/**
 * Clean up obsolete badges & calibrate existing records with true user performance history
 */
function sanitizeAndReconcile(userId, data) {
  if (!data.unlockedBadges || typeof data.unlockedBadges !== 'object') {
    data.unlockedBadges = {};
  }

  // Remove obsolete participation badges
  delete data.unlockedBadges.first_quiz;
  delete data.unlockedBadges.night_owl;
  delete data.unlockedBadges.flashcard_scholar;

  // Retrieve actual quiz submissions to verify authentic achievements
  const results = getAllQuizResults(userId);

  const score80Count = results.filter((r) => (r.percentage || 0) >= 80).length;
  const score90Count = results.filter((r) => (r.percentage || 0) >= 90).length;
  const perfectCount = results.filter((r) => (r.percentage || 0) === 100 && (r.total || 0) >= 3).length;

  // Reconcile Marksman (formerly Centurion)
  let marksmanLvl = 0;
  if (score80Count >= 3) marksmanLvl = 1;
  if (score90Count >= 5) marksmanLvl = 2;
  if (perfectCount >= 3) marksmanLvl = 3;
  if (marksmanLvl > 0) {
    data.unlockedBadges.marksman = marksmanLvl;
  } else {
    delete data.unlockedBadges.marksman;
    delete data.unlockedBadges.centurion;
  }

  // Reconcile Speed Demon (STRICT RULE: Accuracy MUST be >= 80%!)
  // If user only had quizzes with < 80% accuracy, speed demon is revoked
  let bestSpeedLvl = 0;
  for (const r of results) {
    const acc = r.percentage || 0;
    const count = r.total || 0;
    const secs = r.timeSeconds || 0;
    if (acc >= 80 && count >= 3 && secs > 0) {
      const pace = secs / count;
      if (pace < 15 && bestSpeedLvl < 1) bestSpeedLvl = 1;
      if (pace < 10 && count >= 5 && bestSpeedLvl < 2) bestSpeedLvl = 2;
      if (pace < 5 && acc >= 85 && count >= 5 && bestSpeedLvl < 3) bestSpeedLvl = 3;
    }
  }
  if (bestSpeedLvl > 0) {
    data.unlockedBadges.speed_demon = bestSpeedLvl;
  } else {
    delete data.unlockedBadges.speed_demon;
  }

  // Reconcile Mastermind (quizzes passed with >= 80%)
  let mastermindLvl = 0;
  if (score80Count >= 5) mastermindLvl = 1;
  if (score80Count >= 15) mastermindLvl = 2;
  if (score80Count >= 30) mastermindLvl = 3;
  if (mastermindLvl > 0) {
    data.unlockedBadges.mastermind = mastermindLvl;
  } else {
    delete data.unlockedBadges.mastermind;
  }

  // Reconcile Streak Pioneer
  let streakLvl = 0;
  const maxStreak = Math.max(data.currentStreak || 0, data.longestStreak || 0);
  if (maxStreak >= 3) streakLvl = 1;
  if (maxStreak >= 7) streakLvl = 2;
  if (maxStreak >= 14) streakLvl = 3;
  if (streakLvl > 0) {
    data.unlockedBadges.streak_pioneer = streakLvl;
  } else {
    delete data.unlockedBadges.streak_pioneer;
  }

  // Reconcile Quiz Architect
  let archLvl = 0;
  const created = data.totalQuizzesCreated || 0;
  if (created >= 3) archLvl = 1;
  if (created >= 8) archLvl = 2;
  if (created >= 15) archLvl = 3;
  if (archLvl > 0) {
    data.unlockedBadges.quiz_architect = archLvl;
  } else {
    delete data.unlockedBadges.quiz_architect;
  }

  // Reconcile Survival Champion
  let survivalLvl = 0;
  for (const r of results) {
    if (r.mode === 'survival' && (r.percentage || 0) >= 80) {
      if (survivalLvl < 1) survivalLvl = 1;
      if ((r.livesLeft || 0) >= 2 && (r.percentage || 0) >= 85 && survivalLvl < 2) survivalLvl = 2;
      if ((r.livesLeft || 0) >= 3 && (r.percentage || 0) >= 90 && survivalLvl < 3) survivalLvl = 3;
    }
  }
  if (survivalLvl > 0) {
    data.unlockedBadges.survival_champion = survivalLvl;
  } else {
    delete data.unlockedBadges.survival_champion;
  }
}

export function getGamificationData(userId = null) {
  const key = getStorageKey(userId);
  let data = null;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      data = JSON.parse(raw);
    }
  } catch {}

  if (!data) {
    data = {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      totalCompleted: 0,
      totalQuizzesCreated: 0,
      activityHistory: {}, // { 'YYYY-MM-DD': count }
      unlockedBadges: {},  // { badgeId: currentLevel (1, 2, or 3) }
      modeCompletions: {
        classic: 0,
        survival: 0,
        flashcards: 0,
      },
    };
  }

  sanitizeAndReconcile(userId, data);
  return data;
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
    return;
  }

  const today = new Date(todayStr);
  const prev = new Date(lastDate);
  const diffDays = Math.round((today - prev) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    data.currentStreak += 1;
    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }
  } else {
    data.currentStreak = 1;
  }

  data.lastActiveDate = todayStr;
}

/**
 * Check and award progressive badge levels.
 * Strict prerequisite: Any quiz performance badge requires score >= 80%.
 */
function checkBadgeAwards(data, context = {}) {
  const newlyUnlocked = [];

  function evaluateProgression(badgeId, targetLevel) {
    const currentLevel = Number(data.unlockedBadges[badgeId]) || 0;
    if (targetLevel > currentLevel) {
      for (let lvl = currentLevel + 1; lvl <= targetLevel && lvl <= 3; lvl++) {
        data.unlockedBadges[badgeId] = lvl;
        const badgeDef = BADGES_CATALOG.find((b) => b.id === badgeId);
        const levelDef = badgeDef?.levels.find((l) => l.level === lvl);
        if (badgeDef && levelDef) {
          newlyUnlocked.push({
            id: badgeDef.id,
            title: badgeDef.title,
            icon: badgeDef.icon,
            level: lvl,
            isLevelUp: lvl > 1,
            levelName: levelDef.name,
            tier: levelDef.tier,
            description: levelDef.description,
          });
        }
      }
    }
  }

  const score = Number(context.score) || 0;
  const totalQuestions = Number(context.totalQuestions) || 0;
  const timeSeconds = Number(context.timeSeconds) || 0;

  // 1. Speed Demon (STRICT RULE: Accuracy MUST be >= 80%!)
  if (score >= 80 && totalQuestions >= 3 && timeSeconds > 0) {
    const pace = timeSeconds / totalQuestions;
    let speedLvl = 0;
    if (pace < 15) speedLvl = 1;
    if (pace < 10 && totalQuestions >= 5) speedLvl = 2;
    if (pace < 5 && score >= 85 && totalQuestions >= 5) speedLvl = 3;

    if (speedLvl > 0) {
      evaluateProgression('speed_demon', speedLvl);
    }
  }

  // 2. Marksman & 3. Mastermind (From verified results)
  const results = getAllQuizResults(context.userId);
  const score80Count = results.filter((r) => (r.percentage || 0) >= 80).length;
  const score90Count = results.filter((r) => (r.percentage || 0) >= 90).length;
  const perfectCount = results.filter((r) => (r.percentage || 0) === 100 && (r.total || 0) >= 3).length;

  // Marksman
  let marksmanLvl = 0;
  if (score80Count >= 3) marksmanLvl = 1;
  if (score90Count >= 5) marksmanLvl = 2;
  if (perfectCount >= 3) marksmanLvl = 3;
  if (marksmanLvl > 0) {
    evaluateProgression('marksman', marksmanLvl);
  }

  // Mastermind
  let mastermindLvl = 0;
  if (score80Count >= 5) mastermindLvl = 1;
  if (score80Count >= 15) mastermindLvl = 2;
  if (score80Count >= 30) mastermindLvl = 3;
  if (mastermindLvl > 0) {
    evaluateProgression('mastermind', mastermindLvl);
  }

  // 4. Streak Pioneer
  let streakLvl = 0;
  if (data.currentStreak >= 3) streakLvl = 1;
  if (data.currentStreak >= 7) streakLvl = 2;
  if (data.currentStreak >= 14) streakLvl = 3;
  if (streakLvl > 0) {
    evaluateProgression('streak_pioneer', streakLvl);
  }

  // 5. Quiz Architect
  let archLvl = 0;
  const created = data.totalQuizzesCreated || 0;
  if (created >= 3) archLvl = 1;
  if (created >= 8) archLvl = 2;
  if (created >= 15) archLvl = 3;
  if (archLvl > 0) {
    evaluateProgression('quiz_architect', archLvl);
  }

  // 6. Survival Champion (STRICT RULE: Accuracy MUST be >= 80%!)
  if (context.mode === 'survival' && score >= 80) {
    let survLvl = 1;
    if ((context.livesLeft || 0) >= 2 && score >= 85) survLvl = 2;
    if ((context.livesLeft || 0) >= 3 && score >= 90) survLvl = 3;
    evaluateProgression('survival_champion', survLvl);
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
    userId,
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
  const newlyUnlocked = checkBadgeAwards(data, { userId });
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
